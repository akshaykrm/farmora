import { Button } from "@mui/material"
import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router"
import { brandGradients } from "../../../theme/brand"

type FinalCTAProps = {
  onScrollToPackages: () => void
}

const FinalCTA = ({ onScrollToPackages }: FinalCTAProps) => {
  const navigate = useNavigate()

  return (
    <section className="px-6 py-16 md:py-20 font-sans">
      <div
        className="max-w-5xl mx-auto rounded-3xl px-8 py-12 md:py-16 text-center text-white shadow-xl"
        style={{ background: brandGradients.heroHorizontal }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Start managing your livestock farm smarter
        </h2>
        <p className="text-white/90 max-w-2xl mx-auto mb-8 text-lg">
          Join farm owners who use Farmora to control batches, costs, and investor
          returns from one platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="contained"
            size="large"
            onClick={onScrollToPackages}
            endIcon={<ArrowRight size={18} />}
            sx={{
              bgcolor: "white",
              color: "#2E7D32",
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            View Packages
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/login")}
            sx={{
              borderColor: "white",
              color: "white",
              "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            Sign in
          </Button>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA
