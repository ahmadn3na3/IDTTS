import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { TaskPriority } from '../task.enums';

export class CreateTaskDto {
    @IsNotEmpty()
    @IsString()
    requestingParty: string;

    @IsEnum(TaskPriority)
    priority: TaskPriority;

    @IsInt()
    @Min(1)
    plannedTime: number;
}
