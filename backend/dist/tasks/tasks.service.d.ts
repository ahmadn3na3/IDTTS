import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
export declare class TasksService {
    private tasksRepository;
    constructor(tasksRepository: Repository<Task>);
    create(createTaskDto: CreateTaskDto): Promise<Task>;
    findAll(): Promise<Task[]>;
    findOne(id: string): Promise<Task>;
    update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task>;
    remove(id: string): Promise<void>;
    approveCredit(id: string): Promise<Task>;
    reportObstacle(id: string, obstacle: string): Promise<Task>;
    resolveObstacle(id: string): Promise<Task>;
    completeProduction(id: string): Promise<Task>;
    closeTask(id: string): Promise<Task>;
    private logTransition;
}
