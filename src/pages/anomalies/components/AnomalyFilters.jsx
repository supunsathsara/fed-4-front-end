import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Filter, X, RotateCcw } from "lucide-react";

/**
 * AnomalyFilters - Filter controls for anomaly list
 */
const AnomalyFilters = ({ filters, onFilterChange }) => {
  const handleChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value === "all" ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = filters.type || filters.severity || filters.status;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Severity Filter */}
          <Select 
            value={filters.severity || "all"} 
            onValueChange={(value) => handleChange("severity", value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="CRITICAL">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Critical
                </span>
              </SelectItem>
              <SelectItem value="WARNING">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Warning
                </span>
              </SelectItem>
              <SelectItem value="INFO">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Info
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select 
            value={filters.status || "all"} 
            onValueChange={(value) => handleChange("status", value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="OPEN">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Open
                </span>
              </SelectItem>
              <SelectItem value="ACKNOWLEDGED">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Acknowledged
                </span>
              </SelectItem>
              <SelectItem value="RESOLVED">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Resolved
                </span>
              </SelectItem>
              <SelectItem value="FALSE_POSITIVE">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-500" />
                  False Positive
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select 
            value={filters.type || "all"} 
            onValueChange={(value) => handleChange("type", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Anomaly Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ZERO_PRODUCTION">Zero Production</SelectItem>
              <SelectItem value="SIGNIFICANT_DROP">Significant Drop</SelectItem>
              <SelectItem value="GRADUAL_DEGRADATION">Gradual Degradation</SelectItem>
              <SelectItem value="SENSOR_SPIKE">Sensor Spike</SelectItem>
              <SelectItem value="INTERMITTENT_FAILURE">Intermittent Failure</SelectItem>
              <SelectItem value="BELOW_THRESHOLD">Below Threshold</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
            {filters.severity && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                Severity: {filters.severity}
                <button onClick={() => handleChange("severity", "all")} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                Status: {filters.status}
                <button onClick={() => handleChange("status", "all")} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.type && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                Type: {filters.type.replace(/_/g, " ")}
                <button onClick={() => handleChange("type", "all")} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnomalyFilters;
