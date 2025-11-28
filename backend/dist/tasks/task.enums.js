"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Department = exports.TaskStatus = exports.TaskPriority = void 0;
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["HIGH"] = "High";
    TaskPriority["MEDIUM"] = "Medium";
    TaskPriority["LOW"] = "Low";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["NEW"] = "New";
    TaskStatus["UNDER_REVIEW"] = "Under Review";
    TaskStatus["AWAITING_APPROVAL"] = "Awaiting Approval";
    TaskStatus["IN_PROGRESS"] = "In Progress";
    TaskStatus["BLOCKED"] = "Blocked by Obstacle";
    TaskStatus["COMPLETED"] = "Completed";
    TaskStatus["CLOSED"] = "Closed";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var Department;
(function (Department) {
    Department["SALES"] = "Sales";
    Department["ACCOUNTS"] = "Accounts";
    Department["PRODUCTION"] = "Production";
    Department["PURCHASING"] = "Purchasing";
})(Department || (exports.Department = Department = {}));
//# sourceMappingURL=task.enums.js.map