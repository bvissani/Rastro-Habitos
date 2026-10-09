"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowLeft } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { secureSet, secureGet } from "@/utils/secure-storage"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1) // 1: username, 2: security question, 3: new password
  const [forgotUsername, setForgotUsername] = useState("")
  const [securityAnswer, setSecurityAnswer] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [securityQuestion, setSecurityQuestion] = useState("")

  // Security question options
  const securityQuestions = {
    pet: "¿Cómo se llamaba tu primera mascota?",
    school: "¿Cuál era el nombre de tu escuela primaria?",
    city: "¿En qué ciudad naciste?",
    mother: "¿Cuál es el apellido de soltera de tu madre?",
    friend: "¿Cómo se llamaba tu mejor amigo de la infancia?",
    book: "¿Cuál es tu libro favorito?",
    food: "¿Cuál es tu comida favorita?",
  }

  // Check for stored credentials on component mount
  useEffect(() => {
    const checkStoredCredentials = () => {
      const storedUser = localStorage.getItem("statusWindowRememberedUser")

      if (storedUser) {
        try {
          const { username, timestamp } = JSON.parse(storedUser)
          const users = JSON.parse(localStorage.getItem("statusWindowUsers") || "{}")

          // Check if the stored user exists and if the remember me hasn't expired (30 days)
          const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000
          const isValid = Date.now() - timestamp < thirtyDaysInMs

          if (isValid && users[username]) {
            // Auto login
            localStorage.setItem("statusWindowCurrentUser", username)
            router.push("/dashboard")
            return
          } else {
            // Clear invalid stored credentials
            localStorage.removeItem("statusWindowRememberedUser")
          }
        } catch (e) {
          localStorage.removeItem("statusWindowRememberedUser")
        }
      }

      setIsLoading(false)
    }

    checkStoredCredentials()
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    if (!username || !password) {
      setError("Por favor ingresa tanto tu usuario como tu contraseña")
      return
    }

    // Check if user exists using secure storage
    const users = secureGet("statusWindowUsers", {})

    if (users[username] && users[username].password === password) {
      // Set current user
      localStorage.setItem("statusWindowCurrentUser", username)

      // Store credentials if remember me is checked
      if (rememberMe) {
        secureSet(
          "statusWindowRememberedUser",
          {
            username,
            timestamp: Date.now(),
          }
        )
      }

      router.push("/dashboard")
    } else {
      setError("Usuario o contraseña inválidos")
    }
  }

  const handleForgotPasswordStep1 = (e: React.FormEvent) => {
    e.preventDefault()

    if (!forgotUsername) {
      setError("Por favor ingresa tu nombre de usuario")
      return
    }

    const users = secureGet("statusWindowUsers", {})

    if (!users[forgotUsername]) {
      setError("Nombre de usuario no encontrado")
      return
    }

    if (!users[forgotUsername].securityQuestion || !users[forgotUsername].securityAnswer) {
      setError("Esta cuenta no tiene preguntas de seguridad configuradas. Por favor contacta soporte.")
      return
    }

    setSecurityQuestion(users[forgotUsername].securityQuestion)
    setError("")
    setForgotPasswordStep(2)
  }

  const handleForgotPasswordStep2 = (e: React.FormEvent) => {
    e.preventDefault()

    if (!securityAnswer) {
      setError("Por favor responde la pregunta de seguridad")
      return
    }

    const users = secureGet("statusWindowUsers", {})
    const storedAnswer = users[forgotUsername].securityAnswer.toLowerCase().trim()
    const providedAnswer = securityAnswer.toLowerCase().trim()

    if (storedAnswer !== providedAnswer) {
      setError("Respuesta incorrecta a la pregunta de seguridad")
      return
    }

    setError("")
    setForgotPasswordStep(3)
  }

  const handleForgotPasswordStep3 = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || !confirmPassword) {
      setError("Por favor completa ambos campos de contraseña")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    // Update password
    const users = secureGet("statusWindowUsers", {})
    users[forgotUsername].password = newPassword
    secureSet("statusWindowUsers", users)

    // Reset form
    setShowForgotPassword(false)
    setForgotPasswordStep(1)
    setForgotUsername("")
    setSecurityAnswer("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")

    // Show success message
    setError("¡Contraseña actualizada con éxito! Ahora puedes iniciar sesión con tu nueva contraseña.")
  }

  const resetForgotPassword = () => {
    setShowForgotPassword(false)
    setForgotPasswordStep(1)
    setForgotUsername("")
    setSecurityAnswer("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md flex justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <Sparkles className="h-8 w-8 text-yellow-400 animate-spin" />
            <p className="mt-4 text-white">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-400" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-purple-400">
              StatusWindow
            </h1>
          </div>
        </div>

        <Card className="border-purple-500/30 bg-slate-800/70 backdrop-blur-sm text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          <CardHeader>
            <CardTitle className="text-center">
              {showForgotPassword ? "Restablece Tu Contraseña" : "Inicia Sesión en Tu Cuenta"}
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              {showForgotPassword
                ? forgotPasswordStep === 1
                  ? "Ingresa tu usuario para iniciar la recuperación"
                  : forgotPasswordStep === 2
                    ? "Responde a tu pregunta de seguridad"
                    : "Crea una nueva contraseña"
                : "Ingresa tus credenciales para continuar tu aventura"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showForgotPassword ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div
                    className={`border p-3 rounded-md text-sm ${
                      error.includes("éxito") || error.includes("successfully")
                        ? "bg-green-500/20 border-green-500/50 text-green-200"
                        : "bg-red-500/20 border-red-500/50 text-red-200"
                    }`}
                  >
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de Usuario</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="remember-me" className="text-sm text-gray-300 cursor-pointer">
                      Recordarme por 30 días
                    </Label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Iniciar Sesión
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                {forgotPasswordStep === 1 && (
                  <form onSubmit={handleForgotPasswordStep1} className="space-y-4">
                    {error && (
                      <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-md text-sm">
                        {error}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="forgotUsername">Nombre de Usuario</Label>
                      <Input
                        id="forgotUsername"
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Ingresa tu usuario"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Continuar
                    </Button>
                  </form>
                )}

                {forgotPasswordStep === 2 && (
                  <form onSubmit={handleForgotPasswordStep2} className="space-y-4">
                    {error && (
                      <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-md text-sm">
                        {error}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Pregunta de Seguridad</Label>
                      <div className="p-3 bg-slate-700/50 border border-slate-600 rounded-md text-sm">
                        {securityQuestions[securityQuestion as keyof typeof securityQuestions]}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="securityAnswer">Tu Respuesta</Label>
                      <Input
                        id="securityAnswer"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Ingresa tu respuesta"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Verificar Respuesta
                    </Button>
                  </form>
                )}

                {forgotPasswordStep === 3 && (
                  <form onSubmit={handleForgotPasswordStep3} className="space-y-4">
                    {error && (
                      <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-md text-sm">
                        {error}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nueva Contraseña</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Ingresa nueva contraseña"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Confirma nueva contraseña"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Actualizar Contraseña
                    </Button>
                  </form>
                )}

                <Button
                  variant="outline"
                  onClick={resetForgotPassword}
                  className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-900/20"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Iniciar Sesión
                </Button>
              </div>
            )}
          </CardContent>
          {!showForgotPassword && (
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-center text-gray-400">¿Aún no tienes una cuenta?</div>
              <Link href="/onboarding" className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-900/20"
                >
                  Crear Nuevo Personaje
                </Button>
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
