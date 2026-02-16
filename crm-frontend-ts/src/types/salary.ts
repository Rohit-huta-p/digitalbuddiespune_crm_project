export interface SalaryRecord {
    id: number;
    totalSalary: number;
    taxPercentage: number;
    taxAmount: number;
    month: string;
    status: string;
}

export interface MarkPaidRequest {
    id: number;
    month: string;
}
