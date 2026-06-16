import { updateOrderStatusAction } from "@/actions/orders";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Order detail</h1>
      <form 
        action={async (formData) => {
          "use server";
          await updateOrderStatusAction(formData);
        }} 
        className="flex items-center gap-3"
      >
        <Input name="id" defaultValue={id} placeholder="Order ID" />
        <Input name="status" placeholder="New status" />
        <Button type="submit">Update</Button>
      </form>
    </div>
  );
}
