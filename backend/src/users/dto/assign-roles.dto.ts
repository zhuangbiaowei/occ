import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class AssignRolesDto {
  @ApiProperty({ type: [String], example: ['role-id-1', 'role-id-2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds: string[];
}
