import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TaskStatus, Department } from './task.enums';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) { }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    // BR-01: Created by Sales -> Under Review -> Accounts
    const task = this.tasksRepository.create({
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
    return this.tasksRepository.save(task);
  }

  async findAll(): Promise<Task[]> {
    return this.tasksRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOneBy({ id });
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    await this.tasksRepository.delete(id);
  }

  async approveCredit(id: string): Promise<Task> {
    const task = await this.findOne(id);
    // BR-02: Accounts approves -> In Progress -> Production
    if (task.status !== TaskStatus.UNDER_REVIEW || task.currentDepartment !== Department.ACCOUNTS) {
      throw new BadRequestException('Task is not in Credit Review state');
    }

    task.status = TaskStatus.IN_PROGRESS;
    task.currentDepartment = Department.PRODUCTION;
    this.logTransition(task, 'Credit Approved');
    return this.tasksRepository.save(task);
  }

  async reportObstacle(id: string, obstacle: string): Promise<Task> {
    const task = await this.findOne(id);
    // BR-03: Production reports obstacle -> Blocked -> Purchasing
    if (task.currentDepartment !== Department.PRODUCTION) {
      throw new BadRequestException('Only Production can report obstacles');
    }

    task.status = TaskStatus.BLOCKED;
    task.currentDepartment = Department.PURCHASING;
    task.obstacle = obstacle;
    this.logTransition(task, `Obstacle Reported: ${obstacle}`);
    return this.tasksRepository.save(task);
  }

  async resolveObstacle(id: string): Promise<Task> {
    const task = await this.findOne(id);
    // BR-04: Purchasing confirms -> In Progress -> Production
    if (task.status !== TaskStatus.BLOCKED) {
      throw new BadRequestException('Task is not blocked');
    }

    task.status = TaskStatus.IN_PROGRESS;
    task.currentDepartment = Department.PRODUCTION;
    task.obstacle = null;
    this.logTransition(task, 'Obstacle Resolved');
    return this.tasksRepository.save(task);
  }

  async completeProduction(id: string): Promise<Task> {
    const task = await this.findOne(id);
    // BR-05: Production confirms -> Completed -> Sales
    if (task.currentDepartment !== Department.PRODUCTION) {
      throw new BadRequestException('Only Production can complete tasks');
    }

    task.status = TaskStatus.COMPLETED;
    task.currentDepartment = Department.SALES; // Back to Requesting Party
    this.logTransition(task, 'Production Completed');
    return this.tasksRepository.save(task);
  }

  async closeTask(id: string): Promise<Task> {
    const task = await this.findOne(id);
    // BR-61: Close only if Completed
    if (task.status !== TaskStatus.COMPLETED) {
      throw new BadRequestException('Task must be Completed to be Closed');
    }

    task.status = TaskStatus.CLOSED;
    this.logTransition(task, 'Task Closed');
    return this.tasksRepository.save(task);
  }

  private logTransition(task: Task, action: string) {
    if (!task.flowLog) task.flowLog = [];
    task.flowLog.push({
      status: task.status,
      department: task.currentDepartment,
      timestamp: new Date(),
      action,
    });
  }
}
