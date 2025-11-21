-- Supabase Setup: Auto-create usuario row when auth.users is created
-- Run this in your Supabase SQL Editor

-- Step 1: Make sure we have a default role
-- Check if idrol table has a default role (id=1 for "user" role)
-- If not, create one
INSERT INTO public.idrol (id, descripcion, tiporol)
VALUES (1, 'Usuario Regular', 'user')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a row into public.usuario when a new user signs up
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
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),  -- Default name
    COALESCE(NEW.raw_user_meta_data->>'apellidos', 'Nuevo'), -- Default last name
    NEW.email,
    COALESCE(
      (NEW.raw_user_meta_data->>'fecha_nac')::date,
      CURRENT_DATE - INTERVAL '25 years'  -- Default birth date (25 years ago)
    ),
    1,  -- Default role ID (must exist in idrol table)
    'default.jpg'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 4: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Enable RLS on usuario table (if not already enabled)
ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for usuario table
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON public.usuario
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.usuario
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role to do anything (for admin operations)
CREATE POLICY "Service role has full access"
  ON public.usuario
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify the setup
SELECT 'Setup complete! You can now sign up users.' AS status;
