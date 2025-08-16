import './globals.css'
import { Inter } from 'next/font/google'
import { ElectronContextProvider } from '@/components/providers/ElectronContextProvider'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ElectronContextProvider>
          {children}
        </ElectronContextProvider>
      </body>
    </html>
  )
}