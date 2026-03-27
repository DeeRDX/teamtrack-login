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
  const response = await axiosInstance.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return response.data;
};
