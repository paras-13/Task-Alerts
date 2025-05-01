import React, { useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../store/authContext";
import { toast } from "react-toastify";
import makeRequest from "../../axios";
import dayjs from "dayjs";
import TaskModal from "../Modals/TaskModal";

export default function Completed() {
  const { currentUser } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [openEditableWindow, setOpenEditableWindow] = useState(false);
  const [windowData, setWindowData] = useState(null);

  const queryClient = useQueryClient();

  // Fetch completed tasks with search
  const {
    data: completedTasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["completedTasks", currentUser?.id, search],
    queryFn: async () => {
      const response = await makeRequest.get(
        `/tasks/completed/${currentUser.id}?search=${encodeURIComponent(
          search
        )}`
      );
      return response.data;
    },
    enabled: !!currentUser?.id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (taskId) => makeRequest.delete(`/tasks/remove-task/${taskId}`),
    onSuccess: () => {
      toast.success("Task deleted successfully!");
      queryClient.invalidateQueries(["completedTasks", currentUser?.id]);
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

  return (
    <div className="p-8 bg-gray-100 min-h-screen max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Completed Tasks</h2>

      <input
        type="search"
        placeholder="Search completed tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {isLoading ? (
        <p className="text-gray-500 text-center">Loading completed tasks...</p>
      ) : error ? (
        <p className="text-red-500 text-center">Error loading tasks.</p>
      ) : completedTasks?.length === 0 ? (
        <p className="text-gray-500 text-center">No completed tasks found.</p>
      ) : (
        <div className="space-y-4">
          {completedTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 bg-green-50 border border-green-400 rounded-lg shadow cursor-pointer flex justify-between items-center"
              onClick={() => handleTaskClick(task)}
              title="Click to edit task"
            >
              <div>
                <h3 className="text-lg font-semibold text-green-700">
                  {task.title}
                </h3>
                <p className="text-gray-700">{task.description}</p>
                <p className="text-sm text-green-600 mt-1">
                  Completed on:{" "}
                  {dayjs(task.completed_at || task.updated_at).format(
                    "DD MMM YYYY"
                  )}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(task.id);
                }}
                className="ml-4 px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-semibold transition"
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
