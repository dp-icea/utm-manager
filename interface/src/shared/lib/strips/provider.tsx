import { useState, type ReactNode } from "react";
import { StripsContext } from "./context";
import type { FlightArea } from "@/shared/model";

export const StripsProvider = ({ children }: { children: ReactNode }) => {
  const [activeStripIds, setActiveStripIds] = useState<FlightArea[]>([]);
  return (
    <StripsContext.Provider
      value={{
        activeStripIds,
        setActiveStripIds,
      }}
    >
      {children}
    </StripsContext.Provider>
  );
};
