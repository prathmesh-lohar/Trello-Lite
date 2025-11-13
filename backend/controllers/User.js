const router = require("express").Router();

const { register,login,authMe } = require("../services/User");
const { protect } = require("../middleware/auth");

router.post("/register",register)
router.post("/login",login)
router.get("/me", protect, authMe);

module.exports = router;