import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Patch(':id/approve-credit')
  approveCredit(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.tasksService.approveCredit(id, reason);
  }

  @Patch(':id/report-obstacle')
  reportObstacle(@Param('id') id: string, @Body('obstacle') obstacle: string) {
    return this.tasksService.reportObstacle(id, obstacle);
  }

  @Patch(':id/resolve-obstacle')
  resolveObstacle(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.tasksService.resolveObstacle(id, reason);
  }

  @Patch(':id/complete-production')
  completeProduction(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.tasksService.completeProduction(id, reason);
  }

  @Patch(':id/close')
  closeTask(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.tasksService.closeTask(id, reason);
  }
  @Patch(':id/submit-review')
  submitForReview(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.tasksService.submitForReview(id, reason);
  }
}
