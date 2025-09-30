import { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { BarChart3 } from "lucide-react";

const DailyStatistics = ({ loading, dailyStats }) => {
    console.log("StatisticsCards received:", dailyStats, loading);
  const [metric, setMetric] = useState("visitor_count");
  const [range, setRange] = useState(7);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const chartData = Array.isArray(dailyStats)
    ? data.map((item) => ({
        date: item.date,
        visitor_count: item.visitor_count || 0,
        revenue: parseFloat(item.total_revenue) || 0,
        cafe_sales: parseFloat(item.cafe_sales) || 0,
        bounce_time: item.bounce_time_minutes || 0,
      }))
    : [];

  const filteredData = chartData.slice(-range);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">
          Daily Statistics
        </h3>
        <div className="flex items-center gap-3">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="visitor_count">Visitors</option>
            <option value="revenue">Revenue</option>
            <option value="cafe_sales">Cafe Sales</option>
            <option value="bounce_time">Bounce Time</option>
          </select>
          <select
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Chart or Empty State */}
      {filteredData.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <BarChart3 className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="font-medium">No daily statistics available</p>
          <p className="text-sm mt-1">Data will appear once recorded</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E2001A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#E2001A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#555" }}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })
              }
              stroke="#888"
            />
            <YAxis tick={{ fontSize: 12, fill: "#555" }} stroke="#888" />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelFormatter={(value) =>
                `Date: ${new Date(value).toLocaleDateString()}`
              }
              formatter={(value, name) => [
                metric === "revenue" || metric === "cafe_sales"
                  ? `£${value}`
                  : value,
                metric === "visitor_count"
                  ? "Visitors"
                  : metric === "revenue"
                  ? "Total Revenue"
                  : metric === "cafe_sales"
                  ? "Cafe Sales"
                  : metric === "bounce_time"
                  ? "Bounce Time (min)"
                  : metric,
              ]}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke="#E2001A"
              fillOpacity={1}
              fill="url(#colorPrimary)"
              strokeWidth={2.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DailyStatistics;