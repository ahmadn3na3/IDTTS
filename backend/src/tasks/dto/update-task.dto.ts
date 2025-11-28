import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { TaskStatus, Department } from '../task.enums';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    @IsString()
    obstacle?: string;

    @IsOptional()
    @IsNumber()
    actualTime?: number;

    @IsOptional()
    @IsEnum(Department)
    currentDepartment?: Department;
}
