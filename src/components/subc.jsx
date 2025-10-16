import { Droplets, Wind } from "lucide-react";

export default function Subc({ day, temp, humidity, wind, icon }) {
  return (
    <div
      className="subCard flex flex-col gap-5 items-center justify-around text-center p-3 rounded-xl backdrop-blur-sm shadow-md bg-white/90
      w-[6rem] sm:w-20 md:w-24 lg:w-28"
    >
      {/* Day name */}
      <p className="text-sm md:text-base lg:text-2xl font-semibold">
        {new Date(day).toLocaleDateString("en-US", { weekday: "short" })}
      </p>

      {/* Weather icon */}
      <img
        src={icon}
        alt="Weather icon"
        className="w-16 h-16 md:w-20 md:h-20 lg:w-36 lg:h-24 m-0"
      />

      {/* Temperature */}
      <div className="flex items-center">
        <p className="text-xl md:text-2xl lg:text-3xl font-bold">
          {temp}
          <span className="text-base align-super">°C</span>
        </p>
      </div>

      {/* Humidity */}
      <div className="flex items-center gap-1">
        <Droplets className="h-4 w-4 md:h-6 md:w-6 lg:h-8 lg:w-8" />
        <span className="text-sm md:text-base">{humidity}%</span>
      </div>

      {/* Wind speed */}
      <div className="flex items-center gap-1">
        <Wind className="h-4 w-4 md:h-6 md:w-6 lg:h-8 lg:w-8" />
        <span className="text-sm md:text-base">{wind}km/h</span>
      </div>
    </div>
  );
}
