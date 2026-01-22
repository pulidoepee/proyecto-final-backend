import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Check merge request',
    description: 'Task name',
    minLength: 5,
    maxLength: 55,
    uniqueItems: true,
    nullable: false,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(55)
  readonly name: string;

  @ApiProperty({
    example: 'Review the code for feature',
    description: 'Task description',
    minLength: 10,
    maxLength: 255,
    nullable: true,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(255)
  @IsOptional()
  readonly description?: string;

  @ApiProperty({
    example: false,
    description: 'Task status, completed or not completed',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly completed?: boolean;

  @ApiProperty({
    example: '2025-04-24T09:27:13.089Z',
    description: 'Task assignment due date',
    nullable: true,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  readonly dueDate?: Date;

  @ApiProperty({
    example: 'low',
    description: 'Task priority',
    enum: TaskPriority,
    nullable: true,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  readonly priority?: TaskPriority;
}
