import { useState } from "react"
import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  User,
} from "lucide-react"
import { Button, Checkbox, FormControlLabel } from "@mui/material"
import type { UseFormReturn } from "react-hook-form"
import type { LoginPayload } from "@app-types/auth.types"
import { useNavigate } from "react-router"
import toast from "react-hot-toast"
import { gradients as brandGradients } from "../../../theme/tokens"
import ForgotPasswordDialog from "./forgot-password-dialog"

type LoginFormCardProps = {
  methods: UseFormReturn<LoginPayload>
  onLogin: (payload: LoginPayload) => void
  isPending: boolean
}

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

const fieldClass =
  "w-full rounded-xl border border-brand-border bg-brand-card py-3 pr-4 pl-11 text-sm text-brand-ink outline-none transition-shadow placeholder:text-brand-ink-muted focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"

const LoginFormCard = ({ methods, onLogin, isPending }: LoginFormCardProps) => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  const handleReset = (username: string) => {
    methods.setValue("username", username)
  }

  return (
    <div className="w-full max-w-[420px] rounded-3xl border border-brand-border bg-brand-card p-7 shadow-brand-xl md:p-9">
      <div className="mb-7">
        <h1 className="mb-1.5 text-2xl font-bold text-brand-ink md:text-[1.75rem]">
          Welcome back
        </h1>
        <p className="text-sm text-brand-ink-soft">
          Sign in to your Farmora account
        </p>
      </div>

      <form onSubmit={methods.handleSubmit(onLogin)} className="space-y-5">
        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-sm font-medium text-brand-ink-soft"
          >
            Username
          </label>
          <div className="relative">
            <User
              className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-brand-ink-muted"
              aria-hidden
            />
            <input
              id="username"
              className={fieldClass}
              placeholder="Enter your username"
              autoComplete="username"
              {...methods.register("username")}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-brand-ink-soft"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-brand-ink-muted"
              aria-hidden
            />
            <input
              id="password"
              className={`${fieldClass} pr-11`}
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...methods.register("password")}
            />
            <button
              type="button"
              className="absolute top-1/2 right-3 -translate-y-1/2 p-0.5 text-brand-ink-muted hover:text-brand-ink-soft"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-[18px] w-[18px]" />
              ) : (
                <Eye className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={rememberMe}
                onChange={(_, checked) => setRememberMe(checked)}
                sx={{
                  color: "primary.main",
                  "&.Mui-checked": { color: "primary.main" },
                }}
              />
            }
            label={
              <span className="text-sm text-brand-ink-soft">Remember me</span>
            }
          />
          <button
            type="button"
            className="cursor-pointer border-none bg-transparent text-sm font-medium text-brand-accent hover:text-brand-primary"
            onClick={() => setForgotOpen(true)}
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isPending}
          endIcon={!isPending ? <ArrowRight size={18} /> : undefined}
          sx={{
            py: 1.5,
            borderRadius: "12px",
            fontSize: "1rem",
            background: brandGradients.cta,
            "&:hover": {
              background: "linear-gradient(90deg, #2E7D32 0%, #1B5E20 100%)",
            },
          }}
        >
          {isPending ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-brand-border" />
        <span className="text-xs font-medium tracking-wide text-brand-ink-muted uppercase">
          Or
        </span>
        <div className="h-px flex-1 bg-brand-border" />
      </div>

      <Button
        type="button"
        variant="outlined"
        fullWidth
        size="large"
        startIcon={<GoogleIcon />}
        onClick={() => toast("Google sign-in is not available yet.")}
        sx={{
          py: 1.35,
          borderRadius: "12px",
          borderColor: "divider",
          color: "text.primary",
          textTransform: "none",
          "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
        }}
      >
        Continue with Google
      </Button>

      <button
        type="button"
        onClick={() => navigate("/#packages")}
        className="group mt-6 flex w-full items-start gap-3 rounded-xl border border-brand-border bg-brand-card-soft p-4 text-left transition-colors hover:bg-brand-primary-soft"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-border bg-brand-card text-brand-accent">
          <Leaf className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brand-ink">New to Farmora?</p>
          <p className="mt-0.5 text-xs leading-relaxed text-brand-ink-soft">
            Create your account and start your journey today
          </p>
        </div>
        <ArrowRight
          className="mt-1 h-5 w-5 shrink-0 text-brand-accent transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </button>

      <ForgotPasswordDialog
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        defaultUsername={methods.getValues("username")}
        onReset={handleReset}
      />
    </div>
  )
}

export default LoginFormCard
