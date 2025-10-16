// src/hooks/usePlacePhoto.js
import { useCallback, useRef } from "react";

export default function usePlacePhoto() {
  const cache = useRef({});
  const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

  const getPlacePhoto = useCallback(
    async (place) => {
      if (!place) return "";

      if (cache.current[place]) return cache.current[place];

      try {
        const query = `${place}`;
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            query
          )}&orientation=landscape&per_page=5`,
          {
            headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
          }
        );

        const data = await res.json();
        const imageUrl = data.results?.[0]?.urls?.regular || "";

        cache.current[place] = imageUrl;
        return imageUrl;
      } catch (error) {
        console.error("❌ Unsplash fetch failed:", error);
        return "";
      }
    },
    [UNSPLASH_KEY]
  );

  return { getPlacePhoto };
}
