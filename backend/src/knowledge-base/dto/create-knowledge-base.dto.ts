import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKnowledgeBaseDto {
  @ApiProperty({ description: '知识库名称', maxLength: 200 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: '知识库描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '类型', required: false, default: 'internal' })
  @IsOptional()
  @IsString()
  type?: string;
}
