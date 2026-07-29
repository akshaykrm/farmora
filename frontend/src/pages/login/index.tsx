import {
  BarChart3,
  CheckCircle2,
  Cloud,
  PieChart,
  Shield,
} from "lucide-react"
import useLogin from "@hooks/use-login"
import { useNavigate } from "react-router"
import BrandLogo from "@components/brand-logo"
import LoginBackground from "./components/login-background"
import LoginFarmShowcase from "./components/login-farm-showcase"
import LoginFormCard from "./components/login-form-card"

const FEATURES = [
  { icon: BarChart3, label: "Real-time Analytics" },
  { icon: PieChart, label: "Profit Tracking" },
  { icon: Shield, label: "Secure & Reliable" },
  { icon: Cloud, label: "Cloud Access" },
] as const

const LoginPage = () => {
  const { onLogin, methods, isPending } = useLogin()
  const navigate = useNavigate()
  const year = new Date().getFullYear()

  return (
    <div className="relative min-h-screen w-full font-sans text-brand-charcoal">
      <LoginBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="flex flex-1 flex-col lg:flex-row lg:items-center max-w-[1280px] mx-auto w-full px-5 sm:px-8 lg:px-10 py-8 lg:py-10 gap-10 lg:gap-12">
          {/* Marketing column */}
          <div className="flex-1 flex flex-col min-w-0 lg:pr-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-fit text-left mb-6 lg:mb-8"
              aria-label="Farmora home"
            >
              <BrandLogo variant="onLight" priority className="h-11 md:h-12" />
              <p className="mt-2 text-sm text-brand-steel">
                Farm Management Made Simple
              </p>
            </button>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-mint border border-brand-pale/70 px-3 py-1.5 mb-6">
              <CheckCircle2
                className="w-4 h-4 text-brand-accent shrink-0"
                aria-hidden
              />
              <span className="text-xs font-medium text-brand-slate">
                Trusted by 1000+ farm businesses worldwide
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-bold leading-tight mb-4 max-w-xl">
              Modern farm management for{" "}
              <span className="text-brand-accent">smarter livestock</span>
            </h2>
            <p className="text-brand-steel text-base md:text-lg leading-relaxed max-w-xl mb-8">
              Sign in to manage farms, batches, P&amp;L, and investor reports
              from one dashboard.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-3 max-w-xl mb-2">
              {FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <div className="w-11 h-11 rounded-full bg-white border border-brand-divider shadow-sm flex items-center justify-center text-brand-accent mb-2">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <span className="text-xs font-medium text-brand-slate leading-snug">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="hidden md:block">
              <LoginFarmShowcase />
            </div>
          </div>

          {/* Form column */}
          <div className="flex shrink-0 justify-center lg:justify-end w-full lg:w-auto">
            <LoginFormCard
              methods={methods}
              onLogin={onLogin}
              isPending={isPending}
            />
          </div>
        </div>

        <footer className="relative z-10 mt-auto px-5 sm:px-8 lg:px-10 pb-6 pt-4 min-h-[3.5rem]">
          <p className="text-center text-xs text-brand-steel flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-brand-accent shrink-0" aria-hidden />
            <span>Your data is protected with enterprise-grade security</span>
          </p>
          <p className="mt-3 sm:mt-0 sm:absolute sm:bottom-6 sm:right-8 lg:right-10 text-xs text-brand-muted text-center sm:text-right">
            &copy; {year} Farmora. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default LoginPage
