import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'CS Logger',
  description: 'Log and review IGCSE Computer Science questions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <Link href="/">
              <h1>CS Logger</h1>
            </Link>
            <nav>
              <Link href="/log" className="btn">
                + New Log Entry
              </Link>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
