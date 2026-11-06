import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, Check, X, LogOut, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { settingsQuery, type InvitationSettings } from "@/lib/invitation";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Panel de administración · Katherina & Naomi" },
      { name: "description", content: "Panel privado de la invitación." },
      { property: "og:title", content: "Panel de administración" },
      { property: "og:description", content: "Panel privado de la invitación." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (error) throw error;
      return !!data;
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!isAdmin)
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="glass-card max-w-sm p-8">
          <h1 className="text-3xl">Sin acceso</h1>
          <p className="mt-2 text-sm text-muted-foreground">Esta cuenta no tiene permisos de administradora.</p>
          <Button className="mt-6 rounded-full" onClick={signOut}>Cerrar sesión</Button>
        </div>
      </main>
    );

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl text-gradient">Panel privado</h1>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full"><Link to="/">Ver invitación</Link></Button>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut /> Salir</Button>
        </div>
      </header>
      <Tabs defaultValue="content">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Invitación</TabsTrigger>
          <TabsTrigger value="messages">Mensajes</TabsTrigger>
          <TabsTrigger value="photos">Fotos</TabsTrigger>
        </TabsList>
        <TabsContent value="content"><SettingsEditor /></TabsContent>
        <TabsContent value="messages"><MessagesAdmin /></TabsContent>
        <TabsContent value="photos"><PhotosAdmin /></TabsContent>
      </Tabs>
    </main>
  );
}

type Field = { key: keyof InvitationSettings; label: string; long?: boolean; placeholder?: string };
const GROUPS: { title: string; fields: Field[] }[] = [
  { title: "Portada", fields: [
    { key: "name_one", label: "Primer nombre" }, { key: "name_two", label: "Segundo nombre" },
    { key: "headline", label: "Frase principal" }, { key: "year", label: "Año" } ] },
  { title: "Presentación", fields: [
    { key: "intro_title", label: "Título" }, { key: "intro_message", label: "Mensaje de invitación", long: true } ] },
  { title: "Información del evento", fields: [
    { key: "event_date", label: "Fecha", placeholder: "Sábado 12 de diciembre" },
    { key: "event_time", label: "Horario", placeholder: "21:30 hs" },
    { key: "venue_name", label: "Salón o lugar" }, { key: "venue_address", label: "Dirección" },
    { key: "maps_url", label: "Enlace de Google Maps", placeholder: "https://maps.app.goo.gl/…" },
    { key: "dress_code", label: "Dress code (opcional)" } ] },
  { title: "Textos de secciones", fields: [
    { key: "rsvp_message", label: "Confirmación de asistencia", long: true },
    { key: "guestbook_intro", label: "Libro de mensajes", long: true },
    { key: "gallery_intro", label: "Galería", long: true } ] },
  { title: "Despedida", fields: [
    { key: "farewell_title", label: "Título" }, { key: "farewell_message", label: "Mensaje", long: true } ] },
];

function SettingsEditor() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(settingsQuery);
  const [form, setForm] = useState<Partial<InvitationSettings>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setForm(data); }, [data]);

  async function save() {
    if (form.maps_url && !/^https:\/\//.test(form.maps_url)) return void toast.error("El enlace de Maps debe empezar con https://");
    setSaving(true);
    const { id: _id, updated_at: _u, ...rest } = form as InvitationSettings;
    const clean = Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, typeof v === "string" && v.trim() === "" ? null : v]));
    const { error } = await supabase.from("invitation_settings").update({ ...clean, updated_at: new Date().toISOString() }).eq("id", 1);
    setSaving(false);
    if (error) return void toast.error("No se pudo guardar. Revisá que los campos obligatorios no estén vacíos.");
    toast.success("Cambios guardados");
    qc.invalidateQueries({ queryKey: settingsQuery.queryKey });
  }

  if (isLoading) return <Loader2 className="mx-auto mt-10 animate-spin" />;
  return (
    <div className="space-y-6 pt-4">
      {GROUPS.map((g) => (
        <section key={g.title} className="glass-card space-y-4 p-5">
          <h2 className="text-2xl">{g.title}</h2>
          {g.fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.long ? (
                <Textarea id={f.key} rows={4} value={(form[f.key] as string) ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              ) : (
                <Input id={f.key} placeholder={f.placeholder} value={(form[f.key] as string) ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              )}
            </div>
          ))}
        </section>
      ))}
      <div className="sticky bottom-4">
        <Button size="lg" className="w-full rounded-full shadow-glow" onClick={save} disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <Save />} Guardar cambios</Button>
      </div>
    </div>
  );
}

function MessagesAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guest_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  async function remove(id: string) {
    if (!confirm("¿Eliminar este mensaje?")) return;
    const { error } = await supabase.from("guest_messages").delete().eq("id", id);
    if (error) return void toast.error("No se pudo eliminar.");
    toast.success("Mensaje eliminado");
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
  }
  if (isLoading) return <Loader2 className="mx-auto mt-10 animate-spin" />;
  if (!data?.length) return <p className="pt-10 text-center text-muted-foreground">Todavía no hay mensajes.</p>;
  return (
    <ul className="space-y-3 pt-4">
      {data.map((m) => (
        <li key={m.id} className="glass-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-serif text-xl">{m.author_name}</p>
              <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("es-AR")}</p>
            </div>
            <Button size="icon" variant="ghost" aria-label="Eliminar" onClick={() => remove(m.id)}><Trash2 className="text-destructive" /></Button>
          </div>
          <p className="mt-3 whitespace-pre-line">{m.message}</p>
        </li>
      ))}
    </ul>
  );
}

function PhotosAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-photos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("photos").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      if (!data.length) return [];
      const { data: urls } = await supabase.storage.from("photos").createSignedUrls(data.map((p) => p.storage_path), 3600);
      return data.map((p, i) => ({ ...p, url: urls?.[i]?.signedUrl ?? "" }));
    },
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-photos"] }); qc.invalidateQueries({ queryKey: ["approved-photos"] }); };

  async function approve(id: string) {
    const { error } = await supabase.from("photos").update({ status: "approved" }).eq("id", id);
    if (error) return void toast.error("No se pudo aprobar.");
    toast.success("Foto publicada");
    refresh();
  }
  async function remove(id: string, path: string, label: string) {
    if (!confirm(`¿${label} esta foto? Se borrará definitivamente.`)) return;
    const { error: se } = await supabase.storage.from("photos").remove([path]);
    if (se) return void toast.error("No se pudo borrar el archivo.");
    const { error } = await supabase.from("photos").delete().eq("id", id);
    if (error) return void toast.error("No se pudo eliminar.");
    toast.success("Foto eliminada");
    refresh();
  }

  if (isLoading) return <Loader2 className="mx-auto mt-10 animate-spin" />;
  const pending = data?.filter((p) => p.status === "pending") ?? [];
  const approved = data?.filter((p) => p.status === "approved") ?? [];
  return (
    <div className="space-y-8 pt-4">
      {[{ title: `Pendientes (${pending.length})`, list: pending, isPending: true }, { title: `Publicadas (${approved.length})`, list: approved, isPending: false }].map((g) => (
        <section key={g.title}>
          <h2 className="mb-3 text-2xl">{g.title}</h2>
          {!g.list.length ? <p className="text-sm text-muted-foreground">Nada por aquí.</p> : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {g.list.map((p) => (
                <div key={p.id} className="glass-card overflow-hidden p-0">
                  <a href={p.url} target="_blank" rel="noopener noreferrer"><img src={p.url} alt="" loading="lazy" className="aspect-square w-full object-cover" /></a>
                  <div className="space-y-2 p-2">
                    <p className="truncate text-xs text-muted-foreground">{p.uploader_name || "Anónimo"}</p>
                    <div className="flex gap-2">
                      {g.isPending ? (
                        <>
                          <Button size="sm" className="flex-1" onClick={() => approve(p.id)}><Check /> Aprobar</Button>
                          <Button size="sm" variant="outline" onClick={() => remove(p.id, p.storage_path, "Rechazar")} aria-label="Rechazar"><X /></Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => remove(p.id, p.storage_path, "Eliminar")}><Trash2 /> Eliminar</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
