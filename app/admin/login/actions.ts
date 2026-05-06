"use server";

import { redirect } from "next/navigation";
import { loginAdmin } from "@/lib/admin-auth";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const ok = await loginAdmin(password);
  if (!ok) redirect("/admin/login?error=1");
  redirect("/admin");
}
