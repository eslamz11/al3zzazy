import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin")({
  component: AdminShellLayout,
});

function AdminShellLayout() {
  const location = useLocation();
  const isLoginPage =
    location.pathname.endsWith("/admin/login") || location.pathname.endsWith("/admin/login/");

  if (isLoginPage) {
    return <Outlet />;
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AdminGuard>
  );
}
