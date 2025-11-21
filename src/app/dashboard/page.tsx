'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CreateLessonView from '@/components/dashboard/CreateLessonView'
import LessonLibraryView from '@/components/dashboard/LessonLibraryView'

export default function DashboardPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div>
            <h1 className="text-2xl font-bold">Machtia</h1>
            <p className="text-sm text-neutral-600">
              Procesador de Transcripciones de YouTube
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

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <Tabs defaultValue="crear" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="crear">Crear</TabsTrigger>
            <TabsTrigger value="biblioteca">Biblioteca</TabsTrigger>
          </TabsList>

          <TabsContent value="crear" className="mt-6">
            <CreateLessonView />
          </TabsContent>

          <TabsContent value="biblioteca" className="mt-6">
            <LessonLibraryView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
