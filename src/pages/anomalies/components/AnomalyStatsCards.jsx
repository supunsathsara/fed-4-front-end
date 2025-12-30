import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetMyAnomalyStatsQuery } from "@/lib/redux/query";
import { AlertTriangle, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * AnomalyStatsCards - Displays summary statistics for anomalies
 * Shows counts by severity and status
 */
const AnomalyStatsCards = () => {
  const { data: stats, isLoading, isError } = useGetMyAnomalyStatsQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
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
          <p className="text-destructive">Failed to load anomaly statistics</p>
        </CardContent>
      </Card>
    );
  }

  const severityCards = [
    {
      title: "Critical",
      count: stats.bySeverity?.CRITICAL || 0,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      title: "Warnings",
      count: stats.bySeverity?.WARNING || 0,
      icon: AlertCircle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      title: "Info",
      count: stats.bySeverity?.INFO || 0,
      icon: Info,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Resolved",
      count: stats.byStatus?.RESOLVED || 0,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  ];

  const totalOpen = (stats.byStatus?.OPEN || 0) + (stats.byStatus?.ACKNOWLEDGED || 0);

  return (
    <div className="space-y-4">
      {/* Summary Banner */}
      <Card className={totalOpen > 0 ? "border-orange-300 bg-orange-50" : "border-green-300 bg-green-50"}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {totalOpen > 0 ? (
              <AlertCircle className="h-6 w-6 text-orange-500" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-500" />
            )}
            <div>
              <p className="font-semibold text-lg">
                {totalOpen > 0 
                  ? `${totalOpen} Active Anomal${totalOpen === 1 ? 'y' : 'ies'} Detected`
                  : 'No Active Anomalies'}
              </p>
              <p className="text-sm text-muted-foreground">
                {totalOpen > 0 
                  ? 'Review and address the issues below'
                  : 'Your solar system is operating normally'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Severity Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {severityCards.map((card) => (
          <Card key={card.title} className={`${card.borderColor} ${card.bgColor}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <card.icon className={`h-4 w-4 ${card.color}`} />
                <CardDescription className="font-medium">{card.title}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${card.color}`}>{card.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AnomalyStatsCards;
