const Project = require("../models/Project");

//  Create a new project
const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    
    const projectMembers = Array.isArray(members) && members.length > 0
      ? members
      : [{ userId: req.user._id, role: "admin" }];

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: projectMembers, 
    });

    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


//  Get all projects where the user is owner or member
const getProjects = async (req, res) => {
  try {
    const userId = req.user._id;

    const projects = await Project.find({
      $or: [{ owner: userId }, { "members.userId": userId }],
    }).populate("owner", "name email");

    res.status(200).json(projects);
  } catch (error) {
    console.error("Get Projects Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//  Get single project by ID
const getProjectById = async (req, res) => {
  try {
    const userId = req.user._id;
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members.userId", "name email");

    if (!project) return res.status(404).json({ message: "Project not found" });

    const isMember =
      project.owner._id.equals(userId) ||
      project.members.some((m) => m.userId._id.equals(userId));

    if (!isMember)
      return res.status(403).json({ message: "Access denied to this project" });

    res.status(200).json(project);
  } catch (error) {
    console.error("Get Project Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//  Update project (only owner or admin)
const updateProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "Project not found" });

    const isAdmin =
      project.owner.equals(userId) ||
      project.members.some(
        (m) => m.userId.equals(userId) && m.role === "admin"
      );

    if (!isAdmin)
      return res.status(403).json({ message: "Only admins can update project" });

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({ message: "Project updated successfully", project: updatedProject });
  } catch (error) {
    console.error("Update Project Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//  Delete project (only owner)
const deleteProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!project.owner.equals(userId))
      return res.status(403).json({ message: "Only owner can delete project" });

    await project.deleteOne();
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete Project Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//  Add a member to a project (only admin/owner)
const addMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);
    const requesterId = req.user._id;

    if (!project) return res.status(404).json({ message: "Project not found" });

    const isAdmin =
      project.owner.equals(requesterId) ||
      project.members.some(
        (m) => m.userId.equals(requesterId) && m.role === "admin"
      );

    if (!isAdmin)
      return res.status(403).json({ message: "Only admins can add members" });

    const alreadyMember = project.members.some((m) =>
      m.userId.equals(userId)
    );
    if (alreadyMember)
      return res.status(400).json({ message: "User already a member" });

    project.members.push({ userId, role: role || "member" });
    await project.save();

    res.status(200).json({ message: "Member added successfully", project });
  } catch (error) {
    console.error("Add Member Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//  Remove a member (only admin/owner)
const removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    const requesterId = req.user._id;

    if (!project) return res.status(404).json({ message: "Project not found" });

    const isAdmin =
      project.owner.equals(requesterId) ||
      project.members.some(
        (m) => m.userId.equals(requesterId) && m.role === "admin"
      );

    if (!isAdmin)
      return res.status(403).json({ message: "Only admins can remove members" });

    project.members = project.members.filter(
      (m) => !m.userId.equals(userId)
    );

    await project.save();

    res.status(200).json({ message: "Member removed successfully", project });
  } catch (error) {
    console.error("Remove Member Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
