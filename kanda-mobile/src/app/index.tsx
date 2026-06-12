import { Redirect } from "expo-router";

import { useAppStore } from "@/store/use-app-store";

export default function Index() {
  const user = useAppStore((state) => state.user);

  return <Redirect href={user ? "/home" : "/auth/login"} />;
}
