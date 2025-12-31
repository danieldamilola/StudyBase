import { Suspense } from "react";
import { UploadDashboard } from "@/components/UploadDashboard";
import { AuthGuard } from "@/components/AuthGuard";
import { RoleGuard } from "@/components/RoleGuard";

export default function Upload() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['Lecturer', 'Class Rep', 'Admin']}>
        <Suspense fallback={<div>Loading...</div>}>
          <UploadDashboard />
        </Suspense>
      </RoleGuard>
    </AuthGuard>
  );
}

