export interface LoginAttributes {
  role: string;
  employee_id: string;
  id: number;
  message: string;
  token: string;
}

export interface LoginResponse {
  attributes: LoginAttributes;
  errors: [{ title: string; message: string; code: number }] | null;
}

export interface LoginRequest {
  id: string;
  password: string;
  lattitude: string;
  longitude: string;
}
