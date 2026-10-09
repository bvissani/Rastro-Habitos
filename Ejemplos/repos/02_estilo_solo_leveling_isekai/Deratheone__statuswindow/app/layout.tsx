import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://statuswindow.vercel.app"),
  title: "StatusWindow - Sube de Nivel Tu Vida Real",
  description: "Transforma tu superación personal en una aventura épica con StatusWindow. Registra atributos, completa misiones y visualiza tu crecimiento con una interfaz de estado estilo RPG y manhwa.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover",
  generator: "Next.js",
  keywords: ["ventana de estado", "desarrollo personal", "productividad gamificada", "interfaz manhwa", "superación personal", "rastreador RPG de vida", "rastreo de hábitos", "desarrollo de habilidades"],
  authors: [{ name: "StatusWindow Team" }],
  openGraph: {
    type: "website",
    locale: "es_419",
    url: "https://statuswindow.vercel.app",
    siteName: "StatusWindow",
    title: "StatusWindow - Sube de Nivel Tu Vida Real",
    description: "Visualiza tu crecimiento personal con una interfaz de ventana de estado inspirada en manhwa y RPG. ¡Registra habilidades, completa misiones y aumenta tus atributos!",
    images: [
      {
        url: "https://statuswindow.vercel.app/dashboard.png",
        width: 1200,
        height: 630,
        alt: "Vista Previa del Panel de StatusWindow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StatusWindow - Superación Personal Estilo RPG",
    description: "Registra el progreso de tu vida real con una interfaz inspirada en manhwa",
    images: ["https://statuswindow.vercel.app/dashboard.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  alternates: {
    canonical: "https://statuswindow.vercel.app",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1e293b" />
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="msapplication-TileColor" content="#1e40af" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "StatusWindow",
              "description": "Registra tu desarrollo personal con una interfaz de ventana de estado inspirada en manhwa y RPG",
              "operatingSystem": "Web",
              "applicationCategory": "LifestyleApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "screenshot": "https://statuswindow.vercel.app/dashboard.png",
              "featureList": "Sistema de progresión de personaje, registro de actividades, tablero de misiones, desarrollo de habilidades",
              "url": "https://statuswindow.vercel.app"
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Suspense>{children}</Suspense>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
