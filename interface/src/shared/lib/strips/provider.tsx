import { useState, type ReactNode } from "react";
import { StripsContext } from "./context";
import type { FlightArea, FlightStripUI } from "@/shared/model";

export const StripsProvider = ({ children }: { children: ReactNode }) => {
  const [activeStripIds, setActiveStripIds] = useState<FlightArea[]>([]);
  const [strips, setStrips] = useState<FlightStripUI[]>([]);
  return (
    <StripsContext.Provider
      value={{
        activeStripIds,
        setActiveStripIds,
        strips,
        setStrips,
      }}
    >
      {children}
    </StripsContext.Provider>
  );
};
