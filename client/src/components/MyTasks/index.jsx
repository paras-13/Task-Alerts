import React, { useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../store/authContext";
import { toast } from "react-toastify";
import makeRequest from "../../axios";
import dayjs from "dayjs";
import TaskModal from "../Modals/TaskModal";
import AddTaskCard from "../Modals/AddTaskCard";

function MyTasks() {
  const { currentUser } = useContext(AuthContext);
  const [openEditableWindow, setOpenEditableWindow] = useState(false);
  const [windowData, setWindowData] = useState({});
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "overdue"
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();

  // Fetch pending tasks
  const {
    data: pendingTasks,
    isLoading: pendingLoading,
    error: pendingError,
  } = useQuery({
    queryKey: ["pendingTasks", currentUser?.id, search],
    queryFn: async () => {
      const response = await makeRequest.get(
        `/tasks/pending/${currentUser.id}?search=${encodeURIComponent(search)}`
      );
      return response.data;
    },
    enabled: !!currentUser?.id && activeTab === "pending",
    staleTime: 0,
  });

  // Fetch overdue tasks
  const {
    data: overdueTasks,
    isLoading: overdueLoading,
    error: overdueError,
  } = useQuery({
    queryKey: ["overdueTasks", currentUser?.id, search],
    queryFn: async () => {
      const response = await makeRequest.get(
        `/tasks/overdue/${currentUser.id}?search=${encodeURIComponent(search)}`
      );
      return response.data;
    },
    enabled: !!currentUser?.id && activeTab === "overdue",
    staleTime: 0,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (taskId) => {
      await makeRequest.delete(`/tasks/remove-task/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["pendingTasks", currentUser?.id]);
      queryClient.invalidateQueries(["overdueTasks", currentUser?.id]);
      toast.success("Task Removed!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete task");
    },
  });

  const handleTaskClick = (t) => {
    setOpenEditableWindow(true);
    setWindowData(t);
  };

  const handleDelete = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate(taskId);
    }
  };

  // Which data to display
  const tasksToDisplay = activeTab === "pending" ? pendingTasks : overdueTasks;
  const isLoading = activeTab === "pending" ? pendingLoading : overdueLoading;
  const error = activeTab === "pending" ? pendingError : overdueError;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex gap-6 max-w-7xl mx-auto">
        {/* Add Task Form */}
        <AddTaskCard userId={currentUser.id} />

        {/* Tasks Section */}
        <div className="w-2/3 bg-white p-6 rounded-xl shadow-lg overflow-y-auto max-h-[80vh]">
          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <button
                className={`px-4 py-2 rounded-t-lg font-semibold transition ${
                  activeTab === "pending"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-blue-700"
                }`}
                onClick={() => {
                  setActiveTab("pending");
                  setSearch("");
                }}
              >
                Pending
              </button>
              <button
                className={`px-4 py-2 rounded-t-lg font-semibold transition ${
                  activeTab === "overdue"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-red-700"
                }`}
                onClick={() => {
                  setActiveTab("overdue");
                  setSearch("");
                }}
              >
                Overdue
              </button>
            </div>
            <input
              type="search"
              placeholder={`Search ${activeTab} tasks...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full p-2 border rounded mb-4 ${
                activeTab === "pending" ? "border-blue-400" : "border-red-400"
              }`}
            />
          </div>
          {isLoading ? (
            <p className="text-gray-500">Loading tasks...</p>
          ) : error ? (
            <p className="text-red-500">Error loading tasks.</p>
          ) : tasksToDisplay?.length > 0 ? (
            <div className="space-y-4">
              {tasksToDisplay.map((t) => (
                <div
                  key={t.id}
                  className={`p-4 border rounded-lg shadow-sm cursor-pointer flex justify-between items-center ${
                    activeTab === "pending"
                      ? "bg-blue-50 border-blue-400"
                      : "bg-red-50 border-red-400"
                  }`}
                  onClick={() => handleTaskClick(t)}
                >
                  <div>
                    <h4
                      className={`text-lg font-semibold ${
                        activeTab === "pending"
                          ? "text-blue-700"
                          : "text-red-700"
                      }`}
                    >
                      {t.title}
                    </h4>
                    <p className="text-gray-700 mb-1">{t.description}</p>
                    <p className="text-sm text-gray-500">
                      Due: {dayjs(t.dueDate).format("DD MMM YYYY")} at{" "}
                      {t.dueTime}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(t.id);
                    }}
                    className={`ml-4 px-3 py-1 rounded ${
                      activeTab === "pending"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-red-600 hover:bg-red-700"
                    } text-white`}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {openEditableWindow && (
                <TaskModal
                  windowData={windowData}
                  onClose={() => setOpenEditableWindow(false)}
                />
              )}
            </div>
          ) : (
            <p className="text-gray-500">No {activeTab} tasks found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyTasks;
