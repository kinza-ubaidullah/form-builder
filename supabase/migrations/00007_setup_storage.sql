-- Create a new storage bucket for form uploads
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- Set up security policies for the 'uploads' bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'uploads' );

create policy "Authenticated Users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'uploads' AND auth.role() = 'authenticated' );
  
-- Also allow public uploads if we want anonymous users to submit forms with files
create policy "Public Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'uploads' );
