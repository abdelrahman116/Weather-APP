import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import LocationGetter from "./LocationGetter";
import useLocationData from "../hooks/useLocationData";
import countries from "world-countries";
import Fuse from "fuse.js";
import usePlacePhoto from "../hooks/usePlacePhoto";
import MainCard from "./mainCard";
import Subc from "./subc";
import Cooldesk from "../assets/Cool/1920.jpg"; // Default background

export default function HomePage() {
  const { place, setPlace } = useLocationData();
  const { getPlacePhoto } = usePlacePhoto();

  const [bgImage, setBgImage] = useState(Cooldesk);
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [weather, setWeather] = useState([
    { degree: 25, humidity: 70, speed: 15 },
  ]);
  const [inputValue, setInputValue] = useState("");

  const [manualLocation, setManualLocation] = useState(false);

  const fetchedPlace = useRef("");
  const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  const WEATHER_KEY = import.meta.env.VITE_WEATHER_ACCESS_KEY;

  const { degree, humidity, speed, icon } = weather[0] || {};

  // ---------- WEATHER ----------
  const getWeather = useCallback(
    async (lat, lon) => {
      if (!lat || !lon) return;
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_KEY}`
        );
        const data = await res.json();
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
          },
        ];
        setWeather(weatherData);
        console.log("🌤️ Weather updated for:", data.name);
      } catch (err) {
        console.error("Error fetching weather:", err);
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

  // ---------- FETCH WEATHER WHEN COORDS CHANGE ----------
  useEffect(() => {
    if (coords.lat && coords.lon) {
      getWeather(coords.lat, coords.lon);
    }
  }, [coords.lat, coords.lon, getWeather]);

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
        // Fetch background like manual search does
        const placeImage = await getPlacePhoto(display).catch(() => null);
        if (placeImage) {
          // cache-bust so it refreshes
          setBgImage(`${placeImage}?cacheBust=${Date.now()}`);
        } else {
          try {
            const resImg = await fetch(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                display
              )}&client_id=${UNSPLASH_KEY}&orientation=landscape&per_page=1`
            );
            const imgData = await resImg.json();
            if (imgData.results?.length > 0)
              setBgImage(
                `${imgData.results[0].urls.regular}?cacheBust=${Date.now()}`
              );
            else setBgImage(Cooldesk);
          } catch (err) {
            console.warn("fallback background fetch failed:", err);
            setBgImage(Cooldesk);
          }
        }
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
            const image = await getPlacePhoto(bestMatch).catch(() => null);
            if (image) setBgImage(`${image}?cacheBust=${Date.now()}`);
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

  // ---------- BACKGROUND for place changes (keeps existing logic) ----------
  useEffect(() => {
    if (!place || fetchedPlace.current === place) return;
    fetchedPlace.current = place;

    let isCurrent = true; // 👈 prevents flicker when location just changed
    const controller = new AbortController();

    const fetchImage = async () => {
      try {
        const imageFromHook = await getPlacePhoto(place).catch(() => null);
        if (!isCurrent) return;

        if (imageFromHook) {
          setBgImage(imageFromHook);
          return;
        }

        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            place
          )}&client_id=${UNSPLASH_KEY}&orientation=landscape&per_page=1`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (!isCurrent) return;

        if (data.results?.length > 0) {
          setBgImage(data.results[0].urls.regular); // lighter, faster
        } else {
          setBgImage(Cooldesk);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch background:", err);
          setBgImage(Cooldesk);
        }
      }
    };

    // small delay to avoid quick flicker
    const timeout = setTimeout(fetchImage, 300);

    return () => {
      isCurrent = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [place, UNSPLASH_KEY, getPlacePhoto]);

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
          return;
        }
      } catch (err) {
        console.warn("Error parsing saved location", err);
      }
    }
    setManualLocation(false);
  }, [getWeather, setCoords, setPlace]);

  // ---------- UI ----------
  return (
    <div
      className="fixed bg-cover bg-no-repeat bg-center h-full w-full text-3xl text-black transition-all duration-700"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : "none",
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

        {/* Clickable location icon */}
        <svg
          role="button"
          aria-label="Use my location"
          className="location-SVG cursor-pointer"
          width="36"
          height="52"
          viewBox="0 0 36 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ cursor: "pointer" }}
          onClick={() => window.location.reload()}
        >
          <path
            d="M17.7427 51.3703C17.1366 51.3703 16.5766 51.0501 16.2684 50.5284L13.7164 46.2116C8.4527 37.3125 3.48062 28.9072 1.79111 25.5162C0.600462 23.075 0 20.4636 0 17.7422C0.000570781 7.95897 7.95954 0 17.7427 0C27.5265 0 35.4855 7.95897 35.4855 17.7422C35.4855 20.4614 34.8856 23.0727 33.7023 25.5025C33.6904 25.5265 33.6784 25.5499 33.6664 25.5733C31.9501 29.0008 27.0042 37.3622 21.7696 46.2122L19.2171 50.529C18.9094 51.0501 18.3489 51.3703 17.7427 51.3703ZM17.7427 3.42469C9.84769 3.42469 3.42526 9.84769 3.42526 17.7422C3.42526 19.9385 3.90871 22.0453 4.86249 24.0031C6.49035 27.2685 11.6599 36.0083 16.6588 44.4593L17.7427 46.2926L18.8215 44.4684C23.8233 36.0134 28.9945 27.2702 30.6293 23.9894C30.6361 23.9768 30.6424 23.9637 30.6492 23.9511C31.5865 22.007 32.0614 19.9186 32.0614 17.7427C32.0608 9.84769 25.6378 3.42469 17.7427 3.42469"
            fill="black"
          />
          <path
            d="M17.7427 25.4551C13.1331 25.4551 9.38306 21.7051 9.38306 17.0955C9.38306 12.4859 13.1331 8.73639 17.7427 8.73639C22.3518 8.73639 26.1024 12.4864 26.1024 17.0961C26.1024 21.7057 22.3518 25.4551 17.7427 25.4551ZM17.7427 12.1611C15.0218 12.1611 12.8077 14.3746 12.8077 17.0961C12.8077 19.8175 15.0212 22.031 17.7427 22.031C20.4642 22.031 22.6777 19.8175 22.6777 17.0961C22.6777 14.3746 20.4642 12.1611 17.7427 12.1611Z"
            fill="black"
          />
        </svg>
      </div>

      {!manualLocation && (
        <LocationGetter
          onLocationChange={(payload) => handleLocationChange(payload, "auto")}
        />
      )}

      <div className="weather-container flex justify-around gap-2 mt-25">
        <MainCard
          Country={place}
          Humidity={humidity}
          deg={degree}
          Speed={speed}
        />
        <div className="sub-container flex justify-around gap-5">
          {[...Array(5)].map((_, i) => (
            <Subc
              key={i}
              icon={icon}
              Country={place}
              Humidity={humidity}
              deg={degree}
              Speed={speed}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
