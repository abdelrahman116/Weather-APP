import { useEffect, useState, useMemo, useCallback } from "react";
import LocationGetter from "./LocationGetter";
import useLocationData from "../hooks/useLocationData";
import countries from "world-countries";
import Fuse from "fuse.js";
import MainCard from "./mainCard";
import Subc from "./subc";
import Cooldesk from "../assets/Cool/1920.jpg"; // Default background
import location from "../assets/location.svg";
export default function HomePage() {
  const { place, setPlace } = useLocationData();

  const [bgImage, setBgImage] = useState(Cooldesk);
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [weather, setWeather] = useState([
    { degree: 25, humidity: 70, speed: 15 },
  ]);
  const [forecast, setForecast] = useState([]); // 🔹 NEW: 5-day forecast
  const [inputValue, setInputValue] = useState("");
  const [manualLocation, setManualLocation] = useState(false);

  const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  const WEATHER_KEY = import.meta.env.VITE_WEATHER_ACCESS_KEY;

  const { degree, humidity, speed } = weather[0] || {};

  // ---------- WEATHER ----------
  const getWeather = useCallback(
    async (lat, lon) => {
      if (!lat || !lon) return;
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_KEY}`
        );
        const data = await res.json();

        // Convert UTC timestamp + timezone offset into local date/time
        const localTimestamp = (data.dt + data.timezone) * 1000;
        const localDateObj = new Date(localTimestamp);

        const localTimeString = localDateObj.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        const localDayString = localDateObj.toLocaleDateString("en-US", {
          weekday: "long",
        });

        if (data.cod && data.cod !== 200) {
          console.error("Weather fetch failed:", data.message || data);
          return;
        }

        const weatherData = [
          {
            degree: Math.round(data.main?.temp ?? 0),
            humidity: Math.round(data.main?.humidity ?? 0),
            speed: Math.round(data.wind?.speed ?? 0),
            icon: data.weather?.[0]
              ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
              : "",
            main: data.weather?.[0]?.main ?? "",
            description: data.weather?.[0]?.description ?? "",
            name: data.name ?? "",
            timezone: data.timezone ?? 0,
            localTime: localTimeString,
            localDay: localDayString,
          },
        ];
        setWeather(weatherData);
        console.log("🌤️ Weather updated for:", data.name);

        // ---------- 🌆 Dynamic background logic ----------
        const localTime = new Date((data.dt + data.timezone) * 1000);
        const hour = localTime.getUTCHours();
        const isDay = hour >= 6 && hour < 18;
        const condition = data.weather?.[0]?.main?.toLowerCase() || "clear";
        const timeOfDay = isDay ? "day" : "night";
        try {
          const resImg = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
              `${data.name} ${timeOfDay} ${condition}`
            )}&client_id=${UNSPLASH_KEY}&orientation=landscape&per_page=1`
          );
          const imgData = await resImg.json();
          if (imgData.results?.length > 0) {
            setBgImage(
              `${imgData.results[0].urls.full}?cacheBust=${Date.now()}`
            );
          } else {
            setBgImage(Cooldesk);
          }
        } catch (err) {
          console.warn("Background fetch failed:", err);
          setBgImage(Cooldesk);
        }
      } catch (err) {
        console.error("Error fetching weather:", err);
      }
    },
    [WEATHER_KEY, UNSPLASH_KEY]
  );

  // ---------- 5-DAY FORECAST ----------
  const getFiveDayForecast = useCallback(
    async (lat, lon) => {
      if (!lat || !lon) return;
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_KEY}`
        );
        const data = await res.json();
        if (!data?.list) return;

        // Group by date
        const daily = {};
        data.list.forEach((item) => {
          const date = item.dt_txt.split(" ")[0];
          if (!daily[date]) daily[date] = [];
          daily[date].push(item);
        });

        // Create 5-day summary
        const forecastData = Object.keys(daily)
          .slice(0, 5)
          .map((date) => {
            const items = daily[date];
            const avgTemp =
              items.reduce((sum, i) => sum + i.main.temp, 0) / items.length;
            const avgHumidity =
              items.reduce((sum, i) => sum + i.main.humidity, 0) / items.length;
            const avgWind =
              items.reduce((sum, i) => sum + i.wind.speed, 0) / items.length;
            const mainIcon =
              items[Math.floor(items.length / 2)].weather[0].icon;

            return {
              date,
              temp: Math.round(avgTemp),
              humidity: Math.round(avgHumidity),
              wind: Math.round(avgWind),
              icon: `https://openweathermap.org/img/wn/${mainIcon}@2x.png`,
            };
          });

        setForecast(forecastData);
      } catch (err) {
        console.error("Error fetching forecast:", err);
      }
    },
    [WEATHER_KEY]
  );

  // ---------- LOCATION HANDLER ----------
  const handleLocationChange = (
    { lat, lon, place: placeName } = {},
    source
  ) => {
    if (manualLocation && source !== "manual" && source !== "user") {
      console.log("Ignored auto location because manualLocation is active.");
      return;
    }

    if (!lat || !lon) {
      console.warn("handleLocationChange called without lat/lon.");
      return;
    }

    console.log(
      "📍 Location changed:",
      lat,
      lon,
      placeName,
      "source:",
      source || "auto"
    );

    setCoords({ lat, lon });
    setPlace(placeName);

    if (source === "manual") {
      setManualLocation(true);
      localStorage.setItem(
        "lastLocation",
        JSON.stringify({ lat, lon, place: placeName, manualLocation: true })
      );
    } else {
      const saved = localStorage.getItem("lastLocation");
      if (!saved) {
        localStorage.setItem(
          "lastLocation",
          JSON.stringify({ lat, lon, place: placeName, manualLocation: false })
        );
      }
    }
  };

  // ---------- FETCH WEATHER & FORECAST WHEN COORDS CHANGE ----------
  useEffect(() => {
    if (coords.lat && coords.lon) {
      getWeather(coords.lat, coords.lon);
      getFiveDayForecast(coords.lat, coords.lon); // 🔹 Fetch forecast too
    }
  }, [coords.lat, coords.lon, getWeather, getFiveDayForecast]);

  // ---------- SEARCH ----------
  const countryNames = useMemo(() => countries.map((c) => c.name.common), []);
  const fuse = new Fuse(countryNames, { threshold: 0.3 });

  const handleKeyDown = async (e) => {
    if (e.key !== "Enter") return;
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          trimmed
        )}&format=json&limit=1&accept-language=en`
      );
      const data = await res.json();

      if (data?.length > 0) {
        const first = data[0];
        const lat = parseFloat(first.lat);
        const lon = parseFloat(first.lon);
        const display = first.display_name?.split(",")[0] ?? trimmed;

        handleLocationChange({ lat, lon, place: display }, "manual");
        setInputValue("");
      } else {
        const result = fuse.search(trimmed);
        if (result.length > 0) {
          const bestMatch = result[0].item;
          const res2 = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              bestMatch
            )}&format=json&limit=1&accept-language=en`
          );
          const data2 = await res2.json();
          if (data2?.length > 0) {
            const lat = parseFloat(data2[0].lat);
            const lon = parseFloat(data2[0].lon);
            handleLocationChange({ lat, lon, place: bestMatch }, "manual");
          } else {
            alert("⚠️ Couldn’t find that place. Try a different name.");
          }
        } else {
          alert("⚠️ Couldn’t recognize that place. Try again.");
        }
      }
    } catch (err) {
      console.error("Error searching location:", err);
      alert("Error searching location. See console.");
    }
  };

  // ---------- RESTORE SAVED LOCATION ----------
  useEffect(() => {
    const saved = localStorage.getItem("lastLocation");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.lat && parsed?.lon && parsed?.place) {
          console.log("📦 Restored saved location:", parsed.place);
          setCoords({ lat: parsed.lat, lon: parsed.lon });
          setPlace(parsed.place);
          setManualLocation(!!parsed.manualLocation);
          getWeather(parsed.lat, parsed.lon);
          getFiveDayForecast(parsed.lat, parsed.lon);
          return;
        }
      } catch (err) {
        console.warn("Error parsing saved location", err);
      }
    }
    setManualLocation(false);
  }, [getWeather, getFiveDayForecast, setCoords, setPlace]);

  // ---------- UI ----------
  return (
    <div
      className="min-h-screen  w-full bg-cover bg-no-repeat bg-center text-3xl text-black transition-all duration-700 overflow-y-auto"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : "none",
        backgroundAttachment: "fixed", // keeps the background still when scrolling
      }}
    >
      {/* Search Input */}
      <div className="location-in rounded-4xl">
        <input
          className="inputFeild"
          type="text"
          placeholder="Enter Your Country"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <img
          src={location}
          alt=""
          className="location-SVG cursor-pointer h-10 w-15"
          style={{ cursor: "pointer" }}
          onClick={() => window.location.reload()}
        />
      </div>

      {!manualLocation && (
        <LocationGetter
          onLocationChange={(payload) => handleLocationChange(payload, "auto")}
        />
      )}
      <div className="weather-container flex flex-col  items-center mt-15">
        <MainCard
          Country={place}
          Humidity={humidity}
          deg={degree}
          Speed={speed}
          timezone={weather[0]?.timezone}
          localTime={weather[0]?.localTime}
          localDay={weather[0]?.localDay}
        />

        {/* 5-Day Forecast */}
        <div className="sub-container flex justify-around gap-5 mt-5">
          {forecast.map((d, i) => (
            <Subc
              key={i}
              day={d.date}
              temp={d.temp}
              humidity={d.humidity}
              wind={d.wind}
              icon={d.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
