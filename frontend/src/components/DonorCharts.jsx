import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const impactData = [
  { name: "Trauma & ER", value: 45, color: "#ef4444" },
  { name: "Surgeries", value: 30, color: "#3b82f6" },
  { name: "Cancer Treatment", value: 15, color: "#8b5cf6" },
  { name: "Chronic Illness", value: 10, color: "#10b981" },
];

const leaderboard = [
  { rank: 1, name: "Sarah J.", donations: 24, tier: "Gold" },
  { rank: 2, name: "Mike T.", donations: 21, tier: "Gold" },
  { rank: 3, name: "You", donations: 19, tier: "Gold", isUser: true },
  { rank: 4, name: "Emma W.", donations: 15, tier: "Silver" },
  { rank: 5, name: "James L.", donations: 12, tier: "Silver" },
];

export default function DonorCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {/* Impact Distribution Pie Chart */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-zinc-100">
        <h3 className="text-zinc-900 font-extrabold text-xl tracking-tight mb-2">
          Your Blood, Verified
        </h3>
        <p className="text-zinc-500 text-sm font-medium mb-6">
          See exactly where your donations went.
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
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                itemStyle={{ fontWeight: "bold" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-zinc-900">100%</span>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Tracked
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
              <span className="text-xs font-bold text-zinc-600">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Leaderboard */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-zinc-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-zinc-900 font-extrabold text-xl tracking-tight">
            Local Heroes
          </h3>
          <span className="bg-amber-100 text-amber-600 text-xs font-bold px-3 py-1 rounded-full uppercase">
            Top 5
          </span>
        </div>

        <div className="space-y-3">
          {leaderboard.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center justify-between p-3 rounded-2xl ${user.isUser ? "bg-zinc-900 text-white shadow-lg" : "bg-zinc-50 hover:bg-zinc-100 transition"} `}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${user.rank === 1 ? "bg-amber-400 text-amber-900" : user.rank === 2 ? "bg-slate-300 text-slate-700" : user.rank === 3 ? "bg-amber-700 text-amber-100" : "bg-zinc-200 text-zinc-500"}`}
                >
                  #{user.rank}
                </div>
                <div>
                  <p
                    className={`font-bold ${user.isUser ? "text-white" : "text-zinc-900"}`}
                  >
                    {user.name}
                  </p>
                  <p
                    className={`text-xs font-medium ${user.isUser ? "text-zinc-400" : "text-zinc-500"}`}
                  >
                    {user.tier} Tier
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`font-black ${user.isUser ? "text-lime-400" : "text-zinc-900"}`}
                >
                  {user.donations}
                </span>
                <span
                  className={`text-xs ml-1 ${user.isUser ? "text-zinc-400" : "text-zinc-400"}`}
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
