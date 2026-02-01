export function WeatherCardSkeleton() {
  return (
    <div className="glass-panel max-w-xl w-full mx-auto p-4 sm:p-6 md:p-8 text-center select-none animate-pulse fade-in">
      {/* City name skeleton */}
      <div className="h-8 sm:h-10 md:h-12 bg-slate-400/20 rounded-lg w-3/4 mx-auto mb-2"></div>
      
      {/* Weather icon skeleton */}
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-slate-400/20 rounded-full"></div>
      </div>
      
      {/* Description skeleton */}
      <div className="h-5 sm:h-6 md:h-7 bg-slate-400/20 rounded-lg w-1/2 mx-auto mb-6 sm:mb-8"></div>
      
      {/* Temperature skeleton */}
      <div className="mb-6 sm:mb-8">
        <div className="h-12 sm:h-16 md:h-20 bg-slate-400/20 rounded-lg w-32 sm:w-40 mx-auto mb-2"></div>
        {/* Feels like skeleton */}
        <div className="h-4 sm:h-5 md:h-6 bg-slate-400/20 rounded-lg w-24 sm:w-32 mx-auto"></div>
      </div>
      
      {/* Wind and Humidity skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-w-sm mx-auto">
        <div className="glass-panel p-3 sm:p-4 rounded-xl">
          <div className="h-3 sm:h-4 bg-slate-400/20 rounded w-12 mx-auto mb-2"></div>
          <div className="h-6 sm:h-8 md:h-9 bg-slate-400/20 rounded w-16 sm:w-20 mx-auto"></div>
        </div>
        <div className="glass-panel p-3 sm:p-4 rounded-xl">
          <div className="h-3 sm:h-4 bg-slate-400/20 rounded w-12 mx-auto mb-2"></div>
          <div className="h-6 sm:h-8 md:h-9 bg-slate-400/20 rounded w-16 sm:w-20 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
