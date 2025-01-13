import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

const BASE_URL =
    import.meta.env.MODE === "development"
        ? "http://localhost:3000/api"
        : "/api";

const Register = () => {
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigate = useNavigate();

    const handleRegister = () => {
        if (
            !firstname ||
            !lastname ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            return toast.error("All fields are required");
        }
        if (password !== confirmPassword) {
            return toast.error("Passwords don't match");
        }
        axios
            .post(`${BASE_URL}/register`, {
                firstname,
                lastname,
                email,
                password,
            })
            .then((res) => {
                toast.success(res.data.message);
                navigate("/login");
            })
            .catch((err) => {
                if (err.response) {
                    toast.error(
                        err.response.data.message || "Something went wrong!"
                    );
                } else if (err.request) {
                    toast.error("No response from the server!");
                } else {
                    toast.error("Error setting up the request!");
                }
            });
    };

    return (
        <div className="w-screen h-screen bg-gray-100 flex flex-col justify-center items-center">
            <div className="w-fit h-fit bg-white p-8 rounded-md">
                <div>
                    <h2 className="font-bold text-2xl flex w-full justify-center items-center mb-3">
                        Register
                    </h2>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                    <input
                        type="text"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        placeholder="firstname"
                        className="p-2 outline-none bg-gray-100 rounded-md w-72"
                    />
                    <input
                        type="text"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        placeholder="lastname"
                        className="p-2 outline-none bg-gray-100 rounded-md w-72"
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email"
                        className="p-2 outline-none bg-gray-100 rounded-md w-72"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password"
                        className="p-2 outline-none bg-gray-100 rounded-md w-72"
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="confirm password"
                        className="p-2 outline-none bg-gray-100 rounded-md w-72"
                    />
                </div>
                <div>
                    <button
                        onClick={handleRegister}
                        className="w-72 bg-green-400 text-white mt-5 py-1 rounded-md font-semibold"
                    >
                        Register
                    </button>
                </div>
                <div>
                    <h5 className="flex w-full justify-center items-center mt-3">
                        Already have an account?
                        <Link
                            to="/login"
                            className="text-blue-600 hover:text-blue-800"
                        >
                            &nbsp;Login
                        </Link>
                    </h5>
                </div>
            </div>
        </div>
    );
};

export default Register;
