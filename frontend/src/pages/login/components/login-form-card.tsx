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

type LoginFormCardProps = {
  methods: UseFormReturn<LoginPayload>
  onLogin: (payload: LoginPayload) => void
  isPending: boolean
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
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
  "w-full pl-11 pr-4 py-3 border border-brand-divider rounded-xl bg-white text-brand-charcoal placeholder:text-brand-muted text-sm outline-none transition-shadow focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"

const LoginFormCard = ({ methods, onLogin, isPending }: LoginFormCardProps) => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  return (
    <div className="w-full max-w-[420px] rounded-3xl border border-brand-divider/80 bg-white p-7 md:p-9 shadow-xl shadow-brand-charcoal/8">
      <div className="mb-7">
        <h1 className="text-2xl md:text-[1.75rem] font-bold text-brand-charcoal mb-1.5">
          Welcome back
        </h1>
        <p className="text-brand-steel text-sm">
          Sign in to your Farmora account
        </p>
      </div>

      <form onSubmit={methods.handleSubmit(onLogin)} className="space-y-5">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-brand-slate mb-2"
          >
            Username
          </label>
          <div className="relative">
            <User
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-brand-muted pointer-events-none"
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
            className="block text-sm font-medium text-brand-slate mb-2"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-brand-muted pointer-events-none"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-slate p-0.5"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-[18px] h-[18px]" />
              ) : (
                <Eye className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={rememberMe}
                onChange={(_, checked) => setRememberMe(checked)}
                sx={{ color: "primary.main", "&.Mui-checked": { color: "primary.main" } }}
              />
            }
            label={
              <span className="text-sm text-brand-steel">Remember me</span>
            }
          />
          <button
            type="button"
            className="text-sm font-medium text-brand-accent hover:text-brand-primary bg-transparent border-none cursor-pointer"
            onClick={() =>
              toast("Contact support@farmora.com to reset your password.")
            }
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

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-brand-divider" />
        <span className="text-xs font-medium text-brand-muted uppercase tracking-wide">
          Or
        </span>
        <div className="flex-1 h-px bg-brand-divider" />
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
        className="mt-6 w-full text-left rounded-xl border border-brand-pale/80 bg-brand-mint/70 hover:bg-brand-mint transition-colors p-4 flex items-start gap-3 group"
      >
        <div className="w-9 h-9 rounded-lg bg-white border border-brand-pale flex items-center justify-center shrink-0 text-brand-accent">
          <Leaf className="w-5 h-5" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-brand-charcoal">
            New to Farmora?
          </p>
          <p className="text-xs text-brand-steel mt-0.5 leading-relaxed">
            Create your account and start your journey today
          </p>
        </div>
        <ArrowRight
          className="w-5 h-5 text-brand-accent shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform"
          aria-hidden
        />
      </button>
    </div>
  )
}

export default LoginFormCard
