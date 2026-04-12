export const metadata = {
  title: 'Fridge Chef',
  description: 'AI-Powered Recipe Generator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}