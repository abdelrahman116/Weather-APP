// import Coolphone from "../assets/Cool/640.jpg";
// import Cooltap from "../assets/Cool/1200.jpg";
// import Cooldesk from "../assets/Cool/1920.jpg";
// import Hotdesk from "../assets/Sunny/1920x1080/1920.jpg";
// import Hottap from "../assets/Sunny/1280/1280.jpg";
// import Hotphone from "../assets/Sunny/640/640.jpg";
// import { useEffect, useState, useCallback, useMemo } from "react";
// import LocationGetter from "./LocationGetter";
// import useLocationData from "../hooks/useLocationData";
// import countries from "world-countries";
// import Fuse from "fuse.js";

// export default function HomePage() {
//   const { place, setPlace } = useLocationData();

//   const [weather, setWeather] = useState(20);
//   const [backgroundImage, setBackgroundImage] = useState("");
//   const [inputValue, setInputValue] = useState("");

//   // const PEXELS_KEY = import.meta.env.VITE_PEXELS_KEY;
//   const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
//   // ✅ Memoize country list so it's stable
//   const countryNames = useMemo(() => countries.map((c) => c.name.common), []);
//   const fuse = new Fuse(countryNames, {
//     includeScore: true,
//     threshold: 0.4, // 0.0 = exact match, 1.0 = very fuzzy
//   });

//   // ✅ Memoize fetch function so it's stable
//   const getCountryPhoto = useCallback(
//     async (country) => {
//       if (!country) return "";

//       const searchQuery = `tower in ${country} `;

//       const res = await fetch(
//         `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
//           searchQuery
//         )}&orientation=landscape&per_page=1`,
//         {
//           headers: {
//             Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_KEY}`,
//           },
//         }
//       );

//       const data = await res.json();
//       return data.photos?.[0]?.src?.landscape || "";
//     },
//     [UNSPLASH_KEY]
//   );

//   // ✅ Manual input handler
//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       const trimmed = inputValue.trim();

//       // Use Fuse.js to find closest match
//       const result = fuse.search(trimmed);

//       if (result.length > 0) {
//         const bestMatch = result[0].item; // top-ranked match
//         setPlace(bestMatch);
//         getCountryPhoto(bestMatch).then(setBackgroundImage);
//       } else {
//         alert("⚠️ Couldn’t recognize that place. Try again.");
//       }
//     }
//   };

//   // ✅ Auto location effect — now ESLint-safe
//   useEffect(() => {
//     if (
//       place &&
//       countryNames.some(
//         (country) => country.toLowerCase() === place.toLowerCase()
//       )
//     ) {
//       getCountryPhoto(place).then(setBackgroundImage);
//     }
//   }, [place, countryNames, getCountryPhoto]);

// return (
//   <div
//     className="fixed bg-cover bg-no-repeat bg-center h-full w-full text-3xl text-black transition-all duration-700"
//     style={{
//       backgroundImage: `url(${
//         backgroundImage ||
//         (window.innerWidth < 640
//           ? weather <= 27
//             ? Coolphone
//             : Hotphone
//           : window.innerWidth < 1200
//           ? weather <= 27
//             ? Cooltap
//             : Hottap
//           : weather <= 27
//           ? Cooldesk
//           : Hotdesk)
//       })`,
//     }}
//   >
//     <div className="location-in rounded-4xl">
//       <input
//         className="inputFeild"
//         type="text"
//         placeholder="Type your country and press Enter"
//         value={inputValue}
//         onChange={(e) => setInputValue(e.target.value)}
//         onKeyDown={handleKeyDown}
//       />
//       <svg
//         className="location-SVG"
//         width="36"
//         height="52"
//         viewBox="0 0 36 52"
//         fill="none"
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         <path
//           d="M17.7427 51.3703C17.1366 51.3703 16.5766 51.0501 16.2684 50.5284L13.7164 46.2116C8.4527 37.3125 3.48062 28.9072 1.79111 25.5162C0.600462 23.075 0 20.4636 0 17.7422C0.000570781 7.95897 7.95954 0 17.7427 0C27.5265 0 35.4855 7.95897 35.4855 17.7422C35.4855 20.4614 34.8856 23.0727 33.7023 25.5025C33.6904 25.5265 33.6784 25.5499 33.6664 25.5733C31.9501 29.0008 27.0042 37.3622 21.7696 46.2122L19.2171 50.529C18.9094 51.0501 18.3489 51.3703 17.7427 51.3703ZM17.7427 3.42469C9.84769 3.42469 3.42526 9.84769 3.42526 17.7422C3.42526 19.9385 3.90871 22.0453 4.86249 24.0031C6.49035 27.2685 11.6599 36.0083 16.6588 44.4593L17.7427 46.2926L18.8215 44.4684C23.8233 36.0134 28.9945 27.2702 30.6293 23.9894C30.6361 23.9768 30.6424 23.9637 30.6492 23.9511C31.5865 22.007 32.0614 19.9186 32.0614 17.7427C32.0608 9.84769 25.6378 3.42469 17.7427 3.42469Z"
//           fill="black"
//         />
//         <path
//           d="M17.7427 25.4551C13.1331 25.4551 9.38306 21.7051 9.38306 17.0955C9.38306 12.4859 13.1331 8.73639 17.7427 8.73639C22.3518 8.73639 26.1024 12.4864 26.1024 17.0961C26.1024 21.7057 22.3518 25.4551 17.7427 25.4551ZM17.7427 12.1611C15.0218 12.1611 12.8077 14.3746 12.8077 17.0961C12.8077 19.8175 15.0212 22.031 17.7427 22.031C20.4642 22.031 22.6777 19.8175 22.6777 17.0961C22.6777 14.3746 20.4642 12.1611 17.7427 12.1611Z"
//           fill="black"
//         />
//       </svg>
//     </div>

//     <LocationGetter changePlace={setPlace} />
//   </div>
// );
// }

import Coolphone from "../assets/Cool/640.jpg";
import Cooltap from "../assets/Cool/1200.jpg";
import Cooldesk from "../assets/Cool/1920.jpg";
import Hotdesk from "../assets/Sunny/1920x1080/1920.jpg";
import Hottap from "../assets/Sunny/1280/1280.jpg";
import Hotphone from "../assets/Sunny/640/640.jpg";

import { useEffect, useState, useMemo } from "react";
import LocationGetter from "./LocationGetter";
import useLocationData from "../hooks/useLocationData";
import countries from "world-countries";
import Fuse from "fuse.js";
import usePlacePhoto from "../hooks/usePlacePhoto";

export default function HomePage() {
  const { place, setPlace } = useLocationData();
  const { getPlacePhoto } = usePlacePhoto();
  const [bgImage, setBgImage] = useState("");

  const [weather, setWeather] = useState(25);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [inputValue, setInputValue] = useState("");
  const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  // ✅ Memoized country list
  const countryNames = useMemo(() => countries.map((c) => c.name.common), []);
  const fuse = new Fuse(countryNames, { threshold: 0.3 });

  // ✅ Handle manual input
  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      const trimmed = inputValue.trim();
      if (!trimmed) return;

      const result = fuse.search(trimmed);
      if (result.length > 0) {
        const bestMatch = result[0].item;
        setPlace(bestMatch);
        const image = await getPlacePhoto(bestMatch);
        setBackgroundImage(image);
      } else {
        alert("⚠️ Couldn’t recognize that place. Try again.");
      }
    }
  };

  // ✅ Fetch photo when geolocation updates
  useEffect(() => {
    if (!place) return;

    console.log("Fetching background for:", place);

    const fetchImage = async () => {
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            place
          )}&client_id=${UNSPLASH_KEY}&orientation=landscape&per_page=1`
        );
        const data = await res.json();

        if (data.results?.length > 0) {
          setBgImage(data.results[0].urls.full);
        } else {
          console.warn("No image found for:", place);
          setBgImage("");
        }
      } catch (err) {
        console.error("Failed to fetch Unsplash image:", err);
      }
    };

    fetchImage();
  }, [place]);

  // ✅ Choose fallback images for local weather
  // const fallbackImage =
  //   window.innerWidth < 640
  //     ? weather <= 27
  //       ? Coolphone
  //       : Hotphone
  //     : window.innerWidth < 1200
  //     ? weather <= 27
  //       ? Cooltap
  //       : Hottap
  //     : weather <= 27
  //     ? Cooldesk
  //     : Hotdesk;

  return (
    <div
      className="fixed bg-cover bg-no-repeat bg-center h-full w-full text-3xl text-black transition-all duration-700"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : "none",
      }}
    >
      <div className="location-in rounded-4xl">
        <input
          className="inputFeild"
          type="text"
          placeholder="Type your country and press Enter"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <svg
          className="location-SVG"
          width="36"
          height="52"
          viewBox="0 0 36 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.7427 51.3703C17.1366 51.3703 16.5766 51.0501 16.2684 50.5284L13.7164 46.2116C8.4527 37.3125 3.48062 28.9072 1.79111 25.5162C0.600462 23.075 0 20.4636 0 17.7422C0.000570781 7.95897 7.95954 0 17.7427 0C27.5265 0 35.4855 7.95897 35.4855 17.7422C35.4855 20.4614 34.8856 23.0727 33.7023 25.5025C33.6904 25.5265 33.6784 25.5499 33.6664 25.5733C31.9501 29.0008 27.0042 37.3622 21.7696 46.2122L19.2171 50.529C18.9094 51.0501 18.3489 51.3703 17.7427 51.3703ZM17.7427 3.42469C9.84769 3.42469 3.42526 9.84769 3.42526 17.7422C3.42526 19.9385 3.90871 22.0453 4.86249 24.0031C6.49035 27.2685 11.6599 36.0083 16.6588 44.4593L17.7427 46.2926L18.8215 44.4684C23.8233 36.0134 28.9945 27.2702 30.6293 23.9894C30.6361 23.9768 30.6424 23.9637 30.6492 23.9511C31.5865 22.007 32.0614 19.9186 32.0614 17.7427C32.0608 9.84769 25.6378 3.42469 17.7427 3.42469Z"
            fill="black"
          />
          <path
            d="M17.7427 25.4551C13.1331 25.4551 9.38306 21.7051 9.38306 17.0955C9.38306 12.4859 13.1331 8.73639 17.7427 8.73639C22.3518 8.73639 26.1024 12.4864 26.1024 17.0961C26.1024 21.7057 22.3518 25.4551 17.7427 25.4551ZM17.7427 12.1611C15.0218 12.1611 12.8077 14.3746 12.8077 17.0961C12.8077 19.8175 15.0212 22.031 17.7427 22.031C20.4642 22.031 22.6777 19.8175 22.6777 17.0961C22.6777 14.3746 20.4642 12.1611 17.7427 12.1611Z"
            fill="black"
          />
        </svg>
      </div>

      <LocationGetter changePlace={setPlace} />
    </div>
  );
}
