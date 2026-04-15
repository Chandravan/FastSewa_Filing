export const DEFAULT_ORDER_ASSIGNMENT = "FastSewa CA Team"

export const ORDER_ASSIGNMENT_OPTIONS = [
  DEFAULT_ORDER_ASSIGNMENT,
  "GST Team",
  "ITR Team",
  "ROC Team",
  "Incorporation Desk",
  "TDS Team",
  "Support Desk",
]

export function getOrderAssignmentOptions(currentValue = "", { includeBlank = false, blankLabel = "Not assigned yet" } = {}) {
  const options = includeBlank
    ? [{ value: "", label: blankLabel }]
    : []

  ORDER_ASSIGNMENT_OPTIONS.forEach((option) => {
    options.push({ value: option, label: option })
  })

  const normalizedCurrentValue = String(currentValue || "").trim()
  if (normalizedCurrentValue && !ORDER_ASSIGNMENT_OPTIONS.includes(normalizedCurrentValue)) {
    options.push({
      value: normalizedCurrentValue,
      label: `${normalizedCurrentValue} (current)`,
    })
  }

  return options
}
