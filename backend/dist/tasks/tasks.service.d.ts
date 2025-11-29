import { Model } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './entities/task.schema';
export declare class TasksService {
    private taskModel;
    constructor(taskModel: Model<Task>);
    create(createTaskDto: CreateTaskDto): Promise<TaskDocument>;
    findAll(): Promise<Task[]>;
    findOne(id: string): Promise<TaskDocument>;
    update(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskDocument>;
    remove(id: string): Promise<void>;
    approveCredit(id: string): Promise<TaskDocument>;
    reportObstacle(id: string, obstacle: string): Promise<TaskDocument>;
    resolveObstacle(id: string): Promise<TaskDocument>;
    completeProduction(id: string): Promise<TaskDocument>;
    closeTask(id: string): Promise<TaskDocument>;
    private logTransition;
}
