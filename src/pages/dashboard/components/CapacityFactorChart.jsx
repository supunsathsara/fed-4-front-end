import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { useGetCapacityFactorQuery } from "@/lib/redux/query";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, TrendingUp, TrendingDown, Activity, Calendar } from "lucide-react";
import { format } from "date-fns";

// Get performance color based on rating
const getPerformanceColor = (rating) => {
  switch (rating) {
    case "excellent":
      return { fill: "oklch(0.72 0.17 142)", text: "text-green-600", bg: "bg-green-100" };
    case "good":
      return { fill: "oklch(0.75 0.15 145)", text: "text-emerald-600", bg: "bg-emerald-100" };
    case "average":
      return { fill: "oklch(0.8 0.16 75)", text: "text-amber-600", bg: "bg-amber-100" };
    case "poor":
      return { fill: "oklch(0.65 0.2 25)", text: "text-red-600", bg: "bg-red-100" };
    default:
      return { fill: "oklch(0.7 0.18 55)", text: "text-orange-600", bg: "bg-orange-100" };
  }
};

const CapacityFactorChart = ({ solarUnitId }) => {
  const [selectedDays, setSelectedDays] = useState("7");

  const { data, isLoading, isError, error } = useGetCapacityFactorQuery({
    solarUnitId,
    days: parseInt(selectedDays),
  });

  const handleDaysChange = (days) => {
    setSelectedDays(days);
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="rounded-xl p-6 border-destructive/50 bg-destructive/5">
        <h3 className="text-lg font-semibold text-destructive">Capacity Factor Unavailable</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Unable to calculate capacity factor. Please try again later.
        </p>
      </Card>
    );
  }

  const performanceStyle = getPerformanceColor(data.metrics.performanceRating);

  // Prepare radial chart data
  const radialData = [
    {
      name: "Capacity Factor",
      value: data.metrics.capacityFactor,
      fill: performanceStyle.fill,
    },
  ];

  // Prepare bar chart data for daily breakdown
  const barChartData = data.dailyBreakdown.map((day) => ({
    date: format(new Date(day.date), "MMM d"),
    capacityFactor: Math.round(day.capacityFactor * 10) / 10,
    actualEnergy: Math.round(day.actualEnergy * 10) / 10,
  }));

  const chartConfig = {
    capacityFactor: {
      label: "Capacity Factor (%)",
      color: "oklch(0.7 0.18 55)",
    },
    actualEnergy: {
      label: "Actual Energy (kWh)",
      color: "oklch(0.75 0.15 145)",
    },
  };

  return (
    <Card className="rounded-xl p-6 bg-gradient-to-br from-orange-50/30 to-amber-50/30 border-orange-200/50">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            Capacity Factor Analysis
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Performance efficiency of your solar unit
          </p>
        </div>
        <Select value={selectedDays} onValueChange={handleDaysChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="14">Last 14 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radial Chart - Overall Capacity Factor */}
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <RadialBarChart
                width={192}
                height={192}
                innerRadius="60%"
                outerRadius="90%"
                data={radialData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background={{ fill: "#f3f4f6" }}
                  dataKey="value"
                  cornerRadius={10}
                  fill={performanceStyle.fill}
                />
              </RadialBarChart>
            </ChartContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${performanceStyle.text}`}>
                {data.metrics.capacityFactor.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                Capacity Factor
              </span>
            </div>
          </div>

          {/* Performance Rating Badge */}
          <div className={`mt-4 px-4 py-2 rounded-full ${performanceStyle.bg} flex items-center gap-2`}>
            {data.metrics.performanceRating === "excellent" || data.metrics.performanceRating === "good" ? (
              <TrendingUp className={`w-4 h-4 ${performanceStyle.text}`} />
            ) : (
              <TrendingDown className={`w-4 h-4 ${performanceStyle.text}`} />
            )}
            <span className={`font-semibold capitalize ${performanceStyle.text}`}>
              {data.metrics.performanceRating} Performance
            </span>
          </div>

          {/* Metrics Summary */}
          <div className="mt-6 grid grid-cols-2 gap-4 w-full">
            <div className="text-center p-3 bg-white/60 rounded-lg border border-orange-100">
              <Zap className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">
                {data.metrics.actualEnergy.toFixed(1)} kWh
              </p>
              <p className="text-xs text-muted-foreground">Actual Generated</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg border border-orange-100">
              <Calendar className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">
                {data.metrics.theoreticalMaximum.toFixed(1)} kWh
              </p>
              <p className="text-xs text-muted-foreground">Theoretical Max</p>
            </div>
          </div>
        </div>

        {/* Bar Chart - Daily Breakdown */}
        <div className="h-64">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Daily Capacity Factor Breakdown
          </p>
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart
              data={barChartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="capacityFactor"
                name="Capacity Factor"
                fill="oklch(0.7 0.18 55)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-6 pt-4 border-t border-orange-200/50">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Capacity Factor</span> measures how efficiently your solar unit 
          performs compared to its rated capacity. A higher percentage indicates better utilization of your solar panels.
          Based on {data.period.days} days of data with {data.metrics.recordCount} readings.
        </p>
      </div>
    </Card>
  );
};

export default CapacityFactorChart;
