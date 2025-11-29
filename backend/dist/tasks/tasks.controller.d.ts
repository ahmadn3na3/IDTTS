import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/task.schema").Task, {}, import("mongoose").DefaultSchemaOptions> & import("./entities/task.schema").Task & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    findAll(): Promise<import("./entities/task.schema").Task[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./entities/task.schema").Task, {}, import("mongoose").DefaultSchemaOptions> & import("./entities/task.schema").Task & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    update(id: string, updateTaskDto: UpdateTaskDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/task.schema").Task, {}, import("mongoose").DefaultSchemaOptions> & import("./entities/task.schema").Task & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    remove(id: string): Promise<void>;
    approveCredit(id: string): Promise<import("mongoose").Document<unknown, {}, import("./entities/task.schema").Task, {}, import("mongoose").DefaultSchemaOptions> & import("./entities/task.schema").Task & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    reportObstacle(id: string, obstacle: string): Promise<import("mongoose").Document<unknown, {}, import("./entities/task.schema").Task, {}, import("mongoose").DefaultSchemaOptions> & import("./entities/task.schema").Task & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    resolveObstacle(id: string): Promise<import("mongoose").Document<unknown, {}, import("./entities/task.schema").Task, {}, import("mongoose").DefaultSchemaOptions> & import("./entities/task.schema").Task & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    completeProduction(id: string): Promise<import("mongoose").Document<unknown, {}, import("./entities/task.schema").Task, {}, import("mongoose").DefaultSchemaOptions> & import("./entities/task.schema").Task & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    closeTask(id: string): Promise<import("mongoose").Document<unknown, {}, import("./entities/task.schema").Task, {}, import("mongoose").DefaultSchemaOptions> & import("./entities/task.schema").Task & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
}
