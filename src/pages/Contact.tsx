import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/emailjs";

const faqs = [
  { q: "Comment rejoindre l'association ?", a: "Remplissez le formulaire de contact ci-contre et nous vous recontacterons sous 48h avec toutes les informations nécessaires pour votre adhésion." },
  { q: "Quel est le montant de la cotisation ?", a: "La cotisation annuelle est de 20€ pour les membres actifs et de 10€ pour les bénévoles. Tarifs réduits disponibles sur demande." },
  { q: "À partir de quel âge peut-on rejoindre ?", a: "Notre association est ouverte aux jeunes de 15 à 30 ans. Au-delà, vous pouvez nous rejoindre en tant que bénévole adulte." },
  { q: "Comment proposer un événement ?", a: "Contactez-nous via ce formulaire ou directement lors de nos réunions mensuelles (premier samedi du mois à 15h)." },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // 1. Envoyer l'email via EmailJS vers mioramh@gmail.com
      console.log("Envoi du formulaire:", form);
      const emailResult = await sendEmail(form);
      
      console.log("Résultat email:", emailResult);
      
      if (emailResult.success) {
        // 2. Sauvegarder dans Supabase
        const { data, error: dbError } = await supabase
          .from('contact')
          .insert([
            {
              nom: form.name,
              email: form.email,
              sujet: form.subject,
              message: form.message,
              created_at: new Date().toISOString()
            }
          ])
          .select();

        if (dbError) {
          console.error("Erreur détaillée Supabase:", dbError);
          setError("Email envoyé mais erreur de sauvegarde: " + dbError.message);
        } else {
          console.log("Sauvegarde Supabase réussie:", data);
        }
        
        setSent(true);
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setError(emailResult.error || "Erreur lors de l'envoi de l'email");
      }
    } catch (err: any) {
      console.error("Erreur complète:", err);
      setError(`Erreur: ${err.message || "Une erreur est survenue"}`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 font-body`;
  const inputStyle = {
    background: "hsl(var(--card))",
    borderColor: "hsl(var(--border))",
    color: "hsl(var(--foreground))",
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header avec image de fond */}
      <div 
        className="relative pt-24 pb-12"
        style={{
          backgroundImage: `url('/1.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}
      >
        {/* Overlay sombre pour améliorer la lisibilité */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1
          }}
        />
        
        <div className="container mx-auto px-4 text-center py-10 space-y-4 relative z-10">
          <span className="badge-primary" style={{ background: "hsl(var(--primary) / 0.25)", color: "hsl(210 100% 85%)" }}>
            Nous contacter
          </span>
          <h1 className="font-display font-bold text-4xl md:text-5xl" style={{ color: "hsl(0 0% 98%)" }}>
            Parlons-nous !
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "hsl(210 40% 75%)" }}>
            Une question, une idée ou envie de nous rejoindre ? On est là.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl mb-2">Coordonnées</h2>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                Notre équipe répond généralement sous 24-48h en jours ouvrés.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { Icon: Mail, label: "Email", value: "mioramh@gmail.com", href: "mailto:mioramh@gmail.com" },
                { Icon: Phone, label: "Téléphone", value: "038 83 371 22", href: "tel:+261388337122" },
                { Icon: MapPin, label: "Adresse", value: "1112C207 antsirabe", href: "#" },
              ].map(({ Icon, label, value, href }, i) => (
                <div key={i} className="glass-card p-4 flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "hsl(var(--primary) / 0.12)" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</p>
                    {href ? (
                      <a href={href} className="text-sm font-medium hover:text-primary transition-colors">{value}</a>
                    ) : (
                      <p className="text-sm font-medium">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="glass-card p-8">
              {sent ? (
                <div className="text-center py-12 space-y-4 animate-fade-up">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                    style={{ background: "hsl(142 70% 45% / 0.12)" }}
                  >
                    <CheckCircle2 className="w-10 h-10" style={{ color: "hsl(142 60% 40%)" }} />
                  </div>
                  <h3 className="font-display font-bold text-2xl">Message envoyé ! ✅</h3>
                  <p className="text-sm max-w-sm mx-auto" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Merci {form.name} ! Nous vous répondrons dans les 48 heures à {form.email}
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="btn-primary"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "var(--gradient-card)" }}
                    >
                      <MessageSquare className="w-4 h-4" style={{ color: "hsl(var(--primary-foreground))" }} />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-xl">Envoyer un message</h2>
                      <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Tous les champs sont requis</p>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
                        Nom complet
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Jean Dupont"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={inputClass}
                        style={inputStyle}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="jean@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={inputClass}
                        style={inputStyle}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Sujet
                    </label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                      disabled={loading}
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option>🤝 Devenir membre</option>
                      <option>📅 Renseignements sur les événements</option>
                      <option>🤝 Partenariat</option>
                      <option>💡 Proposition d'idée</option>
                      <option>❓ Autre</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Votre message..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={`${inputClass} resize-none`}
                      style={inputStyle}
                      disabled={loading}
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center text-sm" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="text-center mb-10 space-y-3">
            <span className="badge-primary">FAQ</span>
            <h2 className="section-title">Questions fréquentes</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-card cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-sm">{faq.q}</p>
                  <span
                    className="text-lg transition-transform duration-200 flex-shrink-0"
                    style={{ transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}
                  >
                    +
                  </span>
                </div>
                {openFaq === i && (
                  <p className="mt-3 text-sm leading-relaxed animate-fade-up" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}