import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { KnowledgeBaseService } from './knowledge-base.service';
import { TagService } from './tag.service';
import { RagflowSyncService } from './ragflow-sync.service';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto';
import { UpdateKnowledgeBaseDto } from './dto/update-knowledge-base.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@ApiTags('知识库管理')
@Controller('knowledge-bases')
@UseGuards(JwtAuthGuard)
export class KnowledgeBaseController {
  constructor(
    private readonly knowledgeBaseService: KnowledgeBaseService,
    private readonly tagService: TagService,
    private readonly ragflowSyncService: RagflowSyncService,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取知识库列表' })
  @ApiQuery({ name: 'keyword', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'type', required: false, description: '类型' })
  @ApiQuery({ name: 'page', required: false, description: '页码', type: Number })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量', type: Number })
  async findAll(
    @Query('keyword') keyword?: string,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.knowledgeBaseService.findAll(
      { keyword, type },
      page || 1,
      pageSize || 10,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取知识库详情' })
  @ApiParam({ name: 'id', description: '知识库ID' })
  async findOne(@Param('id') id: string) {
    return this.knowledgeBaseService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建知识库' })
  async create(
    @Body() createDto: CreateKnowledgeBaseDto,
    @Req() req: AuthRequest,
  ) {
    return this.knowledgeBaseService.create(createDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新知识库' })
  @ApiParam({ name: 'id', description: '知识库ID' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateKnowledgeBaseDto,
    @Req() req: AuthRequest,
  ) {
    return this.knowledgeBaseService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除知识库' })
  @ApiParam({ name: 'id', description: '知识库ID' })
  async remove(@Param('id') id: string) {
    return this.knowledgeBaseService.remove(id);
  }

  @Get(':id/documents')
  @ApiOperation({ summary: '获取知识库下的文档列表' })
  @ApiParam({ name: 'id', description: '知识库ID' })
  async getDocumentsByBase(
    @Param('id') id: string,
    @Query() query: QueryDocumentDto,
  ) {
    return this.knowledgeBaseService.findDocuments(
      { ...query, knowledgeBaseId: id },
      query.page,
      query.pageSize,
    );
  }

  @Post(':id/documents/upload')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: '上传知识库文档' })
  async uploadDocuments(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: AuthRequest,
  ) {
    return this.knowledgeBaseService.uploadDocuments(id, files, req.user.id);
  }

  @Post('ragflow-sync/retry')
  @ApiOperation({ summary: '手动重试RAGFlow同步任务' })
  async retryRagflowSync(
    @Body()
    body: {
      status?: 'pending' | 'failed' | 'completed';
      limit?: number;
      knowledgeBaseId?: string;
      documentId?: string;
    },
  ) {
    return this.ragflowSyncService.retryJobs(body);
  }
}

@ApiBearerAuth()
@ApiTags('知识文档管理')
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Post()
  @ApiOperation({ summary: '创建文档' })
  async create(@Body() createDto: CreateDocumentDto, @Req() req: AuthRequest) {
    return this.knowledgeBaseService.createDocument(createDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取文档列表' })
  async findAll(@Query() query: QueryDocumentDto) {
    return this.knowledgeBaseService.findDocuments(query, query.page, query.pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取文档详情' })
  @ApiParam({ name: 'id', description: '文档ID' })
  async findOne(@Param('id') id: string) {
    return this.knowledgeBaseService.findDocument(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新文档' })
  @ApiParam({ name: 'id', description: '文档ID' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDocumentDto,
    @Req() req: AuthRequest,
  ) {
    return this.knowledgeBaseService.updateDocument(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除文档' })
  @ApiParam({ name: 'id', description: '文档ID' })
  async remove(@Param('id') id: string) {
    return this.knowledgeBaseService.removeDocument(id);
  }

  @Post(':id/increment-read')
  @ApiOperation({ summary: '增加文档阅读数' })
  @ApiParam({ name: 'id', description: '文档ID' })
  async incrementReadCount(@Param('id') id: string) {
    return this.knowledgeBaseService.incrementReadCount(id);
  }
}

@ApiBearerAuth()
@ApiTags('文档标签管理')
@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ApiOperation({ summary: '获取标签列表' })
  @ApiQuery({ name: 'keyword', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'status', required: false, description: '状态' })
  @ApiQuery({ name: 'page', required: false, description: '页码', type: Number })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量', type: Number })
  async findAll(
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.tagService.findAll(
      { keyword, status },
      page || 1,
      pageSize || 10,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取标签详情' })
  @ApiParam({ name: 'id', description: '标签ID' })
  async findOne(@Param('id') id: string) {
    return this.tagService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建标签' })
  async create(@Body() createDto: CreateTagDto, @Req() req: AuthRequest) {
    return this.tagService.create(createDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新标签' })
  @ApiParam({ name: 'id', description: '标签ID' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTagDto,
  ) {
    return this.tagService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除标签' })
  @ApiParam({ name: 'id', description: '标签ID' })
  async remove(@Param('id') id: string) {
    return this.tagService.remove(id);
  }
}
