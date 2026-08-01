import { Button, Stack, TextField } from "@mui/material"
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import fetcherV2 from "@utils/fetcherV2"
import SectionHeader from "../components/section-header"
import RevealDiv from "../components/reveal"

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      })
      const result = await fetcherV2("contact", payload, {
        method: "POST",
      })
      if (result.status === "success") {
        toast.success("Message sent successfully! We'll get back to you soon.")
        setFormData({ name: "", email: "", phone: "", message: "" })
      } else {
        toast.error("Failed to send message. Please try again.")
      }
    } catch {
      toast.error("Something went wrong. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <section className="landing-section px-6 bg-brand-card font-sans">
      <div className="max-w-7xl mx-auto">
        <RevealDiv>
          <SectionHeader
            eyebrow="Contact"
            title="Talk to our team"
            subtitle="Questions about batches, investors, or getting your farms set up? We are here to help."
          />
        </RevealDiv>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <RevealDiv className="reveal-left">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="medium"
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  multiline
                  rows={5}
                  variant="outlined"
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                  endIcon={
                    isSubmitting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Send size={16} />
                    )
                  }
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </Stack>
            </form>
          </RevealDiv>

          <RevealDiv className="reveal-right space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-brand-ink mb-6">
                Contact Information
              </h3>
              <div className="space-y-6">
                {[
                  {
                    icon: Mail,
                    label: "Email",
                    values: ["support@farmora.com", "info@farmora.com"],
                  },
                  {
                    icon: Phone,
                    label: "Phone",
                    values: ["+91 (123) 456-7890", "+91 (098) 765-4321"],
                  },
                  {
                    icon: MapPin,
                    label: "Address",
                    values: [
                      "123 Farm Street, Agricultural District",
                      "City, State - 123456",
                    ],
                  },
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-canvas rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-brand-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-brand-ink mb-1">
                          {item.label}
                        </h4>
                        {item.values.map((v, j) => (
                          <p key={j} className="text-brand-ink-soft">
                            {v}
                          </p>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-brand-canvas rounded-xl p-6">
              <h4 className="font-semibold text-brand-ink mb-3">
                Business Hours
              </h4>
              <div className="space-y-1.5 text-brand-ink-soft text-sm">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium text-brand-primary">Closed</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-brand-border-strong h-48 bg-brand-canvas flex items-center justify-center">
              <div className="text-center text-brand-ink-muted">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Map integration coming soon</p>
              </div>
            </div>
          </RevealDiv>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
