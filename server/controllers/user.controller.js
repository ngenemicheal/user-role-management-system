const User = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
    try {
        const {firstname, lastname, email, password} = req.body;
        const user = await User.findOne({ email: email });
        if (user) {
            return res.status(400).json({ message: "user already exists" });
        }

        let role = "student";
        const hashed_password = await bcrypt.hash(password, 10);

        if (email === process.env.SUPER_ADMIN) {
            role = 'super-admin';
        }

        const newUser = await User.create({
            firstname,
            lastname,
            email,
            password: hashed_password,
            role
        });

        res.status(201).json({ message: "user created successfully" });
    } catch (error) {
        console.log(`an error occured => ${error}`);
        res.status(400).json({ message: "something went wrong" });
    }
}

exports.loginUser = async (req, res) => {
    try {
        const { email, password} = req.body;
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({ message: "user not found" });
        }

        const check_password = await bcrypt.compare(password, user.password);

        if (!check_password) {
            return res.status(400).json({ message: "invalid credentials" });
        }

        const payload = {
            userId: `${user._id}`,
            email: `${user.email}`,
            role: `${user.role}`,
            name: `${user.firstname} ${user.lastname}`
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: "user logged in successfully",
            token
        });
    } catch (error) {
        console.log(`an error occured => ${error}`);
        res.status(400).json({ message: "something went wrong" });
    }
}

exports.checkUser = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'token is required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        return res.status(200).json({ message: 'user is valid', isValid: true, decoded });
    } catch (err) {
        console.error(err);

        return res.status(401).json({ message: 'invalid or expired token' });
    }
};

exports.fetchUsers = async (req, res) => {
    const { role, userId } = req.body;

    try {
        const requestingUser = await User.findById(userId);

        if (!requestingUser) {
            return res.status(404).json({ message: "user not found" });
        }

        let users;
        const fieldsToSelect = 'firstname lastname email role';

        if (requestingUser.role === "super-admin") {
            users = await User.find().select(fieldsToSelect);
        } else if (requestingUser.role === "admin") {
            users = await User.find({ role: { $in: ["teacher", "student"] } }).select(fieldsToSelect);
        } else if (requestingUser.role === "teacher") {
            users = await User.find({ role: "student" }).select(fieldsToSelect);
        } else if (requestingUser.role === "student") {
            users = await User.find({ _id: userId }).select(fieldsToSelect);
        } else {
            return res.status(403).json({ message: "unauthorized access" });
        }
        res.json(users);
    } catch (err) {
        console.error("error fetching users:", err);
        res.status(500).json({ message: "error fetching users" });
    }
};

exports.updateUserRole = async (req, res) => {
    const { userId, userToUpdateId, newRole } = req.body;
    const userToUpdate = await User.findById(userToUpdateId);
    const requestingUser = await User.findById(userId);

    if (!userToUpdate) {
        return res.status(404).json({ message: "user not found" });
    }

    if (!requestingUser) {
        return res.status(403).json({ message: "unauthorized" });
    }

    if (requestingUser.role === "student" || requestingUser.role === "teacher") {
        return res.status(403).json({ message: "you don't have permission to edit roles" });
    }

    if (requestingUser.role === "admin") {
        if (newRole !== "student" && newRole !== "teacher") {
            return res.status(403).json({ message: "admins can only change a teacher to student or vice versa" });
        }
    }

    if (requestingUser.role === "super-admin") {
        if (!["student", "teacher", "admin"].includes(newRole)) {
            return res.status(400).json({ message: "invalid role for super-admin" });
        }
    }

    userToUpdate.role = newRole;

    try {
        await userToUpdate.save();
        res.status(200).json({ message: "user role updated successfully", user: userToUpdate });
    } catch (error) {
        console.error("error updating user role:", error);
        res.status(500).json({ message: "internal Server Error" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { userId, userToDeleteId } = req.body;
        const requestingUser = await User.findById(userId);
        
        if (!requestingUser || requestingUser.role !== "super-admin") {
            return res.status(403).json({ message: "unauthorized" });
        }

        if (requestingUser._id.toString() === userToDeleteId) {
            return res.status(400).json({ message: "super-admin cannot delete themselves" });
        }

        const userToDelete = await User.findByIdAndDelete(userToDeleteId);
        
        if (!userToDelete) {
            return res.status(404).json({ message: "user not found" });
        }

        res.status(200).json({ message: "user deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "something went wrong" });
    }
};
