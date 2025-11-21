# Machtia - Procesador de Transcripciones de YouTube

Aplicación web para procesar transcripciones de YouTube con IA (Gemini) y generar contenido educativo estructurado. Inspirada en MachtiaDesktop (Swift).

## 🚀 Características

- ✅ **Extracción de transcripciones de YouTube** - Soporte para múltiples formatos de URL
- ✅ **Limpieza de texto con IA** - Usa Gemini para mejorar puntuación, capitalización y formato
- ✅ **Chunking inteligente** - Divide texto en fragmentos de 300-500 palabras con detección de límites de oración
- ✅ **Vista previa con indicadores de calidad** - Fragmentos codificados por colores (verde/naranja/rojo)
- ✅ **Entrada de texto manual** - Alternativa a YouTube para contenido personalizado
- ✅ **Autenticación con Supabase** - Sistema completo de login/signup
- ✅ **Interfaz en español** - Mensajes de error y UI completamente en español
- ✅ **UI moderna** - shadcn/ui + Tailwind CSS

## 📋 Requisitos Previos

- Node.js 18+
- npm o pnpm
- Cuenta de Supabase (gratis)
- API Key de Google Gemini (prueba gratuita disponible)

## 🛠️ Instalación

### 1. Clonar o navegar al proyecto

```bash
cd /Users/roger/Code/Machtia
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completa las variables:

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-supabase-service-role-key

# Google Gemini API Configuration
GEMINI_API_KEY=tu-gemini-api-key

# App Configuration (opcional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Obtener credenciales de Supabase:

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings → API
4. Copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

#### Obtener API Key de Gemini:

1. Ve a [Google AI Studio](https://aistudio.google.com/)
2. Crea una API key
3. Copia la key → `GEMINI_API_KEY`

### 4. Configurar base de datos (Opcional)

La aplicación ya tiene interfaces TypeScript para tu schema existente. Si quieres crear las tablas desde cero, ejecuta este SQL en Supabase SQL Editor:

```sql
-- Las tablas ya existen en tu base de datos según la imagen
-- Este es solo un ejemplo si necesitas crear nuevas tablas

-- Tabla de ejemplo para guardar lecciones procesadas (opcional)
CREATE TABLE IF NOT EXISTS lecciones_procesadas (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  titulo TEXT,
  descripcion TEXT,
  tipo TEXT,
  contenido_original TEXT,
  contenido_limpio TEXT,
  total_palabras INTEGER,
  total_fragmentos INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📖 Uso

### 1. Crear cuenta / Iniciar sesión

- Ve a `/login` o `/signup`
- Crea una cuenta con email y contraseña
- Serás redirigido al dashboard

### 2. Procesar transcripción de YouTube

1. Ve a la pestaña **"Crear"**
2. Selecciona **"YouTube"**
3. Pega una URL de YouTube (formatos soportados):
   - `https://youtube.com/watch?v=...`
   - `https://youtu.be/...`
   - `https://youtube.com/shorts/...`
4. (Opcional) Marca "Limpiar texto con IA" para mejorar formato
5. Click en **"Procesar Contenido"**
6. Espera a que se complete el procesamiento
7. Revisa los fragmentos generados con indicadores de calidad:
   - 🟢 Verde: 300-500 palabras (ideal)
   - 🟠 Naranja: <300 palabras (corto)
   - 🔴 Rojo: >500 palabras (largo)

### 3. Procesar texto manual

1. Ve a la pestaña **"Crear"**
2. Selecciona **"Texto Manual"**
3. Pega o escribe tu texto
4. Sigue los pasos 4-7 de arriba

## 🏗️ Estructura del Proyecto

```
/Users/roger/Code/Machtia/
├── src/
│   ├── app/                      # App Router (Next.js 14)
│   │   ├── api/                  # API Routes
│   │   │   ├── youtube/extract/  # Extracción de transcripciones
│   │   │   └── process/          # Limpieza y chunking
│   │   ├── dashboard/            # Dashboard principal
│   │   ├── login/                # Página de login
│   │   └── signup/               # Página de registro
│   ├── components/               # Componentes React
│   │   ├── ui/                   # shadcn/ui components
│   │   └── dashboard/            # Componentes del dashboard
│   ├── contexts/                 # React Contexts
│   │   └── AuthContext.tsx       # Autenticación
│   ├── lib/                      # Utilidades y servicios
│   │   ├── supabase/             # Clientes de Supabase
│   │   └── services/             # Servicios (YouTube, Gemini, Chunking)
│   └── types/                    # TypeScript types
│       └── database.ts           # Tipos de la base de datos
├── .env.local                    # Variables de entorno (no commitear)
├── .env.example                  # Plantilla de variables
├── package.json
└── README.md
```

## 🔧 Servicios Principales

### YouTubeService (`src/lib/services/youtube.ts`)

- Valida URLs de YouTube
- Extrae transcripciones (prioridad a español)
- Maneja múltiples formatos de URL

### GeminiService (`src/lib/services/gemini.ts`)

- Limpia texto con Gemini 1.5 Flash
- Agrega puntuación y capitalización
- Mantiene conteo de palabras similar (±10%)

### ChunkingService (`src/lib/services/chunking.ts`)

- Divide texto en fragmentos de 300-500 palabras
- Detección de límites de oraciones (español e inglés)
- Superposición de 1 oración entre fragmentos
- Indicadores de calidad codificados por colores

## 🗄️ Base de Datos

La aplicación tiene interfaces TypeScript flexibles para tu schema existente de Supabase:

- `usuario` - Usuarios
- `modulos` - Módulos educativos
- `leccionmodulo` - Lecciones por módulo
- `contenido_leccion` - Contenido de lecciones
- `pregunta` - Preguntas/evaluaciones

**Nota**: Los CRUDs están scaffoldeados y listos para adaptarse cuando finalices el schema.

## 🚢 Deployment

### Vercel (Recomendado)

1. Push a GitHub
2. Importa en Vercel
3. Agrega variables de entorno en Vercel Settings
4. Deploy automático

### Otras plataformas

La aplicación funciona en cualquier plataforma que soporte Next.js 14:
- Railway
- Render
- Netlify
- AWS Amplify

## 📝 API Routes

### `POST /api/youtube/extract`

Extrae transcripción de YouTube

```json
{
  "url": "https://youtube.com/watch?v=..."
}
```

### `POST /api/process/clean`

Limpia texto con Gemini

```json
{
  "text": "texto a limpiar..."
}
```

### `POST /api/process/chunk`

Divide texto en fragmentos

```json
{
  "text": "texto a dividir...",
  "options": {
    "minWords": 200,
    "maxWords": 600,
    "targetWords": 400
  }
}
```

### `POST /api/process/full`

Pipeline completo: extraer → limpiar → chunking

```json
{
  "sourceType": "youtube",
  "sourceContent": "https://youtube.com/watch?v=...",
  "useTextCleaning": true,
  "title": "Título de lección"
}
```

## 🐛 Troubleshooting

### Error: "No se encontraron subtítulos"

- Verifica que el video tenga subtítulos disponibles
- Algunos videos privados o restringidos no permiten extracción

### Error: "GEMINI_API_KEY no está configurada"

- Verifica que `.env.local` existe y tiene la clave correcta
- Reinicia el servidor de desarrollo después de agregar variables

### Error de autenticación Supabase

- Verifica que las credenciales en `.env.local` sean correctas
- Asegúrate de haber habilitado Email Auth en Supabase Dashboard

## 🤝 Contribución

Este es un proyecto interno, pero las mejoras son bienvenidas:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Proyecto privado - Machtia

## 🙏 Créditos

- Inspirado en **MachtiaDesktop** (Swift/SwiftUI)
- UI: [shadcn/ui](https://ui.shadcn.com/)
- Framework: [Next.js 14](https://nextjs.org/)
- Database: [Supabase](https://supabase.com/)
- IA: [Google Gemini](https://ai.google.dev/)
