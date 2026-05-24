import './globals.css'

export const metadata = {
  metadataBase: new URL('https://youssefjarray.github.io'),
  title: 'Youssef Jarray | Game Dev & Software Engineer',
  description: 'Portfolio of Youssef Jarray — Software Engineering student, game developer, and designer. Building real-time experiences with Unity, C++, and modern web technologies.',
  keywords: ['Youssef Jarray', 'game developer', 'software engineer', 'Unity', 'portfolio', 'VR'],
  authors: [{ name: 'Youssef Jarray' }],
  openGraph: {
    title: 'Youssef Jarray | Game Dev & Software Engineer',
    description: 'Building real-time experiences with Unity, C++, and modern web technologies.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
