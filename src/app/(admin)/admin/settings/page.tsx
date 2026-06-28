import { requireAdmin } from "@/lib/guards";
import { getSiteSettings } from "@/actions/settings";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSiteSettings();

  return (
    <div className="space-y-8 pb-12">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-500/80 mb-1">PrintForge Admin</p>
        <h1 className="text-3xl font-bold text-white">Store & Branding Settings</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Customize store branding, site name, logo, and home page hero banners.
        </p>
      </div>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
