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
// import { useEffect, useState, useCallback } from "react";

// function LocationGetter({ onLocationChange }) {
//   const [error, setError] = useState(null);
//   const [place, setPlace] = useState("");
//   const [coords, setCoords] = useState({ lat: null, lon: null });
//   const apiKey = import.meta.env.VITE_OPENCAGE_KEY;

//   const getPlaceFromCoords = useCallback(
//     async (lat, lon) => {
//       try {
//         const res = await fetch(
//           `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`
//         );
//         const data = await res.json();

//         if (data.results?.length) {
//           const country = data.results[0].components.country;
//           setPlace(country);
//           onLocationChange?.({ lat, lon, place: country });
//         } else {
//           setError("Couldn't determine location name.");
//         }
//       } catch (err) {
//         console.error(err);
//         setError("Error fetching location name.");
//       }
//     },
//     [apiKey, onLocationChange]
//   );

//   useEffect(() => {
//     if (!navigator.geolocation) {
//       setError("Geolocation not supported by your browser.");
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const lat = pos.coords.latitude;
//         const lon = pos.coords.longitude;
//         setCoords({ lat, lon });
//         getPlaceFromCoords(lat, lon);
//       },
//       (err) => setError("Could not access your location.")
//     );
//   }, [getPlaceFromCoords]);

//   return (
//     <div className="p-6 text-lg text-gray-800">
//       {error ? (
//         <p className="text-red-500">⚠️ {error}</p>
//       ) : place ? (
//         <p>
//           You are in: <strong>{place}</strong>
//         </p>
//       ) : (
//         <p>📡 Detecting location...</p>
//       )}
//     </div>
//   );
// }

// export default LocationGetter;

import { useEffect, useState, useCallback } from "react";

function LocationGetter({ onLocationChange }) {
  const [error, setError] = useState(null);
  const [place, setPlace] = useState("");
  const [coords, setCoords] = useState({ lat: null, lon: null });

  const getPlaceFromCoords = useCallback(
    async (lat, lon) => {
      try {
        // ✅ Using Nominatim (no API key needed)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`
        );

        const data = await res.json();
        console.log("Nominatim response:", data);

        if (data && data.address) {
          const country = data.address.country || "Unknown";
          const city =
            data.address.name ||
            data.address.town ||
            data.address.village ||
            data.address.state ||
            "Unknown";

          const placeName = `${country}, ${city}`;
          setPlace(placeName);

          // Notify parent component
          onLocationChange?.({ lat, lon, place: placeName });
        } else {
          setError("Could not determine location name.");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching location name.");
      }
    },
    [onLocationChange]
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }

    console.log("Requesting user location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        getPlaceFromCoords(lat, lon);
      },
      (err) => {
        console.error(err);
        setError("Could not access your location.");
      }
    );
  }, [getPlaceFromCoords]);

  // return (
  //   <div className="p-6 text-lg text-gray-800">
  //     {error ? (
  //       <p className="text-red-500">⚠️ {error}</p>
  //     ) : place ? (
  //       <p>
  //         📍 You are in: <strong>{place}</strong>
  //       </p>
  //     ) : (
  //       <p>📡 Detecting location...</p>
  //     )}
  //   </div>
  // );
}

export default LocationGetter;
