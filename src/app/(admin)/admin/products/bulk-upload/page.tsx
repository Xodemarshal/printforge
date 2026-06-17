// src/app/(admin)/admin/products/bulk-upload/page.tsx
import { BulkUploadForm } from "./bulkUploadForm"; // <-- Lowercase 'b'

export const dynamic = "force-dynamic";

export default function BulkUploadPage() {
  return <BulkUploadForm />;
}