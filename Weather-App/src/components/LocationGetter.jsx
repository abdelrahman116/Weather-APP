// import { useEffect, useState } from "react";

// function LocationGetter({ changePlace }) {
//   const [location, setLocation] = useState({ lat: null, lon: null });
//   const [place, setPlace] = useState("");
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const apiKey = import.meta.env.VITE_OPENCAGE_KEY;

//     if (!navigator.geolocation) {
//       setError("Geolocation not supported by your browser.");
//       return;
//     }

//     console.log("Requesting location...");
//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const lat = position.coords.latitude;
//         const lon = position.coords.longitude;
//         console.log("Got coordinates:", lat, lon);
//         setLocation({ lat, lon });

//         try {
//           const res = await fetch(
//             `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`
//           );

//           const data = await res.json();
//           console.log("OpenCage response:", data);

//           if (data.results && data.results.length > 0) {
//             const components = data.results[0].components;
//             const country = components.country;

//             setPlace(country);
//             // ✅ Tell HomePage the new location
//             if (changePlace) changePlace(country);
//           } else {
//             setError("Could not determine location name.");
//           }
//         } catch (err) {
//           console.error("Failed to fetch city name:", err);
//           setError("Failed to fetch city name.");
//         }
//       },
//       (err) => {
//         console.error("Geolocation error:", err);
//         setError(err.message);
//       }
//     );
//   }, [changePlace]);

//   return (
//     <div className="p-6 text-lg text-gray-800">
//       {error && <p className="text-red-500">⚠️ {error}</p>}
//       {place ? (
//         <p>
//           You are in: <strong>{place}</strong>
//         </p>
//       ) : (
//         <p>📡 Fetching your location...</p>
//       )}
//       {error && (
//         <div className="text-yellow-600 bg-yellow-100 p-3 rounded-md">
//           ⚠️ {error}
//           <button
//             onClick={() => window.location.reload()}
//             className="ml-2 text-blue-500 underline"
//           >
//             Retry
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default LocationGetter;

import { useEffect, useState } from "react";

function LocationGetter({ changePlace }) {
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [place, setPlace] = useState("");
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState("");

  const apiKey = import.meta.env.VITE_OPENCAGE_KEY;

  // ✅ Reverse geocoding (coords → place)
  const getPlaceFromCoords = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`
      );
      const data = await res.json();

      if (data.results?.length) {
        const country = data.results[0].components.country;
        setPlace(country);
        changePlace?.(country);
      } else setError("Couldn't determine location name.");
    } catch (err) {
      console.error("Error fetching place:", err);
      setError("Error fetching location name.");
    }
  };

  // ✅ Forward geocoding (place name → coords)
  const getCoordsFromPlace = async (city) => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }
    setError(null);

    try {
      const res = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          city
        )}&key=${apiKey}`
      );
      const data = await res.json();

      if (data.results?.length) {
        const result = data.results[0];
        const lat = result.geometry.lat;
        const lon = result.geometry.lng;
        const country = result.components.country;

        setLocation({ lat, lon });
        setPlace(country);
        changePlace?.(country);
      } else setError("City not found. Try again.");
    } catch (err) {
      console.error("Error fetching coordinates:", err);
      setError("Error fetching city info.");
    }
  };

  // ✅ Detect location automatically on load
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }

    console.log("Requesting location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        console.log("Got coordinates:", lat, lon);
        setLocation({ lat, lon });
        getPlaceFromCoords(lat, lon);
      },
      (err) => {
        console.warn("Geolocation denied or failed:", err);
        setError("Could not access your location. Enter a city below 👇");
      }
    );
  }, []);

  return (
    <div className="p-6 text-lg text-gray-800 flex flex-col gap-3">
      {error && <p className="text-red-500">⚠️ {error}</p>}

      {place ? (
        <p>
          You are in: <strong>{place}</strong>
        </p>
      ) : (
        <p>📡 Fetching your location...</p>
      )}
      {/* 
      <div className="mt-4">
        <input
          type="text"
          placeholder="Type a city name (e.g. London)"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
        <button
          onClick={() => getCoordsFromPlace(manualInput)}
          className="bg-blue-600 text-white mt-2 px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </div> */}
    </div>
  );
}

export default LocationGetter;
