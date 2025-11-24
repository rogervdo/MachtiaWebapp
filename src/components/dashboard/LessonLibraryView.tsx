'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function LessonLibraryView() {
  // Placeholder - will be connected to database
  const lessons: any[] = []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Biblioteca de Lecciones</CardTitle>
          <CardDescription>
            Busca y administra tus lecciones procesadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <Input placeholder="Buscar lecciones..." className="flex-1" />
            <Button variant="outline">Buscar</Button>
          </div>

          {/* Lessons List */}
          {lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-12">
              <div className="text-center">
                <h3 className="text-lg font-medium">No hay lecciones todavía</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Las lecciones que proceses aparecerán aquí.
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  Ve a la pestaña "Crear" para empezar.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson) => (
                <Card key={lesson.id} className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">{lesson.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {lesson.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {lesson.chunks} fragmentos
                      </Badge>
                      <Badge variant="outline">
                        {lesson.words} palabras
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
