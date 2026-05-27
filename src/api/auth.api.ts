import axiosInstance from "./axios";

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>("https://localhost:44352/api/auth/login", {
    email,
    password,
  });
  return response.data;
};

export interface SignupPayload {
  fullName: string;
  email: string;
  enumber: string;
  password: string;
  confirmPassword: string;
}

export const signup = async (payload: SignupPayload) => {
  const response = await axiosInstance.post("https://localhost:44352/api/auth/signup", payload);
  return response.data;
};
