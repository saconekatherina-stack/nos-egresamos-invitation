import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera, Loader2, ImagePlus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, approvedPhotosQuery, compressImage } from "@/lib/invitation";

const MAX_FILES = 5;

export function Gallery() {
  const { data: photos, isLoading, isError } = useQuery(approvedPhotosQuery);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-10">
      <Uploader />
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-lavender/60" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-center text-sm text-muted-foreground">No pudimos cargar la galería. Recargá la página.</p>
      ) : !photos?.length ? (
        <p className="text-center font-serif text-lg italic text-muted-foreground">Las primeras fotos aparecerán aquí muy pronto.</p>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
          {photos.map((p, i) => (
            <button key={p.id} onClick={() => setOpen(i)} className="block w-full overflow-hidden rounded-xl shadow-glow transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-ring">
              <img src={p.url} alt={p.uploader_name ? `Foto de ${p.uploader_name}` : "Foto de la fiesta"} loading="lazy" decoding="async" className="w-full" />
            </button>
          ))}
        </div>
      )}
      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">Foto ampliada</DialogTitle>
          {open !== null && photos?.[open] && (
            <div className="relative">
              <img src={photos[open].url} alt="Foto ampliada" className="max-h-[85vh] w-full rounded-2xl object-contain" />
              {photos[open].uploader_name && (
                <p className="mt-2 text-center text-sm text-primary-foreground">📷 {photos[open].uploader_name}</p>
              )}
              {photos.length > 1 && (
                <>
                  <Button size="icon" variant="secondary" className="absolute left-2 top-1/2 rounded-full" aria-label="Anterior" onClick={() => setOpen((open - 1 + photos.length) % photos.length)}><ChevronLeft /></Button>
                  <Button size="icon" variant="secondary" className="absolute right-2 top-1/2 rounded-full" aria-label="Siguiente" onClick={() => setOpen((open + 1) % photos.length)}><ChevronRight /></Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Uploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [progress, setProgress] = useState<string | null>(null);

  function pick(list: FileList | null) {
    if (!list) return;
    const chosen = Array.from(list);
    const valid: File[] = [];
    for (const f of chosen) {
      if (!ALLOWED_IMAGE_TYPES.includes(f.type)) { toast.error(`${f.name}: solo se aceptan imágenes JPG, PNG o WEBP.`); continue; }
      if (f.size > MAX_IMAGE_BYTES) { toast.error(`${f.name}: supera los 15 MB.`); continue; }
      valid.push(f);
    }
    const merged = [...files, ...valid].slice(0, MAX_FILES);
    if (files.length + valid.length > MAX_FILES) toast.message(`Podés enviar hasta ${MAX_FILES} fotos por vez.`);
    setFiles(merged);
  }

  async function upload() {
    const last = Number(localStorage.getItem("ph_last") ?? 0);
    if (Date.now() - last < 60_000) return void toast.error("Esperá un minuto antes de enviar más fotos.");
    let ok = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(`Subiendo ${i + 1} de ${files.length}…`);
        const blob = await compressImage(files[i]!);
        const path = `${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await supabase.storage.from("photos").upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (upErr) throw new Error("No pudimos subir la foto.");
        const { error } = await supabase.from("photos").insert({ storage_path: path, uploader_name: name.trim() || null });
        if (error) throw new Error(error.message.includes("Probá") ? error.message : "No pudimos registrar la foto.");
        ok++;
      }
      toast.success(`¡Gracias! ${ok === 1 ? "Tu foto será publicada" : "Tus fotos serán publicadas"} después de ser revisada${ok === 1 ? "" : "s"}.`);
      localStorage.setItem("ph_last", String(Date.now()));
      setFiles([]);
    } catch (e) {
      toast.error((e as Error).message + (ok ? ` Se enviaron ${ok}.` : ""));
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="glass-card p-6 sm:p-8">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple className="hidden" onChange={(e) => { pick(e.target.files); e.target.value = ""; }} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={!!progress} className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-lilac/70 p-8 text-muted-foreground transition-colors hover:bg-lavender/40">
        <ImagePlus className="h-8 w-8 text-primary" />
        <span className="font-medium text-foreground">Elegir fotos</span>
        <span className="text-xs">JPG, PNG o WEBP · hasta {MAX_FILES} por vez · máx. 15 MB</span>
      </button>
      {files.length > 0 && (
        <div className="mt-5 space-y-4">
          <ul className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-2 rounded-full bg-lavender px-3 py-1 text-xs">
                <span className="max-w-[10rem] truncate">{f.name}</span>
                <button aria-label="Quitar" onClick={() => setFiles(files.filter((_, j) => j !== i))} disabled={!!progress}><X className="h-3 w-3" /></button>
              </li>
            ))}
          </ul>
          <Input placeholder="Tu nombre (opcional)" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
          <Button className="w-full rounded-full" size="lg" onClick={upload} disabled={!!progress}>
            {progress ? <><Loader2 className="animate-spin" /> {progress}</> : <><Camera /> Enviar fotos</>}
          </Button>
        </div>
      )}
    </div>
  );
}
