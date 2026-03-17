"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function SettingsError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Settings Error]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="flex items-center gap-2 text-red-700">
        <AlertCircle className="h-5 w-5" />
        <h2 className="font-semibold">Error al cargar Configuración</h2>
      </div>
      <p className="mt-2 text-sm text-red-600">
        {error.message || "Ha ocurrido un error inesperado."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Reintentar
      </button>
    </div>
  );
}
