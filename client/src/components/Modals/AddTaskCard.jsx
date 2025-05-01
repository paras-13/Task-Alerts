import React, { useState, useContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import makeRequest from "../../axios";
import { AuthContext } from "../../store/authContext";

export default function AddTaskCard({ userId, onTaskAdded }) {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [task, setTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    reminder: false,
    reminderDate: "",
    reminderTime: "",
  });

  const mutation = useMutation({
    mutationFn: async (newTask) => {
      const response = await makeRequest.post(
        `/tasks/${userId || currentUser?.id}`,
        {
          ...newTask,
          createdDate: new Date().toISOString().split("T")[0],
          createdTime: new Date().toTimeString().slice(0, 5),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([
        "createdTodayTasks",
        userId || currentUser?.id,
      ]);
      queryClient.invalidateQueries([
        "dueTodayTasks",
        userId || currentUser?.id,
      ]);
      toast.success("Task created successfully!");
      setTask({
        title: "",
        description: "",
        dueDate: "",
        dueTime: "",
        reminder: false,
        reminderDate: "",
        reminderTime: "",
      });
      if (onTaskAdded) onTaskAdded();
    },
    onError: (err) => {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        Object.entries(errors).forEach(([field, messages]) => {
          toast.error(`${field}: ${messages.join(", ")}`);
        });
      } else {
        toast.error(err.response?.data?.error || "Failed to add Task");
      }
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTask((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(task);
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Add New Task</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-1">Task Title</label>
          <input
            name="title"
            value={task.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task title"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Task Description</label>
          <textarea
            name="description"
            value={task.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task description"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={task.dueDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Due Time</label>
            <input
              type="time"
              name="dueTime"
              value={task.dueTime}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg shadow-sm"
              required
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="reminder"
            checked={task.reminder}
            onChange={handleChange}
            className="w-5 h-5"
          />
          <label className="text-gray-700">Set Reminder</label>
        </div>
        {task.reminder && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Reminder Date</label>
              <input
                type="date"
                name="reminderDate"
                value={task.reminderDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg shadow-sm"
                required={task.reminder}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Reminder Time</label>
              <input
                type="time"
                name="reminderTime"
                value={task.reminderTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg shadow-sm"
                required={task.reminder}
              />
            </div>
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? "Creating Task..." : "Create Task"}
        </button>
      </form>
    </div>
  );
}
