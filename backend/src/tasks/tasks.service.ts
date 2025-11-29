import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './entities/task.schema';
import { TaskStatus, Department } from './task.enums';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
  ) { }

  async create(createTaskDto: CreateTaskDto): Promise<TaskDocument> {
    // BR-01: Created by Sales -> Under Review -> Accounts
    const createdTask = new this.taskModel({
      ...createTaskDto,
      status: TaskStatus.UNDER_REVIEW,
      currentDepartment: Department.ACCOUNTS,
      flowLog: [{
        status: TaskStatus.NEW,
        department: Department.SALES,
        timestamp: new Date(),
        action: 'Created',
      }, {
        status: TaskStatus.UNDER_REVIEW,
        department: Department.ACCOUNTS,
        timestamp: new Date(),
        action: 'Auto-Transition: Sent to Accounts',
      }],
    });
    return createdTask.save();
  }

  async findAll(): Promise<Task[]> {
    return this.taskModel.find().sort({ createdAt: 'desc' }).exec();
  }

  async findOne(id: string): Promise<TaskDocument> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskDocument> {
    const task = await this.findOne(id);
    task.set(updateTaskDto);
    return task.save();
  }

  async remove(id: string): Promise<void> {
    await this.taskModel.findByIdAndDelete(id).exec();
  }

  async approveCredit(id: string): Promise<TaskDocument> {
    const task = await this.findOne(id);
    // BR-02: Accounts approves -> In Progress -> Production
    if (task.status !== TaskStatus.UNDER_REVIEW || task.currentDepartment !== Department.ACCOUNTS) {
      throw new BadRequestException('Task is not in Credit Review state');
    }

    task.status = TaskStatus.IN_PROGRESS;
    task.currentDepartment = Department.PRODUCTION;
    this.logTransition(task, 'Credit Approved');
    return task.save();
  }

  async reportObstacle(id: string, obstacle: string): Promise<TaskDocument> {
    const task = await this.findOne(id);
    // BR-03: Production reports obstacle -> Blocked -> Purchasing
    if (task.currentDepartment !== Department.PRODUCTION) {
      throw new BadRequestException('Only Production can report obstacles');
    }

    task.status = TaskStatus.BLOCKED;
    task.currentDepartment = Department.PURCHASING;
    task.obstacle = obstacle;
    this.logTransition(task, `Obstacle Reported: ${obstacle}`);
    return task.save();
  }

  async resolveObstacle(id: string): Promise<TaskDocument> {
    const task = await this.findOne(id);
    // BR-04: Purchasing confirms -> In Progress -> Production
    if (task.status !== TaskStatus.BLOCKED) {
      throw new BadRequestException('Task is not blocked');
    }

    task.status = TaskStatus.IN_PROGRESS;
    task.currentDepartment = Department.PRODUCTION;
    task.obstacle = null;
    this.logTransition(task, 'Obstacle Resolved');
    return task.save();
  }

  async completeProduction(id: string): Promise<TaskDocument> {
    const task = await this.findOne(id);
    // BR-05: Production confirms -> Completed -> Sales
    if (task.currentDepartment !== Department.PRODUCTION) {
      throw new BadRequestException('Only Production can complete tasks');
    }

    task.status = TaskStatus.COMPLETED;
    task.currentDepartment = Department.SALES; // Back to Requesting Party
    this.logTransition(task, 'Production Completed');
    return task.save();
  }

  async closeTask(id: string): Promise<TaskDocument> {
    const task = await this.findOne(id);
    // BR-61: Close only if Completed
    if (task.status !== TaskStatus.COMPLETED) {
      throw new BadRequestException('Task must be Completed to be Closed');
    }

    task.status = TaskStatus.CLOSED;
    this.logTransition(task, 'Task Closed');
    return task.save();
  }

  private logTransition(task: TaskDocument, action: string) {
    if (!task.flowLog) task.flowLog = [];
    task.flowLog.push({
      status: task.status,
      department: task.currentDepartment,
      timestamp: new Date(),
      action,
    });
  }
}
