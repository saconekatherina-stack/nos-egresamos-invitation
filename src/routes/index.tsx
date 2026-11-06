import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarDays, Clock, MapPin, Navigation, MessageCircle, ChevronDown, Shirt } from "lucide-react";
import florals from "@/assets/florals.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reveal, SectionTitle, Ornament } from "@/components/invitation/Reveal";
import { Guestbook } from "@/components/invitation/Guestbook";
import { Gallery } from "@/components/invitation/Gallery";
import { settingsQuery, buildWhatsAppLink, type InvitationSettings } from "@/lib/invitation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Katherina & Naomi · ¡Nos egresamos! 2026" },
      { name: "description", content: "Estás invitado a celebrar la graduación de Katherina & Naomi. Confirmá tu asistencia, dejanos un mensaje y compartí tus fotos." },
      { property: "og:title", content: "Katherina & Naomi · ¡Nos egresamos! 2026" },
      { property: "og:description", content: "Invitación a nuestra fiesta de egresadas. ¡Te esperamos!" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Invitation,
});

const FALLBACK: Partial<InvitationSettings> = { name_one: "Katherina", name_two: "Naomi", headline: "¡Nos egresamos!", year: "2026" };

function Invitation() {
  const { data } = useQuery(settingsQuery);
  const s = { ...FALLBACK, ...data } as InvitationSettings;
  const [opened, setOpened] = useState(false);

  function openInvitation() {
    setOpened(true);
    requestAnimationFrame(() => document.getElementById("invitacion")?.scrollIntoView({ behavior: "smooth" }));
  }

  return (
    <main className="overflow-x-hidden">
      <Cover s={s} onOpen={openInvitation} opened={opened} />
      {opened && (
        <div id="invitacion">
          <Intro s={s} />
          <EventInfo s={s} />
          <Rsvp s={s} />
          <Section id="mensajes" eyebrow="Libro de mensajes" title="Unas palabras para nosotras" intro={s.guestbook_intro}>
            <Guestbook />
          </Section>
          <Section id="galeria" eyebrow="Galería" title="Momentos compartidos" intro={s.gallery_intro} wide>
            <Gallery />
          </Section>
          <Farewell s={s} />
        </div>
      )}
    </main>
  );
}

function Petals() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className="petal" style={{ left: `${(i * 37) % 100}%`, animationDuration: `${9 + (i % 5) * 2}s`, animationDelay: `${i * 0.9}s`, transform: `scale(${0.6 + (i % 4) * 0.25})` }} />
      ))}
    </div>
  );
}

function Cover({ s, onOpen, opened }: { s: InvitationSettings; onOpen: () => void; opened: boolean }) {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center bg-hero px-6 py-16">
      <img src={florals} alt="" width={1024} height={1536} className="absolute inset-0 h-full w-full object-cover opacity-90" />
      <Petals />
      <div className="relative z-10 max-w-xl text-center">
        <p className="animate-rise text-xs uppercase tracking-[0.5em] text-muted-foreground" style={{ animationDelay: "0.2s" }}>Promoción {s.year}</p>
        <h1 className="mt-6 leading-none">
          <span className="block animate-rise font-serif text-6xl font-medium text-gradient sm:text-8xl" style={{ animationDelay: "0.5s" }}>{s.name_one}</span>
          <span className="my-2 block animate-rise font-script text-5xl text-lilac sm:text-6xl" style={{ animationDelay: "0.9s" }}>&amp;</span>
          <span className="block animate-rise font-serif text-6xl font-medium text-gradient sm:text-8xl" style={{ animationDelay: "1.2s" }}>{s.name_two}</span>
        </h1>
        <div className="animate-rise" style={{ animationDelay: "1.6s" }}><Ornament /></div>
        <p className="animate-rise font-script text-4xl text-primary sm:text-5xl" style={{ animationDelay: "1.9s" }}>{s.headline}</p>
        <p className="mt-2 animate-rise font-serif text-2xl tracking-[0.3em] text-foreground/80" style={{ animationDelay: "2.1s" }}>{s.year}</p>
        <div className="mt-10 animate-rise" style={{ animationDelay: "2.5s" }}>
          {opened ? (
            <a href="#invitacion" className="inline-flex flex-col items-center gap-1 text-sm text-muted-foreground"><span>Deslizá</span><ChevronDown className="animate-bounce" /></a>
          ) : (
            <Button size="lg" onClick={onOpen} className="rounded-full px-10 py-6 text-base shadow-glow">Abrir invitación</Button>
          )}
        </div>
      </div>
    </section>
  );
}

function Section({ id, eyebrow, title, intro, children, wide }: { id: string; eyebrow: string; title: string; intro?: string | null; children: React.ReactNode; wide?: boolean }) {
  return (
    <section id={id} className="px-6 py-20 sm:py-28">
      <div className={wide ? "mx-auto max-w-5xl" : "mx-auto max-w-xl"}>
        <Reveal><SectionTitle eyebrow={eyebrow} title={title} /></Reveal>
        {intro && <Reveal delay={100}><p className="mx-auto mb-10 max-w-lg text-center text-muted-foreground">{intro}</p></Reveal>}
        <Reveal delay={200}>{children}</Reveal>
      </div>
    </section>
  );
}

function Intro({ s }: { s: InvitationSettings }) {
  return (
    <section className="px-6 py-24 sm:py-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="font-script text-4xl text-lilac">{s.intro_title}</p>
        <Ornament />
        <p className="whitespace-pre-line font-serif text-2xl leading-relaxed text-foreground/90 sm:text-3xl">{s.intro_message}</p>
      </Reveal>
    </section>
  );
}

function Pending({ children }: { children: React.ReactNode }) {
  return <span className="italic text-muted-foreground/80">{children}</span>;
}

function EventInfo({ s }: { s: InvitationSettings }) {
  const items = [
    { icon: CalendarDays, label: "Fecha", value: s.event_date, fallback: "Fecha a confirmar" },
    { icon: Clock, label: "Horario", value: s.event_time, fallback: "Horario a confirmar" },
    { icon: MapPin, label: "Lugar", value: s.venue_name, fallback: "Lugar a confirmar", sub: s.venue_address },
  ];
  return (
    <section id="evento" className="bg-hero/60 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <Reveal><SectionTitle eyebrow="La celebración" title="Cuándo y dónde" /></Reveal>
        <div className="grid gap-5 sm:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.label} delay={i * 120}>
              <div className="glass-card h-full p-6 text-center">
                <it.icon className="mx-auto h-7 w-7 text-primary" />
                <p className="mt-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">{it.label}</p>
                <p className="mt-2 font-serif text-2xl">{it.value || <Pending>{it.fallback}</Pending>}</p>
                {it.label === "Lugar" && (
                  <p className="mt-1 text-sm text-muted-foreground">{it.sub || <Pending>Dirección próximamente</Pending>}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
        {s.dress_code && (
          <Reveal className="mt-6 text-center"><p className="inline-flex items-center gap-2 text-muted-foreground"><Shirt className="h-4 w-4" /> Dress code: <span className="font-medium text-foreground">{s.dress_code}</span></p></Reveal>
        )}
        <Reveal className="mt-10 text-center" delay={200}>
          {s.maps_url ? (
            <Button asChild size="lg" variant="outline" className="rounded-full bg-glass">
              <a href={s.maps_url} target="_blank" rel="noopener noreferrer"><Navigation /> Cómo llegar</a>
            </Button>
          ) : (
            <p className="text-sm italic text-muted-foreground/80">La ubicación en el mapa estará disponible pronto.</p>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function Rsvp({ s }: { s: InvitationSettings }) {
  const [name, setName] = useState("");
  const [guests, setGuests] = useState(1);
  const valid = name.trim().length >= 2;
  return (
    <Section id="confirmar" eyebrow="Confirmación" title="¿Nos acompañás?" intro={s.rsvp_message}>
      <form className="glass-card space-y-4 p-6 sm:p-8" onSubmit={(e) => { e.preventDefault(); if (valid) window.open(buildWhatsAppLink(name, guests, `${s.name_one} & ${s.name_two}`), "_blank", "noopener"); }}>
        <div className="space-y-2">
          <Label htmlFor="rsvp-name">Nombre y apellido</Label>
          <Input id="rsvp-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="¿Cómo te llamás?" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rsvp-guests">Cantidad de personas</Label>
          <Input id="rsvp-guests" type="number" min={1} max={10} value={guests} onChange={(e) => setGuests(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} />
        </div>
        <Button type="submit" size="lg" className="w-full rounded-full" disabled={!valid}>
          <MessageCircle /> Confirmar por WhatsApp
        </Button>
      </form>
    </Section>
  );
}

function Farewell({ s }: { s: InvitationSettings }) {
  return (
    <section className="relative overflow-hidden bg-hero px-6 py-28 text-center sm:py-36">
      <Petals />
      <Reveal className="relative mx-auto max-w-2xl">
        <p className="font-script text-6xl text-primary sm:text-7xl">{s.farewell_title}</p>
        <Ornament />
        <p className="whitespace-pre-line font-serif text-2xl leading-relaxed sm:text-3xl">{s.farewell_message}</p>
        <p className="mt-10 font-serif text-xl tracking-[0.2em] text-gradient">{s.name_one} &amp; {s.name_two} · {s.year}</p>
      </Reveal>
      <Link to="/admin" className="relative mt-16 inline-block text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 hover:text-muted-foreground">Administración</Link>
    </section>
  );
}
