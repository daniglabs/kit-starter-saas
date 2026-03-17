import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";

interface CustomerProfilePageProps {
  searchParams: { profileUpdated?: string; passwordUpdated?: string };
}

export default async function CustomerProfilePage({ searchParams }: CustomerProfilePageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.userType === "admin") {
    redirect("/admin");
  }

  return (
    <ProfileForm
      userId={user.id}
      redirectTo="/dashboard/profile"
      profileUpdated={searchParams.profileUpdated === "1"}
      passwordUpdated={searchParams.passwordUpdated === "1"}
    />
  );
}
