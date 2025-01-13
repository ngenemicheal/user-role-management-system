import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const BASE_URL =
    import.meta.env.MODE === "development"
        ? "http://localhost:3000/api"
        : "/api";

const Home = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newRole, setNewRole] = useState("");

    const checkForUser = async () => {
        const token = localStorage.getItem("user_token");

        if (!token) {
            return navigate("/login");
        }

        axios
            .post(`${BASE_URL}/check-user`, { token })
            .then((response) => {
                if (response.data && response.data.isValid) {
                    setUserData(response.data.decoded);
                } else {
                    localStorage.removeItem("user_token");
                    navigate("/login");
                }
            })
            .catch((err) => {
                console.error("Token verification failed:", err);
                localStorage.removeItem("user_token");
                navigate("/login");
            });
    };

    useEffect(() => {
        checkForUser();
    }, [navigate]);

    useEffect(() => {
        if (userData) {
            axios
                .post(`${BASE_URL}/users`, {
                    userId: userData.userId,
                })
                .then((response) => {
                    setUsers(response.data);
                    setLoading(false);
                })
                .catch((err) => {
                    setError("Error fetching data");
                    setLoading(false);
                });
        }
    }, [userData]);

    const handleRoleChange = () => {
        axios
            .post(`${BASE_URL}/user-edit`, {
                newRole,
                userToUpdateId: selectedUser._id,
                userId: userData.userId,
            })
            .then((response) => {
                toast.success(response.data.message);
                setUsers(
                    users.map((user) =>
                        user._id === selectedUser._id
                            ? { ...user, role: newRole }
                            : user
                    )
                );
                setShowModal(false);
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
                setError("Error updating role");
            });
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setShowModal(true);
    };

    const handleDeleteClick = async (user) => {
        try {
            const response = await axios.post(`${BASE_URL}/user-delete`, {
                userToDeleteId: user._id,
                userId: userData.userId,
            });

            toast.success(response.data.message);

            setUsers((prevUsers) =>
                prevUsers.filter((u) => u._id !== user._id)
            );
        } catch (err) {
            if (err.response) {
                toast.error(
                    err.response.data.message || "Something went wrong!"
                );
            } else if (err.request) {
                toast.error("No response from the server!");
            } else {
                toast.error("Error setting up the request!");
            }
        }
    };

    const getRoleOptions = () => {
        if (userData.role === "student" || userData.role === "teacher") {
            return [userData.role];
        }

        if (userData.role === "admin") {
            return ["student", "teacher"];
        }

        if (userData.role === "super-admin") {
            return ["student", "teacher", "admin"];
        }

        return [];
    };

    if (loading) {
        return (
            <div className="w-screen h-screen bg-gray-100 flex flex-col justify-center items-center">
                <h5 className="font-light text-3xl flex w-full justify-center items-center mb-3">
                    Loading...
                </h5>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-screen h-screen bg-gray-100 flex flex-col justify-center items-center">
                <div>
                    <h5 className="font-light text-3xl flex w-full justify-center items-center mb-3">
                        {error}
                    </h5>
                    <button
                        className="bg-blue-400 p-2 px-5 text-white justify-center items-center w-full"
                        onClick={() => {
                            location.reload();
                        }}
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen bg-gray-100 flex flex-col justify-center items-center">
            <div>
                <h5 className="font-light text-3xl flex w-full justify-center items-center mb-3">
                    Hello {userData.name}
                </h5>
                <h5 className="font-light text-lg flex w-full justify-center items-center mb-3 mt-3">
                    You have {userData.role} role permissions
                </h5>
                <button
                    className="bg-red-400 p-2 px-5 text-white justify-center items-center w-full"
                    onClick={() => {
                        localStorage.removeItem("user_token");
                        navigate("/login");
                    }}
                >
                    Logout
                </button>
            </div>

            <div className="container mx-auto p-5">
                <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                    <table className="min-w-full table-auto">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="px-4 py-2 text-left">#</th>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Email</th>
                                <th className="px-4 py-2 text-left">Role</th>
                                <th className="px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-800">
                            {users.map((user, index) => (
                                <tr
                                    key={user._id}
                                    className="border-b hover:bg-gray-100"
                                >
                                    <td className="px-4 py-2">{index + 1}</td>
                                    <td className="px-4 py-2">
                                        {user.firstname} {user.lastname}
                                    </td>
                                    <td className="px-4 py-2">{user.email}</td>
                                    <td className="px-4 py-2">{user.role}</td>
                                    <td className="px-4 py-2">
                                        <button
                                            className={`text-blue-600 hover:text-blue-800 ${
                                                userData.role === "teacher" ||
                                                userData.role === "student" ||
                                                userData.userId === user._id
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                userData.role !== "teacher" &&
                                                userData.role !== "student" &&
                                                userData.userId !== user._id &&
                                                handleEditClick(user)
                                            }
                                            disabled={
                                                userData.role === "teacher" ||
                                                userData.role === "student" ||
                                                userData.userId === user._id
                                            }
                                        >
                                            Edit
                                        </button>
                                        &nbsp; &nbsp; &nbsp;
                                        <button
                                            className={`text-red-600 hover:text-red-800 ${
                                                userData.role !==
                                                    "super-admin" ||
                                                userData.userId === user._id
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                userData.role ===
                                                    "super-admin" &&
                                                userData.userId !== user._id &&
                                                handleDeleteClick(user)
                                            }
                                            disabled={
                                                userData.role !==
                                                    "super-admin" ||
                                                userData.userId === user._id
                                            }
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
                    <div className="bg-white p-5 rounded-lg w-1/3">
                        <h3 className="text-lg mb-4">Edit Role</h3>
                        <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="w-full p-2 mb-4 border rounded"
                        >
                            {getRoleOptions().map((roleOption) => (
                                <option key={roleOption} value={roleOption}>
                                    {roleOption}
                                </option>
                            ))}
                        </select>
                        <div className="flex justify-between">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRoleChange}
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
