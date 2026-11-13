import { useState } from "react";
import { toast } from "sonner";
import { Lock, Send, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function Guestbook() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (website) return;
    const n = name.trim();
    const m = message.trim();
    if (!n || !m) return void toast.error("Completá tu nombre y tu mensaje.");
    const last = Number(localStorage.getItem("gb_last") ?? 0);
    if (Date.now() - last < 30_000) return void toast.error("Esperá unos segundos antes de enviar otro mensaje.");
    setSending(true);
    const { error } = await supabase.from("guest_messages").insert({ author_name: n, message: m });
    setSending(false);
    if (error) return void toast.error(error.message.includes("Demasiados") ? error.message : "No pudimos enviar tu mensaje. Intentá de nuevo.");
    localStorage.setItem("gb_last", String(Date.now()));
    setSent(true);
    setName("");
    setMessage("");
  }

  if (sent)
    return (
      <div className="glass-card p-8 text-center">
        <Check className="mx-auto h-10 w-10 text-primary" />
        <p className="mt-4 font-serif text-2xl">¡Gracias por tu mensaje!</p>
        <p className="mt-2 text-sm text-muted-foreground">Lo guardamos de forma privada para leerlo con cariño.</p>
        <Button variant="ghost" className="mt-4" onClick={() => setSent(false)}>Escribir otro</Button>
      </div>
    );

  return (
    <form onSubmit={submit} className="glass-card space-y-4 p-6 sm:p-8">
      <div className="space-y-2">
        <Label htmlFor="gb-name">Tu nombre</Label>
        <Input id="gb-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gb-msg">Tu mensaje</Label>
        <Textarea id="gb-msg" rows={5} value={message} maxLength={1500} onChange={(e) => setMessage(e.target.value)} required />
        <p className="text-right text-xs text-muted-foreground">{message.length}/1500</p>
      </div>
      <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden="true" name="website" />
      <Button type="submit" size="lg" className="w-full rounded-full" disabled={sending}>
        {sending ? <Loader2 className="animate-spin" /> : <Send />} Enviar mensaje
      </Button>
      <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" /> Solo Katherina podrá leerlo.
      </p>
    </form>
  );
}
