import { useEffect, useState, useCallback } from "react";

function LocationGetter({ onLocationChange }) {
  const [error, setError] = useState(null);
  const [place, setPlace] = useState("");
  const [coords, setCoords] = useState({ lat: null, lon: null });

  const getPlaceFromCoords = useCallback(
    async (lat, lon) => {
      try {
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
}

export default LocationGetter;
