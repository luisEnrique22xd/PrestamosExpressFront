'use client';
import  { useRouter } from "next/navigation";
import { useEffect } from "react";
import  Sidebar  from "../components/sidebar"
import "../globals.css"

export const metadata = {
  title: 'SAPPE - Préstamos Express',
  manifest: '/manifest.json', // Esto vincula el archivo que creamos arriba
  themeColor: '#0047AB',      // Color de la barra de estado en Android
  icons: {
    icon: '/images/icon-192x192.png',
    apple: '/images/icon-192x192.png', // Específico para iPhone
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  useEffect(() => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    router.push('/login'); // Redirección forzada si no hay token
  }
}, []);
  
  return (
    <html lang="es">
      <body className="bg-gray-100 antialiased text-slate-900">
        <div className="flex flex-col md:flex-row min-h-screen">
          
         
          <Sidebar />

          <div className="flex-1 flex flex-col min-w-0">
            <main className="p-4 md:p-10 overflow-y-auto w-full">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
