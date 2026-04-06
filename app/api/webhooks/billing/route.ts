import { NextResponse } from "next/server";
import { processBillingWebhook } from "@/lib/billing";

/**
 * Endpoint genérico (retrocompatible). Usa BILLING_PROVIDER por entorno
 * o header `x-billing-provider`.
 */
export async function POST(req: Request) {
  const result = await processBillingWebhook(req);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ processed: result.processed });
}
