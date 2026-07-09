import { addAddressAction, deleteAddressAction, updateAddressAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { requireUser } from "@/lib/guards";

export default async function AddressesPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-foreground">Addresses</h1>
      <form 
        action={async (formData) => {
          "use server";
          await addAddressAction(formData);
        }} 
        className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6"
      >
        <Input name="line1" placeholder="Address line 1" />
        <Textarea name="line2" placeholder="Address line 2" />
        <div className="grid gap-4 md:grid-cols-2">
          <Input name="city" placeholder="City" />
          <Input name="state" placeholder="State" />
          <Input name="postalCode" placeholder="Postal code" />
          <Input name="country" placeholder="Country" />
        </div>
        <Button type="submit">Add address</Button>
      </form>
      <form 
        action={async (formData) => {
          "use server";
          await updateAddressAction(formData);
        }} 
        className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6"
      >
        <Input name="id" placeholder="Address ID" />
        <Button type="submit" variant="outline">Update address</Button>
      </form>
      <form 
        action={async (formData) => {
          "use server";
          await deleteAddressAction(formData);
        }} 
        className="mt-6 rounded-2xl border border-border bg-card p-6"
      >
        <Input name="id" placeholder="Address ID" />
        <Button type="submit" variant="outline">Delete address</Button>
      </form>
    </div>
  );
}
