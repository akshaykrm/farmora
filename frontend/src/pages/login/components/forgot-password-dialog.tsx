import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent } from "@components/dialog"
import { Button, CircularProgress } from "@mui/material"
import toast from "react-hot-toast"
import fetcherV2 from "@utils/fetcherV2"
import type { ValidationError } from "@errors/api.error"

type FormValues = {
  username: string
  new_password: string
  confirm_password: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  defaultUsername?: string
  onReset: (username: string) => void
}

const fieldClass =
  "w-full rounded-xl border border-brand-border bg-brand-card px-4 py-3 text-sm text-brand-ink outline-none transition-shadow placeholder:text-brand-ink-muted focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"

const ForgotPasswordDialog = ({
  isOpen,
  onClose,
  defaultUsername,
  onReset,
}: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      username: "",
      new_password: "",
      confirm_password: "",
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        username: defaultUsername || "",
        new_password: "",
        confirm_password: "",
      })
      setErrorMessage(null)
    }
  }, [isOpen, defaultUsername, reset])

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      setErrorMessage(null)
      onClose()
    }
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    const res = await fetcherV2<unknown>(
      "auth/reset-password",
      JSON.stringify({
        username: data.username,
        new_password: data.new_password,
      }),
      { method: "POST" },
    )

    setIsSubmitting(false)

    if (res.status === "success") {
      toast.success("Password reset successfully. Please sign in.")
      onReset(data.username)
      handleClose()
    } else if (res.status === "validation_error") {
      res.error.forEach(({ name, message }: ValidationError) => {
        setError(name as keyof FormValues, { message })
      })
    } else if (res.status === "failed") {
      setErrorMessage(
        typeof res.data === "string"
          ? res.data
          : "Password reset failed. Please try again.",
      )
    } else {
      setErrorMessage("Network error. Please try again.")
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      headerTitle="Reset Password"
      onClose={handleClose}
    >
      <DialogContent>
        <p className="mb-4 text-sm text-brand-ink-soft">
          Enter your username and a new password to reset your account.
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-brand-danger-soft border border-brand-danger-soft">
            <p className="text-sm text-brand-danger-strong">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="fp-username"
              className="mb-2 block text-sm font-medium text-brand-ink-soft"
            >
              Username
            </label>
            <input
              id="fp-username"
              className={fieldClass}
              placeholder="Enter your username"
              autoComplete="username"
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
              })}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-brand-danger">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="fp-new-password"
              className="mb-2 block text-sm font-medium text-brand-ink-soft"
            >
              New Password
            </label>
            <input
              id="fp-new-password"
              type="password"
              className={fieldClass}
              placeholder="Enter a new password"
              autoComplete="new-password"
              {...register("new_password", {
                required: "New password is required",
                minLength: {
                  value: 3,
                  message: "Password must be at least 3 characters",
                },
              })}
            />
            {errors.new_password && (
              <p className="mt-1 text-xs text-brand-danger">
                {errors.new_password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="fp-confirm-password"
              className="mb-2 block text-sm font-medium text-brand-ink-soft"
            >
              Confirm New Password
            </label>
            <input
              id="fp-confirm-password"
              type="password"
              className={fieldClass}
              placeholder="Re-enter the new password"
              autoComplete="new-password"
              {...register("confirm_password", {
                required: "Please confirm your new password",
                validate: (value) =>
                  value === watch("new_password") || "Passwords do not match",
              })}
            />
            {errors.confirm_password && (
              <p className="mt-1 text-xs text-brand-danger">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outlined"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ForgotPasswordDialog
