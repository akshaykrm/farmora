import { useState } from "react"
import { Mail, Phone, MapPin, ArrowUp, Send } from "lucide-react"
import toast from "react-hot-toast"
import BrandLogo from "@components/brand-logo"

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState("")

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      toast.success("Subscribed to newsletter!")
      setEmail("")
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="bg-[#1B5E20] text-brand-ink-muted relative font-sans">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="mb-4">
              <BrandLogo variant="onDark" className="h-10" />
            </div>
            <p className="text-brand-ink-muted mb-6 text-sm leading-relaxed">
              Livestock farm management and accounting—batches, seasons, P&amp;L,
              cost per kg, and investor profit sharing in one platform.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 px-3 py-2 bg-brand-ink-soft border border-brand-border-strong rounded-lg text-sm text-white placeholder-brand-ink-muted focus:outline-none focus:border-brand-accent transition-colors"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-brand-accent rounded-lg hover:bg-brand-primary transition-colors"
              >
                <Send size={16} className="text-white" />
              </button>
            </form>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2.5">
              {[
                "Multi-farm dashboard",
                "Batches & seasons",
                "Batch P&L & cost/kg",
                "Reports & analytics",
                "Investor management",
              ].map((service, i) => (
                <li
                  key={i}
                  className="text-white/90 text-sm hover:text-white transition-colors cursor-default"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: "About", action: () => scrollToTop() },
                { label: "Contact", href: "#contact" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
              ].map((item, i) => (
                <li key={i}>
                  {"action" in item ? (
                    <button
                      onClick={item.action}
                      className="text-white/90 hover:text-white transition-colors text-sm"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <a
                      href={item.href}
                      className="text-white/90 hover:text-white transition-colors text-sm"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-4">
              {[
                {
                  icon: Mail,
                  text: "support@farmora.com",
                },
                {
                  icon: Phone,
                  text: "+91 (123) 456-7890",
                },
                {
                  icon: MapPin,
                  text: "123 Farm Street, City, State - 123456",
                },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <li key={i} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
                    <span className="text-brand-ink-muted text-sm">{item.text}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/15 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-brand-ink-soft text-sm">
              &copy; {currentYear} Farmora. All rights reserved.
            </p>
            <div className="flex gap-4">
              {["Facebook", "Twitter", "LinkedIn", "Instagram"].map(
                (social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-9 h-9 bg-brand-ink-soft rounded-lg flex items-center justify-center text-brand-ink-muted hover:bg-brand-accent hover:text-white transition-all text-xs font-medium"
                  >
                    {social[0]}
                  </a>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-40 w-11 h-11 bg-brand-accent rounded-full flex items-center justify-center text-white shadow-lg hover:bg-brand-primary transition-colors"
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>
    </footer>
  )
}

export default Footer
