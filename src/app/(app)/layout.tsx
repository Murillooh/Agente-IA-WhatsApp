import { Sidebar } from "@/components/Sidebar";
import { getSession } from "@/lib/auth/session";
import { isUserAdmin } from "@/lib/repo/users";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const isAdmin = session ? await isUserAdmin(session.userId) : false;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isAdmin={isAdmin} />
      <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-transparent">
        <div className="mx-auto max-w-screen-2xl px-8 py-8 2xl:px-12">{children}</div>
      </main>
    </div>
  );
}
