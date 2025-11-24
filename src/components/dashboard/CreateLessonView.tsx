'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ChunkPreview } from './ChunkPreview'
import type { ProcessedContent, Modulo } from '@/types/database'

type SourceType = 'youtube' | 'text'

interface CreateLessonViewProps {
  selectedModuleId?: number | null
}

export default function CreateLessonView({ selectedModuleId }: CreateLessonViewProps = {}) {
  const [sourceType, setSourceType] = useState<SourceType>('youtube')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [manualText, setManualText] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDescription, setLessonDescription] = useState('')
  const [useTextCleaning, setUseTextCleaning] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [processedContent, setProcessedContent] = useState<ProcessedContent | null>(null)
  const [saving, setSaving] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [modules, setModules] = useState<Modulo[]>([])
  const [selectedModule, setSelectedModule] = useState<string>(selectedModuleId ? selectedModuleId.toString() : 'new')
  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleDescription, setModuleDescription] = useState('')

  useEffect(() => {
    loadModules()
  }, [])

  useEffect(() => {
    if (selectedModuleId) {
      setSelectedModule(selectedModuleId.toString())
    }
  }, [selectedModuleId])

  const loadModules = async () => {
    try {
      const response = await fetch('/api/modules')
      const result = await response.json()
      if (result.success) {
        setModules(result.data)
      }
    } catch (error) {
      console.error('Error loading modules:', error)
    }
  }

  const handleProcess = async () => {
    const sourceContent = sourceType === 'youtube' ? youtubeUrl : manualText

    if (!sourceContent.trim()) {
      toast.error(
        sourceType === 'youtube'
          ? 'Por favor ingresa una URL de YouTube'
          : 'Por favor ingresa texto para procesar'
      )
      return
    }

    setProcessing(true)
    setProcessedContent(null)

    try {
      const response = await fetch('/api/process/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType,
          sourceContent,
          useTextCleaning,
          title: lessonTitle,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al procesar contenido')
      }

      setProcessedContent(result.data)
      toast.success('Contenido procesado exitosamente')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al procesar contenido'
      )
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setProcessedContent(null)
    setYoutubeUrl('')
    setManualText('')
    setLessonTitle('')
    setLessonDescription('')
    setModuleTitle('')
    setModuleDescription('')
  }

  const handleSaveToDatabase = async () => {
    if (!processedContent) return

    if (!lessonTitle.trim()) {
      toast.error('Por favor ingresa un título para la lección')
      return
    }

    // Determinar si estamos usando un módulo existente o creando uno nuevo
    const isNewModule = selectedModule === 'new'

    if (isNewModule && !moduleTitle.trim()) {
      toast.error('Por favor ingresa un título para el nuevo módulo')
      return
    }

    setSaving(true)

    try {

      const response = await fetch('/api/lessons/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduloId: isNewModule ? undefined : parseInt(selectedModule),
          moduloTitulo: isNewModule ? moduleTitle : undefined,
          moduloDescripcion: isNewModule ? (moduleDescription || undefined) : undefined,
          contenidoTitulo: lessonTitle,
          contenidoDescripcion: lessonDescription || undefined,
          contenidoTipo: sourceType === 'youtube' ? 'video' : 'document',
          videoUrl: sourceType === 'youtube' ? youtubeUrl : undefined,
          chunks: processedContent.chunks.map((chunk, index) => ({
            texto: chunk.text,
            position: index,
          })),
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al guardar la lección')
      }

      toast.success(`Lección guardada exitosamente! ${result.data.parrafosCreated} fragmentos creados.`)
      setShowSaveDialog(false)

      // Opcionalmente reiniciar el formulario después de guardar exitosamente
      // handleReset()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al guardar la lección'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crear Nueva Lección</CardTitle>
          <CardDescription>
            Procesa transcripciones de YouTube o texto manual con IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información de la Lección */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la lección (opcional)</Label>
              <Input
                id="title"
                placeholder="Ej: Cultivo de Café Arábica"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Breve descripción de la lección..."
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Pestañas de Tipo de Origen */}
          <Tabs value={sourceType} onValueChange={(v) => setSourceType(v as SourceType)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
              <TabsTrigger value="text">Texto Manual</TabsTrigger>
            </TabsList>

            <TabsContent value="youtube" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="youtube-url">URL de YouTube</Label>
                <Input
                  id="youtube-url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
                <p className="text-xs text-neutral-600">
                  Formatos soportados: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...
                </p>
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="manual-text">Texto</Label>
                <Textarea
                  id="manual-text"
                  placeholder="Pega o escribe tu texto aquí..."
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  rows={8}
                />
                <p className="text-xs text-neutral-600">
                  Palabras: {manualText.trim().split(/\s+/).filter(w => w.length > 0).length}
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Opción de Limpieza de Texto */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="text-cleaning"
              checked={useTextCleaning}
              onChange={(e) => setUseTextCleaning(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
            <Label htmlFor="text-cleaning" className="text-sm font-normal">
              Limpiar texto con IA (agregar puntuación, capitalización, formato)
            </Label>
          </div>

          {/* Botón de Procesar */}
          <Button
            onClick={handleProcess}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? 'Procesando...' : 'Procesar Contenido'}
          </Button>
        </CardContent>
      </Card>

      {/* Vista Previa del Contenido Procesado */}
      {processedContent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Contenido Procesado</h2>
            <div className="flex gap-2">
              <Button onClick={() => setShowSaveDialog(true)}>
                Guardar en Base de Datos
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Crear Nueva Lección
              </Button>
            </div>
          </div>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-neutral-600">Total de palabras</p>
                  <p className="text-2xl font-bold">{processedContent.metadata.totalWords}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Fragmentos</p>
                  <p className="text-2xl font-bold">{processedContent.metadata.totalChunks}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Tiempo de proceso</p>
                  <p className="text-2xl font-bold">
                    {((processedContent.metadata.processingTime || 0) / 1000).toFixed(1)}s
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Texto limpiado</p>
                  <Badge variant={processedContent.cleanedText ? "default" : "secondary"}>
                    {processedContent.cleanedText ? "Sí" : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vista Previa de Fragmentos */}
          <ChunkPreview chunks={processedContent.chunks} />
        </div>
      )}

      {/* Diálogo de Guardar en Base de Datos */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Guardar Lección en Base de Datos</DialogTitle>
            <DialogDescription>
              Completa la información del módulo para guardar la lección procesada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="module-select">Seleccionar Módulo *</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger id="module-select">
                  <SelectValue placeholder="Selecciona un módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">+ Crear Nuevo Módulo</SelectItem>
                  {modules.map((module) => (
                    <SelectItem key={module.idmodulo} value={module.idmodulo.toString()}>
                      {module.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedModule === 'new' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="module-title">Título del Nuevo Módulo *</Label>
                  <Input
                    id="module-title"
                    placeholder="Ej: Fundamentos de Agricultura"
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="module-description">Descripción del Módulo (opcional)</Label>
                  <Textarea
                    id="module-description"
                    placeholder="Descripción general del módulo..."
                    value={moduleDescription}
                    onChange={(e) => setModuleDescription(e.target.value)}
                    rows={2}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="lesson-title-save">Título de la Lección *</Label>
              <Input
                id="lesson-title-save"
                placeholder="Título de la lección"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
              />
            </div>
            {processedContent && (
              <div className="rounded-md bg-neutral-50 p-3 text-sm">
                <p className="font-medium">Resumen:</p>
                <ul className="mt-2 space-y-1 text-neutral-600">
                  <li>• {processedContent.metadata.totalChunks} fragmentos de texto</li>
                  <li>• {processedContent.metadata.totalWords} palabras totales</li>
                  <li>• Tipo: {sourceType === 'youtube' ? 'Video' : 'Documento'}</li>
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveToDatabase} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Lección'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
