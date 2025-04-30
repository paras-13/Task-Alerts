import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import makeRequest from "../../axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      const res = await makeRequest.post("auth/register", {
        username,
        email,
        password,
        confirm_password: confirmPassword,
        name,
      });

      toast.success(res.data.message || "Registered successfully!");
      navigate("/login");
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        Object.values(errors).forEach((msgArr) => {
          toast.error(msgArr[0]);
        });
      } else {
        toast.error(err.response?.data?.error || "Registration failed!");
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
          Register
        </h2>
        <form className="flex flex-col space-y-4 w-full">
          <input
            value={username}
            type="text"
            placeholder="Username"
            className="p-3 border rounded-xl"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            value={email}
            type="email"
            placeholder="Email"
            className="p-3 border rounded-xl"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            value={name}
            type="text"
            placeholder="Name"
            className="p-3 border rounded-xl"
            onChange={(e) => setName(e.target.value)}
          />
          <input
            value={password}
            type="password"
            placeholder="Password"
            className="p-3 border rounded-xl"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            value={confirmPassword}
            type="password"
            placeholder="Confirm Password"
            className="p-3 border rounded-xl"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600"
            onClick={handleClick}
          >
            Register
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
