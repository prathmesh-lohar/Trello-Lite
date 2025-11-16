"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTasks, addTask, updateTask, deleteTask, getTaskById } from '@/src/api/taskService';
import { ApiError } from '@/src/api/client';
import { useAuth } from './AuthContext';

interface Task {
    _id: string;
    title: string;
    description: string;
    assignee: (
        | {
              _id: string;
              name: string;
              email?: string;
          }
        | string
        | null
    );
    status: 'todo' | 'in_progress' | 'done';
    dueDate: string;
    order: number;
    createdAt?: string;
    createdBy?: string;
}

interface TaskContextType {
    tasks: Task[];
    filteredTasks: Task[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    statusFilter: string;
    assigneeFilter: string;
    dueStart: string;
    dueEnd: string;
    sortBy: 'none' | 'dueDate' | 'createdAt';
    sortOrder: 'asc' | 'desc';
    fetchTasks: (projectId: string, opts?: { silent?: boolean }) => void;
    createTask: (projectId: string, taskData: Omit<Task, '_id'>) => Promise<void>;
    editTask: (taskId: string, taskData: Partial<Task>) => Promise<void>;
    removeTask: (taskId: string) => Promise<void>;
    setSearchQuery: (query: string) => void;
    setStatusFilter: (status: string) => void;
    setAssigneeFilter: (assignee: string) => void;
    setDueStart: (date: string) => void;
    setDueEnd: (date: string) => void;
    setSortBy: (sort: 'none' | 'dueDate' | 'createdAt') => void;
    setSortOrder: (order: 'asc' | 'desc') => void;
    clearFilters: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
    const { token, setToken, setUser } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [assigneeFilter, setAssigneeFilter] = useState<string>('');
    const [dueStart, setDueStart] = useState<string>('');
    const [dueEnd, setDueEnd] = useState<string>('');
    const [sortBy, setSortBy] = useState<'none' | 'dueDate' | 'createdAt'>('none');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const fetchTasks = async (projectId: string, opts?: { silent?: boolean }) => {
        if (!token) return;
        try {
            if (opts?.silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            const data = await getTasks(projectId, token);
            setTasks(data);
            applyFilters(data);
        } catch (err: any) {
            if (err instanceof ApiError && err.status === 401) {
                setToken(null);
                setUser(null);
            }
            setError(err.message);
        } finally {
            if (opts?.silent) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    };

    const applyFilters = (tasksToFilter: Task[]) => {
        let filtered = tasksToFilter;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(task => {
                const q = searchQuery.toLowerCase();
                const assigneeName = typeof task.assignee === 'object' && task.assignee?.name ? task.assignee.name.toLowerCase() : '';
                return (
                    task.title.toLowerCase().includes(q) ||
                    task.description.toLowerCase().includes(q) ||
                    assigneeName.includes(q)
                );
            });
        }

        // Status filter
        if (statusFilter) {
            filtered = filtered.filter(task => task.status === statusFilter);
        }

        // Assignee filter
        if (assigneeFilter) {
            filtered = filtered.filter(task => {
                if (!task.assignee) return false;
                if (typeof task.assignee === 'string') return task.assignee === assigneeFilter;
                return task.assignee._id === assigneeFilter;
            });
        }

        // Due date range filter
        if (dueStart) {
            filtered = filtered.filter(task => task.dueDate && new Date(task.dueDate) >= new Date(dueStart));
        }
        if (dueEnd) {
            filtered = filtered.filter(task => task.dueDate && new Date(task.dueDate) <= new Date(dueEnd));
        }
        // Sorting
        if (sortBy !== 'none') {
            filtered = [...filtered].sort((a, b) => {
                const aVal = sortBy === 'dueDate' ? (a.dueDate ? new Date(a.dueDate).getTime() : 0) : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                const bVal = sortBy === 'dueDate' ? (b.dueDate ? new Date(b.dueDate).getTime() : 0) : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            });
        }
        setFilteredTasks(filtered);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setAssigneeFilter('');
        setDueStart('');
        setDueEnd('');
        setSortBy('none');
        setSortOrder('asc');
        setFilteredTasks(tasks);
    };

    const createTask = async (projectId: string, taskData: Omit<Task, '_id'>) => {
        if (!token) return;
        try {
            const res = await addTask(projectId, taskData, token);
            const newTask = (res.task || res) as Task;
            try {
                const populated = await getTaskById((newTask as any)._id, token);
                const fullTask = (populated.task || populated) as Task;
                setTasks(prev => [...prev, fullTask]);
                applyFilters([...tasks, fullTask]);
            } catch {
                setTasks(prev => [...prev, newTask]);
                applyFilters([...tasks, newTask]);
            }
        } catch (err: any) {
            if (err instanceof ApiError && err.status === 401) {
                setToken(null);
                setUser(null);
            }
            setError(err.message);
        }
    };

    // Update filtered tasks when filters change
    useEffect(() => {
        applyFilters(tasks);
    }, [searchQuery, statusFilter, assigneeFilter, dueStart, dueEnd, sortBy, sortOrder, tasks]);

    const editTask = async (taskId: string, taskData: Partial<Task>) => {
        if (!token) return;
        try {
            const prevTasks = tasks;
            const nextTasks = prevTasks.map(t => t._id === taskId ? { ...t, ...taskData } : t);
            setTasks(nextTasks);
            applyFilters(nextTasks);
            try {
                const res = await updateTask(taskId, taskData, token);
                const updated = (res.updatedTask || res) as Task;
                const merged = nextTasks.map(t => t._id === updated._id ? { ...t, ...updated } : t);
                setTasks(merged);
                applyFilters(merged);
            } catch (innerErr: any) {
                setTasks(prevTasks);
                applyFilters(prevTasks);
                if (innerErr instanceof ApiError && innerErr.status === 401) {
                    setToken(null);
                    setUser(null);
                }
                setError(innerErr.message);
            }
        } catch (err: any) {
            if (err instanceof ApiError && err.status === 401) {
                setToken(null);
                setUser(null);
            }
            setError(err.message);
        }
    };

    const removeTask = async (taskId: string) => {
        if (!token) return;
        try {
            const prevTasks = tasks;
            const nextTasks = prevTasks.filter(t => t._id !== taskId);
            setTasks(nextTasks);
            applyFilters(nextTasks);
            try {
                await deleteTask(taskId, token);
            } catch (innerErr: any) {
                setTasks(prevTasks);
                applyFilters(prevTasks);
                if (innerErr instanceof ApiError && innerErr.status === 401) {
                    setToken(null);
                    setUser(null);
                }
                setError(innerErr.message);
            }
        } catch (err: any) {
            if (err instanceof ApiError && err.status === 401) {
                setToken(null);
                setUser(null);
            }
            setError(err.message);
        }
    };

    return (
        <TaskContext.Provider value={{ 
            tasks, 
            filteredTasks, 
            loading, 
            refreshing,
            error, 
            searchQuery,
            statusFilter,
            assigneeFilter,
            dueStart,
            dueEnd,
            sortBy,
            sortOrder,
            fetchTasks, 
            createTask, 
            editTask, 
            removeTask,
            setSearchQuery,
            setStatusFilter,
            setAssigneeFilter,
            setDueStart,
            setDueEnd,
            setSortBy,
            setSortOrder,
            clearFilters
        }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = (): TaskContextType => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};