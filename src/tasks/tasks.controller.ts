import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth('jwt')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(AuthGuard())
  @ApiResponse({ status: 201, description: 'Task was created', type: Task })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related' })
  create(@Body() createTaskDto: CreateTaskDto, @GetUser() user: User) {
    return this.tasksService.create(createTaskDto, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  @ApiResponse({
    status: 200,
    description: 'Tasks was returned',
    type: [Task],
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related' })
  findAll(@GetUser() user: User) {
    return this.tasksService.findAll(user);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  @ApiResponse({ status: 200, description: 'Task was returned', type: Task })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.tasksService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  @ApiResponse({ status: 200, description: 'Task was updated', type: Task })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: User,
  ) {
    return this.tasksService.update(id, updateTaskDto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  @ApiResponse({ status: 200, description: 'Task was removed' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.tasksService.remove(id, user);
  }

  @Patch(':id/complete')
  @UseGuards(AuthGuard())
  @ApiResponse({ status: 200, description: 'Task was updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  completeTask(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.tasksService.completeTask(id, user);
  }

  @Patch('complete/all')
  @UseGuards(AuthGuard())
  @ApiResponse({ status: 200, description: 'Tasks was updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related' })
  completeAllPendingTasks(@GetUser() user: User) {
    return this.tasksService.completeAllPendingTasks(user);
  }

  @Delete('completed/all')
  @UseGuards(AuthGuard())
  @ApiResponse({ status: 200, description: 'Task was updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related' })
  deleteAllCompletedTasks(@GetUser() user: User) {
    return this.tasksService.deleteAllCompletedTasks(user);
  }
}
