import { NextResponse } from "next/server";
import { seedInitialData } from "@/app/actions/seed";

/**
 * Desarrollo:
 * - Permite GET /api/seed sin autenticación para arrancar rápido.
 *
 * Otros entornos:
 * - Requiere header `x-seed-secret` que coincida con `SEED_SECRET`.
 * - Si no existe `SEED_SECRET`, el endpoint queda deshabilitado.
 */
export async function GET(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    const expectedSecret = process.env.SEED_SECRET;
    if (!expectedSecret) {
      return NextResponse.json(
        { ok: false, error: "Seed endpoint disabled" },
        { status: 404 }
      );
    }

    const providedSecret = req.headers.get("x-seed-secret");
    if (!providedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  await seedInitialData();
  return NextResponse.json({ ok: true });
}

