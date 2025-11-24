'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Search, Plus, BookOpen, Trash2, Edit, FileText } from 'lucide-react'
import type { Modulo, ModuloWithLecciones } from '@/types/database'

interface ModuleLibraryViewProps {
  onViewModule?: (moduleId: number) => void
}

export function ModuleLibraryView({ onViewModule }: ModuleLibraryViewProps = {}) {
  const [modules, setModules] = useState<ModuloWithLecciones[]>([])
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedModule, setSelectedModule] = useState<Modulo | null>(null)
  const [formData, setFormData] = useState({ titulo: '', descripcion: '' })

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/modules')
      const result = await response.json()

      if (result.success) {
        // Cargar conteos de lecciones para cada módulo
        const modulesWithLessons = await Promise.all(
          result.data.map(async (module: Modulo) => {
            const detailResponse = await fetch(`/api/modules/${module.idmodulo}`)
            const detailResult = await detailResponse.json()
            return {
              ...module,
              lecciones: detailResult.success ? detailResult.data.lecciones : [],
            }
          })
        )
        setModules(modulesWithLessons)
      } else {
        toast.error('Error al cargar módulos')
      }
    } catch (error) {
      console.error('Error loading modules:', error)
      toast.error('Error al cargar módulos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateModule = async () => {
    if (!formData.titulo.trim()) {
      toast.error('El título es requerido')
      return
    }

    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Módulo creado exitosamente')
        setShowCreateDialog(false)
        setFormData({ titulo: '', descripcion: '' })
        loadModules()
      } else {
        toast.error(result.error || 'Error al crear módulo')
      }
    } catch (error) {
      console.error('Error creating module:', error)
      toast.error('Error al crear módulo')
    }
  }

  const handleUpdateModule = async () => {
    if (!selectedModule || !formData.titulo.trim()) {
      toast.error('El título es requerido')
      return
    }

    try {
      const response = await fetch(`/api/modules/${selectedModule.idmodulo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Módulo actualizado exitosamente')
        setShowEditDialog(false)
        setSelectedModule(null)
        setFormData({ titulo: '', descripcion: '' })
        loadModules()
      } else {
        toast.error(result.error || 'Error al actualizar módulo')
      }
    } catch (error) {
      console.error('Error updating module:', error)
      toast.error('Error al actualizar módulo')
    }
  }

  const handleDeleteModule = async () => {
    if (!selectedModule) return

    try {
      const response = await fetch(`/api/modules/${selectedModule.idmodulo}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Módulo eliminado exitosamente')
        setShowDeleteDialog(false)
        setSelectedModule(null)
        loadModules()
      } else {
        toast.error(result.error || 'Error al eliminar módulo')
      }
    } catch (error) {
      console.error('Error deleting module:', error)
      toast.error('Error al eliminar módulo')
    }
  }

  const filteredModules = modules.filter((module) =>
    module.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
    (module.descripcion?.toLowerCase().includes(searchText.toLowerCase()) ?? false)
  )

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado */}
      <div className="border-b pb-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Biblioteca de Módulos</h1>
            <p className="text-muted-foreground mt-1">
              {modules.length} módulos creados
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Módulo
          </Button>
        </div>

        {/* Barra de Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar módulos..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de Módulos */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Cargando módulos...</p>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchText ? 'No se encontraron módulos' : 'No hay módulos'}
            </h3>
            {!searchText && (
              <p className="text-muted-foreground mb-4">
                Crea tu primer módulo para comenzar
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((module) => (
              <ModuleCard
                key={module.idmodulo}
                module={module}
                onView={() => onViewModule?.(module.idmodulo)}
                onEdit={() => {
                  setSelectedModule(module)
                  setFormData({
                    titulo: module.titulo,
                    descripcion: module.descripcion || '',
                  })
                  setShowEditDialog(true)
                }}
                onDelete={() => {
                  setSelectedModule(module)
                  setShowDeleteDialog(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Diálogo de Crear Módulo */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Módulo</DialogTitle>
            <DialogDescription>
              Crea un nuevo módulo educativo para organizar tus lecciones
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                placeholder="Ej: Introducción al Café"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe el contenido del módulo..."
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateModule}>Crear Módulo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Editar Módulo */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Módulo</DialogTitle>
            <DialogDescription>
              Actualiza la información del módulo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-titulo">Título</Label>
              <Input
                id="edit-titulo"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-descripcion">Descripción</Label>
              <Textarea
                id="edit-descripcion"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateModule}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Módulo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar &quot;{selectedModule?.titulo}&quot;?
              Esta acción no se puede deshacer y eliminará todas las lecciones asociadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteModule}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ModuleCardProps {
  module: ModuloWithLecciones
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

function ModuleCard({ module, onView, onEdit, onDelete }: ModuleCardProps) {
  const lessonCount = module.lecciones?.length || 0

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onView}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">{module.titulo}</CardTitle>
            <CardDescription className="line-clamp-2">
              {module.descripcion || 'Sin descripción'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{lessonCount} lecciones</span>
            </div>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
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
