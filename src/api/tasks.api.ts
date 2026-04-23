import axiosInstance from "./axios";

export interface TaskPayload {
  mainId: string;
  taskRefId: string;
  taskDescription: string;
  inProduction: boolean;
  complexity: string;
  classification: string;
  logDate: string;
  planStartDate: string;
  planEndDate: string;
  actualStartDate: string;
  actualEndDate: string;
  plannedHours: number;
  hoursLogged: number;
}

export interface TaskResponse extends TaskPayload {
  id: string;
}

export const createTask = async (payload: TaskPayload): Promise<TaskResponse> => {
  const response = await axiosInstance.post<TaskResponse>("/tasks", payload);
  return response.data;
};

export const updateTaskApi = async (
  id: string,
  payload: TaskPayload
): Promise<TaskResponse> => {
  const response = await axiosInstance.put<TaskResponse>(`/tasks/${id}`, payload);
  return response.data;
};
