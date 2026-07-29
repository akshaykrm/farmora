import type { LucideIcon } from "lucide-react"

type FeatureCardProps = {
  title: string
  description: string
  icon: LucideIcon
  group?: string
}

const FeatureCard = ({ title, description, icon: Icon, group }: FeatureCardProps) => {
  return (
    <div className="group h-full p-6 rounded-2xl bg-white border border-brand-divider shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {group && (
        <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted mb-3">
          {group}
        </p>
      )}
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-mint text-brand-accent mb-4 group-hover:bg-brand-accent group-hover:text-white transition-colors">
        <Icon size={22} strokeWidth={2} />
      </div>
      <h3 className="text-lg font-semibold text-brand-charcoal mb-2">{title}</h3>
      <p className="text-sm text-brand-steel leading-relaxed">{description}</p>
    </div>
  )
}

export default FeatureCard
