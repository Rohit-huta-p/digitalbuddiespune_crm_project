export interface CreateTaskRequest {
  taskName: string;
  description: string;
  deadlineTimestamp: string | Date;
  status: string;
  assignedBy: string;
  email: string;
  assignedToEmployeeId: Array<number>;
}
