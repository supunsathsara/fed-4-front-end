import { Link } from "react-router";

export const SolarPulseLogo = ({ size = "default", showText = true, className = "" }) => {
  const sizeClasses = {
    small: "w-8 h-8",
    default: "w-10 h-10",
    large: "w-12 h-12",
  };

  const textSizeClasses = {
    small: "text-lg",
    default: "text-xl",
    large: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Custom Solar Logo */}
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500 flex justify-center items-center shadow-lg`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white"
        >
          {/* Sun with rays */}
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </div>
      {showText && (
        <span className={`font-[Inter] ${textSizeClasses[size]} font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent`}>
          SolarPulse
        </span>
      )}
    </div>
  );
};

export const SolarPulseLogoLink = ({ size = "default", showText = true, className = "" }) => {
  return (
    <Link to="/" className={className}>
      <SolarPulseLogo size={size} showText={showText} />
    </Link>
  );
};

export default SolarPulseLogo;
