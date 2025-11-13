const Task = require("../models/Task");
const Project = require("../models/Project");

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, assignee, status, dueDate, order } = req.body;
    const { projectId } = req.params;
    const userId = req.user._id;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Check if user is a member
    const isMember =
      project.owner.toString() === userId.toString() ||
      project.members.some((m) => m.userId.toString() === userId.toString());
    if (!isMember)
      return res
        .status(403)
        .json({ message: "You are not a member of this project" });

    const task = await Task.create({
      title,
      description,
      assignee,
      status,
      dueDate,
      projectId,
      createdBy: userId,
      order,
    });

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all tasks for a project
const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ projectId }).populate("assignee", "name email");
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Get Tasks Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single task
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("assignee", "name email");
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (error) {
    console.error("Get Task Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    const task = await Task.findById(id).populate("projectId");
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Check permission
    const isAllowed =
      task.createdBy.toString() === userId.toString() ||
      task.projectId.owner.toString() === userId.toString() ||
      task.projectId.members.some(
        (m) => m.userId.toString() === userId.toString() && m.role === "admin"
      );

    if (!isAllowed)
      return res
        .status(403)
        .json({ message: "You do not have permission to update this task" });

    const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ message: "Task updated successfully", updatedTask });
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(id).populate("projectId");
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Check permission
    const isAllowed =
      task.projectId.owner.toString() === userId.toString() ||
      task.projectId.members.some(
        (m) => m.userId.toString() === userId.toString() && m.role === "admin"
      );

    if (!isAllowed)
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this task" });

    await task.deleteOne();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
};
