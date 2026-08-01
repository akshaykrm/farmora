import { BarChart3, CheckCircle2, Cloud, PieChart, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import BrandLogo from "@components/brand-logo";
import LoginBackground from "./components/login-background";
import LoginFarmShowcase from "./components/login-farm-showcase";
import LoginFormCard from "./components/login-form-card";
import useLogin from "./hooks/use-login";

const FEATURES = [
  { icon: BarChart3, label: "Real-time Analytics" },
  { icon: PieChart, label: "Profit Tracking" },
  { icon: Shield, label: "Secure & Reliable" },
  { icon: Cloud, label: "Cloud Access" },
] as const;

const LoginPage = () => {
  const { onLogin, methods, isPending } = useLogin();
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <div className="relative min-h-screen w-full bg-brand-canvas font-sans text-brand-ink">
      <LoginBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-10 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:gap-12 lg:px-10 lg:py-10">
          {/* Marketing column */}
          <div className="flex min-w-0 flex-1 flex-col lg:pr-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-6 w-fit text-left lg:mb-8"
              aria-label="Farmora home"
            >
              <BrandLogo variant="onLight" priority className="h-11 md:h-12" />
              <p className="mt-2 text-sm text-brand-ink-soft">
                Farm Management Made Simple
              </p>
            </button>

            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-brand-border bg-brand-card-soft px-3 py-1.5">
              <CheckCircle2
                className="h-4 w-4 shrink-0 text-brand-accent"
                aria-hidden
              />
              <span className="text-xs font-medium text-brand-ink-soft">
                Trusted by 1000+ farm businesses worldwide
              </span>
            </div>

            <h2 className="mb-4 max-w-xl text-3xl leading-tight font-bold sm:text-4xl lg:text-[2.5rem]">
              Modern farm management for{" "}
              <span className="text-brand-accent">smarter livestock</span>
            </h2>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-brand-ink-soft md:text-lg">
              Sign in to manage farms, batches, P&amp;L, and investor reports
              from one dashboard.
            </p>

            <div className="mb-2 grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-3">
              {FEATURES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center sm:items-start sm:text-left"
                >
                  <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full border border-brand-border bg-brand-card text-brand-accent shadow-sm">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <span className="text-xs leading-snug font-medium text-brand-ink-soft">
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
          <div className="flex w-full shrink-0 justify-center lg:w-auto lg:justify-end">
            <LoginFormCard
              methods={methods}
              onLogin={onLogin}
              isPending={isPending}
            />
          </div>
        </div>

        <footer className="relative z-10 mt-auto min-h-[3.5rem] px-5 pt-4 pb-6 sm:px-8 lg:px-10">
          <p className="flex items-center justify-center gap-2 text-center text-xs text-brand-ink-soft">
            <Shield
              className="h-4 w-4 shrink-0 text-brand-accent"
              aria-hidden
            />
            <span>Your data is protected with enterprise-grade security</span>
          </p>
          <p className="mt-3 text-center text-xs text-brand-ink-muted sm:absolute sm:right-8 sm:bottom-6 sm:mt-0 sm:text-right lg:right-10">
            &copy; {year} Farmora. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
