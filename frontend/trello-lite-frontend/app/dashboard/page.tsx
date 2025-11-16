"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";
import ProtectedRoute from "@/src/routes/ProtectedRoute";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import { useProjects } from "@/src/context/ProjectContext";
import { Search, Plus, Folder, CheckSquare, Users, BarChart2, Settings, MoreVertical } from "lucide-react";
import { ThemeSwitcher } from "@/src/components/ThemeSwitcher";
import type { LucideIcon } from "lucide-react";

// Helper Sidebar NavItem
const NavItem = ({ icon: Icon, label, isActive }: { icon: LucideIcon; label: string; isActive: boolean }) => (
    <div className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
        isActive ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"
    }`}>
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </div>
);

type UIProjectMember = { _id?: string; userId: { _id: string; name: string; avatar?: string } | string; role: string };
type UIProject = { _id: string; name: string; description: string; owner?: { name?: string } | string; members?: UIProjectMember[] };

const ProjectCard = ({ project, progress }: { project: UIProject; progress: number }) => {
    // Extract members array from project
    const members = project.members || [];

    return (
        <Link href={`/project/${project._id}`}>
            <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 w-full max-w-sm flex flex-col cursor-pointer hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-4 flex-grow">{project.description}</p>
                <p className="text-xs text-gray-400 mb-3">Owner: {typeof project.owner === 'object' ? (project.owner as { name?: string }).name : (project.owner as string)}</p>

                <div className="flex items-center mb-3">
                    {members.map((member: UIProjectMember) => {
                        const uname = typeof member.userId === 'object' ? (member.userId as { name: string }).name : '';
                        const avatarUrl = (typeof member.userId === 'object' && (member.userId as { avatar?: string }).avatar)
                            ? (member.userId as { avatar?: string }).avatar!
                            : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(uname || 'U')}`;

                        return (
                            <img
                                key={member._id}
                                src={avatarUrl}
                                alt={`Member ${uname}`}
                                title={`${uname} (${member.role})`}
                                className="w-8 h-8 rounded-full border-2 border-white -mr-2"
                                style={{ zIndex: members.length }}
                            />
                        );
                    })}
                </div>

                        <div className="flex items-center space-x-2 mt-auto">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    {progress > 0 && (
                        <span
                            className={`text-xs font-semibold ${
                                progress >= 90 ? "text-green-600" : "text-gray-600"
                            }`}
                        >
              {progress}%
            </span>
                    )}
                </div>
            </div>
        </Link>
    );
};


// CreateProjectModal with dynamic users selection
const CreateProjectModal = ({ isOpen, onClose, onCreate }: { isOpen: boolean; onClose: () => void; onCreate: (payload: { name: string; description: string; members: { userId: string; role: "admin" | "member" }[] }) => void }) => {
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [allUsers, setAllUsers] = useState<{ _id: string; name: string; email: string }[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<{ userId: string; role: "admin" | "member" }[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetch('http://localhost:1000/api/v1/users')
                .then((res) => res.json())
                .then(setAllUsers)
                .catch(console.error);
        }
    }, [isOpen]);

    const toggleUserSelection = (userId: string) => {
        if (selectedMembers.find((m) => m.userId === userId)) {
            setSelectedMembers(selectedMembers.filter((m) => m.userId !== userId));
        } else {
            setSelectedMembers([...selectedMembers, { userId, role: "member" }]);
        }
    };

    const updateUserRole = (userId: string, role: "admin" | "member") => {
        const updated = selectedMembers.map((m) =>
            m.userId === userId ? { ...m, role } : m
        );
        setSelectedMembers(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({ name, description, members: selectedMembers });
        setName("");
        setDescription("");
        setSelectedMembers([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Project</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Add Members</label>
                        <div className="max-h-48 overflow-auto border border-gray-300 rounded p-2">
                            {allUsers.map((user) => {
                                const member = selectedMembers.find((m) => m.userId === user._id);
                                return (
                                    <div key={user._id} className="flex items-center justify-between mb-1">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={!!member}
                                                onChange={() => toggleUserSelection(user._id)}
                                            />
                                            <span>{user.name} ({user.email})</span>
                                        </label>
                                        {member && (
                                            <select
                                                value={member.role}
                                                onChange={(e) => updateUserRole(user._id, e.target.value as "admin" | "member")}
                                                className="border border-gray-300 rounded px-2 py-1"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="member">Member</option>
                                            </select>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
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
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function DashboardPage() {
    const { projects, loading, error, createProject } = useProjects();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { logout } = useAuth();
    const router = useRouter();

    const [sidebarUser, setSidebarUser] = useState({
        name: "Alex Hartman",
        email: "alex@teamflow.com",
        avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?crop=entropy&cs=tinysrgb&fit=crop&h=100&w=100",
    });

    const currentUserId = "6733c5c93b9f9b4a2a1d4b91"; // your logged-in user id

    const handleCreateProject = async ({ name, description, members }: { name: string; description: string; members: { userId: string; role: "admin" | "member" }[] }) => {
        const payload = {
            name,
            description,
            owner: currentUserId,
            members,
        };

        await createProject(payload);
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('auth-user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (!parsedUser.avatar) {
                parsedUser.avatar = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(parsedUser.name)}`;
            }
            setSidebarUser(parsedUser);
        }
    }, []);


    

    return (
        <ProtectedRoute>
            <div className="flex h-screen bg-gray-50">
                <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between shadow-lg">
                    <div>
                        <div className="flex items-center text-xl font-bold text-blue-600 mb-8">
                            <Folder className="w-6 h-6 mr-2" />
                            TeamFlow
                        </div>
                        <nav className="space-y-1">
                            <NavItem icon={Folder} label="Projects" isActive={true} />
                            {/*<NavItem icon={CheckSquare} label="My Tasks" isActive={false} />*/}
                            {/*<NavItem icon={Users} label="Team" isActive={false} />*/}
                            {/*<NavItem icon={BarChart2} label="Reports" isActive={false} />*/}
                        </nav>
                    </div>
                    <div>
                        <NavItem icon={Settings} label="Settings" isActive={false} />
                        <div className="flex items-center space-x-3 mt-4 p-2">
                            <img src={sidebarUser.avatar} alt={sidebarUser.name} className="w-10 h-10 rounded-full" />
                            <div>
                                <div className="text-sm font-semibold text-gray-800">{sidebarUser.name}</div>
                                <div className="text-xs text-gray-500">{sidebarUser.email}</div>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto p-10">
                    <header className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
                        <div className="flex items-center space-x-4">
                            {/*<ThemeSwitcher />*/}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                            >
                                <Plus className="w-5 h-5 mr-1" />
                                Create New Project
                            </button>
                            <button
                                onClick={() => {
                                    logout();
                                    router.replace("/login");
                                }}
                                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
                    </header>

                    {loading && <p>Loading projects...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && projects.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg mb-4">No projects found.</p>
                            <p className="text-gray-400 text-sm">Create your first project to get started!</p>
                        </div>
                    )}

                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                progress={10}
                            />
                        ))}
                    </section>
                </main>
            </div>

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateProject}
            />
        </ProtectedRoute>
    );
}
