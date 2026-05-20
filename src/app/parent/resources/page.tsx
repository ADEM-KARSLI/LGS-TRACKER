import { AppShell } from "@/components/app-shell";
import { ResourceManager } from "@/components/resource-manager";
import { requireRole } from "@/lib/auth";
import { getParentResources } from "@/lib/resources";

export default async function ParentResourcesPage() {
  const profile = await requireRole("parent");
  const { students, resources } = await getParentResources(profile.id);

  return (
    <AppShell role="parent" title="Kaynak Yönetimi" userName={profile.name}>
      <p className="mb-6 text-slate-600 dark:text-slate-400">
        Öğrenciniz için ders, konu ve kaynak ekleyin. Bu kaynaklar öğrenci test ekleme formunda dropdown olarak görünecektir.
      </p>
      <ResourceManager students={students} resources={resources} />
    </AppShell>
  );
}
