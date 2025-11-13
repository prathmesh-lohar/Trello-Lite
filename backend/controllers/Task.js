const router = require("express").Router();
const { protect } = require("../middleware/auth");
const {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../services/Task");

// Project-level
router.post("/:projectId/tasks", protect, createTask);
router.get("/:projectId/tasks", protect, getTasksByProject);

// Task-level
router.get("/:id", protect, getTaskById);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

module.exports = router;
