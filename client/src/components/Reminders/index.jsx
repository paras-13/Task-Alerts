import React, { useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../store/authContext";
import { toast } from "react-toastify";
import makeRequest from "../../axios";
import dayjs from "dayjs";
import TaskModal from "../Modals/TaskModal";

export default function Reminders() {
  const { currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [openEditableWindow, setOpenEditableWindow] = useState(false);
  const [windowData, setWindowData] = useState(null);

  const queryClient = useQueryClient();

  // Fetch reminders
  const {
    data: upcomingReminders,
    isLoading: upcomingLoading,
    error: upcomingError,
  } = useQuery({
    queryKey: ["upcomingReminders", currentUser?.id, search],
    queryFn: async () => {
      const response = await makeRequest.get(
        `/tasks/reminders/upcoming/${
          currentUser.id
        }?search=${encodeURIComponent(search)}`
      );
      return response.data;
    },
    enabled: !!currentUser?.id && activeTab === "upcoming",
  });

  const {
    data: pastReminders,
    isLoading: pastLoading,
    error: pastError,
  } = useQuery({
    queryKey: ["pastReminders", currentUser?.id, search],
    queryFn: async () => {
      const response = await makeRequest.get(
        `/tasks/reminders/past/${currentUser.id}?search=${encodeURIComponent(
          search
        )}`
      );
      return response.data;
    },
    enabled: !!currentUser?.id && activeTab === "past",
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (taskId) => makeRequest.delete(`/tasks/remove-task/${taskId}`),
    onSuccess: () => {
      toast.success("Task deleted successfully!");
      queryClient.invalidateQueries(["upcomingReminders", currentUser?.id]);
      queryClient.invalidateQueries(["pastReminders", currentUser?.id]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete task");
    },
  });

  const handleDelete = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate(taskId);
    }
  };

  const handleTaskClick = (task) => {
    setWindowData(task);
    setOpenEditableWindow(true);
  };

  const handleCloseModal = () => {
    setOpenEditableWindow(false);
    setWindowData(null);
  };

  const remindersToDisplay =
    activeTab === "upcoming" ? upcomingReminders : pastReminders;
  const isLoading = activeTab === "upcoming" ? upcomingLoading : pastLoading;
  const error = activeTab === "upcoming" ? upcomingError : pastError;

  return (
    <div className="p-8 bg-gray-100 min-h-screen max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Reminders</h2>
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition ${
            activeTab === "upcoming"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-blue-700"
          }`}
          onClick={() => {
            setActiveTab("upcoming");
            setSearch("");
          }}
        >
          Upcoming Reminders
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition ${
            activeTab === "past"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-red-700"
          }`}
          onClick={() => {
            setActiveTab("past");
            setSearch("");
          }}
        >
          Past Reminders
        </button>
      </div>
      <input
        type="search"
        placeholder={`Search ${activeTab} reminders...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={`w-full p-3 mb-6 border rounded-lg focus:outline-none ${
          activeTab === "upcoming" ? "border-blue-400" : "border-red-400"
        }`}
      />
      {isLoading ? (
        <p className="text-gray-500 text-center">Loading reminders...</p>
      ) : error ? (
        <p className="text-red-500 text-center">Error loading reminders.</p>
      ) : remindersToDisplay?.length === 0 ? (
        <p className="text-gray-500 text-center">
          No {activeTab} reminders found.
        </p>
      ) : (
        <div className="space-y-4">
          {remindersToDisplay.map((task) => (
            <div
              key={task.id}
              className={`p-4 border rounded-lg shadow cursor-pointer flex justify-between items-center ${
                activeTab === "upcoming"
                  ? "bg-blue-50 border-blue-400"
                  : "bg-red-50 border-red-400"
              }`}
              onClick={() => handleTaskClick(task)}
              title="Click to edit task"
            >
              <div>
                <h3
                  className={`text-lg font-semibold ${
                    activeTab === "upcoming" ? "text-blue-700" : "text-red-700"
                  }`}
                >
                  {task.title}
                </h3>
                <p className="text-gray-700">{task.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Reminder: {dayjs(task.reminderDate).format("DD MMM YYYY")} at{" "}
                  {task.reminderTime}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(task.id);
                }}
                className={`ml-4 px-3 py-1 rounded ${
                  activeTab === "upcoming"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-red-600 hover:bg-red-700"
                } text-white font-semibold transition`}
                aria-label={`Delete task ${task.title}`}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
      {openEditableWindow && windowData && (
        <TaskModal windowData={windowData} onClose={handleCloseModal} />
      )}
    </div>
  );
}
