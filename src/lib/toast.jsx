import { ToastContainer, toast } from "react-toastify"

const DEFAULT_TOAST_OPTIONS = {
  position: "top-right",
  autoClose: 3200,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

export function getToastMessage(input, fallback = "Something went wrong. Please try again.") {
  if (!input) {
    return fallback
  }

  if (typeof input === "string") {
    return input
  }

  if (typeof input.message === "string" && input.message.trim()) {
    return input.message
  }

  return fallback
}

export function notifySuccess(message, options = {}) {
  return toast.success(message, { ...DEFAULT_TOAST_OPTIONS, ...options })
}

export function notifyError(error, fallback, options = {}) {
  return toast.error(getToastMessage(error, fallback), { ...DEFAULT_TOAST_OPTIONS, ...options })
}

export function notifyInfo(message, options = {}) {
  return toast.info(message, { ...DEFAULT_TOAST_OPTIONS, ...options })
}

export function notifyWarning(message, options = {}) {
  return toast.warn(message, { ...DEFAULT_TOAST_OPTIONS, ...options })
}

export function AppToastContainer() {
  return (
    <ToastContainer
      theme="dark"
      newestOnTop
      limit={4}
      closeButton={false}
      toastClassName="fastsewa-toast"
      bodyClassName="fastsewa-toast-body"
      progressClassName="fastsewa-toast-progress"
    />
  )
}
