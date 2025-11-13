const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require("../services/ProjectService")

const { protect } = require("../middleware/auth");

// CRUD routes
router.post("/", protect, createProject);
router.get("/", protect, getProjects);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);

// Member management
router.post("/:id/members", protect, addMember);
router.delete("/:id/members", protect, removeMember);

module.exports = router;
