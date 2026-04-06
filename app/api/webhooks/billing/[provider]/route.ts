import { NextResponse } from "next/server";
import { processBillingWebhookWithOptions } from "@/lib/billing";

export async function POST(
  req: Request,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider?.toLowerCase();
  const result = await processBillingWebhookWithOptions(req, {
    providerId: provider
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, provider },
      { status: 400 }
    );
  }

  return NextResponse.json({ processed: result.processed, provider });
}
