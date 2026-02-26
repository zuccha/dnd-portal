drop trigger if exists "validate_source_ownership_delete" on "public"."source_ownerships";

drop trigger if exists "validate_source_ownership_update" on "public"."source_ownerships";

drop trigger if exists "validate_source_ownership_write" on "public"."source_ownerships";

drop trigger if exists "validate_source_role_delete" on "public"."source_roles";

drop trigger if exists "validate_source_role_write" on "public"."source_roles";

drop trigger if exists "validate_source_creator_transfer" on "public"."sources";

drop function if exists "public"."validate_source_creator_transfer"();

drop function if exists "public"."validate_source_ownership_delete"();

drop function if exists "public"."validate_source_ownership_update"();

drop function if exists "public"."validate_source_ownership_write"();

drop function if exists "public"."validate_source_role_delete"();

drop function if exists "public"."validate_source_role_write"();


