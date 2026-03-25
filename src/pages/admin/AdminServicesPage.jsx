import { useEffect, useMemo, useState } from "react"
import { CheckSquare, Plus, RotateCcw, Search, Sparkles, Tag, Wrench } from "lucide-react"
import AdminShell from "@/components/admin/AdminShell"
import { Badge, Button, ConfirmDialog, Input } from "@/components/ui"
import { useAuth } from "@/hooks/useAuth"
import { hasPermission } from "@/lib/adminPermissions"
import { servicesApi } from "@/lib/api"
import { notifyError, notifySuccess } from "@/lib/toast"
import { cn, formatCurrency } from "@/lib/utils"

const EMPTY_FORM = {
  code: "",
  category: "",
  name: "",
  description: "",
  basePrice: "",
  discountPercent: "0",
  duration: "3-5 working days",
  popular: false,
  active: true,
  icon: "file-text",
  documentsText: "",
}

const BULK_ACTIONS = [
  { value: "archive", label: "Archive selected" },
  { value: "restore", label: "Restore selected" },
  { value: "markPopular", label: "Mark popular" },
  { value: "unmarkPopular", label: "Remove popular flag" },
]

export default function AdminServicesPage() {
  const { user } = useAuth()
  const canManageServices = hasPermission(user, "services.manage")
  const canArchiveServices = hasPermission(user, "services.archive")
  const canRestoreServices = hasPermission(user, "services.restore")
  const canBulkServices = hasPermission(user, "services.bulk")

  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [bulkSaving, setBulkSaving] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [includeInactive, setIncludeInactive] = useState(true)
  const [selectedServiceId, setSelectedServiceId] = useState("")
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkAction, setBulkAction] = useState("archive")
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [confirmState, setConfirmState] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  useEffect(() => {
    let active = true

    async function loadServices() {
      setLoading(true)
      try {
        const data = await servicesApi.adminCatalog({ includeInactive: String(includeInactive) })
        if (!active) return
        setServices(data.items)
        setCategories(["All", ...data.categories])
        setSelectedServiceId((current) => current || data.items[0]?.id || "")
        setSelectedIds((current) => current.filter((id) => data.items.some((service) => service.id === id)))
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

    loadServices()

    return () => {
      active = false
    }
  }, [includeInactive])

  const filteredServices = useMemo(() => (
    services.filter((service) => {
      const matchCategory = categoryFilter === "All" || service.category === categoryFilter
      const query = search.toLowerCase()
      const matchSearch = !query || [
        service.code,
        service.name,
        service.description,
        service.category,
      ].some((value) => value.toLowerCase().includes(query))

      return matchCategory && matchSearch
    })
  ), [categoryFilter, search, services])

  const selectedService = services.find((service) => service.id === selectedServiceId) || null

  useEffect(() => {
    if (isCreating) {
      setForm(EMPTY_FORM)
      return
    }

    if (!selectedService) {
      setForm(EMPTY_FORM)
      return
    }

    setForm({
      code: selectedService.code,
      category: selectedService.category,
      name: selectedService.name,
      description: selectedService.description,
      basePrice: String(selectedService.basePrice),
      discountPercent: String(selectedService.discountPercent || 0),
      duration: selectedService.duration,
      popular: Boolean(selectedService.popular),
      active: Boolean(selectedService.active),
      icon: selectedService.icon || "file-text",
      documentsText: selectedService.documents.join("\n"),
    })
  }, [isCreating, selectedService])

  const stats = useMemo(() => ({
    active: services.filter((service) => service.active).length,
    inactive: services.filter((service) => !service.active).length,
    popular: services.filter((service) => service.popular).length,
    categories: new Set(services.map((service) => service.category)).size,
  }), [services])

  const visibleSelectedCount = filteredServices.filter((service) => selectedIds.includes(service.id)).length

  const setField = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value
    setForm((current) => ({ ...current, [key]: value }))
  }

  function createPayload() {
    return {
      code: form.code.trim(),
      category: form.category.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      basePrice: Number(form.basePrice || 0),
      discountPercent: Number(form.discountPercent || 0),
      duration: form.duration.trim(),
      popular: form.popular,
      active: form.active,
      icon: form.icon.trim(),
      documents: form.documentsText.split("\n").map((item) => item.trim()).filter(Boolean),
    }
  }

  function mergeServices(nextItems) {
    setServices((current) => {
      const incoming = new Map(nextItems.map((service) => [service.id, service]))
      const merged = current.map((service) => incoming.get(service.id) || service)
      const newItems = nextItems.filter((service) => !current.some((existing) => existing.id === service.id))
      return [...newItems, ...merged]
    })
  }

  function toggleSelected(serviceId) {
    setSelectedIds((current) => (
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId]
    ))
  }

  function toggleSelectAllVisible() {
    const visibleIds = filteredServices.map((service) => service.id)
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))

    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id))
      }

      return Array.from(new Set([...current, ...visibleIds]))
    })
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
    if (!canManageServices) {
      return
    }

    setSaving(true)
    try {
      const payload = createPayload()
      const data = isCreating
        ? await servicesApi.create(payload)
        : await servicesApi.update(selectedService.id, payload)

      mergeServices([data.service])
      setSelectedServiceId(data.service.id)
      setIsCreating(false)
      setError("")
      notifySuccess(data.message || (isCreating ? "Service created successfully." : "Service updated successfully."))
    } catch (requestError) {
      notifyError(requestError, "Unable to save this service right now.")
    } finally {
      setSaving(false)
    }
  }

  async function performLifecycleAction(serviceId, action) {
    try {
      const data = action === "archive"
        ? await servicesApi.archive(serviceId)
        : await servicesApi.restore(serviceId)

      mergeServices([data.service])
      setError("")
      notifySuccess(data.message || `Service ${action === "archive" ? "archived" : "restored"} successfully.`)
      return true
    } catch (requestError) {
      notifyError(requestError, `Unable to ${action} this service right now.`)
      return false
    }
  }

  async function performBulkAction(action, ids) {
    if (!canBulkServices || !Array.isArray(ids) || ids.length === 0) {
      return
    }

    setBulkSaving(true)
    try {
      const data = await servicesApi.bulkAction({ ids, action })
      mergeServices(data.items || [])
      setSelectedIds([])
      setError("")
      notifySuccess(data.message || "Bulk service action completed successfully.")
      return true
    } catch (requestError) {
      notifyError(requestError, "Unable to complete the bulk service action right now.")
      return false
    } finally {
      setBulkSaving(false)
    }
  }

  function handleLifecycleAction(service, action) {
    if (!service) {
      return
    }

    if (action !== "archive") {
      void performLifecycleAction(service.id, action)
      return
    }

    openConfirmation({
      title: `Archive ${service.name}?`,
      description: "This hides the service from the public catalog, but keeps history and lets admins restore it later.",
      confirmLabel: "Archive Service",
      onConfirm: () => performLifecycleAction(service.id, "archive"),
    })
  }

  function handleBulkActionRequest() {
    if (!canBulkServices || selectedIds.length === 0) {
      return
    }

    const targetIds = [...selectedIds]
    const selectedCount = targetIds.length

    if (bulkAction === "archive") {
      openConfirmation({
        title: `Archive ${selectedCount} service${selectedCount === 1 ? "" : "s"}?`,
        description: "Archived services will be hidden from the public catalog until they are restored.",
        confirmLabel: "Archive Selected",
        onConfirm: () => performBulkAction("archive", targetIds),
      })
      return
    }

    void performBulkAction(bulkAction, targetIds)
  }

  return (
    <AdminShell
      badge="Catalog Operations"
      title="Service Studio"
      description="Create, edit, restore, archive, and bulk-manage the FastSewa catalog from one workspace."
      actions={(
        canManageServices ? (
          <Button className="gap-2" onClick={() => { setIsCreating(true); setSelectedServiceId("") }}>
            <Plus size={14} /> New Service
          </Button>
        ) : null
      )}
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!canManageServices && (
        <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-4 text-sm text-blue-200">
          This workspace is currently read-only for your account. You can inspect services, but create and edit actions are hidden until `services.manage` is granted.
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StudioStat label="Active" value={stats.active} icon={Sparkles} tone="bg-green-500/10 text-green-300" />
        <StudioStat label="Archived" value={stats.inactive} icon={Wrench} tone="bg-slate-500/10 text-slate-300" />
        <StudioStat label="Popular" value={stats.popular} icon={Tag} tone="bg-orange-500/10 text-orange-300" />
        <StudioStat label="Categories" value={stats.categories} icon={Search} tone="bg-blue-500/10 text-blue-300" />
      </div>

      <div className="grid xl:grid-cols-[1.08fr,0.92fr] gap-6">
        <section className="glass rounded-[26px] p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-5">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search services by code, title, or category..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-brand-500/50 transition-all"
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-white/60">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(event) => setIncludeInactive(event.target.checked)}
                className="rounded border-white/15 bg-white/5"
              />
              Include archived
            </label>
          </div>

          {canBulkServices && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 mb-5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <button
                    type="button"
                    onClick={toggleSelectAllVisible}
                    className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  >
                    <CheckSquare size={15} />
                    {visibleSelectedCount === filteredServices.length && filteredServices.length > 0 ? "Clear visible" : "Select visible"}
                  </button>
                  <span>{selectedIds.length} selected</span>
                </div>
                <div className="flex gap-3 flex-1 lg:justify-end">
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
                  <Button size="sm" variant="outline" loading={bulkSaving} disabled={selectedIds.length === 0} onClick={handleBulkActionRequest}>
                    Apply Bulk Action
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap mb-5">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-sm font-medium transition-all",
                  categoryFilter === category ? "bg-brand-500 text-white" : "glass text-white/45 hover:text-white"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-white/40 py-10">Loading service studio...</div>
            ) : filteredServices.length === 0 ? (
              <div className="text-sm text-white/40 py-10">No services match the current filters.</div>
            ) : (
              filteredServices.map((service) => (
                <div
                  key={service.id}
                  className={cn(
                    "rounded-2xl border px-4 py-4 transition-all",
                    !isCreating && selectedService?.id === service.id
                      ? "border-brand-500/25 bg-brand-500/10"
                      : "border-white/8 bg-white/[0.03]"
                  )}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {canBulkServices && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(service.id)}
                          onChange={() => toggleSelected(service.id)}
                          className="mt-1 rounded border-white/15 bg-white/5"
                        />
                      )}

                      <button
                        onClick={() => { setIsCreating(false); setSelectedServiceId(service.id) }}
                        className="text-left min-w-0 flex-1"
                      >
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <p className="font-medium text-white truncate">{service.name}</p>
                          <Badge variant={service.active ? "success" : "default"}>{service.active ? "Active" : "Archived"}</Badge>
                          {service.popular && <Badge variant="brand">Popular</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/35">
                          <span className="font-mono">{service.code}</span>
                          <span>{service.category}</span>
                          <span>{service.documents.length} docs</span>
                          <span>{service.duration}</span>
                        </div>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-mono font-bold text-brand-300">{formatCurrency(service.price)}</span>
                      <Button variant="outline" size="sm" onClick={() => { setIsCreating(false); setSelectedServiceId(service.id) }}>
                        {canManageServices ? "Edit" : "View"}
                      </Button>
                      {service.active && canArchiveServices && (
                        <Button variant="danger" size="sm" onClick={() => handleLifecycleAction(service, "archive")}>
                          Archive
                        </Button>
                      )}
                      {!service.active && canRestoreServices && (
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleLifecycleAction(service, "restore")}>
                          <RotateCcw size={13} /> Restore
                        </Button>
                      )}
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
              <p className="text-xs uppercase tracking-[0.24em] text-white/30 mb-2">Service Form</p>
              <h2 className="text-2xl font-display font-bold text-white">
                {isCreating ? "Create Service" : selectedService ? (canManageServices ? "Edit Service" : "Inspect Service") : "Select a service"}
              </h2>
            </div>
            {!isCreating && selectedService && <Badge variant={selectedService.active ? "success" : "default"}>{selectedService.active ? "Live" : "Archived"}</Badge>}
          </div>

          {(!isCreating && !selectedService) ? (
            <div className="text-sm text-white/40 py-10">Pick a service from the list to inspect it.</div>
          ) : (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input disabled={!canManageServices} label="Service Code" value={form.code} onChange={setField("code")} placeholder="svc-028" />
                <Input disabled={!canManageServices} label="Category" value={form.category} onChange={setField("category")} placeholder="Business Registration & Advisory" />
              </div>

              <Input disabled={!canManageServices} label="Service Name" value={form.name} onChange={setField("name")} placeholder="New service title" />

              <div>
                <label className="text-sm font-medium text-white/70 block mb-1.5">Description</label>
                <textarea
                  rows={4}
                  disabled={!canManageServices}
                  value={form.description}
                  onChange={setField("description")}
                  className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-brand-500/50 transition-all resize-none disabled:opacity-60"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input disabled={!canManageServices} label="Base Price" type="number" value={form.basePrice} onChange={setField("basePrice")} />
                <Input disabled={!canManageServices} label="Discount %" type="number" value={form.discountPercent} onChange={setField("discountPercent")} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input disabled={!canManageServices} label="Turnaround" value={form.duration} onChange={setField("duration")} />
                <Input disabled={!canManageServices} label="Icon" value={form.icon} onChange={setField("icon")} placeholder="file-text" />
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 block mb-1.5">Required Documents</label>
                <textarea
                  rows={6}
                  disabled={!canManageServices}
                  value={form.documentsText}
                  onChange={setField("documentsText")}
                  placeholder="One document per line"
                  className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-brand-500/50 transition-all resize-none disabled:opacity-60"
                />
              </div>

              <div className="flex flex-wrap gap-5 pt-2">
                <label className="inline-flex items-center gap-2 text-sm text-white/60">
                  <input disabled={!canManageServices} type="checkbox" checked={form.popular} onChange={setField("popular")} />
                  Mark as popular
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-white/60">
                  <input disabled={!canManageServices} type="checkbox" checked={form.active} onChange={setField("active")} />
                  Show in public catalog
                </label>
              </div>

              {canManageServices ? (
                <div className="flex flex-wrap gap-3">
                  <Button loading={saving} onClick={handleSave}>
                    {isCreating ? "Create Service" : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsCreating(true)
                    setSelectedServiceId("")
                    setForm(EMPTY_FORM)
                  }}>
                    Reset Form
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-white/40">You can inspect this service, but editing requires `services.manage`.</p>
              )}
            </div>
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

function StudioStat({ label, value, icon: Icon, tone }) {
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
