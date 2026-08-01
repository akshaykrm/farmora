import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Skeleton,
} from "@mui/material"
import { Check, Sparkles } from "lucide-react"
import fetcher from "@utils/fetcher"
import ManagerRegistrationDialog from "../components/manager-registration-dialog"
import RevealDiv from "../components/reveal"
import SectionHeader from "../components/section-header"
import { PACKAGE_FEATURE_BULLETS } from "../content/landing-content"

interface Package {
  id: number
  name: string
  description: string
  price: string
  duration: number
  status: string
}

const features = [...PACKAGE_FEATURE_BULLETS]

const PackageSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 border border-brand-divider shadow-sm">
    <Skeleton variant="text" width="60%" height={32} />
    <Skeleton variant="text" width="40%" height={48} sx={{ mt: 1 }} />
    <Skeleton variant="text" width="80%" height={20} sx={{ mt: 2 }} />
    <div className="space-y-2 mt-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} variant="text" width="70%" height={18} />
      ))}
    </div>
    <Skeleton variant="rounded" height={44} sx={{ mt: 4 }} />
  </div>
)

const PackagesSection = () => {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: packages, isLoading } = useQuery({
    queryKey: ["public-packages"],
    queryFn: async () => {
      const response = await fetcher("packages")
      return response.data as Package[]
    },
  })

  const activePackages = packages?.filter((pkg) => pkg.status === "active")

  const handleGetStarted = (pkg: Package) => {
    setSelectedPackage(pkg)
    setIsDialogOpen(true)
  }

  return (
    <>
      <ManagerRegistrationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        packageId={selectedPackage?.id || 0}
        packageName={selectedPackage?.name || ""}
      />
      <section className="landing-section px-6 bg-brand-mint font-sans">
        <div className="max-w-7xl mx-auto">
          <RevealDiv>
            <SectionHeader
              eyebrow="Pricing"
              title="Simple, transparent pricing"
              subtitle="Every package includes batch P&L, seasons, reports, and investor tools—scale as your livestock operation grows."
            />
          </RevealDiv>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <PackageSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activePackages?.map((pkg, index) => (
                <RevealDiv key={pkg.id} delay={index * 0.1} className="reveal h-full">
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      borderRadius: 4,
                      transition: "box-shadow 0.3s, transform 0.3s",
                      "&:hover": { boxShadow: 8, transform: "translateY(-8px)" },
                      ...(index === 1 && {
                        border: "2px solid",
                        borderColor: "primary.main",
                      }),
                    }}
                  >
                    {index === 1 && (
                      <Chip
                        icon={<Sparkles size={14} />}
                        label="Most Popular"
                        color="success"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 16,
                          right: 16,
                          fontWeight: "bold",
                          borderRadius: 2,
                        }}
                      />
                    )}

                    <CardContent sx={{ flexGrow: 1, p: 4 }}>
                      <h3 className="text-2xl font-bold text-brand-charcoal mb-2">
                        {pkg.name}
                      </h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-brand-accent">
                          ₹{parseFloat(pkg.price).toLocaleString()}
                        </span>
                        <span className="text-brand-steel ml-2 text-sm">
                          / {pkg.duration} days
                        </span>
                      </div>
                      <p className="text-brand-steel mb-6 text-sm leading-relaxed">
                        {pkg.description}
                      </p>
                      <div className="space-y-3">
                        {features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-brand-mint rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-brand-accent" />
                            </div>
                            <span className="text-brand-slate text-sm">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    <CardActions sx={{ p: 4, pt: 0 }}>
                      <Button
                        variant={index === 1 ? "contained" : "outlined"}
                        fullWidth
                        size="large"
                        onClick={() => handleGetStarted(pkg)}
                      >
                        Get Started
                      </Button>
                    </CardActions>
                  </Card>
                </RevealDiv>
              ))}
            </div>
          )}

          {!isLoading &&
            (!activePackages || activePackages.length === 0) && (
              <div className="text-center py-12">
                <p className="text-brand-steel text-lg">
                  No packages available at the moment. Please check back later.
                </p>
              </div>
            )}
        </div>
      </section>
    </>
  )
}

export default PackagesSection
