import { useState } from "react";
import LocationContext from "./LocationContext ";

export default function LocationProvider({ children }) {
  const [place, setPlace] = useState("");
  const [coords, setCoords] = useState(null);
  const [background, setBackground] = useState("");

  const value = {
    place,
    setPlace,
    coords,
    setCoords,
    background,
    setBackground,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}
