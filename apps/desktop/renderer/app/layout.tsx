import './globals.css'
import { Inter } from 'next/font/google'
import { ElectronContextProvider } from '@/components/providers/ElectronContextProvider'
import { AuthProvider } from '../../../../packages/shared/src/context/auth.context'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider
          config={{
            apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
            enableAutoRefresh: true,
            refreshThresholdMinutes: 5
          }}
        >
          <ElectronContextProvider>
            {children}
          </ElectronContextProvider>
        </AuthProvider>
      </body>
    </html>
  )
}