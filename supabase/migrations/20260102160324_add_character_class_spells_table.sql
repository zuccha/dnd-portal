
  create table "public"."character_class_spells" (
    "character_class_id" uuid not null,
    "spell_id" uuid not null
      );


alter table "public"."character_class_spells" enable row level security;

CREATE UNIQUE INDEX character_class_spells_pkey ON public.character_class_spells USING btree (character_class_id, spell_id);

CREATE INDEX idx_character_class_spells_class_id ON public.character_class_spells USING btree (character_class_id);

CREATE INDEX idx_character_class_spells_spell_id ON public.character_class_spells USING btree (spell_id);

alter table "public"."character_class_spells" add constraint "character_class_spells_pkey" PRIMARY KEY using index "character_class_spells_pkey";

alter table "public"."character_class_spells" add constraint "character_class_spells_character_class_id_fkey" FOREIGN KEY (character_class_id) REFERENCES public.character_classes(resource_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."character_class_spells" validate constraint "character_class_spells_character_class_id_fkey";

alter table "public"."character_class_spells" add constraint "character_class_spells_spell_id_fkey" FOREIGN KEY (spell_id) REFERENCES public.spells(resource_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."character_class_spells" validate constraint "character_class_spells_spell_id_fkey";

grant delete on table "public"."character_class_spells" to "anon";

grant insert on table "public"."character_class_spells" to "anon";

grant references on table "public"."character_class_spells" to "anon";

grant select on table "public"."character_class_spells" to "anon";

grant trigger on table "public"."character_class_spells" to "anon";

grant truncate on table "public"."character_class_spells" to "anon";

grant update on table "public"."character_class_spells" to "anon";

grant delete on table "public"."character_class_spells" to "authenticated";

grant insert on table "public"."character_class_spells" to "authenticated";

grant references on table "public"."character_class_spells" to "authenticated";

grant select on table "public"."character_class_spells" to "authenticated";

grant trigger on table "public"."character_class_spells" to "authenticated";

grant truncate on table "public"."character_class_spells" to "authenticated";

grant update on table "public"."character_class_spells" to "authenticated";

grant delete on table "public"."character_class_spells" to "service_role";

grant insert on table "public"."character_class_spells" to "service_role";

grant references on table "public"."character_class_spells" to "service_role";

grant select on table "public"."character_class_spells" to "service_role";

grant trigger on table "public"."character_class_spells" to "service_role";

grant truncate on table "public"."character_class_spells" to "service_role";

grant update on table "public"."character_class_spells" to "service_role";


  create policy "Creators and GMs can create character class spells"
  on "public"."character_class_spells"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(character_class_id));



  create policy "Creators and GMs can delete character class spells"
  on "public"."character_class_spells"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(character_class_id));



  create policy "Users can read character class spells"
  on "public"."character_class_spells"
  as permissive
  for select
  to anon, authenticated
using ((public.can_read_resource(character_class_id) AND public.can_read_resource(spell_id)));



