import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../store/authContext";
import {
  LogOut,
  User,
  PlusCircle,
  CheckCircle,
  Bell,
  List,
} from "lucide-react";

function Sidebar() {
  const { currentUser, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname.includes(path);

  const handleLogout = () => {
    logout(); // Make sure this clears token/context
    navigate("/login");
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col justify-between h-screen p-4 shadow-md">
      {/* Profile Section */}
      <div>
        <div className="mb-6 border-b border-gray-700 pb-4">
          <div className="flex items-center space-x-3">
            <User className="text-white w-10 h-10" />
            <div>
              <h2 className="text-lg font-semibold">{currentUser?.name}</h2>
              <p className="text-xs text-gray-400">{currentUser?.email}</p>
            </div>
          </div>
          <button className="mt-4 bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700 transition duration-300">
            Update Profile
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-4">
          <Link
            className={`flex items-center space-x-2 p-2 rounded-md ${
              isActive("add-task") ? "bg-blue-600" : "hover:bg-blue-700"
            }`}
            to="/add-task"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Task</span>
          </Link>

          <Link
            className={`flex items-center space-x-2 p-2 rounded-md ${
              isActive("my-tasks") ? "bg-blue-600" : "hover:bg-blue-700"
            }`}
            to="/my-tasks"
          >
            <List className="w-5 h-5" />
            <span>My Tasks</span>
          </Link>

          <Link
            className={`flex items-center space-x-2 p-2 rounded-md ${
              isActive("completed") ? "bg-blue-600" : "hover:bg-blue-700"
            }`}
            to="/completed"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Completed</span>
          </Link>

          <Link
            className={`flex items-center space-x-2 p-2 rounded-md ${
              isActive("reminders") ? "bg-blue-600" : "hover:bg-blue-700"
            }`}
            to="/reminders"
          >
            <Bell className="w-5 h-5" />
            <span>Reminders</span>
          </Link>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 p-2 bg-red-600 text-white rounded-md w-full hover:bg-red-700 transition duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
