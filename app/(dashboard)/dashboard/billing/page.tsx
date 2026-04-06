import { redirect } from "next/navigation";

export default async function BillingLegacyPage() {
  redirect("/dashboard/settings/billing");
}
