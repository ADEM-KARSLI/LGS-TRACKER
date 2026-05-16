import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const profile = await getCurrentUser();

  if (!profile) {
    redirect("/login");
  }

  redirect(profile.role === "parent" ? "/parent" : "/dashboard");
}
