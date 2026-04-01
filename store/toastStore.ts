import { create } from "zustand";

type ToastState = {
  message: string | null;
  show: (message: string) => void;
  clear: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message) => {
    set({ message });
    if (typeof window !== "undefined") {
      window.setTimeout(() => set({ message: null }), 3000);
    }
  },
  clear: () => set({ message: null }),
}));
