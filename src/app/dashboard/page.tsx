// Dashboard utilisateur - Domelia.fr
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardContent } from "@/components/domelia/DashboardContent";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Redirection si non connecte
  if (!user) {
    redirect("/connexion");
  }

  return <DashboardContent user={user} />;
}
