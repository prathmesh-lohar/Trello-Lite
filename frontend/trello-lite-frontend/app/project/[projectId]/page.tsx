"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTasks } from '@/src/context/TaskContext';
import { useProjects } from '@/src/context/ProjectContext';
import { useAuth } from '@/src/context/AuthContext';
import ProtectedRoute from '@/src/routes/ProtectedRoute';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Search, Filter, X } from 'lucide-react';

const TaskCard = ({ task, index }) => {
    const { editTask, removeTask } = useTasks();
    const { currentProject } = useProjects();
    const { user } = useAuth();
    const canEdit = !!user && (
        task.createdBy === user._id ||
        (currentProject && (currentProject.owner === user._id || (currentProject.members || []).some(m => m.userId._id === user._id && m.role === 'admin')))
    );
    const assigneeId = task.assignee ? task.assignee._id : '';
    const handleAssigneeChange = (e: any) => {
        const newId = e.target.value;
        editTask(task._id, { assignee: newId as any });
    };
    const dueVal = task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '';
    const handleDueChange = (e: any) => {
        const val = e.target.value;
        editTask(task._id, { dueDate: val } as any);
    };
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description);
    const handleSaveEdit = async () => {
        await editTask(task._id, { title: editTitle, description: editDescription } as any);
        setIsEditOpen(false);
    };
    return (
        <Draggable draggableId={task._id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-white p-4 rounded-lg shadow-md mb-4"
                >
                    <h4 className="font-bold">{task.title}</h4>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                        <select
                            value={assigneeId}
                            onChange={handleAssigneeChange}
                            disabled={!canEdit}
                            className="px-2 py-1 border border-gray-300 rounded"
                        >
                            <option value="">Unassigned</option>
                            {currentProject && currentProject.members && currentProject.members.map(member => (
                                <option key={member.userId._id} value={member.userId._id}>{member.userId.name}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={dueVal}
                            onChange={handleDueChange}
                            disabled={!canEdit}
                            className="px-2 py-1 border border-gray-300 rounded"
                        />
                        {canEdit && (
                            <>
                                <button onClick={() => setIsEditOpen(true)} className="px-2 py-1 text-xs border rounded">Edit</button>
                                <button onClick={() => removeTask(task._id)} className="px-2 py-1 text-xs border rounded text-red-600">Delete</button>
                            </>
                        )}
                    </div>
                    {isEditOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                                <h3 className="text-lg font-semibold mb-4">Edit Task</h3>
                                <div className="mb-3">
                                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 border rounded" />
                                </div>
                                <div className="mb-4">
                                    <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full px-3 py-2 border rounded" rows={4} />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsEditOpen(false)} className="px-3 py-2 border rounded">Cancel</button>
                                    <button onClick={handleSaveEdit} className="px-3 py-2 bg-blue-600 text-white rounded">Save</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};

const TaskColumn = ({ title, tasks, droppableId }) => (
  <div className="bg-gray-100 p-4 rounded-lg w-full max-w-[550px]">
    <h3 className="font-bold mb-4">{title}</h3>
    <Droppable droppableId={droppableId}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="min-h-[400px]"
        >
          {tasks.map((task, index) => (
            <TaskCard key={task._id} task={task} index={index} />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
);


import { Plus } from 'lucide-react';

// ... existing code ...

const CreateTaskModal = ({ isOpen, onClose, onCreate, members }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [assignee, setAssignee] = useState("");


    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate({ title, description, status: 'todo', dueDate, assignee });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Task</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                        <select
                            id="assignee"
                            value={assignee}
                            onChange={(e) => setAssignee(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Unassigned</option>
                            {members && members.map(member => (
                                <option key={member.userId._id} value={member.userId._id}>
                                    {member.userId.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                            type="date"
                            id="dueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function ProjectPage() {
    const { projectId } = useParams();
    const {
        filteredTasks,
        loading,
        error,
        fetchTasks,
        createTask,
        editTask,
        searchQuery,
        statusFilter,
        assigneeFilter,
        refreshing,
        setSearchQuery,
        setStatusFilter,
        setAssigneeFilter,
        dueStart,
        dueEnd,
        sortBy,
        sortOrder,
        setDueStart,
        setDueEnd,
        setSortBy,
        setSortOrder,
        clearFilters
    } = useTasks();
    const { currentProject, fetchProjectById, addMember, removeMember, error: projectError, updateProject, deleteProject } = useProjects();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inviteValue, setInviteValue] = useState("");
    const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
    const [editProjectName, setEditProjectName] = useState("");
    const [editProjectDesc, setEditProjectDesc] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (projectId) {
            fetchTasks(projectId as string);
            fetchProjectById(projectId as string);
        }
    }, [projectId]);

    useEffect(() => {
        if (!projectId) return;
        const i = setInterval(() => {
            fetchTasks(projectId as string, { silent: true });
        }, 4000);
        return () => clearInterval(i);
    }, [projectId]);

    useEffect(() => {
        if (projectError && projectError.toLowerCase().includes("access denied")) {
            router.replace("/dashboard");
        }
    }, [projectError]);

    const handleCreateTask = async (taskData) => {
        await createTask(projectId as string, taskData);
    };

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const updatedTask = {
            status: destination.droppableId as 'todo' | 'in_progress' | 'done',
            order: destination.index,
        };

        editTask(draggableId, updatedTask);
    };

    const columns = {
        todo: filteredTasks.filter((task) => task.status === 'todo'),
        in_progress: filteredTasks.filter((task) => task.status === 'in_progress'),
        done: filteredTasks.filter((task) => task.status === 'done'),
    };

    const ownerId = currentProject ? ((currentProject as any).owner?._id ?? (currentProject as any).owner) : undefined;
    const isAdmin = Boolean(
        currentProject && user && (
            ownerId === user._id ||
            (currentProject.members || []).some(m => m.userId._id === user._id && m.role === 'admin')
        )
    );
    const isMember = Boolean(
        currentProject && user && (
            ownerId === user._id ||
            (currentProject.members || []).some(m => m.userId._id === user._id)
        )
    );

    const handleInvite = async () => {
        if (!currentProject) return;
        const value = inviteValue.trim();
        if (!value) return;
        let userId = value;
        if (value.includes("@")) {
            try {
                const res = await fetch("http://localhost:1000/api/v1/users");
                const users = await res.json();
                const match = users.find((u: any) => u.email.toLowerCase() === value.toLowerCase());
                if (!match) return;
                userId = match._id;
            } catch {}
        }
        await addMember(currentProject._id, userId, 'member');
        setInviteValue("");
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!currentProject) return;
        await removeMember(currentProject._id, memberId);
    };

    return (
        <ProtectedRoute>
            <div className="p-10">
                {currentProject && (
                    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold">{currentProject.name}</h2>
                                <p className="text-gray-600">{currentProject.description}</p>
                            </div>
                            {isAdmin && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setIsEditProjectOpen(true);
                                            setEditProjectName(currentProject.name);
                                            setEditProjectDesc(currentProject.description);
                                        }}
                                        className="px-3 py-2 border rounded"
                                    >
                                        Edit Project
                                    </button>
                                    {ownerId === user?._id && (
                                        <button
                                            onClick={async () => {
                                                await deleteProject(currentProject._id);
                                                router.replace("/dashboard");
                                            }}
                                            className="px-3 py-2 border rounded text-red-600"
                                        >
                                            Delete Project
                                        </button>
                                    )}
                                    {/* <input
                                        type="text"
                                        value={inviteValue}
                                        onChange={(e) => setInviteValue(e.target.value)}
                                        placeholder="Add by email or user id"
                                        className="px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <button
                                        onClick={handleInvite}
                                        className="px-3 py-2 bg-blue-600 text-white rounded-lg"
                                    >
                                        Add
                                    </button> */}
                                </div>
                            )}
                        </div>
                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Members</h3>
                            <div className="flex flex-wrap gap-2">
                                {currentProject.members && currentProject.members.map((m) => (
                                    <div key={m.userId._id} className="flex items-center gap-2 px-3 py-2 border rounded">
                                        <span className="text-sm">{m.userId.name} ({m.role})</span>
                                        {isAdmin && m.userId._id !== user?._id && (
                                            <button
                                                onClick={() => handleRemoveMember(m.userId._id)}
                                                className="text-red-600 text-xs"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {isEditProjectOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Edit Project</h3>
                            <div className="mb-3">
                                <input value={editProjectName} onChange={(e) => setEditProjectName(e.target.value)} className="w-full px-3 py-2 border rounded" />
                            </div>
                            <div className="mb-4">
                                <textarea value={editProjectDesc} onChange={(e) => setEditProjectDesc(e.target.value)} className="w-full px-3 py-2 border rounded" rows={4} />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsEditProjectOpen(false)} className="px-3 py-2 border rounded">Cancel</button>
                                <button
                                    onClick={async () => {
                                        await updateProject(currentProject!._id, { name: editProjectName, description: editProjectDesc });
                                        setIsEditProjectOpen(false);
                                    }}
                                    className="px-3 py-2 bg-blue-600 text-white rounded"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Task Board</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        disabled={!isMember}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-5 h-5 mr-1" />
                        Create New Task
                    </button>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="">All Status</option>
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>

                        {/* Assignee Filter */}
                        <div className="relative">
                            <select
                                value={assigneeFilter}
                                onChange={(e) => setAssigneeFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="">All Assignees</option>
                                {currentProject && currentProject.members && currentProject.members.map(member => (
                                    <option key={member.userId._id} value={member.userId._id}>
                                        {member.userId.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={dueStart}
                                onChange={(e) => setDueStart(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                                type="date"
                                value={dueEnd}
                                onChange={(e) => setDueEnd(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="none">Sort: None</option>
                                <option value="dueDate">Sort: Due Date</option>
                                <option value="createdAt">Sort: Created</option>
                            </select>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as any)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="asc">Asc</option>
                                <option value="desc">Desc</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {(searchQuery || statusFilter || assigneeFilter || dueStart || dueEnd || sortBy !== 'none') && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Clear
                            </button>
                        )}

                        {/* Results Count */}
                        <div className="text-sm text-gray-600 ml-auto flex items-center gap-3">
                            <span>{filteredTasks.length} tasks</span>
                            <span className="text-xs text-gray-400">{(refreshing ? 'Syncing…' : '')}</span>
                        </div>
                    </div>
                </div>
                {loading && <p>Loading tasks...</p>}
                {error && <p className="text-red-500">{error}</p>}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex space-x-4">
                        <TaskColumn title="To Do" tasks={columns.todo} droppableId="todo" />
                        <TaskColumn title="In Progress" tasks={columns.in_progress} droppableId="in_progress" />
                        <TaskColumn title="Done" tasks={columns.done} droppableId="done" />
                    </div>
                </DragDropContext>
            </div>
            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateTask}
                members={currentProject ? currentProject.members : []}
            />
        </ProtectedRoute>
    );
}