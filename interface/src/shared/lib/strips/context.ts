import type { FlightArea, FlightStripUI } from "@/shared/model";
import { createContext } from "react";

export interface IStripsContext {
  activeStripIds: FlightArea[];
  setActiveStripIds: (ids: FlightArea[]) => void;
  strips: FlightStripUI[];
  setStrips: (strips: FlightStripUI[]) => void;
}

export const StripsContext = createContext<IStripsContext | undefined>(
  undefined,
);
