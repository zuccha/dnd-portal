drop policy "Creators and GMs can create new resources" on "public"."resources";


  create policy "Creators and GMs can create new resources"
  on "public"."resources"
  as permissive
  for insert
  to authenticated
with check (true);



