"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

interface ProfileSuccessBannerProps {
  profileUpdated?: boolean;
  passwordUpdated?: boolean;
  redirectTo: string;
}

export function ProfileSuccessBanner({
  profileUpdated,
  passwordUpdated,
  redirectTo
}: ProfileSuccessBannerProps) {
  const [visible, setVisible] = useState(true);
  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!profileUpdated && !passwordUpdated) return;

    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, 3500);

    const removeTimer = setTimeout(() => {
      setVisible(false);
      router.replace(redirectTo);
    }, 4000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [profileUpdated, passwordUpdated, redirectTo, router]);

  if (!visible || (!profileUpdated && !passwordUpdated)) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex flex-col gap-2 transition-all duration-300 ease-out ${
        !entered || exiting
          ? "translate-x-full opacity-0"
          : "translate-x-0 opacity-100"
      }`}
    >
      {profileUpdated && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-white px-4 py-3 text-sm text-green-800 shadow-lg">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
          <span>Datos personales actualizados correctamente.</span>
        </div>
      )}
      {passwordUpdated && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-white px-4 py-3 text-sm text-green-800 shadow-lg">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
          <span>Contraseña cambiada correctamente.</span>
        </div>
      )}
    </div>
  );
}
