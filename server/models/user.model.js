const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
    {
        firstname: {
            type: String,
            required: [true, "Please provide a valid first name"],
        },
        lastname: {
            type: String,
            required: [true, "Please provide a valid last name"],
        },
        email: {
            type: String,
            required: [true, "Please provide a valid email"],
        },
        password: {
            type: String,
            required: [true, "Please provide a valid password"],
        },
        role: {
            type: String,
            enum: ["student", "teacher", "admin", "super-admin"],
            default: "student",
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;