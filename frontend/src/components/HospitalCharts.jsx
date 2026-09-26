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
} from "recharts";

const inventoryData = [
  { name: "O+", units: 45, fill: "#00b1ff" },
  { name: "O-", units: 12, fill: "#00b1ff" },
  { name: "A+", units: 38, fill: "#00b1ff" },
  { name: "A-", units: 8, fill: "#59b4ff" },
  { name: "B+", units: 25, fill: "#00b1ff" },
  { name: "B-", units: 5, fill: "#59b4ff" },
  { name: "AB+", units: 15, fill: "#00b1ff" },
  { name: "AB-", units: 3, fill: "#59b4ff" },
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
      <div className="bg-deep-iris border border-iris-border p-3 rounded-xl shadow-none">
        <p className="text-ash text-xs font-semibold uppercase mb-1">{label}</p>
        <p className="text-white font-semibold text-lg">
          {payload[0].value}{" "}
          {payload[0].dataKey === "requests" ? "requests" : "units"}
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
      <div className="bg-iris-shadow rounded-3xl p-6 shadow-none border border-iris-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-xl tracking-tight">
            Blood Inventory
          </h3>
          <span className="bg-deep-iris text-clinical-cyan text-xs font-semibold px-3 py-1 rounded-full uppercase">
            Sample
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
                tick={{ fill: "#d8d8e3", fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#d8d8e3", fontSize: 12, fontWeight: 500 }}
              />
              <Tooltip
                cursor={{ fill: "#16165c" }}
                content={<CustomTooltip />}
              />
              <Bar dataKey="units" radius={[7, 7, 7, 7]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Request Trend Area Chart */}
      <div className="bg-iris-shadow rounded-3xl p-6 shadow-none border border-iris-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-xl tracking-tight">
            SOS Dispatch Volume
          </h3>
          <span className="bg-deep-iris text-ash text-xs font-semibold px-3 py-1 rounded-full uppercase">
            Sample week
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
                  <stop offset="5%" stopColor="#00b1ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00b1ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#d8d8e3", fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#d8d8e3", fontSize: 12, fontWeight: 500 }}
              />
              <Tooltip
                cursor={{
                  stroke: "#4846c6",
                  strokeWidth: 2,
                  strokeDasharray: "4 4",
                }}
                content={<CustomTooltip />}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#00b1ff"
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
