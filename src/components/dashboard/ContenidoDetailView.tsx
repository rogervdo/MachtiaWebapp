'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  ArrowLeft,
  FileText,
  Trash2,
  Edit,
  Save,
  X,
} from 'lucide-react'
import type { Contenido, Parrafo, Pregunta } from '@/types/database'

interface ContenidoDetailViewProps {
  contenidoId: number
  onBack: () => void
}

export function ContenidoDetailView({ contenidoId, onBack }: ContenidoDetailViewProps) {
  const [contenido, setContenido] = useState<Contenido | null>(null)
  const [parrafos, setParrafos] = useState<Parrafo[]>([])
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingParrafoId, setEditingParrafoId] = useState<number | null>(null)
  const [editedText, setEditedText] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedParrafo, setSelectedParrafo] = useState<Parrafo | null>(null)

  useEffect(() => {
    loadContenidoData()
  }, [contenidoId])

  const loadContenidoData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/contenidos/${contenidoId}`)
      const result = await response.json()

      if (result.success) {
        setContenido(result.data.contenido)
        setParrafos(result.data.parrafos || [])
        setPreguntas(result.data.preguntas || [])
      } else {
        toast.error('Error al cargar el contenido')
      }
    } catch (error) {
      console.error('Error loading contenido:', error)
      toast.error('Error al cargar el contenido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditParrafo = (parrafo: Parrafo) => {
    setEditingParrafoId(parrafo.id)
    setEditedText(parrafo.texto || '')
  }

  const handleSaveParrafo = async (parrafoId: number) => {
    // Note: This would require an API endpoint for updating parrafos
    // For now, we'll just show a toast
    toast.info('Función de edición próximamente')
    setEditingParrafoId(null)
  }

  const handleCancelEdit = () => {
    setEditingParrafoId(null)
    setEditedText('')
  }

  const handleDeleteParrafo = async () => {
    if (!selectedParrafo) return

    try {
      const response = await fetch(`/api/parrafos?id=${selectedParrafo.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Parrafo eliminado exitosamente')
        setShowDeleteDialog(false)
        setSelectedParrafo(null)
        loadContenidoData()
      } else {
        toast.error(result.error || 'Error al eliminar parrafo')
      }
    } catch (error) {
      console.error('Error deleting parrafo:', error)
      toast.error('Error al eliminar parrafo')
    }
  }

  const getTotalWords = () => {
    return parrafos.reduce((total, parrafo) => {
      const words = parrafo.texto?.split(/\s+/).filter(Boolean).length || 0
      return total + words
    }, 0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando contenido...</p>
      </div>
    )
  }

  if (!contenido) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">Contenido no encontrado</p>
        <Button onClick={onBack}>Volver</Button>
      </div>
    )
  }

  const totalWords = getTotalWords()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b pb-6 mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{contenido.titulo}</h1>
              <Badge>{contenido.tipo}</Badge>
            </div>
            <p className="text-muted-foreground">
              {contenido.descripcion || 'Sin descripción'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{parrafos.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Fragmentos</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalWords}</span>
            </div>
            <p className="text-sm text-muted-foreground">Palabras</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{preguntas.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Preguntas</p>
          </div>
        </div>
      </div>

      {/* Parrafos List */}
      <div className="flex-1 overflow-auto">
        {parrafos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay fragmentos</h3>
            <p className="text-muted-foreground">
              Este contenido no tiene fragmentos de texto
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {parrafos.map((parrafo, index) => (
              <ParrafoCard
                key={parrafo.id}
                parrafo={parrafo}
                index={index}
                isEditing={editingParrafoId === parrafo.id}
                editedText={editedText}
                onEditTextChange={setEditedText}
                onEdit={() => handleEditParrafo(parrafo)}
                onSave={() => handleSaveParrafo(parrafo.id)}
                onCancel={handleCancelEdit}
                onDelete={() => {
                  setSelectedParrafo(parrafo)
                  setShowDeleteDialog(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Fragmento</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este fragmento?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteParrafo}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ParrafoCardProps {
  parrafo: Parrafo
  index: number
  isEditing: boolean
  editedText: string
  onEditTextChange: (text: string) => void
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onDelete: () => void
}

function ParrafoCard({
  parrafo,
  index,
  isEditing,
  editedText,
  onEditTextChange,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: ParrafoCardProps) {
  const wordCount = parrafo.texto?.split(/\s+/).filter(Boolean).length || 0
  const getQualityColor = () => {
    if (wordCount < 300) return 'text-orange-600'
    if (wordCount > 500) return 'text-red-600'
    return 'text-green-600'
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Fragmento {index + 1}</CardTitle>
            <CardDescription className={`font-medium ${getQualityColor()}`}>
              {wordCount} palabras
            </CardDescription>
          </div>
          {!isEditing && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editedText}
              onChange={(e) => onEditTextChange(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={onSave}>
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </Button>
              <Button variant="outline" size="sm" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {parrafo.texto || 'Sin texto'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
