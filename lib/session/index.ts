import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import {
  PERMISSIONS,
  type Permission
} from "@/models/OrganizationRole";

function normalizeRolePermissions(raw: unknown): Permission[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((p): p is Permission =>
    PERMISSIONS.includes(p as Permission)
  );
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) return null;

  return {
    id: (session.user as any).id as string,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    userType: (session.user as any).userType as "admin" | "customer"
  };
}

export async function getCurrentUserWithOrg() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  try {
    await connectDB();
    const user = await User.findById((session.user as any).id)
      .populate("organization")
      .populate("organizationRole")
      .lean();

    if (!user) return null;

    const org = user.organization as any;
    const orgRole = user.organizationRole as any;
    const permissions = normalizeRolePermissions(orgRole?.permissions);
    const orgCreatedBy = org?.createdBy?.toString?.() ?? org?.createdBy;

    const userType = (user as any).userType ?? (user as any).role;

    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      userType,
      organizationId: org ? String(org._id) : null,
      organizationRoleId: user.organizationRole ? String((user.organizationRole as any)._id) : null,
      permissions,
      isOrgAdmin: !!orgCreatedBy && orgCreatedBy === String(user._id)
    };
  } catch (err) {
    console.error("[getCurrentUserWithOrg]", err);
    throw err;
  }
}

export function hasPermission(
  user: Awaited<ReturnType<typeof getCurrentUserWithOrg>>,
  permission: Permission
): boolean {
  if (!user) return false;
  if (user.userType === "admin") return true;
  if (user.isOrgAdmin) return true;
  return user.permissions.includes(permission);
}
