import { create } from "zustand";

import type { User } from "@/types/user";

type AppState = {
  user: User | null;
  login: (phone: string) => void;
  logout: () => void;
};

const makeUser = (phone: string): User => {
  const digits = phone.replace(/\D/g, "");
  return {
    id: `user-${digits.slice(-9) || "local"}`,
    name: "Utilizador Kanda",
    phone,
    joinedAt: new Date().toISOString(),
  };
};

export const useAppStore = create<AppState>((set) => ({
  user: null,
  login: (phone) => set({ user: makeUser(phone) }),
  logout: () => set({ user: null }),
}));
