export interface CreateBillRequest {
  customerName: string;
  email: string;
  phno: string;
  amount: string;
  generatedBy: string;
  serviceTitle: string;
  serviceDesc: string;
  bill_due_date?: string;
  invoiceNumber?: string;
}

export interface CreateBillResponse {
  attributes: {
    message: string;
  };
  errors: any | null;
}
console.log("bills.type.ts");
