-- RLS Policies for Lesson Creation
-- Run this in Supabase SQL Editor to allow authenticated users to create lessons

-- ============================================================================
-- MODULOS TABLE POLICIES
-- ============================================================================

-- Enable RLS on modulos (if not already enabled)
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to INSERT modules
CREATE POLICY "Users can create modules"
ON public.modulos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to SELECT modules
CREATE POLICY "Users can view modules"
ON public.modulos
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to UPDATE their own modules
-- (Optional - uncomment if you want users to edit modules)
-- CREATE POLICY "Users can update modules"
-- ON public.modulos
-- FOR UPDATE
-- TO authenticated
-- USING (true)
-- WITH CHECK (true);

-- ============================================================================
-- CONTENIDO TABLE POLICIES
-- ============================================================================

ALTER TABLE public.contenido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create contenido"
ON public.contenido
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view contenido"
ON public.contenido
FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- LECCION TABLE POLICIES (Junction table)
-- ============================================================================

ALTER TABLE public.leccion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create leccion"
ON public.leccion
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view leccion"
ON public.leccion
FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- PARRAFOS TABLE POLICIES (Text chunks)
-- ============================================================================

ALTER TABLE public.parrafos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create parrafos"
ON public.parrafos
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view parrafos"
ON public.parrafos
FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- PREGUNTA TABLE POLICIES (Questions - future use)
-- ============================================================================

ALTER TABLE public.pregunta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create preguntas"
ON public.pregunta
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view preguntas"
ON public.pregunta
FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that policies were created successfully
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('modulos', 'contenido', 'leccion', 'parrafos', 'pregunta')
ORDER BY tablename, policyname;
