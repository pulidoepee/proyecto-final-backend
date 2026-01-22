import { ApiProperty } from '@nestjs/swagger';
import { Task } from 'src/tasks/entities/task.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user')
export class User {
  @ApiProperty({
    example: 'd5799c6f-b1cf-41fd-87e3-29a75dbb7b63',
    description: 'User ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'test@test.com',
    description: 'User email',
    uniqueItems: true,
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    example: 'TestTest1234',
    description:
      'The password must have a Uppercase, lowercase letter and a number',
    minLength: 6,
    maxLength: 50,
  })
  @Column()
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name user',
    minLength: 5,
  })
  @Column()
  fullName: string;

  @ApiProperty({
    example: true,
    description: 'User status, active or not active',
    default: true,
  })
  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
