import { request } from "@/src/api/client";

export const getTasks = async (projectId: string, token: string) => {
    return request(`/tasks/${projectId}/tasks`, { token });
};

export const addTask = async (projectId: string, taskData: any, token: string) => {
    return request(`/tasks/${projectId}/tasks`, { method: "POST", body: taskData, token });
};

export const updateTask = async (taskId: string, taskData: any, token: string) => {
    return request(`/tasks/${taskId}`, { method: "PUT", body: taskData, token });
};

export const deleteTask = async (taskId: string, token: string) => {
    return request(`/tasks/${taskId}`, { method: "DELETE", token });
};

export const getTaskById = async (taskId: string, token: string) => {
    return request(`/tasks/${taskId}`, { token });
};