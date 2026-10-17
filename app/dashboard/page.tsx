import { redirect } from "next/navigation";

/** Legacy path → ERP dashboard */
export default function LegacyDashboard() {
  redirect("/erp/dashboard");
}
