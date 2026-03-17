"use server";

import { redirect } from "next/navigation";
import { getCurrentUserWithOrg, hasPermission } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { OrganizationRole } from "@/models/OrganizationRole";
import { logAction } from "@/lib/audit";
import {
  PERMISSIONS,
  type Permission
} from "@/models/OrganizationRole";

export async function createOrgRole(formData: FormData) {
  const user = await getCurrentUserWithOrg();
  if (!user?.organizationId) redirect("/dashboard");
  if (!hasPermission(user, "roles.create")) {
    throw new Error("No tienes permiso para crear roles");
  }

  await connectDB();

  const name = String(formData.get("name") || "").trim();
  const permissionList = formData.getAll("permissions") as Permission[];

  if (!name) throw new Error("El nombre es obligatorio");

  const validPerms = permissionList.filter((p) =>
    PERMISSIONS.includes(p)
  );

  const newRole = await OrganizationRole.create({
    organization: user.organizationId,
    name,
    permissions: validPerms,
    isSystem: false
  });

  await logAction({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action: "create",
    entity: "org_role",
    entityId: String(newRole._id),
    details: `Creó rol ${name}`
  });

  redirect("/dashboard/settings/roles");
}

export async function updateOrgRole(formData: FormData) {
  const user = await getCurrentUserWithOrg();
  if (!user?.organizationId) redirect("/dashboard");
  if (!hasPermission(user, "roles.update")) {
    throw new Error("No tienes permiso para editar roles");
  }

  await connectDB();

  const roleId = String(formData.get("roleId") || "");
  const name = String(formData.get("name") || "").trim();
  const permissionList = formData.getAll("permissions") as Permission[];

  if (!roleId || !name) throw new Error("Datos incompletos");

  const role = await OrganizationRole.findOne({
    _id: roleId,
    organization: user.organizationId
  });

  if (!role) throw new Error("Rol no encontrado");
  if (role.isSystem) throw new Error("No se puede editar el rol de sistema");

  const validPerms = permissionList.filter((p) =>
    PERMISSIONS.includes(p)
  );

  await OrganizationRole.findByIdAndUpdate(roleId, {
    name,
    permissions: validPerms
  });

  await logAction({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action: "update",
    entity: "org_role",
    entityId: roleId,
    details: `Editó rol ${name}`
  });

  redirect("/dashboard/settings/roles");
}

export async function deleteOrgRole(formData: FormData) {
  const user = await getCurrentUserWithOrg();
  if (!user?.organizationId) redirect("/dashboard");
  if (!hasPermission(user, "roles.delete")) {
    throw new Error("No tienes permiso para eliminar roles");
  }

  await connectDB();

  const roleId = String(formData.get("roleId") || "");
  const role = await OrganizationRole.findOne({
    _id: roleId,
    organization: user.organizationId
  });

  if (!role) throw new Error("Rol no encontrado");
  if (role.isSystem) throw new Error("No se puede eliminar el rol de sistema");

  const roleName = role.name;

  await OrganizationRole.findByIdAndDelete(roleId);

  await logAction({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action: "delete",
    entity: "org_role",
    entityId: roleId,
    details: `Eliminó rol ${roleName}`
  });

  redirect("/dashboard/settings/roles");
}
