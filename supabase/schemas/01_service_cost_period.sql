CREATE TYPE public.service_cost_period AS ENUM (
  'once',
  'day',
  'hour',
  'distance'
);

ALTER TYPE public.service_cost_period OWNER TO postgres;
