import React, { useContext } from "react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../store/authContext";
import { toast } from "react-toastify";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const handleClick = async (e) => {
    e.preventDefault();
    try {
      await login({ username, password });
      navigate("/");
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        Object.values(errors).forEach((msgArr) => {
          toast.error(msgArr[0]);
        });
      } else {
        toast.error(err.response?.data?.error || "Login failed!");
      }
    }
  };
  return (
    <div className="w-full h-screen bg-blue-200 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-2xl w-80 flex flex-col items-center"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-500">
          Login
        </h2>
        <form className="flex flex-col space-y-4 w-full">
          <input
            value={username}
            type="text"
            placeholder="UserName"
            className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            value={password}
            type="password"
            placeholder="Password"
            className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition-all duration-300"
            onClick={handleClick}
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
