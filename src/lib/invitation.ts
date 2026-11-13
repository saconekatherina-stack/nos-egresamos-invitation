import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { getApprovedPhotos } from "@/lib/photos.functions";

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
    const photos = await getApprovedPhotos();
    // Signed links are built against the public backend address the browser can reach.
    return photos.map(({ signedPath, ...p }) => ({ ...p, url: `${import.meta.env["VITE_SUPABASE_URL"]}${signedPath}` }));
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
