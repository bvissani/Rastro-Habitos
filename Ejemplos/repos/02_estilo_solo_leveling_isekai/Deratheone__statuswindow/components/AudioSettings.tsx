"use client"
import { useAudio } from "@/contexts/AudioContext"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX, Play } from "lucide-react"
import type { SoundType } from "@/utils/audioManager"

interface AudioSettingsProps {
  className?: string
}

export function AudioSettings({ className = "" }: AudioSettingsProps) {
  const { settings, setVolume, toggleMute, toggleSound, setEnabled, playSound } = useAudio()

  const soundLabels: Record<SoundType, string> = {
    XP_GAIN: "Ganancia de EXP",
    LEVEL_UP: "Subida de Nivel",
    QUEST_COMPLETE: "Misión Completada",
    ACTIVITY_LOG: "Registro de Actividad",
    UI_CLICK: "Clic en Interfaz",
    NOTIFICATION: "Notificación",
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  const handleTestSound = async (soundType: SoundType) => {
    try {
      await playSound(soundType)
    } catch (error) {
      console.warn("Failed to test sound:", error)
    }
  }

  return (
    <div className={`bg-slate-800 rounded-lg p-6 border border-slate-700 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-6">Configuración de Audio</h3>

      {/* Controles Principales */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-white font-medium">Audio Habilitado</label>
          <Button
            variant={settings.isEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setEnabled(!settings.isEnabled)}
            className="min-w-[80px]"
          >
            {settings.isEnabled ? "Sí" : "No"}
          </Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <label className="text-white font-medium">Volumen General</label>
          <div className="flex items-center gap-3 flex-1 max-w-xs ml-4">
            <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:text-yellow-400">
              {settings.isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </Button>
            <Slider
              value={[settings.volume]}
              onValueChange={handleVolumeChange}
              max={1}
              min={0}
              step={0.1}
              className="flex-1"
              disabled={!settings.isEnabled}
            />
            <span className="text-white text-sm min-w-[3ch]">{Math.round(settings.volume * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Controles de Sonidos Individuales */}
      <div>
        <h4 className="text-white font-medium mb-4">Sonidos Individuales</h4>
        <div className="space-y-3">
          {Object.entries(soundLabels).map(([soundType, label]) => (
            <div key={soundType} className="flex items-center justify-between">
              <span className="text-white">{label}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTestSound(soundType as SoundType)}
                  disabled={!settings.isEnabled || settings.isMuted}
                  className="text-white hover:text-yellow-400"
                >
                  <Play size={16} />
                </Button>
                <Button
                  variant={settings.soundToggles[soundType as SoundType] ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSound(soundType as SoundType)}
                  disabled={!settings.isEnabled}
                  className="min-w-[60px]"
                >
                  {settings.soundToggles[soundType as SoundType] ? "Sí" : "No"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
