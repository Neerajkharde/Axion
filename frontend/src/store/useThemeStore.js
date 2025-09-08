import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("axion-theme") || "night",
  setTheme: (theme) => {
    localStorage.setItem("axion-theme", theme);
    set({ theme });
  },
}));