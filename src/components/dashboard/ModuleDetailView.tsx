'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Plus,
  FileText,
  Video,
  FileQuestion,
  File,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react'
import type { Modulo, LeccionWithContenido, Contenido } from '@/types/database'

interface ModuleDetailViewProps {
  moduleId: number
  onBack: () => void
  onViewContenido: (contenidoId: number) => void
  onCreateContenido: (moduleId: number) => void
}

export function ModuleDetailView({
  moduleId,
  onBack,
  onViewContenido,
  onCreateContenido,
}: ModuleDetailViewProps) {
  const [module, setModule] = useState<Modulo | null>(null)
  const [lecciones, setLecciones] = useState<LeccionWithContenido[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedContenido, setSelectedContenido] = useState<Contenido | null>(null)

  useEffect(() => {
    loadModuleData()
  }, [moduleId])

  const loadModuleData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/modules/${moduleId}`)
      const result = await response.json()

      if (result.success) {
        setModule(result.data.modulo)
        setLecciones(result.data.lecciones || [])
      } else {
        toast.error('Error al cargar el módulo')
      }
    } catch (error) {
      console.error('Error loading module:', error)
      toast.error('Error al cargar el módulo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteContenido = async () => {
    if (!selectedContenido) return

    try {
      const response = await fetch(`/api/contenidos/${selectedContenido.idleccion}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Contenido eliminado exitosamente')
        setShowDeleteDialog(false)
        setSelectedContenido(null)
        loadModuleData()
      } else {
        toast.error(result.error || 'Error al eliminar contenido')
      }
    } catch (error) {
      console.error('Error deleting contenido:', error)
      toast.error('Error al eliminar contenido')
    }
  }

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'video':
        return <Video className="h-5 w-5" />
      case 'quiz':
        return <FileQuestion className="h-5 w-5" />
      case 'document':
        return <File className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTypeBadge = (tipo: string) => {
    const colors = {
      lesson: 'bg-blue-100 text-blue-800',
      video: 'bg-red-100 text-red-800',
      document: 'bg-green-100 text-green-800',
      quiz: 'bg-purple-100 text-purple-800',
    }
    return colors[tipo as keyof typeof colors] || colors.lesson
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando módulo...</p>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">Módulo no encontrado</p>
        <Button onClick={onBack}>Volver</Button>
      </div>
    )
  }

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
          Volver a Módulos
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{module.titulo}</h1>
            <p className="text-muted-foreground">
              {module.descripcion || 'Sin descripción'}
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{lecciones.length} lecciones</span>
              </div>
            </div>
          </div>
          <Button onClick={() => onCreateContenido(moduleId)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Contenido
          </Button>
        </div>
      </div>

      {/* Lessons List */}
      <div className="flex-1 overflow-auto">
        {lecciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay contenido</h3>
            <p className="text-muted-foreground mb-4">
              Agrega el primer contenido a este módulo
            </p>
            <Button onClick={() => onCreateContenido(moduleId)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Contenido
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {lecciones.map((leccion) => {
              const contenido = leccion.contenido
              if (!contenido) return null

              return (
                <ContenidoCard
                  key={leccion.id}
                  contenido={contenido}
                  onView={() => onViewContenido(contenido.idleccion)}
                  onDelete={() => {
                    setSelectedContenido(contenido)
                    setShowDeleteDialog(true)
                  }}
                  getTypeIcon={getTypeIcon}
                  getTypeBadge={getTypeBadge}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Contenido</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar &quot;{selectedContenido?.titulo}&quot;?
              Esta acción no se puede deshacer y eliminará todos los parrafos asociados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteContenido}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ContenidoCardProps {
  contenido: Contenido
  onView: () => void
  onDelete: () => void
  getTypeIcon: (tipo: string) => React.ReactNode
  getTypeBadge: (tipo: string) => string
}

function ContenidoCard({
  contenido,
  onView,
  onDelete,
  getTypeIcon,
  getTypeBadge,
}: ContenidoCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            {getTypeIcon(contenido.tipo)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <CardTitle className="text-lg leading-tight">
                {contenido.titulo}
              </CardTitle>
              <Badge className={getTypeBadge(contenido.tipo)}>
                {contenido.tipo}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">
              {contenido.descripcion || 'Sin descripción'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {contenido.created_at && (
              <span>
                Creado: {new Date(contenido.created_at).toLocaleDateString('es-MX')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" onClick={onView}>
              <Eye className="mr-2 h-4 w-4" />
              Ver
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
