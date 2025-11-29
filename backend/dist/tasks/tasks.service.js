"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const task_schema_1 = require("./entities/task.schema");
const task_enums_1 = require("./task.enums");
let TasksService = class TasksService {
    taskModel;
    constructor(taskModel) {
        this.taskModel = taskModel;
    }
    async create(createTaskDto) {
        const createdTask = new this.taskModel({
            ...createTaskDto,
            status: task_enums_1.TaskStatus.UNDER_REVIEW,
            currentDepartment: task_enums_1.Department.ACCOUNTS,
            flowLog: [{
                    status: task_enums_1.TaskStatus.NEW,
                    department: task_enums_1.Department.SALES,
                    timestamp: new Date(),
                    action: 'Created',
                }, {
                    status: task_enums_1.TaskStatus.UNDER_REVIEW,
                    department: task_enums_1.Department.ACCOUNTS,
                    timestamp: new Date(),
                    action: 'Auto-Transition: Sent to Accounts',
                }],
        });
        return createdTask.save();
    }
    async findAll() {
        return this.taskModel.find().sort({ createdAt: 'desc' }).exec();
    }
    async findOne(id) {
        const task = await this.taskModel.findById(id).exec();
        if (!task)
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        return task;
    }
    async update(id, updateTaskDto) {
        const task = await this.findOne(id);
        task.set(updateTaskDto);
        return task.save();
    }
    async remove(id) {
        await this.taskModel.findByIdAndDelete(id).exec();
    }
    async approveCredit(id) {
        const task = await this.findOne(id);
        if (task.status !== task_enums_1.TaskStatus.UNDER_REVIEW || task.currentDepartment !== task_enums_1.Department.ACCOUNTS) {
            throw new common_1.BadRequestException('Task is not in Credit Review state');
        }
        task.status = task_enums_1.TaskStatus.IN_PROGRESS;
        task.currentDepartment = task_enums_1.Department.PRODUCTION;
        this.logTransition(task, 'Credit Approved');
        return task.save();
    }
    async reportObstacle(id, obstacle) {
        const task = await this.findOne(id);
        if (task.currentDepartment !== task_enums_1.Department.PRODUCTION) {
            throw new common_1.BadRequestException('Only Production can report obstacles');
        }
        task.status = task_enums_1.TaskStatus.BLOCKED;
        task.currentDepartment = task_enums_1.Department.PURCHASING;
        task.obstacle = obstacle;
        this.logTransition(task, `Obstacle Reported: ${obstacle}`);
        return task.save();
    }
    async resolveObstacle(id) {
        const task = await this.findOne(id);
        if (task.status !== task_enums_1.TaskStatus.BLOCKED) {
            throw new common_1.BadRequestException('Task is not blocked');
        }
        task.status = task_enums_1.TaskStatus.IN_PROGRESS;
        task.currentDepartment = task_enums_1.Department.PRODUCTION;
        task.obstacle = null;
        this.logTransition(task, 'Obstacle Resolved');
        return task.save();
    }
    async completeProduction(id) {
        const task = await this.findOne(id);
        if (task.currentDepartment !== task_enums_1.Department.PRODUCTION) {
            throw new common_1.BadRequestException('Only Production can complete tasks');
        }
        task.status = task_enums_1.TaskStatus.COMPLETED;
        task.currentDepartment = task_enums_1.Department.SALES;
        this.logTransition(task, 'Production Completed');
        return task.save();
    }
    async closeTask(id) {
        const task = await this.findOne(id);
        if (task.status !== task_enums_1.TaskStatus.COMPLETED) {
            throw new common_1.BadRequestException('Task must be Completed to be Closed');
        }
        task.status = task_enums_1.TaskStatus.CLOSED;
        this.logTransition(task, 'Task Closed');
        return task.save();
    }
    logTransition(task, action) {
        if (!task.flowLog)
            task.flowLog = [];
        task.flowLog.push({
            status: task.status,
            department: task.currentDepartment,
            timestamp: new Date(),
            action,
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TasksService);
//# sourceMappingURL=tasks.service.js.map