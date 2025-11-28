import { TaskPriority } from '../task.enums';
export declare class CreateTaskDto {
    requestingParty: string;
    priority: TaskPriority;
    plannedTime: number;
}
