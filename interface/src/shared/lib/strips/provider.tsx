import { type ReactNode } from "react";
import { StripsContext } from "./context";

export const StripsProvider = ({ children }: { children: ReactNode }) => {
  return <StripsContext.Provider value={{}}>{children}</StripsContext.Provider>;
};
