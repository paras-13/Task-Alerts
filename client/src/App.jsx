import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./routes/ProtectedRoute";
import MyDay from "./components/MyDay";
import MyTasks from "./components/MyTasks";
import Completed from "./components/completed";
import Reminders from "./components/reminders";
import UserStats from "./components/UserStats";
const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />}>
            <Route path="/" element={<UserStats />} />
            <Route path="myDay" element={<MyDay />} />
            <Route path="my-tasks" element={<MyTasks />} />
            <Route path="completed" element={<Completed />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="myStats" element={<UserStats />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer />
    </>
  );
};

export default App;
