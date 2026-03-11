import AuthGuard from "@/components/ui/auth-guard";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AuthGuard>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthGuard>
  );
}
