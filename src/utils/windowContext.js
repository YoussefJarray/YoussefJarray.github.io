"use client";
import { createContext, useContext } from "react";

export const WindowContext = createContext(null);

export function useWindowContext() {
  return useContext(WindowContext);
}
