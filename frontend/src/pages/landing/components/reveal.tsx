import { useReveal } from "../hooks/use-reveal"

type RevealDivProps = {
  className?: string
  delay?: number
  children: React.ReactNode
}

const RevealDiv = ({
  className = "reveal",
  delay,
  children,
}: RevealDivProps) => {
  const { ref, revealed } = useReveal()
  return (
    <div
      ref={ref}
      className={`${className} ${revealed ? "revealed" : ""}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}

export default RevealDiv
