"use server";

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/Organization";
import { OrganizationRole } from "@/models/OrganizationRole";
import { User } from "@/models/User";
import { Plan } from "@/models/Plan";

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
        "roles.delete",
        "logs.read"
      ],
      isSystem: true
    });
  }

  await OrganizationRole.updateOne(
    { organization: org._id, name: "Admin", isSystem: true },
    { $addToSet: { permissions: "logs.read" } }
  );

  /**
   * Catálogo demo (EUR). Anual = 12 × mensual × 0,75 (25% descuento vs pagar mes a mes).
   * Pro: 20€/mes → 180€/año. Business: 60€/mes → 540€/año.
   */
  const catalogPlans = [
    {
      slug: "free",
      name: "Free",
      tier: "free" as const,
      description: "Para empezar y probar el producto.",
      priceMinor: 0,
      currency: "EUR",
      interval: "one_time" as const,
      features: [
        "1 organización",
        "Usuarios limitados",
        "Soporte por comunidad"
      ],
      active: true,
      sortOrder: 0,
      providerPriceIds: {}
    },
    {
      slug: "pro-monthly",
      name: "Pro",
      tier: "pro" as const,
      description: "Para equipos en crecimiento (facturación mensual).",
      priceMinor: 2000,
      currency: "EUR",
      interval: "month" as const,
      features: [
        "Todo en Free",
        "Usuarios ampliados",
        "Roles y permisos avanzados",
        "Soporte prioritario"
      ],
      active: true,
      sortOrder: 1,
      providerPriceIds: {}
    },
    {
      slug: "pro-yearly",
      name: "Pro (anual)",
      tier: "pro" as const,
      description:
        "Mismo plan Pro con facturación anual (−25% frente a 12 meses al precio mensual).",
      priceMinor: 18000,
      currency: "EUR",
      interval: "year" as const,
      features: [
        "Todo en Free",
        "Usuarios ampliados",
        "Roles y permisos avanzados",
        "Soporte prioritario",
        "Ahorro 25% vs mensual"
      ],
      active: true,
      sortOrder: 2,
      providerPriceIds: {}
    },
    {
      slug: "business-monthly",
      name: "Business",
      tier: "business" as const,
      description: "Para organizaciones con más exigencias (mensual).",
      priceMinor: 6000,
      currency: "EUR",
      interval: "month" as const,
      features: [
        "Todo en Pro",
        "Logs y auditoría ampliados",
        "SLA y soporte dedicado",
        "Integraciones prioritarias"
      ],
      active: true,
      sortOrder: 3,
      providerPriceIds: {}
    },
    {
      slug: "business-yearly",
      name: "Business (anual)",
      tier: "business" as const,
      description:
        "Mismo plan Business con facturación anual (−25% frente a 12 meses al precio mensual).",
      priceMinor: 54000,
      currency: "EUR",
      interval: "year" as const,
      features: [
        "Todo en Pro",
        "Logs y auditoría ampliados",
        "SLA y soporte dedicado",
        "Integraciones prioritarias",
        "Ahorro 25% vs mensual"
      ],
      active: true,
      sortOrder: 4,
      providerPriceIds: {}
    }
  ];

  for (const doc of catalogPlans) {
    await Plan.findOneAndUpdate({ slug: doc.slug }, { $set: doc }, { upsert: true });
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

