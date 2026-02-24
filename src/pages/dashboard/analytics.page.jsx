import { useMemo, useState } from "react";
import {
  useGetSolarUnitForUserQuery,
  useGetEnergyGenerationRecordsBySolarUnitQuery,
  useGetCapacityFactorQuery,
  useGetMyAnomalyStatsQuery,
  useGetInvoicesQuery,
} from "@/lib/redux/query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, toDate, startOfWeek, differenceInDays } from "date-fns";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  AlertTriangle,
  BarChart3,
  Calendar,
  Sun,
  BatteryCharging,
} from "lucide-react";

// ─── Utility Helpers ──────────────────────────────────────────

function computeStats(values) {
  if (!values.length) return { avg: 0, min: 0, max: 0, total: 0, count: 0 };
  const total = values.reduce((s, v) => s + v, 0);
  return {
    avg: total / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    total,
    count: values.length,
  };
}

function groupByWeek(dailyData) {
  const weeks = new Map();
  dailyData.forEach((d) => {
    const date = new Date(d._id.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const key = format(weekStart, "MMM d");
    const current = weeks.get(key) || { energy: 0, days: 0 };
    current.energy += d.totalEnergy;
    current.days += 1;
    weeks.set(key, current);
  });
  return Array.from(weeks, ([week, val]) => ({
    week,
    energy: Math.round(val.energy * 10) / 10,
    avgDaily: Math.round((val.energy / val.days) * 10) / 10,
  }));
}

function computeTrend(dailyData) {
  if (dailyData.length < 3) return { direction: "flat", pct: 0 };
  const mid = Math.floor(dailyData.length / 2);
  const firstHalf = dailyData.slice(0, mid);
  const secondHalf = dailyData.slice(mid);
  const avg1 = firstHalf.reduce((s, d) => s + d.totalEnergy, 0) / firstHalf.length;
  const avg2 = secondHalf.reduce((s, d) => s + d.totalEnergy, 0) / secondHalf.length;
  if (avg1 === 0) return { direction: "flat", pct: 0 };
  const pct = ((avg2 - avg1) / avg1) * 100;
  return {
    direction: pct > 5 ? "up" : pct < -5 ? "down" : "flat",
    pct: Math.abs(pct),
  };
}

const ANOMALY_COLORS = {
  critical: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

const INVOICE_COLORS = {
  PAID: "#22c55e",
  PENDING: "#f59e0b",
  FAILED: "#ef4444",
};

// ─── Main Component ──────────────────────────────────────────

export default function AnalyticsPage() {
  const [range, setRange] = useState("30");

  const { data: solarUnit, isLoading: loadingUnit } = useGetSolarUnitForUserQuery();
  const { data: energyData, isLoading: loadingEnergy } =
    useGetEnergyGenerationRecordsBySolarUnitQuery(
      { id: solarUnit?._id, groupBy: "date", limit: parseInt(range) },
      { skip: !solarUnit?._id }
    );
  const { data: capacityData } = useGetCapacityFactorQuery(
    { solarUnitId: solarUnit?._id, days: parseInt(range) },
    { skip: !solarUnit?._id }
  );
  const { data: anomalyStats } = useGetMyAnomalyStatsQuery();
  const { data: invoiceData } = useGetInvoicesQuery({ limit: "100" });

  // ─── Derived Calculations ───────────────────────────────────
  const analytics = useMemo(() => {
    if (!energyData) return null;
    const sorted = [...energyData].sort(
      (a, b) => new Date(a._id.date) - new Date(b._id.date)
    );
    const values = sorted.map((d) => d.totalEnergy);
    const stats = computeStats(values);
    const trend = computeTrend(sorted);
    const weeklyData = groupByWeek(sorted);

    // Daily chart data
    const dailyChart = sorted.map((d) => ({
      date: format(toDate(d._id.date), "MMM d"),
      energy: Math.round(d.totalEnergy * 100) / 100,
    }));

    // Best / worst day
    const best = sorted.reduce(
      (b, d) => (d.totalEnergy > b.totalEnergy ? d : b),
      sorted[0]
    );
    const worst = sorted.reduce(
      (w, d) => (d.totalEnergy < w.totalEnergy ? d : w),
      sorted[0]
    );

    return { stats, trend, weeklyData, dailyChart, best, worst, sorted };
  }, [energyData]);

  // Invoice analytics
  const invoiceAnalytics = useMemo(() => {
    if (!invoiceData?.invoices) return null;
    const invoices = invoiceData.invoices;
    const totalSpent = invoices
      .filter((i) => i.paymentStatus === "PAID")
      .reduce((s, i) => s + i.amountCents, 0);
    const totalEnergy = invoices.reduce(
      (s, i) => s + (i.totalEnergyGenerated || 0),
      0
    );
    const avgCostPerKwh =
      totalEnergy > 0 ? totalSpent / 100 / totalEnergy : 0;

    // Pie data
    const statusCounts = {};
    invoices.forEach((i) => {
      statusCounts[i.paymentStatus] = (statusCounts[i.paymentStatus] || 0) + 1;
    });
    const pieData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }));

    return { totalSpent, totalEnergy, avgCostPerKwh, pieData, counts: invoiceData.counts };
  }, [invoiceData]);

  // Capacity factor trend data
  const capacityTrend = useMemo(() => {
    if (!capacityData?.dailyBreakdown) return [];
    return capacityData.dailyBreakdown.map((d) => ({
      date: format(new Date(d.date), "MMM d"),
      factor: Math.round(d.capacityFactor * 10) / 10,
    }));
  }, [capacityData]);

  // ─── Loading State ─────────────────────────────────────────
  if (loadingUnit || loadingEnergy) {
    return (
      <main className="mt-4 pb-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main chart */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full rounded-lg" />
          </CardContent>
        </Card>

        {/* Two-column charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full rounded-lg" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full rounded-lg" /></CardContent>
          </Card>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
            <CardContent className="space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-8 w-full rounded" />)}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-40 w-full rounded-lg" /></CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!solarUnit || !analytics) {
    return (
      <main className="p-4 pb-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No solar unit data available.</p>
        </div>
      </main>
    );
  }

  const { stats, trend, weeklyData, dailyChart, best, worst } = analytics;

  return (
    <main className="mt-4 pb-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-orange-500" />
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Insights and trends for your solar energy system
          </p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="14">Last 14 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ─── KPI Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Energy */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-yellow-50 flex items-center justify-center">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Total kWh</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm">
              {trend.direction === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : trend.direction === "down" ? (
                <TrendingDown className="w-4 h-4 text-red-600" />
              ) : (
                <Activity className="w-4 h-4 text-gray-500" />
              )}
              <span
                className={
                  trend.direction === "up"
                    ? "text-green-600"
                    : trend.direction === "down"
                    ? "text-red-600"
                    : "text-gray-500"
                }
              >
                {trend.pct.toFixed(1)}% {trend.direction === "flat" ? "stable" : trend.direction}
              </span>
              <span className="text-muted-foreground ml-1">vs prior half</span>
            </div>
          </CardContent>
        </Card>

        {/* Daily Average */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center">
                <Sun className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avg.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avg kWh / Day</p>
              </div>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              Range: {stats.min.toFixed(1)} – {stats.max.toFixed(1)} kWh
            </div>
          </CardContent>
        </Card>

        {/* Capacity Factor */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center">
                <BatteryCharging className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {capacityData?.metrics?.capacityFactor?.toFixed(1) ?? "—"}%
                </p>
                <p className="text-xs text-muted-foreground">Capacity Factor</p>
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span
                className={`capitalize font-medium ${
                  capacityData?.metrics?.performanceRating === "excellent" ||
                  capacityData?.metrics?.performanceRating === "good"
                    ? "text-green-600"
                    : "text-amber-600"
                }`}
              >
                {capacityData?.metrics?.performanceRating ?? "—"} performance
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Anomalies */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {anomalyStats?.total ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Total Anomalies</p>
              </div>
            </div>
            <div className="mt-3 flex gap-3 text-xs">
              <span className="text-red-600">
                {anomalyStats?.bySeverity?.critical ?? 0} critical
              </span>
              <span className="text-amber-600">
                {anomalyStats?.bySeverity?.warning ?? 0} warning
              </span>
              <span className="text-blue-600">
                {anomalyStats?.bySeverity?.info ?? 0} info
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Charts Row 1 ────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Daily Energy Production Trend */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" />
              Daily Energy Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-64">
            <ChartContainer
              config={{
                energy: { label: "Energy (kWh)", color: "oklch(0.7 0.18 55)" },
              }}
              className="w-full h-full"
            >
              <AreaChart
                data={dailyChart}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  interval={Math.max(0, Math.floor(dailyChart.length / 8))}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  width={45}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.18 55)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.7 0.18 55)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="energy"
                  stroke="var(--color-energy)"
                  strokeWidth={2}
                  fill="url(#energyGrad)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Weekly Breakdown */}
        {weeklyData.length > 1 && (
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Weekly Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-64">
              <ChartContainer
                config={{
                  energy: { label: "Total kWh", color: "oklch(0.65 0.15 250)" },
                  avgDaily: { label: "Avg Daily kWh", color: "oklch(0.7 0.18 55)" },
                }}
                className="w-full h-full"
              >
                <BarChart
                  data={weeklyData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    width={45}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="energy"
                    fill="var(--color-energy)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="avgDaily"
                    fill="var(--color-avgDaily)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ─── Charts Row 2 ────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Capacity Factor Trend */}
        {capacityTrend.length > 0 && (
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <BatteryCharging className="w-5 h-5 text-emerald-500" />
                Efficiency Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-64">
              <ChartContainer
                config={{
                  factor: { label: "Capacity %", color: "oklch(0.72 0.17 142)" },
                }}
                className="w-full h-full"
              >
                <LineChart
                  data={capacityTrend}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickMargin={8}
                    interval={Math.max(0, Math.floor(capacityTrend.length / 8))}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    width={45}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="factor"
                    stroke="var(--color-factor)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Invoice Breakdown (Pie) */}
        {invoiceAnalytics && invoiceAnalytics.pieData.length > 0 && (
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Billing Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 gap-4">
                {/* Pie chart */}
                <div className="h-56 flex items-center justify-center">
                  <ChartContainer
                    config={{
                      PAID: { label: "Paid", color: INVOICE_COLORS.PAID },
                      PENDING: { label: "Pending", color: INVOICE_COLORS.PENDING },
                      FAILED: { label: "Failed", color: INVOICE_COLORS.FAILED },
                    }}
                    className="w-full h-full"
                  >
                    <PieChart>
                      <Pie
                        data={invoiceAnalytics.pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {invoiceAnalytics.pieData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={INVOICE_COLORS[entry.name] || "#94a3b8"}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </div>
                {/* Stats */}
                <div className="flex flex-col justify-center space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="text-xl font-bold text-green-600">
                      ${(invoiceAnalytics.totalSpent / 100).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Cost / kWh</p>
                    <p className="text-xl font-bold">
                      ${invoiceAnalytics.avgCostPerKwh.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Invoices</p>
                    <p className="text-xl font-bold">
                      {invoiceAnalytics.counts?.total ?? invoiceAnalytics.pieData.reduce((s, d) => s + d.value, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ─── Best / Worst / Highlights ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Best Day */}
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Best Day</p>
                <p className="text-lg font-bold text-green-700">
                  {best.totalEnergy.toFixed(1)} kWh
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(toDate(best._id.date), "EEEE, MMM d")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Worst Day */}
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Worst Day</p>
                <p className="text-lg font-bold text-red-700">
                  {worst.totalEnergy.toFixed(1)} kWh
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(toDate(worst._id.date), "EEEE, MMM d")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consistency Score */}
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Consistency</p>
                <p className="text-lg font-bold text-blue-700">
                  {stats.avg > 0
                    ? `${(100 - ((stats.max - stats.min) / stats.avg) * 50).toFixed(0)}%`
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Deviation: {(stats.max - stats.min).toFixed(1)} kWh spread
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
