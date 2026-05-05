'use client';
import  { useRouter } from "next/navigation";
import { useEffect } from "react";
import  Sidebar  from "../components/sidebar"
import "../globals.css"



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
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
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
