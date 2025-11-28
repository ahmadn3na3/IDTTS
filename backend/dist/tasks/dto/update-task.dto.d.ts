import { CreateTaskDto } from './create-task.dto';
import { TaskStatus, Department } from '../task.enums';
declare const UpdateTaskDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateTaskDto>>;
export declare class UpdateTaskDto extends UpdateTaskDto_base {
    status?: TaskStatus;
    obstacle?: string;
    actualTime?: number;
    currentDepartment?: Department;
}
export {};
