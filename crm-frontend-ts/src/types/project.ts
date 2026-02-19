export type Participant = {
    id: string;
    name: string;
    role: string;
    phone?: string;
};

export type Project = {
    id: number;
    name: string;
    description: string;
    status: string;
    createdAt?: string;
    createdBy?: number;
    clientId?: number;
    clientName?: string;
    participants: Participant[];
    groupLeaderIds: number[];
};

export type ProjectTask = {
    taskId: number;
    taskName: string;
    description: string;
    deadlineTimestamp?: string;
    assignedTimestamp?: string;
    assignedBy: number;
    assignedEmployees: number[];
    priority?: "High" | "Medium" | "Low" | string;
    status: string;
};
