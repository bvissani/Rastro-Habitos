"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Brain, Dumbbell, Sparkles } from "lucide-react"

interface ActivityVerificationProps {
  isOpen: boolean
  onClose: () => void
  activityData: any
  onVerify: (verified: boolean) => void
}

export function ActivityVerification({ isOpen, onClose, activityData, onVerify }: ActivityVerificationProps) {
  const [verificationText, setVerificationText] = useState("")
  const [error, setError] = useState("")

  const getVerificationQuestion = () => {
    switch (activityData.type) {
      case "strength":
        return "Por favor describe qué actividad física realizaste y qué desafío representó:"
      case "intelligence":
        return "Por favor describe qué aprendiste o cómo esta actividad mejoró tus conocimientos:"
      case "mana":
        return "Por favor describe cómo esta actividad mejoró tu bienestar mental o creatividad:"
      default:
        return "Por favor verifica que completaste esta actividad:"
    }
  }

  const handleVerify = () => {
    if (verificationText.length < 10) {
      setError("Por favor ingresa una respuesta más detallada (al menos 10 caracteres)")
      return
    }

    onVerify(true)
    setVerificationText("")
    setError("")
  }

  const handleCancel = () => {
    onVerify(false)
    setVerificationText("")
    setError("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {activityData.type === "strength" && <Dumbbell className="h-5 w-5 text-red-400" />}
            {activityData.type === "intelligence" && <Brain className="h-5 w-5 text-blue-400" />}
            {activityData.type === "mana" && <Sparkles className="h-5 w-5 text-purple-400" />}
            Verificar Actividad
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Para asegurar un registro preciso, verifica que completaste esta actividad.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-slate-700/50 p-3 rounded-md border border-slate-600">
            <div className="font-medium text-lg">{activityData.name}</div>
            {activityData.description && <div className="text-slate-300 mt-1">{activityData.description}</div>}
            <div className="mt-2 text-sm text-yellow-400">
              +{activityData.value}{" "}
              {activityData.type === "strength"
                ? "Fuerza"
                : activityData.type === "intelligence"
                  ? "Inteligencia"
                  : "Maná"}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="verification" className="text-sm font-medium text-slate-200">
              {getVerificationQuestion()}
            </label>
            <Textarea
              id="verification"
              value={verificationText}
              onChange={(e) => {
                setVerificationText(e.target.value)
                if (e.target.value.length >= 10) {
                  setError("")
                }
              }}
              placeholder="Escribe tu verificación aquí..."
              className="bg-slate-700/50 border-slate-600 text-white min-h-[100px]"
            />
            {error && <div className="text-red-400 text-sm">{error}</div>}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleVerify}
            className={`w-full sm:w-auto ${
              activityData.type === "strength"
                ? "bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700"
                : activityData.type === "intelligence"
                  ? "bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700"
                  : "bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700"
            }`}
          >
            Verificar y Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
