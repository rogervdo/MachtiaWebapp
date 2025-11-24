'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CreateLessonView from '@/components/dashboard/CreateLessonView'
import { ModuleLibraryView } from '@/components/dashboard/ModuleLibraryView'
import { ModuleDetailView } from '@/components/dashboard/ModuleDetailView'
import { ContenidoDetailView } from '@/components/dashboard/ContenidoDetailView'

type View = 'modules' | 'module-detail' | 'contenido-detail'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [currentView, setCurrentView] = useState<View>('modules')
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)
  const [selectedContenidoId, setSelectedContenidoId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('biblioteca')

  const handleViewModule = (moduleId: number) => {
    setSelectedModuleId(moduleId)
    setCurrentView('module-detail')
  }

  const handleViewContenido = (contenidoId: number) => {
    setSelectedContenidoId(contenidoId)
    setCurrentView('contenido-detail')
  }

  const handleCreateContenido = (moduleId: number) => {
    setSelectedModuleId(moduleId)
    setActiveTab('crear')
  }

  const handleBackToModules = () => {
    setCurrentView('modules')
    setSelectedModuleId(null)
    setSelectedContenidoId(null)
  }

  const handleBackToModuleDetail = () => {
    setCurrentView('module-detail')
    setSelectedContenidoId(null)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Encabezado */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div>
            <h1 className="text-2xl font-bold">Machtia</h1>
            <p className="text-sm text-neutral-600">
              Plataforma de Gestión de Contenido Educativo
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="crear">Crear Contenido</TabsTrigger>
            <TabsTrigger
              value="biblioteca"
              onClick={() => {
                setCurrentView('modules')
                setSelectedModuleId(null)
                setSelectedContenidoId(null)
              }}
            >
              Biblioteca
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crear" className="mt-6">
            <CreateLessonView selectedModuleId={selectedModuleId} />
          </TabsContent>

          <TabsContent value="biblioteca" className="mt-6">
            {currentView === 'modules' && (
              <ModuleLibraryView onViewModule={handleViewModule} />
            )}

            {currentView === 'module-detail' && selectedModuleId && (
              <ModuleDetailView
                moduleId={selectedModuleId}
                onBack={handleBackToModules}
                onViewContenido={handleViewContenido}
                onCreateContenido={handleCreateContenido}
              />
            )}

            {currentView === 'contenido-detail' && selectedContenidoId && (
              <ContenidoDetailView
                contenidoId={selectedContenidoId}
                onBack={handleBackToModuleDetail}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
