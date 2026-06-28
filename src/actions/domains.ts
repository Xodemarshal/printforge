"use server";

import { requireAdmin } from "@/lib/guards";
import {
  createResendDomain,
  getResendDomain,
  verifyResendDomain,
  updateResendDomain,
  listResendDomains
} from "@/services/email";

export async function createDomainAction(domainName?: string) {
  await requireAdmin();
  return await createResendDomain(domainName);
}

export async function getDomainAction(domainId?: string) {
  await requireAdmin();
  return await getResendDomain(domainId);
}

export async function verifyDomainAction(domainId?: string) {
  await requireAdmin();
  return await verifyResendDomain(domainId);
}

export async function updateDomainAction(
  domainId?: string,
  trackingOptions?: { openTracking?: boolean; clickTracking?: boolean }
) {
  await requireAdmin();
  return await updateResendDomain(domainId, trackingOptions);
}

export async function listDomainsAction() {
  await requireAdmin();
  return await listResendDomains();
}
