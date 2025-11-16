const router = require("express").Router();

const { getAllUsers} = require("../services/User");
const { protect } = require("../middleware/auth");

router.get("",getAllUsers)


module.exports = router;