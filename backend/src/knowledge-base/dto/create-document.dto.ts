import { IsString, IsOptional, IsNotEmpty, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ description: '文档标题', maxLength: 200 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: '文档内容', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '文件名称', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fileName?: string;

  @ApiProperty({ description: '文件路径', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  filePath?: string;

  @ApiProperty({ description: '知识库ID', format: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  knowledgeBaseId: string;

  @ApiProperty({ description: '标签ID列表', type: [String], required: false })
  @IsOptional()
  @IsUUID('all', { each: true })
  tagIds?: string[];

  @ApiProperty({ description: '状态', required: false, default: 'active' })
  @IsOptional()
  @IsString()
  status?: string;
}
