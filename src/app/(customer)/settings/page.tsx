import { updateProfileAction, logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <form
        action={async (formData) => {
          "use server";
          await updateProfileAction(formData);
        }}
        className="mt-8 space-y-4 rounded-2xl border p-6"
      >
        <Input name="name" placeholder="Name" />
        <Input name="phone" placeholder="Phone" />
        <Input name="avatar_url" placeholder="Avatar URL" />
        <Button type="submit">Save changes</Button>
      </form>

      <div className="mt-8 rounded-2xl border border-forest/20 p-6 bg-white dark:bg-card">
        <h2 className="text-xl font-semibold mb-4 text-primary-dark">Account Actions</h2>
        <p className="text-sm text-secondary-medium mb-4">Sign out of your account</p>
        <form action={logoutAction}>
          <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}
