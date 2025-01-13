const express = require("express");
const router = express.Router();
const {registerUser, loginUser, checkUser, fetchUsers, updateUserRole, deleteUser} = require("../controllers/user.controller.js");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/check-user", checkUser);
router.post("/users", fetchUsers);
router.post('/user-edit', updateUserRole);
router.post('/user-delete', deleteUser);

module.exports = router;