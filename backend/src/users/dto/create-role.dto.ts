import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Administrator role with full permissions' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ type: [Object], example: [{ resource: 'users', actions: ['create', 'read', 'update', 'delete'] }] })
  @IsArray()
  permissions: any[];

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
