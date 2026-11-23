import axiosInstance from "./axios";

interface LoginResponse {
  token: string;
  user: {
    userId: number;
    enumber: string;
    fullName: string;
    email: string;
    roleName: string;
    hierarchyLevel: number;
    teamName: string | null;
    dailyHours: number | null;
    assetName: string | null;
    managerName: string | null;
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>("/auth/login", {
    email,
    password,
  }, {
    timeout: 20000,
  });
  return response.data;
};

export interface SignupPayload {
  fullName: string;
  email: string;
  enumber: string;
  password: string;
  confirmPassword: string;
  role_id: string | null;
  team_id: string |null;
  asset_id: string |null;
}

export const signup = async (payload: SignupPayload) => {
  const response = await axiosInstance.post("/auth/signup", payload);
  return response.data;
};
  