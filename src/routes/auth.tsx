import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso administradoras · Katherina & Naomi" },
      { name: "description", content: "Acceso privado al panel de la invitación." },
      { property: "og:title", content: "Acceso administradoras" },
      { property: "og:description", content: "Acceso privado al panel de la invitación." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate({ to: "/admin" }); });
    const { data: sub } = supabase.auth.onAuthStateChange((e, session) => { if (e === "SIGNED_IN" && session) navigate({ to: "/admin" }); });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error("Email o contraseña incorrectos, o el email aún no fue confirmado.");
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      if (error) toast.error(error.message);
      else toast.success("Te enviamos un email para confirmar tu cuenta.");
    }
    setBusy(false);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("No se pudo iniciar sesión con Google.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-hero px-6">
      <div className="glass-card w-full max-w-sm p-8">
        <h1 className="text-center text-3xl text-gradient">Panel privado</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">Solo para las administradoras.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-2"><Label htmlFor="em">Email</Label><Input id="em" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="pw">Contraseña</Label><Input id="pw" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button className="w-full rounded-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}{mode === "in" ? "Ingresar" : "Crear cuenta"}</Button>
        </form>
        <Button variant="outline" className="mt-3 w-full rounded-full bg-card" onClick={google}>Continuar con Google</Button>
        <button className="mt-4 w-full text-center text-xs text-muted-foreground underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "¿Primera vez? Crear cuenta" : "Ya tengo cuenta"}
        </button>
        <Link to="/" className="mt-4 block text-center text-xs text-muted-foreground">← Volver a la invitación</Link>
      </div>
    </main>
  );
}
