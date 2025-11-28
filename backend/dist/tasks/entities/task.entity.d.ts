import { TaskPriority, TaskStatus, Department } from '../task.enums';
export declare class Task {
    id: string;
    requestingParty: string;
    priority: TaskPriority;
    status: TaskStatus;
    plannedTime: number;
    actualTime: number;
    obstacle: string | null;
    currentDepartment: Department;
    flowLog: any[];
    createdAt: Date;
    updatedAt: Date;
}
