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
      <body className="bg-gray-100">
        <div className="flex h-screen">
          <Sidebar/>
          <div className="flex-1 flex flex-col">
            {/* <Topbar /> */}
            <main className="p-6 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
