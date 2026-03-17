"use server";

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/Organization";
import { OrganizationRole } from "@/models/OrganizationRole";
import { User } from "@/models/User";

export async function seedInitialData() {
  await connectDB();

  let org = await Organization.findOne({ slug: "acme" });
  if (!org) {
    org = await Organization.create({
      name: "Acme Inc.",
      slug: "acme"
    });
  }

  const adminPassword = "admin123";
  const customerPassword = "customer123";

  const [adminHash, customerHash] = await Promise.all([
    bcrypt.hash(adminPassword, 10),
    bcrypt.hash(customerPassword, 10)
  ]);

  let adminRole = await OrganizationRole.findOne({
    organization: org._id,
    name: "Admin"
  });
  if (!adminRole) {
    adminRole = await OrganizationRole.create({
      organization: org._id,
      name: "Admin",
      permissions: [
        "users.create",
        "users.read",
        "users.update",
        "users.delete",
        "roles.create",
        "roles.read",
        "roles.update",
        "roles.delete"
      ],
      isSystem: true
    });
  }

  let adminUser = await User.findOne({ email: "admin@example.com" });
  if (!adminUser) {
    adminUser = await User.create({
      email: "admin@example.com",
      name: "Admin",
      firstName: "Admin",
      lastName: "",
      passwordHash: adminHash,
      userType: "admin",
      organization: null,
      organizationRole: null
    });
  }

  let customerUser = await User.findOne({ email: "customer@example.com" });
  if (!customerUser) {
    customerUser = await User.create({
      email: "customer@example.com",
      name: "Customer",
      firstName: "Customer",
      lastName: "",
      passwordHash: customerHash,
      userType: "customer",
      organization: org._id,
      organizationRole: adminRole._id
    });
  } else if (!customerUser.organization) {
    await User.findByIdAndUpdate(customerUser._id, {
      organization: org._id,
      organizationRole: adminRole._id
    });
  }

  await Organization.findByIdAndUpdate(org._id, {
    createdBy: customerUser._id
  });
}

