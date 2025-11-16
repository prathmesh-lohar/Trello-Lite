// src/services/projectService.js

import { request } from "@/src/api/client";

/**
 * Fetches all projects from the backend.
 * @param {string} token - The Bearer Token.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of projects.
 * @throws {Error} Throws an error if the API call fails.
 */
export const getProjects = async (token: string) => {
    if (!token) {
        throw new Error("Authentication token is required to fetch projects.");
    }

    // Mock data for testing since backend is not available
    if (token === "mock-jwt-token-12345") {
        return [
            {
                _id: "1",
                name: "Website Redesign",
                description: "Complete redesign of the company website with modern UI/UX",
                createdAt: "2024-01-15T10:00:00Z",
                updatedAt: "2024-01-20T15:30:00Z"
            },
            {
                _id: "2",
                name: "Mobile App Development",
                description: "Development of the mobile application for iOS and Android",
                createdAt: "2024-01-10T09:00:00Z",
                updatedAt: "2024-01-18T14:20:00Z"
            },
            {
                _id: "3",
                name: "Marketing Campaign",
                description: "Q1 marketing campaign for product launch",
                createdAt: "2024-01-05T08:00:00Z",
                updatedAt: "2024-01-12T11:45:00Z"
            }
        ];
    }

    try {
        return await request(`/projects`, { token });
    } catch (error) {
        console.error("Error fetching projects:", error);
        throw new Error("Failed to fetch projects. Please try again.");
    }
};

/**
 * Creates a new project in the backend.
 * @param {Object} projectData - The data for the new project.
 * @param {string} token - The Bearer Token.
 * @returns {Promise<Object>} A promise that resolves to the newly created project object.
 * @throws {Error} Throws an error if the API call fails.
 */
export const addProject = async (projectData: any, token: string) => {
    if (!token) {
        throw new Error("Authentication token is required to create a project.");
    }

    // Mock data creation for testing since backend is not available
    if (token === "mock-jwt-token-12345") {
        return {
            _id: Date.now().toString(),
            name: projectData.name,
            description: projectData.description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    try {
        return await request(`/projects`, { method: "POST", body: projectData, token });
    } catch (error) {
        console.error("Error creating project:", error);
        throw new Error("Failed to create project. Please try again.");
    }
};

/**
 * Fetches a single project by its ID from the backend.
 * @param {string} projectId - The ID of the project to fetch.
 * @param {string} token - The Bearer Token.
 * @returns {Promise<Object>} A promise that resolves to the project object.
 * @throws {Error} Throws an error if the API call fails.
 */
export const getProjectById = async (projectId: string, token: string) => {
    if (!token) {
        throw new Error("Authentication token is required to fetch a project.");
    }

    return await request(`/projects/${projectId}`, { token });
};

export const updateProjectById = async (projectId: string, payload: any, token: string) => {
    return await request(`/projects/${projectId}`, { method: "PUT", body: payload, token });
};

export const deleteProjectById = async (projectId: string, token: string) => {
    return await request(`/projects/${projectId}`, { method: "DELETE", token });
};

export const addMemberToProject = async (projectId: string, userId: string, role: string, token: string) => {
    return await request(`/projects/${projectId}/add-member`, { method: "POST", body: { userId, role }, token });
};

export const removeMemberFromProject = async (projectId: string, userId: string, token: string) => {
    return await request(`/projects/${projectId}/remove-member`, { method: "POST", body: { userId }, token });
};