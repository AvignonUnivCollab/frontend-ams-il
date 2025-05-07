import { Suspense } from "react";
import ResetPasswordPage from "./changePassword";

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement de la page...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
