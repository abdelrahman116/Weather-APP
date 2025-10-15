import { Droplets } from "lucide-react";
import { Wind } from "lucide-react";
import { Cloud } from "lucide-react";

export default function Subc({ day, deg, Humidity, Speed, icon }) {
  return (
    <>
      <div className="subCard">
        <div>{day}</div>
        <div className="dash "></div>
        <img className="-mt-4" src={icon} alt="" />
        <div>
          <span className="-mt-4 deg">{deg}</span>C
        </div>{" "}
        <Droplets className=" lg:h-10 lg:w-20 md:h-7 md:w-14 h-4.5 w-8" />
        <div>{Humidity}%</div>
        <Wind className=" md:h-7 md:w-14 lg:h-10 lg:w-20 h-4.5 w-8" />
        <div>{Speed}km/h</div>
      </div>
    </>
  );
}
