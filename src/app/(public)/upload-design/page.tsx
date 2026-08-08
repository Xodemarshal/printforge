import type { Metadata } from "next";
import { UploadDesignClient } from "./UploadDesignClient";

export const metadata: Metadata = {
  title: "Upload Design - ArchiveVault",
  description: "Upload your design files and get custom products made."
};

export default function UploadDesignPage() {
  return <UploadDesignClient />;
}
