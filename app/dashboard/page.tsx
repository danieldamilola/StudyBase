import { LandingPage } from "@/components/LandingPage";
import { AuthGuard } from "@/components/AuthGuard";

export default function Dashboard() {
  return (
    <AuthGuard>
      <LandingPage />
    </AuthGuard>
  );
}

