import { IsOptional, IsString, Min, Max, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryDocumentDto {
  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '知识库ID' })
  @IsOptional()
  @IsString()
  knowledgeBaseId?: string;

  @ApiPropertyOptional({ description: '标签ID', type: [String] })
  @IsOptional()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ description: '页码', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: '状态', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
