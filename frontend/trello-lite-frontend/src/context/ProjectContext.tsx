"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getProjects, addProject, getProjectById, updateProjectById, deleteProjectById, addMemberToProject, removeMemberFromProject } from '@/src/api/projectService';
import { ApiError } from '@/src/api/client';
import { useAuth } from './AuthContext';

interface Project {
    _id: string;
    name: string;
    description: string;
    owner: string;
    members: { userId: string; role: string }[];
    createdAt: string;
    updatedAt: string;
}

interface ProjectContextType {
    projects: Project[];
    currentProject: Project | null;
    loading: boolean;
    error: string | null;
    fetchProjects: () => void;
    fetchProjectById: (projectId: string) => Promise<void>;
    createProject: (projectData: { name: string; description: string; members?: { userId: string; role: string }[] }) => Promise<void>;
    updateProject: (projectId: string, payload: any) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    addMember: (projectId: string, userId: string, role?: string) => Promise<void>;
    removeMember: (projectId: string, userId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
    const { token, setToken, setUser } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = async () => {
        if (!token) {
            console.log("No token available, skipping project fetch");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            console.log("Fetching projects with token:", token.substring(0, 10) + "...");
            const data = await getProjects(token);
            console.log("Projects fetched successfully:", data);
            setProjects(data);
        } catch (err: any) {
            console.error("Error fetching projects:", err);
            if (err instanceof ApiError && err.status === 401) {
                setToken(null);
                setUser(null);
            }
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectById = async (projectId: string) => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await getProjectById(projectId, token);
            setCurrentProject(data);
        } catch (err: any) {
            if (err instanceof ApiError && err.status === 401) {
                setToken(null);
                setUser(null);
            }
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createProject = async (projectData: { name: string; description: string; members?: { userId: string; role: string }[] }) => {
        if (!token) return;
        try {
            await addProject(projectData, token);
            fetchProjects();
        } catch (err: any) {
            if (err instanceof ApiError && err.status === 401) {
                setToken(null);
                setUser(null);
            }
            setError(err.message);
        }
    };

    const updateProject = async (projectId: string, payload: any) => {
        if (!token) return;
        try {
            await updateProjectById(projectId, payload, token);
            fetchProjectById(projectId);
        } catch (err: any) {
            if (err instanceof ApiError && err.status === 401) {
                setToken(null);
                setUser(null);
            }
            setError(err.message);
        }
    };

    const deleteProject = async (projectId: string) => {
        if (!token) return;
        try {
            await deleteProjectById(projectId, token);
            fetchProjects();
        } catch (err: any) {
            if (err instanceof ApiError && err.status === 401) {
                setToken(null);
                setUser(null);
            }
            setError(err.message);
        }
    };

    const addMember = async (projectId: string, userId: string, role: string = 'member') => {
        if (!token) return;
        try {
            await addMemberToProject(projectId, userId, role, token);
            fetchProjectById(projectId);
        } catch (err: any) {
            if (err instanceof ApiError && err.status === 401) {
                setToken(null);
                setUser(null);
            }
            setError(err.message);
        }
    };

    const removeMember = async (projectId: string, userId: string) => {
        if (!token) return;
        try {
            await removeMemberFromProject(projectId, userId, token);
            fetchProjectById(projectId);
        } catch (err: any) {
            if (err instanceof ApiError && err.status === 401) {
                setToken(null);
                setUser(null);
            }
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [token]);

    return (
        <ProjectContext.Provider value={{ projects, currentProject, loading, error, fetchProjects, fetchProjectById, createProject, updateProject, deleteProject, addMember, removeMember }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjects = (): ProjectContextType => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
};