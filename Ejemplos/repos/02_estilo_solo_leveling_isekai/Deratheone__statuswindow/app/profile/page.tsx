"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Check, Save, Sparkles, AlertTriangle, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AvatarUpload } from "@/components/avatar-upload"
import { motion } from "framer-motion"
import { logoutUser } from "@/utils/auth"
import { DataManager } from "@/components/data-manager"
import { DeleteAccountModal } from "@/components/delete-account-modal"
import { secureSet, secureGet, secureRemove } from "@/utils/secure-storage"

// Avatar options
const avatarOptions = ["🧙‍♂️", "🧙‍♀️", "🦸‍♂️", "🦸‍♀️", "🧝‍♂️", "🧝‍♀️", "🧚‍♂️", "🧚‍♀️", "👨‍🚀", "👩‍🚀"]

// Class options
const classOptions = [
  { value: "warrior", label: "Guerrero", description: "Enfoque en la fuerza física y resistencia" },
  { value: "sage", label: "Sabio", description: "Maestro del conocimiento y el aprendizaje" },
  { value: "mystic", label: "Místico", description: "Equilibrado en mente, cuerpo y espíritu" },
  { value: "adventurer", label: "Aventurero", description: "Versátil y adaptable a cualquier desafío" },
]

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
        <div className="text-white text-xl">Cargando perfil...</div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    characterName: "",
    avatar: "",
    characterClass: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem("statusWindowCurrentUser")
    if (!currentUser) {
      window.location.href = "/login"
      return
    }

    // Get user data
    const users = JSON.parse(localStorage.getItem("statusWindowUsers") || "{}")
    const user = users[currentUser]

    if (!user) {
      window.location.href = "/login"
      return
    }

    // Set user data with a small delay to allow the page to render first
    setTimeout(() => {
      setUserData(user)
      setFormData({
        characterName: user.characterName || "",
        avatar: user.avatar || "🧙‍♂️",
        characterClass: user.characterClass || "mystic",
        password: "",
        newPassword: "",
        confirmPassword: "",
      })
      setLoading(false)
    }, 100)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Validate form
    if (!formData.characterName) {
      toast({
        title: "Error",
        description: "El nombre del personaje es requerido",
        variant: "destructive",
      })
      setIsSaving(false)
      return
    }

    // Check if changing password
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Las nuevas contraseñas no coinciden",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      if (!formData.password) {
        toast({
          title: "Error",
          description: "Se requiere la contraseña actual para cambiarla",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      if (formData.password !== userData.password) {
        toast({
          title: "Error",
          description: "La contraseña actual es incorrecta",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }
    }

    // Update user data
    const currentUser = localStorage.getItem("statusWindowCurrentUser")
    if (!currentUser) return

    const users = JSON.parse(localStorage.getItem("statusWindowUsers") || "{}")
    const user = users[currentUser]

    if (!user) return

    user.characterName = formData.characterName
    user.avatar = formData.avatar
    user.characterClass = formData.characterClass

    if (formData.newPassword) {
      user.password = formData.newPassword
    }

    // Save updated user data
    users[currentUser] = user
    localStorage.setItem("statusWindowUsers", JSON.stringify(users))

    // Show success state
    setSaveSuccess(true)

    // Show toast notification
    toast({
      title: "Éxito",
      description: "Perfil actualizado con éxito",
      variant: "default",
    })

    // Reset success state after animation
    setTimeout(() => {
      setSaveSuccess(false)
      setIsSaving(false)
    }, 2000)

    // Update state
    setUserData(user)
    setFormData({
      ...formData,
      password: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const handleBackToDashboard = () => {
    window.location.href = "/dashboard"
  }

  const handleLogout = () => {
    logoutUser(true) // Clear remembered user as well
    router.push("/login")
  }

  const clearRememberedLogin = () => {
    localStorage.removeItem("statusWindowRememberedUser")
    setShowToast(true)
    setToastMessage("Inicio de sesión automático eliminado con éxito")
  }

  const handleDeleteAccount = (password: string) => {
    setIsDeleting(true)

    // Verify password
    if (password !== userData.password) {
      toast({
        title: "Error",
        description: "Contraseña incorrecta",
        variant: "destructive",
      })
      setIsDeleting(false)
      return
    }

    // Simulate deletion process
    setTimeout(() => {
      try {
        // Get current user
        const currentUser = localStorage.getItem("statusWindowCurrentUser")
        if (!currentUser) return

        // Get users data securely
        const users = secureGet("statusWindowUsers", {})

        // Delete user
        delete users[currentUser]

        // Save updated users data securely
        secureSet("statusWindowUsers", users)

        // Clear current user
        secureRemove("statusWindowCurrentUser")
        secureRemove("statusWindowRememberedUser")

        // Show success toast
        toast({
          title: "Cuenta Eliminada",
          description: "Tu cuenta ha sido eliminada permanentemente",
          variant: "default",
        })

        // Redirect to login page
        setTimeout(() => {
          window.location.href = "/login"
        }, 1500)
      } catch (error) {
        console.error("Error deleting account:", error)
        toast({
          title: "Error",
          description: "Error al eliminar la cuenta. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
        setIsDeleting(false)
      }
    }, 1500)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-950 text-white">
      {/* Navigation */}
      <nav className="container mx-auto p-4 flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-2 order-1">
          <Button
            onClick={handleBackToDashboard}
            variant="ghost"
            className="text-white flex items-center gap-2 hover:text-purple-400 transition-colors p-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm sm:text-base">Volver al Panel</span>
          </Button>
        </div>
        <div className="flex items-center gap-2 order-2 mx-auto">
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
          <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-purple-400">
            StatusWindow
          </h1>
        </div>
        <div className="order-3 w-[60px]"></div>
      </nav>

      <div className="container mx-auto px-2 py-4 sm:p-4">
        <Suspense fallback={<LoadingSpinner />}>
          <Card className="w-full max-w-[95%] sm:max-w-2xl mx-auto border-purple-500/30 bg-slate-800/70 backdrop-blur-sm shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <CardHeader>
              <CardTitle>Editar Perfil</CardTitle>
              <CardDescription className="text-gray-400">Actualiza la información de tu personaje</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="characterName">Nombre del Personaje</Label>
                  <Input
                    id="characterName"
                    name="characterName"
                    value={formData.characterName}
                    onChange={handleInputChange}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Elige Tu Avatar</Label>
                  <div className="flex flex-col items-center">
                    <AvatarUpload
                      currentAvatar={formData.avatar}
                      onAvatarChange={(avatar) => setFormData({ ...formData, avatar })}
                      size="lg"
                    />
                    <div className="mt-4 text-sm text-gray-400">O selecciona uno de los avatares predeterminados:</div>
                    <div className="grid grid-cols-5 gap-1 sm:gap-2 mt-2 w-full">
                      {avatarOptions.map((avatar) => (
                        <button
                          key={avatar}
                          type="button"
                          onClick={() => setFormData({ ...formData, avatar })}
                          className={`text-2xl h-12 w-12 flex items-center justify-center rounded-md ${
                            formData.avatar === avatar
                              ? "bg-purple-600 border-2 border-purple-400"
                              : "bg-slate-700 border border-slate-600 hover:bg-slate-600"
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Elige Tu Clase</Label>
                  <RadioGroup
                    value={formData.characterClass}
                    onValueChange={(value) => setFormData({ ...formData, characterClass: value })}
                    className="space-y-2"
                  >
                    {classOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-start space-x-2 p-2 rounded-md hover:bg-slate-700/50"
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                        <div className="grid gap-1">
                          <Label htmlFor={option.value} className="font-medium">
                            {option.label}
                          </Label>
                          <p className="text-sm text-gray-400">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-lg font-medium mb-4">Cambiar Contraseña</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña Actual</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nueva Contraseña</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <h3 className="text-lg font-medium">Configuración de Inicio de Sesión</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Eliminar inicio de sesión automático</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearRememberedLogin}
                      className="border-red-500/30 text-red-400 hover:bg-red-900/20"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>

                <motion.div whileHover={!isSaving && !saveSuccess ? { scale: 1.02 } : {}} className="relative">
                  <Button
                    type="submit"
                    className={`w-full ${
                      saveSuccess
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    }`}
                    disabled={isSaving || saveSuccess}
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="mr-2 h-4 w-4" /> Cambios Guardados
                      </>
                    ) : isSaving ? (
                      <>
                        <span className="animate-pulse">Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                      </>
                    )}
                  </Button>

                  {saveSuccess && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-green-600 rounded-md"
                    >
                      <Check className="mr-2 h-5 w-5" /> Cambios Guardados
                    </motion.div>
                  )}
                </motion.div>
                <div className="border-t border-slate-700 pt-6 mt-6">
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2 text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    Zona de Peligro
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Una vez que elimines tu cuenta, no podrás recuperarla. Por favor, asegúrate bien.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-900/20 w-full"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar Cuenta
                  </Button>
                </div>
              </form>
              <div className="border-t border-slate-700 pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">Gestión de Datos</h3>
                <DataManager onDataImported={() => window.location.reload()} />
              </div>
            </CardContent>
          </Card>
        </Suspense>
        {/* Delete Account Modal */}
        <DeleteAccountModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirmDelete={handleDeleteAccount}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  )
}
