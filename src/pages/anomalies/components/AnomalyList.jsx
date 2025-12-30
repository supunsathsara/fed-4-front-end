import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  useGetMyAnomaliesQuery, 
  useAcknowledgeAnomalyMutation, 
  useResolveAnomalyMutation,
  useMarkAnomalyFalsePositiveMutation 
} from "@/lib/redux/query";
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  Clock, 
  Eye,
  XCircle,
  ChevronDown,
  ChevronUp,
  Wrench
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

/**
 * Severity Badge Component
 */
const SeverityBadge = ({ severity }) => {
  const config = {
    CRITICAL: { 
      icon: AlertTriangle, 
      color: "text-red-700", 
      bg: "bg-red-100",
      border: "border-red-300",
      label: "Critical" 
    },
    WARNING: { 
      icon: AlertCircle, 
      color: "text-yellow-700", 
      bg: "bg-yellow-100",
      border: "border-yellow-300",
      label: "Warning" 
    },
    INFO: { 
      icon: Info, 
      color: "text-blue-700", 
      bg: "bg-blue-100",
      border: "border-blue-300",
      label: "Info" 
    },
  };

  const { icon: Icon, color, bg, border, label } = config[severity] || config.INFO;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${color} ${border} border`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

/**
 * Status Badge Component
 */
const StatusBadge = ({ status }) => {
  const config = {
    OPEN: { 
      icon: AlertCircle, 
      color: "text-orange-700", 
      bg: "bg-orange-100",
      label: "Open" 
    },
    ACKNOWLEDGED: { 
      icon: Eye, 
      color: "text-purple-700", 
      bg: "bg-purple-100",
      label: "Acknowledged" 
    },
    RESOLVED: { 
      icon: CheckCircle, 
      color: "text-green-700", 
      bg: "bg-green-100",
      label: "Resolved" 
    },
    FALSE_POSITIVE: { 
      icon: XCircle, 
      color: "text-gray-700", 
      bg: "bg-gray-100",
      label: "False Positive" 
    },
  };

  const { icon: Icon, color, bg, label } = config[status] || config.OPEN;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

/**
 * Anomaly Type Label
 */
const AnomalyTypeLabel = ({ type }) => {
  const labels = {
    ZERO_PRODUCTION: "Zero Production",
    SIGNIFICANT_DROP: "Significant Drop",
    GRADUAL_DEGRADATION: "Gradual Degradation",
    SENSOR_SPIKE: "Sensor Spike",
    INTERMITTENT_FAILURE: "Intermittent Failure",
    BELOW_THRESHOLD: "Below Threshold",
  };
  return labels[type] || type;
};

/**
 * Single Anomaly Card
 */
const AnomalyCard = ({ anomaly }) => {
  const [expanded, setExpanded] = useState(false);
  const [acknowledgeAnomaly, { isLoading: isAcknowledging }] = useAcknowledgeAnomalyMutation();
  const [resolveAnomaly, { isLoading: isResolving }] = useResolveAnomalyMutation();
  const [markFalsePositive, { isLoading: isMarkingFP }] = useMarkAnomalyFalsePositiveMutation();

  const handleAcknowledge = async () => {
    try {
      await acknowledgeAnomaly(anomaly._id).unwrap();
    } catch (error) {
      console.error("Failed to acknowledge anomaly:", error);
    }
  };

  const handleResolve = async () => {
    try {
      await resolveAnomaly({ anomalyId: anomaly._id, notes: "" }).unwrap();
    } catch (error) {
      console.error("Failed to resolve anomaly:", error);
    }
  };

  const handleFalsePositive = async () => {
    try {
      await markFalsePositive({ anomalyId: anomaly._id, notes: "" }).unwrap();
    } catch (error) {
      console.error("Failed to mark as false positive:", error);
    }
  };

  const isActionable = anomaly.status === "OPEN" || anomaly.status === "ACKNOWLEDGED";

  return (
    <Card className={`
      ${anomaly.severity === "CRITICAL" ? "border-red-300 bg-red-50/50" : ""}
      ${anomaly.severity === "WARNING" ? "border-yellow-300 bg-yellow-50/50" : ""}
      ${anomaly.severity === "INFO" ? "border-blue-300 bg-blue-50/50" : ""}
      ${anomaly.status === "RESOLVED" ? "opacity-75" : ""}
    `}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <SeverityBadge severity={anomaly.severity} />
              <StatusBadge status={anomaly.status} />
            </div>
            <CardTitle className="text-lg">
              <AnomalyTypeLabel type={anomaly.anomalyType} />
            </CardTitle>
            <CardDescription className="mt-1">
              {anomaly.description}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Detected: {format(new Date(anomaly.detectedAt), "MMM d, yyyy h:mm a")}</span>
          </div>
        </div>

        {/* Recommended Action */}
        {anomaly.recommendedAction && (
          <div className="p-3 bg-background rounded-lg border mb-3">
            <div className="flex items-start gap-2">
              <Wrench className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Recommended Action</p>
                <p className="text-sm text-muted-foreground">{anomaly.recommendedAction}</p>
              </div>
            </div>
          </div>
        )}

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 p-4 bg-background rounded-lg border space-y-3">
            <h4 className="font-semibold text-sm">Detection Details</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Detection Method</p>
                <p className="font-medium">{anomaly.detectionDetails?.method || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Affected Period</p>
                <p className="font-medium">
                  {format(new Date(anomaly.affectedPeriod.startDate), "MMM d")} 
                  {anomaly.affectedPeriod.startDate !== anomaly.affectedPeriod.endDate && 
                    ` - ${format(new Date(anomaly.affectedPeriod.endDate), "MMM d")}`}
                </p>
              </div>
              {anomaly.detectionDetails?.expectedValue !== undefined && (
                <div>
                  <p className="text-muted-foreground">Expected Value</p>
                  <p className="font-medium">{anomaly.detectionDetails.expectedValue.toFixed(1)} kWh</p>
                </div>
              )}
              {anomaly.detectionDetails?.actualValue !== undefined && (
                <div>
                  <p className="text-muted-foreground">Actual Value</p>
                  <p className="font-medium">{anomaly.detectionDetails.actualValue.toFixed(1)} kWh</p>
                </div>
              )}
              {anomaly.detectionDetails?.deviationPercent !== undefined && (
                <div>
                  <p className="text-muted-foreground">Deviation</p>
                  <p className="font-medium text-red-600">
                    {anomaly.detectionDetails.deviationPercent.toFixed(1)}%
                  </p>
                </div>
              )}
              {anomaly.estimatedEnergyLoss !== undefined && (
                <div>
                  <p className="text-muted-foreground">Estimated Energy Loss</p>
                  <p className="font-medium text-red-600">
                    {anomaly.estimatedEnergyLoss.toFixed(1)} kWh
                  </p>
                </div>
              )}
            </div>

            {/* Resolution Info */}
            {anomaly.resolvedAt && (
              <div className="pt-3 border-t">
                <p className="text-muted-foreground text-sm">
                  Resolved on {format(new Date(anomaly.resolvedAt), "MMM d, yyyy h:mm a")}
                </p>
                {anomaly.resolutionNotes && (
                  <p className="text-sm mt-1">{anomaly.resolutionNotes}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {isActionable && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            {anomaly.status === "OPEN" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAcknowledge}
                disabled={isAcknowledging}
              >
                <Eye className="h-4 w-4 mr-1" />
                {isAcknowledging ? "..." : "Acknowledge"}
              </Button>
            )}
            <Button 
              variant="default" 
              size="sm"
              onClick={handleResolve}
              disabled={isResolving}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              {isResolving ? "..." : "Mark Resolved"}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleFalsePositive}
              disabled={isMarkingFP}
            >
              <XCircle className="h-4 w-4 mr-1" />
              {isMarkingFP ? "..." : "False Positive"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * AnomalyList - Displays list of anomalies with filtering
 */
const AnomalyList = ({ filters }) => {
  const { data: anomalies, isLoading, isError, error } = useGetMyAnomaliesQuery(filters);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load anomalies: {error?.message || "Unknown error"}</p>
        </CardContent>
      </Card>
    );
  }

  if (!anomalies || anomalies.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="font-semibold text-lg">No anomalies found</p>
          <p className="text-muted-foreground">
            {filters?.status ? `No ${filters.status.toLowerCase()} anomalies` : "Your solar system is operating normally"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {anomalies.map((anomaly) => (
        <AnomalyCard key={anomaly._id} anomaly={anomaly} />
      ))}
    </div>
  );
};

export default AnomalyList;
