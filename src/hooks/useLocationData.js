import { useContext } from "react";
import LocationContext from "../context/LocationContext ";

export default function useLocationData() {
  return useContext(LocationContext);
}
