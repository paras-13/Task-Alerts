import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import makeRequest from "../../axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import dayjs from "dayjs";

export default function TaskModal({ windowData, onClose }) {
  // Helper to ensure time is always in HH:mm format
  const parseTime = (timeStr) => (timeStr ? timeStr.slice(0, 5) : "");

  // Helper to ensure date is always in YYYY-MM-DD format
  const parseDate = (dateStr) =>
    dateStr ? dayjs(dateStr).format("YYYY-MM-DD") : "";

  // Initialize state with properly formatted dates/times
  const [task, setTask] = useState({
    ...windowData,
    reminder: windowData.reminder || false,
    completed: windowData.completed || false,
    dueDate: parseDate(windowData.dueDate),
    dueTime: parseTime(windowData.dueTime),
    reminderDate: parseDate(windowData.reminderDate),
    reminderTime: parseTime(windowData.reminderTime),
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (updatedTask) => {
      // Always send dates in YYYY-MM-DD and times in HH:mm
      const payload = {
        ...updatedTask,
        dueDate: parseDate(updatedTask.dueDate),
        dueTime: parseTime(updatedTask.dueTime),
        reminderDate: updatedTask.reminder
          ? parseDate(updatedTask.reminderDate)
          : null,
        reminderTime: updatedTask.reminder
          ? parseTime(updatedTask.reminderTime)
          : null,
      };
      const response = await makeRequest.put(
        `/tasks/update/${updatedTask.id}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasksToday", windowData.user_id],
      });
      queryClient.invalidateQueries(["createdTodayTasks", windowData.user_id]);
      queryClient.invalidateQueries(["dueTodayTasks", windowData.user_id]);
      toast.success("Task updated successfully!");
      onClose();
    },
    onError: (err) => {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        Object.entries(errors).forEach(([field, messages]) => {
          toast.error(`${field}: ${messages.join(", ")}`);
        });
      } else {
        toast.error(err.response?.data?.error || "Failed to update task");
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

  const handleSave = () => {
    mutation.mutate(task);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg mx-4 relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-3xl font-bold leading-none"
          aria-label="Close modal"
        >
          &times;
        </button>

        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Edit Task
        </h2>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold mb-1">
              Task Title
            </label>
            <input
              id="title"
              name="title"
              value={task.title}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={task.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter task description"
            />
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-semibold mb-1"
              >
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={task.dueDate || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="dueTime"
                className="block text-sm font-semibold mb-1"
              >
                Due Time
              </label>
              <input
                type="time"
                id="dueTime"
                name="dueTime"
                value={task.dueTime || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Completed Checkbox */}
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="completed"
              name="completed"
              checked={task.completed}
              onChange={handleChange}
              className="w-8 h-8 rounded-lg border-2 border-blue-600 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <label
              htmlFor="completed"
              className="text-xl font-bold text-blue-700 cursor-pointer select-none"
            >
              Mark as Completed
            </label>
          </div>

          {/* Reminder Toggle */}
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="reminder"
              name="reminder"
              checked={task.reminder}
              onChange={handleChange}
              className="w-6 h-6 rounded border-gray-400 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <label
              htmlFor="reminder"
              className="text-lg font-semibold cursor-pointer select-none"
            >
              Set Reminder
            </label>
          </div>

          {/* Reminder Date & Time - visible only if reminder set */}
          {task.reminder && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="reminderDate"
                  className="block text-sm font-semibold mb-1"
                >
                  Reminder Date
                </label>
                <input
                  type="date"
                  id="reminderDate"
                  name="reminderDate"
                  value={task.reminderDate || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="reminderTime"
                  className="block text-sm font-semibold mb-1"
                >
                  Reminder Time
                </label>
                <input
                  type="time"
                  id="reminderTime"
                  name="reminderTime"
                  value={task.reminderTime || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={mutation.isLoading}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
        >
          {mutation.isLoading ? "Saving..." : "Save Changes"}
        </button>

        {/* Error message */}
        {mutation.isError && (
          <p className="text-red-500 mt-4 text-center font-semibold">
            Something went wrong. Please try again.
          </p>
        )}
      </motion.div>
    </div>
  );
}
