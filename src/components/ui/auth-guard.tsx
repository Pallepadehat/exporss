import { DB } from "@/utils/db";
import AuthScreen from "../screens/auth-screen";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DB.SignedIn>{children}</DB.SignedIn>
      <DB.SignedOut>
        <AuthScreen />
      </DB.SignedOut>
    </>
  );
}
