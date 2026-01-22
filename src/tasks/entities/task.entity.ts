import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('task')
export class Task {
  @ApiProperty({
    example: 'd5799c6f-b1cf-41fd-87e3-29a75dbb7b63',
    description: 'Task ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Check merge request',
    description: 'Task name',
    minLength: 5,
    maxLength: 55,
    uniqueItems: true,
  })
  @Column({ unique: true, length: 55 })
  name: string;

  @ApiProperty({
    example: 'Review the code for feature',
    description: 'Task description',
    minLength: 10,
    maxLength: 255,
  })
  @Column({ length: 255, nullable: true })
  description: string;

  @ApiProperty({
    example: false,
    description: 'Task status, completed or not completed',
    default: false,
  })
  @Column({ default: false })
  completed: boolean;

  @ApiProperty({
    example: '2025-04-24T09:27:13.089Z',
    description: 'Task creation date',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2025-04-24T09:27:13.089Z',
    description: 'Task update date',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    example: '2025-04-24T09:27:13.089Z',
    description: 'Task assignment due date',
  })
  @Column({ nullable: true })
  dueDate: Date;

  @ApiProperty({
    example: 'low',
    description: 'Task priority',
    enum: TaskPriority,
  })
  @Column({ type: 'enum', enum: TaskPriority, nullable: true })
  priority: TaskPriority;

  @ManyToOne(() => User, (user) => user.tasks, { eager: true })
  user: User;

  @BeforeInsert()
  setCreatedAtDate() {
    this.createdAt = new Date();
  }

  @BeforeUpdate()
  setUpdatedAtDate() {
    this.updatedAt = new Date();
  }
}
