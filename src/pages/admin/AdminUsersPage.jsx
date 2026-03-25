import { useEffect, useMemo, useState } from "react"
import { Mail, Search, ShieldCheck, Trash2, UserPlus, Users2 } from "lucide-react"
import AdminShell from "@/components/admin/AdminShell"
import { Badge, Button, ConfirmDialog, Input } from "@/components/ui"
import { useAuth } from "@/hooks/useAuth"
import {
  ADMIN_PERMISSION_GROUPS,
  ADMIN_PERMISSION_TEMPLATES,
  getPermissionTemplate,
  hasPermission,
} from "@/lib/adminPermissions"
import { usersApi } from "@/lib/api"
import { notifyError, notifySuccess, notifyWarning } from "@/lib/toast"
import { cn, formatCurrency, formatDate } from "@/lib/utils"

const ROLE_FILTERS = ["All", "client", "admin"]
const STATUS_FILTERS = ["All", "active", "disabled"]
const BULK_ACTIONS = [
  { value: "enable", label: "Enable selected" },
  { value: "disable", label: "Disable selected" },
  { value: "promoteToAdmin", label: "Promote to admin" },
  { value: "convertToClient", label: "Convert to client" },
  { value: "delete", label: "Delete selected" },
]

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "client",
  phone: "",
  businessName: "",
  pan: "",
  gstin: "",
  address: "",
  permissions: [],
}

function getDefaultPermissionsForAdmin() {
  return getPermissionTemplate("super_admin")?.permissions || ["*"]
}

function getAllPermissionKeys() {
  return ADMIN_PERMISSION_GROUPS.flatMap((group) => group.permissions.map((permission) => permission.key))
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const canManageUsers = hasPermission(user, "users.manage")
  const canDisableUsers = hasPermission(user, "users.disable")
  const canDeleteUsers = hasPermission(user, "users.delete")
  const canBulkUsers = hasPermission(user, "users.bulk")

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusSaving, setStatusSaving] = useState(false)
  const [deleteSaving, setDeleteSaving] = useState(false)
  const [bulkSaving, setBulkSaving] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkAction, setBulkAction] = useState("enable")
  const [bulkTemplate, setBulkTemplate] = useState("super_admin")
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [confirmState, setConfirmState] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  useEffect(() => {
    let active = true

    async function loadUsers() {
      setLoading(true)
      try {
        const data = await usersApi.list({ role: roleFilter, status: statusFilter, search })
        if (!active) return
        setUsers(data.items)
        setSelectedUserId((current) => current || data.items[0]?.id || "")
        setSelectedIds((current) => current.filter((id) => data.items.some((item) => item.id === id)))
        setError("")
      } catch (requestError) {
        if (!active) return
        setError(requestError.message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadUsers()

    return () => {
      active = false
    }
  }, [roleFilter, search, statusFilter])

  const selectedUser = users.find((item) => item.id === selectedUserId) || null

  useEffect(() => {
    if (isCreating) {
      setForm({
        ...EMPTY_FORM,
        permissions: [],
      })
      return
    }

    if (!selectedUser) {
      setForm(EMPTY_FORM)
      return
    }

    setForm({
      name: selectedUser.name || "",
      email: selectedUser.email || "",
      password: "",
      role: selectedUser.role || "client",
      phone: selectedUser.phone || "",
      businessName: selectedUser.businessName || "",
      pan: selectedUser.pan || "",
      gstin: selectedUser.gstin || "",
      address: selectedUser.address || "",
      permissions: Array.isArray(selectedUser.permissions) ? selectedUser.permissions : [],
    })
  }, [isCreating, selectedUser])

  const stats = useMemo(() => ({
    total: users.length,
    clients: users.filter((item) => item.role === "client").length,
    admins: users.filter((item) => item.role === "admin").length,
    disabled: users.filter((item) => item.active === false).length,
    billed: users.reduce((sum, item) => sum + (item.stats?.totalBilled || 0), 0),
  }), [users])

  const setField = (key) => (event) => {
    const value = event.target.value
    setForm((current) => {
      if (key === "role" && value === "client") {
        return { ...current, role: value, permissions: [] }
      }

      if (key === "role" && value === "admin" && current.permissions.length === 0) {
        return { ...current, role: value, permissions: getDefaultPermissionsForAdmin() }
      }

      return { ...current, [key]: value }
    })
  }

  function toggleSelected(userId) {
    setSelectedIds((current) => (
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    ))
  }

  function toggleSelectAllVisible() {
    const visibleIds = users.map((item) => item.id)
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))

    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id))
      }

      return Array.from(new Set([...current, ...visibleIds]))
    })
  }

  function togglePermission(permissionKey) {
    setForm((current) => {
      const currentPermissions = Array.isArray(current.permissions) ? current.permissions : []
      const hasWildcard = currentPermissions.includes("*")
      const basePermissions = hasWildcard
        ? getAllPermissionKeys()
        : currentPermissions

      const nextPermissions = basePermissions.includes(permissionKey)
        ? basePermissions.filter((permission) => permission !== permissionKey)
        : [...basePermissions, permissionKey]

      return {
        ...current,
        permissions: nextPermissions.length > 0 ? nextPermissions : [],
      }
    })
  }

  function applyPermissionTemplate(templateKey) {
    const template = getPermissionTemplate(templateKey)
    if (!template) return

    setForm((current) => ({
      ...current,
      role: "admin",
      permissions: [...template.permissions],
    }))
  }

  function mergeUsers(nextUsers) {
    setUsers((current) => current.map((item) => {
      const nextUser = nextUsers.find((candidate) => candidate.id === item.id)
      if (!nextUser) {
        return item
      }

      return {
        ...item,
        ...nextUser,
        stats: item.stats || nextUser.stats,
      }
    }))
  }

  function openConfirmation(config) {
    setConfirmState(config)
  }

  function closeConfirmation() {
    if (!confirmLoading) {
      setConfirmState(null)
    }
  }

  async function handleConfirmAction() {
    if (!confirmState?.onConfirm) {
      return
    }

    setConfirmLoading(true)
    try {
      const result = await confirmState.onConfirm()
      if (result !== false) {
        setConfirmState(null)
      }
    } finally {
      setConfirmLoading(false)
    }
  }

  async function handleSave() {
    if (!canManageUsers) {
      return
    }

    if (form.role === "admin" && form.permissions.length === 0) {
      notifyWarning("Choose at least one admin permission before saving this account.")
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        phone: form.phone.trim(),
        businessName: form.businessName.trim(),
        pan: form.pan.trim(),
        gstin: form.gstin.trim(),
        address: form.address.trim(),
      }

      if (form.role === "admin") {
        payload.permissions = form.permissions.length > 0 ? form.permissions : getDefaultPermissionsForAdmin()
      }

      if (isCreating) {
        payload.password = form.password
      }

      const data = isCreating
        ? await usersApi.create(payload)
        : await usersApi.adminUpdate(selectedUser.id, payload)

      if (isCreating) {
        setUsers((current) => [{ ...data.user, stats: { orderCount: 0, totalBilled: 0, lastOrderAt: null } }, ...current])
      } else {
        mergeUsers([data.user])
      }

      setSelectedUserId(data.user.id)
      setIsCreating(false)
      setError("")
      notifySuccess(data.message || (isCreating ? "Account created successfully." : "Account updated successfully."))
    } catch (requestError) {
      notifyError(requestError, "Unable to save this account right now.")
    } finally {
      setSaving(false)
    }
  }

  async function performStatusToggle(targetUser, nextActive) {
    if (!targetUser || !canDisableUsers) {
      return
    }

    setStatusSaving(true)
    try {
      const data = await usersApi.setStatus(targetUser.id, {
        active: nextActive,
        disabledReason: nextActive ? "" : "Disabled from admin desk",
      })
      mergeUsers([data.user])
      setError("")
      notifySuccess(data.message || `Account ${nextActive ? "enabled" : "disabled"} successfully.`)
      return true
    } catch (requestError) {
      notifyError(requestError, "Unable to update account status right now.")
      return false
    } finally {
      setStatusSaving(false)
    }
  }

  async function performDelete(targetUser) {
    if (!targetUser || !canDeleteUsers) {
      return
    }

    setDeleteSaving(true)
    try {
      const data = await usersApi.remove(targetUser.id)
      setUsers((current) => current.filter((item) => item.id !== data.deletedUserId))
      setSelectedUserId((current) => (current === targetUser.id ? "" : current))
      setError("")
      notifySuccess(data.message || "Account deleted successfully.")
      return true
    } catch (requestError) {
      notifyError(requestError, "Unable to delete this account right now.")
      return false
    } finally {
      setDeleteSaving(false)
    }
  }

  async function performBulkAction(action, ids, permissionTemplate) {
    if (!canBulkUsers || !Array.isArray(ids) || ids.length === 0) {
      return
    }

    setBulkSaving(true)
    try {
      const payload = { ids, action }
      if (action === "promoteToAdmin") {
        payload.permissionTemplate = permissionTemplate
      }
      if (action === "disable") {
        payload.disabledReason = "Disabled from bulk user action"
      }

      const data = await usersApi.bulkAction(payload)
      mergeUsers(data.items || [])

      if (Array.isArray(data.deletedUserIds) && data.deletedUserIds.length > 0) {
        setUsers((current) => current.filter((item) => !data.deletedUserIds.includes(item.id)))
      }

      setSelectedIds([])
      setError("")
      if (data.skipped?.length > 0) {
        notifyWarning(`${data.message}. ${data.skipped.length} account(s) were skipped.`)
      } else {
        notifySuccess(data.message || "Bulk user action completed successfully.")
      }
      return true
    } catch (requestError) {
      notifyError(requestError, "Unable to complete the bulk user action right now.")
      return false
    } finally {
      setBulkSaving(false)
    }
  }

  function handleStatusToggleRequest() {
    if (!selectedUser || !canDisableUsers) {
      return
    }

    if (selectedUser.active === false) {
      void performStatusToggle(selectedUser, true)
      return
    }

    const targetUser = selectedUser
    openConfirmation({
      title: `Disable ${targetUser.name}?`,
      description: `${targetUser.email} will lose account access until an admin enables it again.`,
      confirmLabel: "Disable Account",
      onConfirm: () => performStatusToggle(targetUser, false),
    })
  }

  function handleDeleteRequest() {
    if (!selectedUser || !canDeleteUsers) {
      return
    }

    const targetUser = selectedUser
    openConfirmation({
      title: `Delete ${targetUser.name}?`,
      description: `This permanently removes ${targetUser.email}. This action only succeeds for accounts without orders.`,
      confirmLabel: "Delete Permanently",
      onConfirm: () => performDelete(targetUser),
    })
  }

  function handleBulkActionRequest() {
    if (!canBulkUsers || selectedIds.length === 0) {
      return
    }

    const targetIds = [...selectedIds]
    const selectedCount = targetIds.length

    if (bulkAction === "disable") {
      openConfirmation({
        title: `Disable ${selectedCount} account${selectedCount === 1 ? "" : "s"}?`,
        description: "Selected accounts will lose access until they are manually enabled again.",
        confirmLabel: "Disable Selected",
        onConfirm: () => performBulkAction("disable", targetIds, bulkTemplate),
      })
      return
    }

    if (bulkAction === "delete") {
      openConfirmation({
        title: `Delete ${selectedCount} account${selectedCount === 1 ? "" : "s"}?`,
        description: "This permanently removes selected accounts that do not have orders. Any ineligible accounts will be skipped.",
        confirmLabel: "Delete Selected",
        onConfirm: () => performBulkAction("delete", targetIds, bulkTemplate),
      })
      return
    }

    void performBulkAction(bulkAction, targetIds, bulkTemplate)
  }

  return (
    <AdminShell
      badge="People Operations"
      title="User Desk"
      description="Manage clients and staff accounts, disable or delete access safely, and control admin permissions at a granular level."
      actions={(
        canManageUsers ? (
          <Button className="gap-2" onClick={() => { setIsCreating(true); setSelectedUserId("") }}>
            <UserPlus size={14} /> New Account
          </Button>
        ) : null
      )}
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!canManageUsers && (
        <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-4 text-sm text-blue-200">
          Your account can inspect users, but edit actions are limited until `users.manage` is granted.
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <PeopleStat label="Visible Accounts" value={stats.total} icon={Users2} tone="bg-blue-500/10 text-blue-300" />
        <PeopleStat label="Clients" value={stats.clients} icon={Mail} tone="bg-green-500/10 text-green-300" />
        <PeopleStat label="Admins" value={stats.admins} icon={ShieldCheck} tone="bg-orange-500/10 text-orange-300" />
        <PeopleStat label="Disabled" value={stats.disabled} icon={Trash2} tone="bg-red-500/10 text-red-300" />
        <PeopleStat label="Platform Billing" value={formatCurrency(stats.billed)} icon={Mail} tone="bg-brand-500/10 text-brand-300" />
      </div>

      <div className="grid xl:grid-cols-[1.02fr,0.98fr] gap-6">
        <section className="glass rounded-[26px] p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-5">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, business, or phone..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-brand-500/50 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {ROLE_FILTERS.map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-sm font-medium capitalize transition-all",
                    roleFilter === role ? "bg-brand-500 text-white" : "glass text-white/45 hover:text-white"
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-5">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium uppercase tracking-[0.18em] transition-all",
                  statusFilter === status ? "bg-white text-background" : "border border-white/10 text-white/45 hover:text-white"
                )}
              >
                {status}
              </button>
            ))}
          </div>

          {canBulkUsers && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 mb-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <button
                    type="button"
                    onClick={toggleSelectAllVisible}
                    className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  >
                    <Users2 size={15} />
                    {selectedIds.length === users.length && users.length > 0 ? "Clear visible" : "Select visible"}
                  </button>
                  <span>{selectedIds.length} selected</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={bulkAction}
                    onChange={(event) => setBulkAction(event.target.value)}
                    className="rounded-xl bg-white/5 border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500/50 transition-all"
                  >
                    {BULK_ACTIONS.map((action) => (
                      <option key={action.value} value={action.value} className="bg-[#121212]">
                        {action.label}
                      </option>
                    ))}
                  </select>
                  {bulkAction === "promoteToAdmin" && (
                    <select
                      value={bulkTemplate}
                      onChange={(event) => setBulkTemplate(event.target.value)}
                      className="rounded-xl bg-white/5 border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500/50 transition-all"
                    >
                      {ADMIN_PERMISSION_TEMPLATES.map((template) => (
                        <option key={template.key} value={template.key} className="bg-[#121212]">
                          {template.label}
                        </option>
                      ))}
                    </select>
                  )}
                  <Button size="sm" variant="outline" loading={bulkSaving} disabled={selectedIds.length === 0} onClick={handleBulkActionRequest}>
                    Apply Bulk Action
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-white/40 py-10">Loading user desk...</div>
            ) : users.length === 0 ? (
              <div className="text-sm text-white/40 py-10">No users match the current filters.</div>
            ) : (
              users.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-2xl border px-4 py-4 transition-all",
                    !isCreating && selectedUser?.id === item.id
                      ? "border-brand-500/25 bg-brand-500/10"
                      : "border-white/8 bg-white/[0.03]"
                  )}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {canBulkUsers && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelected(item.id)}
                          className="mt-1 rounded border-white/15 bg-white/5"
                        />
                      )}

                      <button
                        onClick={() => { setIsCreating(false); setSelectedUserId(item.id) }}
                        className="text-left min-w-0 flex-1"
                      >
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <p className="font-medium text-white truncate">{item.name}</p>
                          <Badge variant={item.role === "admin" ? "brand" : "info"}>{item.role}</Badge>
                          <Badge variant={item.active === false ? "danger" : "success"}>{item.active === false ? "Disabled" : "Active"}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/35">
                          <span>{item.email}</span>
                          <span>{item.businessName || "No business name"}</span>
                          <span>{item.phone || "No phone"}</span>
                        </div>
                      </button>
                    </div>
                    <div className="text-left lg:text-right shrink-0">
                      <p className="text-sm font-semibold text-white">{item.stats?.orderCount || 0} orders</p>
                      <p className="text-xs text-brand-300">{formatCurrency(item.stats?.totalBilled || 0)}</p>
                      <p className="text-xs text-white/30 mt-1">
                        {item.stats?.lastOrderAt ? `Last order ${formatDate(item.stats.lastOrderAt)}` : `Joined ${formatDate(item.joinedAt)}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="glass rounded-[26px] p-6">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/30 mb-2">Account Form</p>
              <h2 className="text-2xl font-display font-bold text-white">
                {isCreating ? "Create Account" : selectedUser ? (canManageUsers ? "Edit Account" : "Inspect Account") : "Select a user"}
              </h2>
            </div>
            {!isCreating && selectedUser && (
              <div className="flex gap-2 flex-wrap">
                <Badge variant={selectedUser.role === "admin" ? "brand" : "info"}>{selectedUser.role}</Badge>
                <Badge variant={selectedUser.active === false ? "danger" : "success"}>{selectedUser.active === false ? "Disabled" : "Active"}</Badge>
              </div>
            )}
          </div>

          {(isCreating || selectedUser) ? (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input disabled={!canManageUsers} label="Full Name" value={form.name} onChange={setField("name")} />
                <Input disabled={!canManageUsers} label="Email" value={form.email} onChange={setField("email")} />
              </div>

              {isCreating && (
                <Input
                  disabled={!canManageUsers}
                  label="Temporary Password"
                  type="password"
                  value={form.password}
                  onChange={setField("password")}
                  placeholder="Minimum 8 characters"
                />
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <SelectField disabled={!canManageUsers} label="Role" value={form.role} onChange={setField("role")} options={["client", "admin"]} />
                <Input disabled={!canManageUsers} label="Phone" value={form.phone} onChange={setField("phone")} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input disabled={!canManageUsers} label="Business Name" value={form.businessName} onChange={setField("businessName")} />
                <Input disabled={!canManageUsers} label="PAN" value={form.pan} onChange={setField("pan")} />
              </div>

              <Input disabled={!canManageUsers} label="GSTIN" value={form.gstin} onChange={setField("gstin")} />

              <div>
                <label className="text-sm font-medium text-white/70 block mb-1.5">Address</label>
                <textarea
                  rows={5}
                  disabled={!canManageUsers}
                  value={form.address}
                  onChange={setField("address")}
                  className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-brand-500/50 transition-all resize-none disabled:opacity-60"
                />
              </div>

              {form.role === "admin" && (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-white mb-2">Permission templates</p>
                    <div className="flex flex-wrap gap-2">
                      {ADMIN_PERMISSION_TEMPLATES.map((template) => (
                        <button
                          key={template.key}
                          type="button"
                          disabled={!canManageUsers}
                          onClick={() => applyPermissionTemplate(template.key)}
                          className="px-3 py-2 rounded-xl border border-white/10 text-sm text-white/65 hover:text-white hover:border-brand-500/30 transition-all disabled:opacity-60"
                        >
                          {template.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {ADMIN_PERMISSION_GROUPS.map((group) => (
                      <div key={group.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                        <p className="text-sm font-semibold text-white mb-3">{group.label}</p>
                        <div className="grid gap-3">
                          {group.permissions.map((permission) => {
                            const selected = form.permissions.includes("*") || form.permissions.includes(permission.key)
                            return (
                              <label key={permission.key} className="flex items-start gap-3 text-sm text-white/65">
                                <input
                                  type="checkbox"
                                  disabled={!canManageUsers}
                                  checked={selected}
                                  onChange={() => togglePermission(permission.key)}
                                  className="mt-1 rounded border-white/15 bg-white/5"
                                />
                                <span>
                                  <span className="block text-white">{permission.label}</span>
                                  <span className="block text-xs text-white/35 mt-0.5">{permission.description}</span>
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isCreating && selectedUser?.active === false && selectedUser.disabledReason && (
                <div className="rounded-2xl border border-red-500/15 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  Disabled reason: {selectedUser.disabledReason}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {canManageUsers && (
                  <Button loading={saving} onClick={handleSave}>
                    {isCreating ? "Create Account" : "Save Changes"}
                  </Button>
                )}

                {(isCreating || canManageUsers) && (
                  <Button variant="outline" onClick={() => {
                    setIsCreating(true)
                    setSelectedUserId("")
                    setForm(EMPTY_FORM)
                  }}>
                    Reset Form
                  </Button>
                )}

                {!isCreating && selectedUser && canDisableUsers && (
                  <Button
                    variant={selectedUser.active === false ? "outline" : "danger"}
                    loading={statusSaving}
                    onClick={handleStatusToggleRequest}
                  >
                    {selectedUser.active === false ? "Enable Account" : "Disable Account"}
                  </Button>
                )}

                {!isCreating && selectedUser && canDeleteUsers && (
                  <Button variant="danger" loading={deleteSaving} onClick={handleDeleteRequest}>
                    Delete Account
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-white/40 py-10">Select an account from the desk or create a new one.</div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(confirmState)}
        title={confirmState?.title}
        description={confirmState?.description}
        confirmLabel={confirmState?.confirmLabel}
        onConfirm={handleConfirmAction}
        onClose={closeConfirmation}
        loading={confirmLoading}
      />
    </AdminShell>
  )
}

function PeopleStat({ label, value, icon: Icon, tone }) {
  return (
    <div className="glass rounded-[24px] p-5">
      <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center mb-4", tone)}>
        <Icon size={18} />
      </div>
      <p className="text-xs uppercase tracking-[0.22em] text-white/30 mb-2">{label}</p>
      <p className="text-3xl font-display font-bold text-white">{value}</p>
    </div>
  )
}

function SelectField({ label, value, onChange, options, disabled }) {
  return (
    <div>
      <label className="text-sm font-medium text-white/70 block mb-1.5">{label}</label>
      <select
        disabled={disabled}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500/50 transition-all disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#121212]">
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}
