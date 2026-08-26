import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPreorderById, getUserPreorderRegistration } from "@/actions/preorders";
import { PreOrderDetails } from "@/components/preorder/PreOrderDetails";

interface PrebookIdPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PrebookIdPageProps): Promise<Metadata> {
  const { id } = await params;
  const preorder = await getPreorderById(id);
  if (!preorder) return { title: "Preorder Not Found | Crafted Tale" };

  return {
    title: `${preorder.title} - Preorder Early Access | Crafted Tale`,
    description: preorder.description || `Prebook ${preorder.products?.name} with ${preorder.discount_percentage}% discount.`
  };
}

export default async function PrebookIdPage({ params }: PrebookIdPageProps) {
  const { id } = await params;
  const preorder = await getPreorderById(id);

  if (!preorder) {
    notFound();
  }

  const userRegistration = await getUserPreorderRegistration(preorder.id);

  return <PreOrderDetails preorder={preorder} userRegistration={userRegistration} />;
}
