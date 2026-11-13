import { createServerFn } from "@tanstack/react-start";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Returns approved photos with short-lived signed links (path + query only). */
export const getApprovedPhotos = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("photos")
    .select("id, storage_path, uploader_name, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) {
    console.error("getApprovedPhotos", error);
    throw new Error("No pudimos cargar la galería.");
  }
  if (!data.length) return [];
  const { data: urls, error: urlErr } = await supabaseAdmin.storage
    .from("photos")
    .createSignedUrls(data.map((p) => p.storage_path), 60 * 60);
  if (urlErr) {
    console.error("getApprovedPhotos signed urls", urlErr);
    throw new Error("No pudimos cargar la galería.");
  }
  return data
    .map((p, i) => {
      const signed = urls?.[i]?.signedUrl;
      let path = "";
      if (signed) {
        const u = new URL(signed);
        path = u.pathname + u.search;
      }
      return { ...p, signedPath: path };
    })
    .filter((p) => p.signedPath);
});

/** Receives one compressed JPEG from a guest, stores it and registers it as pending review. */
export const uploadGuestPhoto = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Datos inválidos.");
    const file = data.get("file");
    const rawName = data.get("name");
    if (!(file instanceof Blob)) throw new Error("Falta la foto.");
    if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) throw new Error("La imagen es demasiado pesada.");
    if (file.type !== "image/jpeg") throw new Error("Formato de imagen no válido.");
    const name = typeof rawName === "string" ? rawName.trim().slice(0, 80) : "";
    return { file, name: name || null };
  })
  .handler(async ({ data }) => {
    const bytes = new Uint8Array(await data.file.arrayBuffer());
    // JPEG magic bytes
    if (bytes.length < 3 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
      return { ok: false as const, error: "Formato de imagen no válido." };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const path = `${crypto.randomUUID()}.jpg`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("photos")
      .upload(path, bytes, { contentType: "image/jpeg", upsert: false });
    if (upErr) {
      console.error("uploadGuestPhoto storage", upErr);
      return { ok: false as const, error: "No pudimos subir la foto." };
    }
    const { error } = await supabaseAdmin
      .from("photos")
      .insert({ storage_path: path, uploader_name: data.name, status: "pending" });
    if (error) {
      await supabaseAdmin.storage.from("photos").remove([path]);
      const friendly = error.message.includes("Probá") ? error.message : "No pudimos registrar la foto.";
      if (!error.message.includes("Probá")) console.error("uploadGuestPhoto insert", error);
      return { ok: false as const, error: friendly };
    }
    return { ok: true as const };
  });
