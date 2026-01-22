import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger('TasksService');

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User) {
    try {
      const task = this.taskRepository.create({ ...createTaskDto, user });
      await this.taskRepository.save(task);
      return task;
    } catch (error) {
      console.log(error);
      this.handleDBExceptions(error);
    }
  }

  findAll(user: User) {
    return this.taskRepository.find({
      where: { user: { id: user.id } },
    });
  }

  async findOne(id: string, user: User) {
    const task = await this.taskRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: User) {
    const task = await this.taskRepository.preload({
      id: id,
      ...updateTaskDto,
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    try {
      task.user = user;
      await this.taskRepository.save(task);
      return task;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string, user: User) {
    const task = await this.taskRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    this.taskRepository.remove(task);
  }

  async completeTask(id: string, user: User) {
    const task = await this.taskRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    task.completed = true;
    task.updatedAt = new Date();

    return this.taskRepository.save(task);
  }

  async completeAllPendingTasks(user: User) {
    const result = await this.taskRepository
      .createQueryBuilder()
      .update(Task)
      .set({ completed: true, updatedAt: new Date() })
      .where('userId = :userId', { userId: user.id })
      .andWhere('completed = false')
      .execute();

    return { updated: result.affected || 0 };
  }

  async deleteAllCompletedTasks(user: User) {
    const result = await this.taskRepository
      .createQueryBuilder()
      .delete()
      .from(Task)
      .where('userId = :userId', { userId: user.id })
      .andWhere('completed = true')
      .execute();

    return { deleted: result.affected || 0 };
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23502' || error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);

    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
