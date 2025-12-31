import { Suspense } from "react";
import { SearchPage } from "@/components/SearchPage";

export default function Resources() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPage />
    </Suspense>
  );
}

