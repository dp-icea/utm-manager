import { createContext } from "react";

export interface IStripsContext {}

export const StripsContext = createContext<IStripsContext | undefined>(
  undefined,
);
