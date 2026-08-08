import type { LucideIcon } from "lucide-react"
import {
  Building2,
  Layers,
  CalendarRange,
  Receipt,
  Calculator,
  Scale,
  LineChart,
  BarChart3,
  FileSpreadsheet,
  HandCoins,
  Package,
  Users,
  Zap,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Cloud,
  Headphones,
  TrendingUp,
  Heart,
} from "lucide-react"

export type FeatureGroup =
  | "Operations"
  | "Finance"
  | "Performance"
  | "Investors & reports"

export type LandingFeature = {
  title: string
  description: string
  group: FeatureGroup
  icon: LucideIcon
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    group: "Operations",
    title: "Multi-farm dashboard",
    description:
      "Manage every livestock farm from one place—switch farms instantly and see what needs attention.",
    icon: Building2,
  },
  {
    group: "Operations",
    title: "Batch management",
    description:
      "Create and track batches within each farm—from placement to close-out with full history.",
    icon: Layers,
  },
  {
    group: "Operations",
    title: "Seasons",
    description:
      "Group batches into seasons for cleaner reporting and year-over-year comparisons.",
    icon: CalendarRange,
  },
  {
    group: "Finance",
    title: "Income & expenses",
    description:
      "Record every purchase, sale, and cost against the right batch so nothing is lost in spreadsheets.",
    icon: Receipt,
  },
  {
    group: "Finance",
    title: "Automatic profit & loss",
    description:
      "Farmora calculates batch P&L as you record transactions—always know where you stand.",
    icon: Calculator,
  },
  {
    group: "Finance",
    title: "Cost per kilogram",
    description:
      "See production cost per kg automatically—price your product and protect your margins.",
    icon: Scale,
  },
  {
    group: "Performance",
    title: "Batch performance",
    description:
      "Compare batches and spot underperformers early to improve productivity and feed efficiency.",
    icon: LineChart,
  },
  {
    group: "Performance",
    title: "Dashboards & charts",
    description:
      "Monitor sales, stock, and cash with intuitive dashboards, charts, and live statistics.",
    icon: BarChart3,
  },
  {
    group: "Investors & reports",
    title: "Reports & analytics",
    description:
      "Generate detailed financial and operational reports for your team, auditors, or partners.",
    icon: FileSpreadsheet,
  },
  {
    group: "Investors & reports",
    title: "Investor profit sharing",
    description:
      "Track investments and allocate profit to each investor based on their ownership percentage.",
    icon: HandCoins,
  },
  {
    group: "Operations",
    title: "Inventory tracking",
    description:
      "Monitor feed, medicine, and stock levels across farms so you never run short mid-batch.",
    icon: Package,
  },
  {
    group: "Operations",
    title: "Staff & vendors",
    description:
      "Manage employees, labour costs, and vendor purchases tied to the right farm and batch.",
    icon: Users,
  },
]

export const STATS_BAR = [
  { icon: Building2, value: "500+", label: "Livestock farms" },
  { icon: Layers, value: "12K+", label: "Batches tracked" },
  { icon: TrendingUp, value: "₹150 Cr+", label: "Revenue tracked" },
  { icon: Heart, value: "98%", label: "Customer satisfaction" },
  { icon: LineChart, value: "40%", label: "Avg. productivity gain" },
] as const

export const WHY_CHOOSE_FARMORA = [
  {
    title: "Smart automation",
    description: "P&L and cost per kg update as you record transactions.",
    icon: Zap,
  },
  {
    title: "Actionable insights",
    description: "Dashboards and charts built for daily farm decisions.",
    icon: Sparkles,
  },
  {
    title: "Mobile friendly",
    description: "Access your farms from the office or the field.",
    icon: Smartphone,
  },
  {
    title: "Secure & reliable",
    description: "Role-based access and cloud backups you can trust.",
    icon: ShieldCheck,
  },
  {
    title: "Cloud based",
    description: "No servers to maintain—scale farms without IT overhead.",
    icon: Cloud,
  },
  {
    title: "Dedicated support",
    description: "Onboarding help when you need to move off spreadsheets.",
    icon: Headphones,
  },
] as const

export const PREVIEW_GALLERY = [
  { title: "Farm overview", PreviewKey: "overview" as const },
  { title: "Financial reports", PreviewKey: "batch" as const },
  { title: "Production analysis", PreviewKey: "season" as const },
  { title: "Batch performance", PreviewKey: "manager" as const },
  { title: "Cost analysis", PreviewKey: "batch" as const },
] as const

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Set up your farms",
    description:
      "Add each livestock farm and configure how you run operations day to day.",
  },
  {
    step: 2,
    title: "Create batches & seasons",
    description:
      "Organize production into batches and roll them up into seasons for tracking.",
  },
  {
    step: 3,
    title: "Record income & expenses",
    description:
      "Log feed, labour, sales, and every cost against the correct batch.",
  },
  {
    step: 4,
    title: "Analyze & share results",
    description:
      "Review P&L, cost per kg, reports, and investor splits from one dashboard.",
  },
] as const

export const TESTIMONIALS = [
  {
    text: "We run three poultry farms—batch P&L and cost per kg finally match what we see in the shed. Farmora paid for itself in one season.",
    author: "Rajesh Patel",
    role: "Poultry farm owner",
  },
  {
    text: "Season grouping and investor splits used to take days in Excel. Now our partners get accurate numbers the same day we close a batch.",
    author: "Priya Sharma",
    role: "Operations manager",
  },
  {
    text: "Multi-farm switching and expense tracking cut our admin time in half. Managers actually use the dashboard every morning.",
    author: "Arun Mehta",
    role: "Dairy farm director",
  },
  {
    text: "Investor allocations are transparent now—no more disputes at season close. Reports look professional for our board.",
    author: "Kavitha Nair",
    role: "Goat farm partner",
  },
] as const

export const BASIC_FEATURES = [
  "Multi-farm dashboard & user access",
  "Batches, seasons & inventory tracking",
  "Batch income, expenses & auto P&L",
] as const

export const PREMIUM_FEATURES = [
  ...BASIC_FEATURES,
  "Production cost per kg",
  "Reports, charts & batch analytics",
  "Employee & vendor management",
] as const

export const ENTERPRISE_FEATURES = [
  ...PREMIUM_FEATURES,
  "Investor tracking & profit allocation",
  "Priority support & onboarding",
] as const
