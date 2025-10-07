import { useContext } from "react";
import { StripsContext } from "./context";

export const useStrips = () => {
  const context = useContext(StripsContext);
  if (context === undefined) {
    throw new Error("useStrips must be used within a StripsProvider");
  }
  return context;
};
