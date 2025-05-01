import React, { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../store/authContext";
import makeRequest from "../../axios";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import dayjs from "dayjs";

export default function UserStats() {
  const { currentUser } = useContext(AuthContext);

  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats", currentUser?.id],
    queryFn: async () => {
      const response = await makeRequest.get(`stats/${currentUser.id}`);
      return response.data;
    },
    enabled: !!currentUser?.id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading dashboard data...</p>
      </div>
    );
  }

  // Prepare data for charts
  const overviewData = [
    { name: "Created", value: stats?.totalCreated || 0, color: "#8884d8" },
    { name: "Completed", value: stats?.totalCompleted || 0, color: "#82ca9d" },
    { name: "Due", value: stats?.totalDue || 0, color: "#ffc658" },
    { name: "Overdue", value: stats?.totalOverdue || 0, color: "#ff8042" },
  ];

  const completionRate = stats?.totalCreated
    ? Math.round((stats.totalCompleted / stats.totalCreated) * 100)
    : 0;

  const pieData = [
    { name: "Completed", value: completionRate, color: "#82ca9d" },
    { name: "Remaining", value: 100 - completionRate, color: "#8884d8" },
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Your Task Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-500">Total Tasks</h3>
            <p className="text-4xl font-bold">{stats?.totalCreated || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-500">Completed</h3>
            <p className="text-4xl font-bold text-green-600">
              {stats?.totalCompleted || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-500">Due Soon</h3>
            <p className="text-4xl font-bold text-yellow-600">
              {stats?.totalDue || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-500">Overdue</h3>
            <p className="text-4xl font-bold text-red-600">
              {stats?.totalOverdue || 0}
            </p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Task Overview Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Task Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overviewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value">
                  {overviewData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Completion Rate Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Completion Rate</h2>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        {stats?.weeklyActivity && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4">Weekly Activity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#8884d8" />
                <Line type="monotone" dataKey="completed" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
