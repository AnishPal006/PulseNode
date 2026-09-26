import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const impactData = [
  { name: "Trauma & ER", value: 45, color: "#00b1ff" },
  { name: "Surgeries", value: 30, color: "#59b4ff" },
  { name: "Cancer Treatment", value: 15, color: "#4846c6" },
  { name: "Chronic Illness", value: 10, color: "#d8d8e3" },
];

const leaderboard = [
  { rank: 1, name: "Sarah J.", donations: 24, tier: "Gold" },
  { rank: 2, name: "Mike T.", donations: 21, tier: "Gold" },
  { rank: 3, name: "Alex R.", donations: 19, tier: "Gold", isUser: true },
  { rank: 4, name: "Emma W.", donations: 15, tier: "Silver" },
  { rank: 5, name: "James L.", donations: 12, tier: "Silver" },
];

export default function DonorCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {/* Impact Distribution Pie Chart */}
      <div className="bg-iris-shadow rounded-3xl p-6 shadow-none border border-iris-border">
        <h3 className="text-white font-semibold text-xl tracking-tight mb-2">
          The bigger picture
        </h3>
        <p className="text-ash text-sm font-medium mb-6">
          Illustrative impact categories · sample data
        </p>

        <div className="h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={impactData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {impactData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "24px",
                  background: "#232269",
                  border: "1px solid #4846c6",
                  boxShadow: "none",
                  color: "#ffffff",
                }}
                itemStyle={{ fontWeight: 500 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-semibold text-white">100%</span>
            <span className="text-xs font-semibold text-ash uppercase tracking-wider">
              Example
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {impactData.map((item, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs font-semibold text-ash">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Leaderboard */}
      <div className="bg-iris-shadow rounded-3xl p-6 shadow-none border border-iris-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-xl tracking-tight">
            Community giving
          </h3>
          <span className="bg-deep-iris text-clinical-cyan text-xs font-semibold px-3 py-1 rounded-full uppercase">
            Sample
          </span>
        </div>

        <div className="space-y-3">
          {leaderboard.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center justify-between p-3 rounded-2xl ${user.isUser ? "bg-deep-iris text-white shadow-none" : "bg-deep-iris hover:bg-deep-iris transition"} `}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${user.rank === 1 ? "bg-iris-pulse text-white" : user.rank === 2 ? "bg-deep-iris text-white" : user.rank === 3 ? "bg-iris-pulse text-white" : "bg-deep-iris text-ash"}`}
                >
                  #{user.rank}
                </div>
                <div>
                  <p
                    className={`font-semibold ${user.isUser ? "text-white" : "text-white"}`}
                  >
                    {user.name}
                  </p>
                  <p
                    className={`text-xs font-medium ${user.isUser ? "text-ash" : "text-ash"}`}
                  >
                    {user.tier} Tier
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`font-semibold ${user.isUser ? "text-clinical-cyan" : "text-white"}`}
                >
                  {user.donations}
                </span>
                <span
                  className={`text-xs ml-1 ${user.isUser ? "text-ash" : "text-ash"}`}
                >
                  donations
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
