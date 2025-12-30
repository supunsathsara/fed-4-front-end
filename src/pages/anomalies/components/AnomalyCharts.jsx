import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetMyAnomalyStatsQuery } from "@/lib/redux/query";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { format, parseISO } from "date-fns";

/**
 * Color palette for charts
 */
const COLORS = {
  CRITICAL: "#ef4444",
  WARNING: "#f59e0b",
  INFO: "#3b82f6",
  OPEN: "#f97316",
  ACKNOWLEDGED: "#a855f7",
  RESOLVED: "#22c55e",
  FALSE_POSITIVE: "#6b7280",
};

const SEVERITY_COLORS = ["#ef4444", "#f59e0b", "#3b82f6"];
const STATUS_COLORS = ["#f97316", "#a855f7", "#22c55e", "#6b7280"];

/**
 * Custom tooltip for charts
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Anomaly Type Distribution Chart (Pie Chart)
 */
const AnomalyTypeChart = ({ data }) => {
  const typeLabels = {
    ZERO_PRODUCTION: "Zero Production",
    SIGNIFICANT_DROP: "Significant Drop",
    GRADUAL_DEGRADATION: "Gradual Degradation",
    SENSOR_SPIKE: "Sensor Spike",
    INTERMITTENT_FAILURE: "Intermittent Failure",
    BELOW_THRESHOLD: "Below Threshold",
  };

  const chartData = Object.entries(data || {}).map(([type, count], index) => ({
    name: typeLabels[type] || type,
    value: count,
    color: ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"][index % 6],
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No anomaly type data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * Severity Distribution Bar Chart
 */
const SeverityChart = ({ data }) => {
  const chartData = [
    { name: "Critical", count: data?.CRITICAL || 0, fill: COLORS.CRITICAL },
    { name: "Warning", count: data?.WARNING || 0, fill: COLORS.WARNING },
    { name: "Info", count: data?.INFO || 0, fill: COLORS.INFO },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis dataKey="name" type="category" width={70} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Anomaly Trend Line Chart (Last 30 Days)
 */
const TrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        No trend data available yet
      </div>
    );
  }

  const chartData = data.map((item) => ({
    date: format(parseISO(item.date), "MMM d"),
    Total: item.total,
    Critical: item.critical,
    Warning: item.warning,
    Info: item.info,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis allowDecimals={false} fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="Critical" 
          stroke={COLORS.CRITICAL} 
          strokeWidth={2}
          dot={{ fill: COLORS.CRITICAL }}
        />
        <Line 
          type="monotone" 
          dataKey="Warning" 
          stroke={COLORS.WARNING} 
          strokeWidth={2}
          dot={{ fill: COLORS.WARNING }}
        />
        <Line 
          type="monotone" 
          dataKey="Info" 
          stroke={COLORS.INFO} 
          strokeWidth={2}
          dot={{ fill: COLORS.INFO }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * Status Distribution Chart
 */
const StatusChart = ({ data }) => {
  const chartData = [
    { name: "Open", value: data?.OPEN || 0, color: COLORS.OPEN },
    { name: "Acknowledged", value: data?.ACKNOWLEDGED || 0, color: COLORS.ACKNOWLEDGED },
    { name: "Resolved", value: data?.RESOLVED || 0, color: COLORS.RESOLVED },
    { name: "False Positive", value: data?.FALSE_POSITIVE || 0, color: COLORS.FALSE_POSITIVE },
  ].filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No status data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * Main Anomaly Charts Component
 */
const AnomalyCharts = () => {
  const { data: stats, isLoading, isError } = useGetMyAnomalyStatsQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load chart data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trend Chart - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Anomaly Trend (Last 30 Days)</CardTitle>
          <CardDescription>
            Track how anomalies have occurred over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrendChart data={stats.recentTrend} />
        </CardContent>
      </Card>

      {/* Distribution Charts - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">By Severity</CardTitle>
            <CardDescription>Distribution of anomalies by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <SeverityChart data={stats.bySeverity} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">By Status</CardTitle>
            <CardDescription>Resolution status of all anomalies</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusChart data={stats.byStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">By Type</CardTitle>
            <CardDescription>Distribution by anomaly type</CardDescription>
          </CardHeader>
          <CardContent>
            <AnomalyTypeChart data={stats.byType} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnomalyCharts;
