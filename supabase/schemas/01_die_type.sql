CREATE TYPE public.die_type AS ENUM (
  'd2',
  'd4',
  'd6',
  'd8',
  'd10',
  'd12',
  'd20',
  'd100'
);

ALTER TYPE public.die_type OWNER TO postgres;
