import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

const inventoryData = [
  { name: "O+", units: 45, fill: "#ff4d4d" },
  { name: "O-", units: 12, fill: "#ef4444" },
  { name: "A+", units: 38, fill: "#f87171" },
  { name: "A-", units: 8, fill: "#fca5a5" },
  { name: "B+", units: 25, fill: "#f87171" },
  { name: "B-", units: 5, fill: "#fca5a5" },
  { name: "AB+", units: 15, fill: "#f87171" },
  { name: "AB-", units: 3, fill: "#fca5a5" },
];

const requestTrendData = [
  { day: "Mon", requests: 12 },
  { day: "Tue", requests: 19 },
  { day: "Wed", requests: 15 },
  { day: "Thu", requests: 25 },
  { day: "Fri", requests: 22 },
  { day: "Sat", requests: 30 },
  { day: "Sun", requests: 28 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl shadow-xl">
        <p className="text-zinc-400 text-xs font-bold uppercase mb-1">
          {label}
        </p>
        <p className="text-white font-black text-lg">
          {payload[0].value} Units
        </p>
      </div>
    );
  }
  return null;
};

export default function HospitalCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {/* Inventory Bar Chart */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-zinc-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-zinc-900 font-extrabold text-xl tracking-tight">
            Blood Inventory
          </h3>
          <span className="bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1 rounded-full uppercase">
            Live
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={inventoryData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12, fontWeight: "bold" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12, fontWeight: "bold" }}
              />
              <Tooltip
                cursor={{ fill: "#f4f4f5" }}
                content={<CustomTooltip />}
              />
              <Bar dataKey="units" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Request Trend Area Chart */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-zinc-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-zinc-900 font-extrabold text-xl tracking-tight">
            SOS Dispatch Volume
          </h3>
          <span className="bg-zinc-100 text-zinc-600 text-xs font-bold px-3 py-1 rounded-full uppercase">
            7 Days
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={requestTrendData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12, fontWeight: "bold" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12, fontWeight: "bold" }}
              />
              <Tooltip
                cursor={{
                  stroke: "#e4e4e7",
                  strokeWidth: 2,
                  strokeDasharray: "4 4",
                }}
                content={<CustomTooltip />}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#3b82f6"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorRequests)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
