/*
  Denormalized step_count and module_count on application_flows for light list queries
  without downloading the full `steps` jsonb blob.
*/

ALTER TABLE public.application_flows
  ADD COLUMN IF NOT EXISTS step_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.application_flows
  ADD COLUMN IF NOT EXISTS module_count integer NOT NULL DEFAULT 0;

UPDATE public.application_flows AS af
SET
  step_count = COALESCE(jsonb_array_length(af.steps), 0),
  module_count = COALESCE(
    (
      SELECT SUM(jsonb_array_length(COALESCE(elem -> 'modules', '[]'::jsonb)))
      FROM jsonb_array_elements(COALESCE(af.steps, '[]'::jsonb)) AS elem
    ),
    0
  )::integer;

CREATE OR REPLACE FUNCTION public.application_flows_set_step_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.step_count := COALESCE(jsonb_array_length(NEW.steps), 0);
  NEW.module_count := COALESCE(
    (
      SELECT SUM(jsonb_array_length(COALESCE(elem -> 'modules', '[]'::jsonb)))
      FROM jsonb_array_elements(COALESCE(NEW.steps, '[]'::jsonb)) AS elem
    ),
    0
  )::integer;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_application_flows_set_step_counts ON public.application_flows;

CREATE TRIGGER trg_application_flows_set_step_counts
  BEFORE INSERT OR UPDATE OF steps ON public.application_flows
  FOR EACH ROW
  EXECUTE FUNCTION public.application_flows_set_step_counts();

COMMENT ON COLUMN public.application_flows.step_count IS 'Denormalized; maintained by trigger';
COMMENT ON COLUMN public.application_flows.module_count IS 'Denormalized; maintained by trigger';
