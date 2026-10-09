export const metadata = {
  title: 'Rastro Hábitos',
  description: 'Aplicación para el rastreo de hábitos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
