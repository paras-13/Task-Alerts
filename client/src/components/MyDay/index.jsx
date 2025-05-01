import React, { useState, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../store/authContext";
import { toast } from "react-toastify";
import makeRequest from "../../axios";
import dayjs from "dayjs";
import TaskModal from "../Modals/TaskModal";
import { FaBell } from "react-icons/fa6";
import AddTaskCard from "../Modals/AddTaskCard";

function MyDay() {
  const { currentUser } = useContext(AuthContext);
  const [openEditableWindow, setOpenEditableWindow] = useState(false);
  const [windowData, setWindowData] = useState({});
  const [activeTab, setActiveTab] = useState("created");

  // Separate queries for Laravel endpoints
  const {
    data: createdTodayTasks,
    isLoading: createdLoading,
    error: createdError,
  } = useQuery({
    queryKey: ["createdTodayTasks", currentUser?.id],
    queryFn: async () => {
      const response = await makeRequest.get(
        `/tasks/created-today/${currentUser.id}`
      );
      return response.data;
    },
    enabled: !!currentUser?.id && activeTab === "created",
  });

  const {
    data: dueTodayTasks,
    isLoading: dueLoading,
    error: dueError,
  } = useQuery({
    queryKey: ["dueTodayTasks", currentUser?.id],
    queryFn: async () => {
      const response = await makeRequest.get(
        `/tasks/due-today/${currentUser.id}`
      );
      return response.data;
    },
    enabled: !!currentUser?.id && activeTab === "due",
  });

  const handleTaskClick = (t) => {
    setOpenEditableWindow(true);
    setWindowData(t);
  };

  const handleCloseModal = () => {
    setOpenEditableWindow(false);
  };

  // Determine which data to display
  const currentData =
    activeTab === "created" ? createdTodayTasks : dueTodayTasks;
  const isLoading = activeTab === "created" ? createdLoading : dueLoading;
  const error = activeTab === "created" ? createdError : dueError;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex gap-6 max-w-7xl mx-auto">
        <AddTaskCard userId={currentUser.id} />

        <div className="w-2/3 bg-white p-6 rounded-xl shadow-lg overflow-y-auto max-h-[80vh]">
          {/* Tab Navigation */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "created"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("created")}
            >
              Created Today
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "due"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("due")}
            >
              Due Today
            </button>
          </div>

          <h3 className="text-xl font-bold mb-4 text-gray-800">
            {activeTab === "created"
              ? "Tasks Created Today"
              : "Tasks Due Today"}
          </h3>

          {isLoading ? (
            <p className="text-gray-500">Loading tasks...</p>
          ) : error ? (
            <p className="text-red-500">Error loading tasks.</p>
          ) : currentData?.length > 0 ? (
            <div className="space-y-4">
              {currentData.map((t) => {
                const dueTime = t.dueTime ? t.dueTime.slice(0, 5) : "00:00";
                const dueDateTime = dayjs(`${t.dueDate}T${dueTime}`);
                const now = dayjs();
                console.log(now);
                const isOverdue = now.isAfter(dueDateTime);
                const isCompleted = Boolean(t.completed);

                let cardClasses =
                  "p-4 border rounded-lg shadow-sm cursor-pointer transition";
                if (isCompleted) {
                  cardClasses += " bg-green-50 border-green-500";
                } else if (isOverdue) {
                  cardClasses += " bg-red-50 border-red-500";
                } else {
                  cardClasses += " bg-gray-50 border-gray-200";
                }

                let titleClasses = "text-lg font-semibold";
                if (isCompleted) {
                  titleClasses += " text-green-700";
                } else if (isOverdue) {
                  titleClasses += " text-red-700";
                } else {
                  titleClasses += " text-blue-700";
                }

                return (
                  <div
                    key={t.id}
                    className={cardClasses}
                    onClick={() => handleTaskClick(t)}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      {isCompleted && (
                        <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center mr-2">
                          ✓
                        </span>
                      )}
                      <h4 className={titleClasses}>{t.title}</h4>
                    </div>
                    <p className="text-gray-700 mb-1">{t.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-500">Due:</span>
                        <span className="text-gray-700">
                          {dayjs(t.dueDate).format("DD MMM YYYY")} • {dueTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {t.reminder && (
                          <FaBell className="text-yellow-500 text-sm" />
                        )}
                        {isOverdue && !isCompleted && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-50 text-red-600">
                            Overdue
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-600">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">
              {activeTab === "created"
                ? "No tasks created today."
                : "No tasks due today."}
            </p>
          )}

          {openEditableWindow && (
            <TaskModal windowData={windowData} onClose={handleCloseModal} />
          )}
        </div>
      </div>
    </div>
  );
}

export default MyDay;
