-- Guestbook: only accept well-formed messages
drop policy if exists "Anyone can write a message" on public.guest_messages;
create policy "Anyone can write a valid message" on public.guest_messages
  for insert to anon, authenticated
  with check (
    char_length(btrim(author_name)) between 1 and 80
    and char_length(btrim(message)) between 1 and 1500
  );

-- Photo files: no direct client uploads (handled server-side), only admins read files directly
drop policy if exists "Anyone uploads photo files" on storage.objects;
drop policy if exists "Approved photo files readable" on storage.objects;
create policy "Admins read photo files" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos' and public.has_role(auth.uid(), 'admin'));