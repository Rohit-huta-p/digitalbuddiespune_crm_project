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
  taxAmount?: string;
  discountAmount?: string;
  paymentMethod?: string;
  notes?: string;
  billingAddress?: string;
}

export interface CreateBillResponse {
  attributes: {
    message: string;
  };
  errors:
  | {
    title: string;
    message: string;
    code: string;
  }[]
  | null;
}
