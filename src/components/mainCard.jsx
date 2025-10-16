import { Droplets, Wind } from "lucide-react";
import { useEffect, useState } from "react";

export default function MainCard({
  Country,
  city,
  deg,
  Humidity,
  Speed,
  timezone,
}) {
  const [dateTime, setDateTime] = useState({ day: "", time: "" });

  useEffect(() => {
    const updateTime = () => {
      if (timezone === undefined || timezone === null) return;

      const nowUTC = new Date(
        new Date().getTime() + new Date().getTimezoneOffset() * 60000
      );
      const localTime = new Date(nowUTC.getTime() + timezone * 1000);

      const day = localTime.toLocaleDateString("en-US", { weekday: "long" });
      const time = localTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      setDateTime({ day, time });
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <div
      className="mainCard flex flex-col justify-around items-center text-center bg-white/70 rounded-2xl p-6 shadow-md backdrop-blur-sm
      w-[90%] sm:w-[70%] md:w-[50%] lg:w-[35%] "
    >
      {/* Location */}
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold">
        {Country || "Unknown"}
      </div>
      {city && <div className="text-lg md:text-xl opacity-80">{city}</div>}

      {/* Day and Time */}
      <div className="font-semibold mt-2 flex flex-col sm:flex-row justify-center gap-2 items-center">
        <p>{dateTime.day}</p>
        <p className="text-lg mt-1 text-blue-100">{dateTime.time}</p>
      </div>

      {/* Temperature */}
      <div className="text-5xl md:text-7xl lg:text-9xl font-bold mt-4">
        <span className="deg align-sub">{deg ?? "--"}</span>C
      </div>

      {/* Humidity */}
      <div className="flex gap-2 items-center text-lg mt-2">
        <Droplets className="w-6 h-6 md:w-7 md:h-7 lg:w-10 lg:h-10" />{" "}
        {Humidity ?? "--"}%
      </div>

      {/* Wind Speed */}
      <div className="flex gap-2 items-center text-lg mt-1">
        <Wind className="w-6 h-6 md:w-7 md:h-7 lg:w-10 lg:h-10" />{" "}
        {Speed ?? "--"} km/h
      </div>
    </div>
  );
}
