import SectionHeader from "../components/section-header"
import RevealDiv from "../components/reveal"
import {
  BatchPLPreview,
  ManagerDashboardPreview,
  OverviewPreview,
  SeasonOverviewPreview,
} from "../components/hero-dashboard-previews"
import { PREVIEW_GALLERY } from "../content/landing-content"

const previewMap = {
  overview: OverviewPreview,
  batch: BatchPLPreview,
  season: SeasonOverviewPreview,
  manager: ManagerDashboardPreview,
} as const

const ProductPreviewSection = () => {
  return (
    <section
      id="preview"
      className="landing-section px-6 bg-brand-card font-sans overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <RevealDiv>
          <SectionHeader
            eyebrow="Dashboard preview"
            title="Powerful insights to help you make smarter decisions"
            subtitle="Explore farm overview, financial reports, batch performance, and cost analysis—without leaving Farmora."
          />
        </RevealDiv>
        <RevealDiv>
          <div className="flex gap-5 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin -mx-2 px-2">
            {PREVIEW_GALLERY.map((item) => {
              const Preview = previewMap[item.PreviewKey]
              return (
                <div
                  key={item.title}
                  className="snap-center shrink-0 w-[min(85vw,320px)] md:w-[340px]"
                >
                  <p className="text-sm font-semibold text-brand-ink mb-3 text-center md:text-left">
                    {item.title}
                  </p>
                  <div className="rounded-2xl border border-brand-border bg-brand-canvas/50 p-2 shadow-lg shadow-brand-5">
                    <Preview />
                  </div>
                </div>
              )
            })}
          </div>
        </RevealDiv>
      </div>
    </section>
  )
}

export default ProductPreviewSection
