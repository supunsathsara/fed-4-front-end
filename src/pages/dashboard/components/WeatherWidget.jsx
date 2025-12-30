import { Card } from "@/components/ui/card";
import { useGetWeatherDataQuery } from "@/lib/redux/query";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudFog,
  Droplets,
  Wind,
  Thermometer,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

// Get weather icon based on weather code
const getWeatherIcon = (weatherCode, isDay) => {
  const iconClass = "w-12 h-12";
  
  if (weatherCode === 0 || weatherCode === 1) {
    return <Sun className={`${iconClass} text-amber-500`} />;
  } else if (weatherCode === 2 || weatherCode === 3) {
    return <Cloud className={`${iconClass} text-gray-500`} />;
  } else if (weatherCode >= 45 && weatherCode <= 48) {
    return <CloudFog className={`${iconClass} text-gray-400`} />;
  } else if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    return <CloudRain className={`${iconClass} text-blue-500`} />;
  } else if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) {
    return <CloudSnow className={`${iconClass} text-blue-300`} />;
  } else if (weatherCode >= 95) {
    return <CloudLightning className={`${iconClass} text-yellow-500`} />;
  }
  
  return <Sun className={`${iconClass} text-amber-500`} />;
};

// Get production potential color and icon
const getProductionStyles = (potential) => {
  switch (potential) {
    case "excellent":
      return { 
        color: "text-green-600", 
        bgColor: "bg-green-100", 
        borderColor: "border-green-300",
        icon: <TrendingUp className="w-5 h-5 text-green-600" />
      };
    case "good":
      return { 
        color: "text-emerald-600", 
        bgColor: "bg-emerald-50", 
        borderColor: "border-emerald-200",
        icon: <TrendingUp className="w-5 h-5 text-emerald-600" />
      };
    case "moderate":
      return { 
        color: "text-amber-600", 
        bgColor: "bg-amber-50", 
        borderColor: "border-amber-200",
        icon: <Minus className="w-5 h-5 text-amber-600" />
      };
    case "poor":
      return { 
        color: "text-red-600", 
        bgColor: "bg-red-50", 
        borderColor: "border-red-200",
        icon: <TrendingDown className="w-5 h-5 text-red-600" />
      };
    default:
      return { 
        color: "text-gray-600", 
        bgColor: "bg-gray-50", 
        borderColor: "border-gray-200",
        icon: <Minus className="w-5 h-5 text-gray-600" />
      };
  }
};

const WeatherWidget = () => {
  const { data: weather, isLoading, isError, error } = useGetWeatherDataQuery({});

  if (isLoading) {
    return (
      <Card className="rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-gray-200 rounded mb-4"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </Card>
    );
  }

  if (isError || !weather) {
    return (
      <Card className="rounded-xl p-6 border-destructive/50 bg-destructive/5">
        <h3 className="text-lg font-semibold text-destructive">Weather Unavailable</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Unable to fetch weather data. Please try again later.
        </p>
      </Card>
    );
  }

  const productionStyles = getProductionStyles(weather.solarImpact.productionPotential);

  return (
    <Card className="rounded-xl p-6 bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-amber-200/50">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            Weather & Solar Conditions
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Current conditions affecting solar production
          </p>
        </div>
        {getWeatherIcon(weather.current.weatherCode, weather.current.isDay)}
      </div>

      {/* Current Weather Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-2xl font-bold text-foreground">{weather.current.temperature}°C</p>
            <p className="text-xs text-muted-foreground">Temperature</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-2xl font-bold text-foreground">{weather.current.cloudCover}%</p>
            <p className="text-xs text-muted-foreground">Cloud Cover</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-2xl font-bold text-foreground">{weather.current.humidity}%</p>
            <p className="text-xs text-muted-foreground">Humidity</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-teal-500" />
          <div>
            <p className="text-2xl font-bold text-foreground">{weather.current.windSpeed}</p>
            <p className="text-xs text-muted-foreground">Wind (km/h)</p>
          </div>
        </div>
      </div>

      {/* Solar Production Impact */}
      <div className={`rounded-lg p-4 ${productionStyles.bgColor} border ${productionStyles.borderColor}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {productionStyles.icon}
            <span className={`font-semibold capitalize ${productionStyles.color}`}>
              {weather.solarImpact.productionPotential} Production Potential
            </span>
          </div>
          <div className={`text-2xl font-bold ${productionStyles.color}`}>
            {weather.solarImpact.productionPercentage}%
          </div>
        </div>
        
        {/* Production Factors */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Affecting Factors:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {weather.solarImpact.factors.slice(0, 3).map((factor, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-current"></span>
                {factor}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Weather Description */}
      <div className="mt-4 pt-4 border-t border-amber-200/50">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{weather.current.weatherDescription}</span>
          {" • "}
          UV Index: <span className="font-medium">{weather.current.uvIndex}</span>
          {weather.current.precipitation > 0 && (
            <>
              {" • "}
              Precipitation: <span className="font-medium">{weather.current.precipitation} mm</span>
            </>
          )}
        </p>
      </div>
    </Card>
  );
};

export default WeatherWidget;
