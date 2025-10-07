import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  OperationalIntent,
  Constraint,
  IdentificationServiceAreaFull,
} from "@/shared/model";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isOperationalIntent = (
  region: OperationalIntent | Constraint | IdentificationServiceAreaFull,
): region is OperationalIntent => {
  return "flight_type" in region.reference;
};

export const isConstraint = (
  region: OperationalIntent | Constraint | IdentificationServiceAreaFull,
): region is Constraint => {
  return "geozone" in region.details;
};

export const isIdentificationServiceArea = (
  region: OperationalIntent | Constraint | IdentificationServiceAreaFull,
): region is IdentificationServiceAreaFull => {
  return "owner" in region.reference;
};

export const areArraysEqual = <T>(arr1: T[], arr2: T[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  if (arr1.length === 0 && arr2.length === 0) return true;
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();
  return sortedArr1.every((value, index) => value === sortedArr2[index]);
};
