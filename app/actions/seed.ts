"use server";

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/Organization";
import { User } from "@/models/User";

export async function seedInitialData() {
  await connectDB();

  const existingOrg = await Organization.findOne({ slug: "acme" });
  if (existingOrg) return;

  const org = await Organization.create({
    name: "Acme Inc.",
    slug: "acme"
  });

  const adminPassword = "admin123";
  const customerPassword = "customer123";

  const [adminHash, customerHash] = await Promise.all([
    bcrypt.hash(adminPassword, 10),
    bcrypt.hash(customerPassword, 10)
  ]);

  await User.create([
    {
      email: "admin@example.com",
      name: "Admin",
      passwordHash: adminHash,
      role: "admin",
      organization: org._id
    },
    {
      email: "customer@example.com",
      name: "Customer",
      passwordHash: customerHash,
      role: "customer",
      organization: org._id
    }
  ]);
}

