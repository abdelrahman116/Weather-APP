import { Droplets } from "lucide-react";
import { Wind } from "lucide-react";

export default function MainCard({ Country, city, deg, Humidity, Speed }) {
  return (
    <>
      <div className="mainCard ">
        <div>{Country}</div>
        <div className=" text-7xl">
          <span className="deg">{deg}</span>C
        </div>
        <div className="flex gap-2 items-center">
          <Droplets /> {Humidity}%
        </div>
        <div className="flex gap-2 items-center">
          <Wind /> {Speed}km/h
        </div>
      </div>
    </>
  );
}
