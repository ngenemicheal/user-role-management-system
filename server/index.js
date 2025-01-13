const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const dotenv = require("dotenv");
const path = require('path');
const userRoutes = require("./routes/user.route.js");

const app = express();
// const __dirname = path.resolve();
app.use(express.json());
app.use(cors());
dotenv.config();

app.use("/api", userRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../client", "dist", "index.html"));
    });
}

const PORT = process.env.PORT || 3333;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(() => {
        console.error("Error connecting to MongoDB");
        process.exit(1);
    });