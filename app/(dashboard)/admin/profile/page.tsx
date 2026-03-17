import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";

interface AdminProfilePageProps {
  searchParams: { profileUpdated?: string; passwordUpdated?: string };
}

export default async function AdminProfilePage({ searchParams }: AdminProfilePageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.userType !== "admin") {
    redirect("/dashboard");
  }

  return (
    <ProfileForm
      userId={user.id}
      redirectTo="/admin/profile"
      profileUpdated={searchParams.profileUpdated === "1"}
      passwordUpdated={searchParams.passwordUpdated === "1"}
    />
  );
}
