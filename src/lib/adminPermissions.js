export const ADMIN_PERMISSION_GROUPS = [
  {
    id: "dashboard",
    label: "Control Tower",
    permissions: [
      { key: "dashboard.view", label: "View dashboard", description: "See the admin overview and live metrics." },
    ],
  },
  {
    id: "orders",
    label: "Order Operations",
    permissions: [
      { key: "orders.view", label: "View orders", description: "Inspect client orders and queue state." },
      { key: "orders.manage", label: "Manage orders", description: "Update status, payment state, and assignment." },
      { key: "orders.bulk", label: "Bulk order actions", description: "Apply updates to many orders at once." },
    ],
  },
  {
    id: "services",
    label: "Catalog Management",
    permissions: [
      { key: "services.view", label: "View services", description: "Open the service studio and inspect the catalog." },
      { key: "services.manage", label: "Manage services", description: "Create and edit services." },
      { key: "services.archive", label: "Archive services", description: "Archive public services." },
      { key: "services.restore", label: "Restore services", description: "Restore archived services." },
      { key: "services.bulk", label: "Bulk service actions", description: "Archive, restore, or flag services in bulk." },
    ],
  },
  {
    id: "users",
    label: "People Operations",
    permissions: [
      { key: "users.view", label: "View users", description: "Open the user desk and inspect accounts." },
      { key: "users.manage", label: "Manage users", description: "Create accounts and update role/profile data." },
      { key: "users.disable", label: "Disable users", description: "Disable or re-enable account access." },
      { key: "users.delete", label: "Delete users", description: "Permanently delete eligible accounts." },
      { key: "users.bulk", label: "Bulk user actions", description: "Apply role or status changes to many users." },
    ],
  },
  {
    id: "audit",
    label: "Audit & Trace",
    permissions: [
      { key: "audit.view", label: "View audit log", description: "Inspect admin actions and platform history." },
    ],
  },
]

export const ADMIN_PERMISSION_TEMPLATES = [
  {
    key: "super_admin",
    label: "Super Admin",
    description: "Full access to every admin surface.",
    permissions: ["*"],
  },
  {
    key: "operations_manager",
    label: "Operations Manager",
    description: "Owns order execution and queue health.",
    permissions: ["dashboard.view", "orders.view", "orders.manage", "orders.bulk", "audit.view"],
  },
  {
    key: "catalog_manager",
    label: "Catalog Manager",
    description: "Owns the service catalog lifecycle.",
    permissions: ["dashboard.view", "services.view", "services.manage", "services.archive", "services.restore", "services.bulk", "audit.view"],
  },
  {
    key: "support_manager",
    label: "Support Manager",
    description: "Handles accounts, order support, and traceability.",
    permissions: ["dashboard.view", "orders.view", "orders.manage", "users.view", "users.manage", "users.disable", "audit.view"],
  },
]

function getNormalizedPermissions(user) {
  if (!user || user.role !== "admin") {
    return []
  }

  const permissions = Array.isArray(user.permissions) && user.permissions.length > 0
    ? user.permissions
    : ["*"]

  return permissions
}

export function hasPermission(user, permission) {
  const permissions = getNormalizedPermissions(user)
  return permissions.includes("*") || permissions.includes(permission)
}

export function hasAnyPermission(user, permissions) {
  return Array.isArray(permissions) && permissions.some((permission) => hasPermission(user, permission))
}

export function getPrimaryAdminRoute(user) {
  if (!user || user.role !== "admin") {
    return "/dashboard"
  }

  if (hasPermission(user, "dashboard.view")) return "/admin"
  if (hasAnyPermission(user, ["orders.view", "orders.manage", "orders.bulk"])) return "/admin/orders"
  if (hasAnyPermission(user, ["services.view", "services.manage", "services.archive", "services.restore", "services.bulk"])) return "/admin/services"
  if (hasAnyPermission(user, ["users.view", "users.manage", "users.disable", "users.delete", "users.bulk"])) return "/admin/users"
  if (hasPermission(user, "audit.view")) return "/admin/audit"
  return "/dashboard/profile"
}

export function getPermissionTemplate(templateKey) {
  return ADMIN_PERMISSION_TEMPLATES.find((template) => template.key === templateKey) || null
}
