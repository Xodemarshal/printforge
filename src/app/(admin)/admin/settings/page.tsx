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
        <h1 className="text-2xl font-semibold text-white">Site & Hero Settings</h1>
        <p className="text-gray-400 mt-1">
          Customize site-wide options such as your store branding, name, logo, and the home page hero section text and assets.
        </p>
      </div>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
