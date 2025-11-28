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
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./entities/task.entity");
const task_enums_1 = require("./task.enums");
let TasksService = class TasksService {
    tasksRepository;
    constructor(tasksRepository) {
        this.tasksRepository = tasksRepository;
    }
    async create(createTaskDto) {
        const task = this.tasksRepository.create({
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
        return this.tasksRepository.save(task);
    }
    async findAll() {
        return this.tasksRepository.find({ order: { createdAt: 'DESC' } });
    }
    async findOne(id) {
        const task = await this.tasksRepository.findOneBy({ id });
        if (!task)
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        return task;
    }
    async update(id, updateTaskDto) {
        const task = await this.findOne(id);
        Object.assign(task, updateTaskDto);
        return this.tasksRepository.save(task);
    }
    async remove(id) {
        await this.tasksRepository.delete(id);
    }
    async approveCredit(id) {
        const task = await this.findOne(id);
        if (task.status !== task_enums_1.TaskStatus.UNDER_REVIEW || task.currentDepartment !== task_enums_1.Department.ACCOUNTS) {
            throw new common_1.BadRequestException('Task is not in Credit Review state');
        }
        task.status = task_enums_1.TaskStatus.IN_PROGRESS;
        task.currentDepartment = task_enums_1.Department.PRODUCTION;
        this.logTransition(task, 'Credit Approved');
        return this.tasksRepository.save(task);
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
        return this.tasksRepository.save(task);
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
        return this.tasksRepository.save(task);
    }
    async completeProduction(id) {
        const task = await this.findOne(id);
        if (task.currentDepartment !== task_enums_1.Department.PRODUCTION) {
            throw new common_1.BadRequestException('Only Production can complete tasks');
        }
        task.status = task_enums_1.TaskStatus.COMPLETED;
        task.currentDepartment = task_enums_1.Department.SALES;
        this.logTransition(task, 'Production Completed');
        return this.tasksRepository.save(task);
    }
    async closeTask(id) {
        const task = await this.findOne(id);
        if (task.status !== task_enums_1.TaskStatus.COMPLETED) {
            throw new common_1.BadRequestException('Task must be Completed to be Closed');
        }
        task.status = task_enums_1.TaskStatus.CLOSED;
        this.logTransition(task, 'Task Closed');
        return this.tasksRepository.save(task);
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
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map