-- Fix: Make idleccion auto-increment in contenido table
-- Run this in Supabase SQL Editor

-- First, let's check the current structure
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable,
  is_identity
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'contenido'
ORDER BY ordinal_position;

-- Check current max value
SELECT MAX(idleccion) as max_idleccion FROM public.contenido;

-- Option 1: If idleccion is NOT an identity column, convert it
-- This will make idleccion auto-increment starting from the next available value

-- Get the current max value first, then run:
-- (Replace <MAX_VALUE> with the actual max value from the query above, or use 1 if no rows exist)

DO $$
DECLARE
  max_val INTEGER;
BEGIN
  -- Get current max value
  SELECT COALESCE(MAX(idleccion), 0) INTO max_val FROM public.contenido;

  -- Make idleccion an IDENTITY column starting from max_val + 1
  EXECUTE format('ALTER TABLE public.contenido ALTER COLUMN idleccion ADD GENERATED ALWAYS AS IDENTITY (START WITH %s RESTART WITH %s)', max_val + 1, max_val + 1);

  RAISE NOTICE 'idleccion is now auto-incrementing, starting from %', max_val + 1;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not convert idleccion to IDENTITY. Error: %', SQLERRM;
  RAISE NOTICE 'It might already be an IDENTITY column or have existing constraints.';
END $$;

-- Verify the change
SELECT
  column_name,
  data_type,
  column_default,
  is_identity,
  identity_generation
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'contenido'
  AND column_name = 'idleccion';
