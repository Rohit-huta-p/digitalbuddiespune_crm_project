export interface LogoutRequest {
  employeeId: string;
  latitude: string;
  longitude: string;
}

export interface LogoutResponse {
  attributes: {
    message: string;
  };
  errors: [{ title: string; message: string; code: number }] | null;
}
