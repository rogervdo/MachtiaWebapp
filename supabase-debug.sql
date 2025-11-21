-- Debug Script: Check what's wrong with the usuario table setup
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if the trigger exists
SELECT
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
  AND event_object_table = 'users';

-- 2. Check if the trigger function exists
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- 3. Check if default role exists
SELECT * FROM public.idrol WHERE id = 1;

-- 4. Check usuario table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'usuario'
ORDER BY ordinal_position;

-- 5. Check RLS status
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'usuario';

-- 6. Check existing policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'usuario';

-- 7. Try a manual insert to see the exact error
DO $$
DECLARE
  test_user_id uuid := gen_random_uuid();
BEGIN
  -- First, let's see if we can insert into usuario manually
  INSERT INTO public.usuario (
    id,
    nombre,
    apellidos,
    email,
    fecha_nac,
    rol,
    imagendir
  )
  VALUES (
    test_user_id,
    'Test',
    'User',
    'test@example.com',
    CURRENT_DATE - INTERVAL '25 years',
    1,
    'default.jpg'
  );

  RAISE NOTICE 'Manual insert successful! User ID: %', test_user_id;

  -- Clean up test data
  DELETE FROM public.usuario WHERE id = test_user_id;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Manual insert failed with error: %', SQLERRM;
END $$;
