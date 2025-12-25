drop policy "Creators and GMs can create new equipment translations" on "public"."equipment_translations";

drop policy "Creators and GMs can create new equipments" on "public"."equipments";

drop policy "Creators and GMs can create new item translations" on "public"."item_translations";

drop policy "Creators and GMs can create new items" on "public"."items";

drop policy "Creators and GMs can create new resource translations" on "public"."resource_translations";


  create policy "Creators and GMs can create new equipment translations"
  on "public"."equipment_translations"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Creators and GMs can create new equipments"
  on "public"."equipments"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Creators and GMs can create new item translations"
  on "public"."item_translations"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Creators and GMs can create new items"
  on "public"."items"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Creators and GMs can create new resource translations"
  on "public"."resource_translations"
  as permissive
  for insert
  to authenticated
with check (true);



