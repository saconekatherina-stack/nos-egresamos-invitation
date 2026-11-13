import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type InvitationSettings = Tables<"invitation_settings">;

export const WHATSAPP_NUMBER = "5492635013396";

export const settingsQuery = queryOptions({
  queryKey: ["invitation-settings"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("invitation_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (error) throw error;
    return data;
  },
  staleTime: 60_000,
});

export const approvedPhotosQuery = queryOptions({
  queryKey: ["approved-photos"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("photos")
      .select("id, storage_path, uploader_name, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw error;
    if (!data.length) return [];
    const { data: urls, error: urlErr } = await supabase.storage
      .from("photos")
      .createSignedUrls(
        data.map((p) => p.storage_path),
        60 * 60,
      );
    if (urlErr) throw urlErr;
    return data
      .map((p, i) => ({ ...p, url: urls?.[i]?.signedUrl ?? "" }))
      .filter((p) => p.url);
  },
});

export type RsvpAnswer = "si" | "no";

/** Normalizes a DNI: keeps only digits. Returns null if it isn't 7–8 digits. */
export function normalizeDni(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  return /^\d{7,8}$/.test(digits) ? digits : null;
}

/** Builds the WhatsApp RSVP link. Nothing is stored: the data only travels in the WhatsApp message. */
export function buildWhatsAppLink(guestName: string, dni: string, answer: RsvpAnswer, honoreeName: string) {
  const name = guestName.trim();
  const response = answer === "si" ? "Sí asistiré" : "No podré asistir";
  const text = `¡Hola! Confirmación de asistencia a la fiesta de egresada de ${honoreeName}.\nNombre y apellido: ${name}\nDNI: ${dni}\nRespuesta: ${response}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // original file; resized before upload

/** Resizes and re-encodes an image in the browser to JPEG (max 1800px). */
export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("No pudimos leer esta imagen. Probá con otra en formato JPG o PNG.");
  });
  const max = 1800;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no permite procesar la imagen.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
  if (!blob) throw new Error("No pudimos procesar la imagen.");
  if (blob.size > 7.5 * 1024 * 1024) throw new Error("La imagen es demasiado pesada.");
  return blob;
}
