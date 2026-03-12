// // components/Sidebar.tsx
// 'use client';
// import { LayoutDashboard, PieChart, Landmark, Coins, Calendar, MessageSquare, User, CalendarSearch, Users } from 'lucide-react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import Image from 'next/image';

// const menuItems = [
//   { icon: LayoutDashboard, label: 'Dashboard', active: true, href:'/dashboard' },
//   { icon: PieChart, label: 'Estadisticas', href:'/dashboard/estadisticas'},
//   { icon: PieChart, label: 'Estadisticas cartera vencida', href:'/dashboard/cartera-vencida' },
//   { icon: Users, label: 'Clientes', href:'/dashboard/clientes' },
//   { icon: Coins, label: 'Prestamos', href:'/dashboard/prestamos' },
//   { icon: Calendar, label: 'Calendario',href:'/dashboard/calendario' },
//   { icon: MessageSquare, label: 'Pagos', href:'/dashboard/pagos' },
//   { icon: CalendarSearch, label: 'Simulador', href:'/dashboard/simulador' },
//   { icon: User, label: 'Perfil de usuario', href:'/dashboard/usuario' },

// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   return (
//     <aside className="w-64 bg-[#050533] text-slate-400 p-6 flex flex-col h-screen sticky top-0">
//       <div className="flex items-center gap-2 mb-10 px-2">
//         {/* <div className="bg-sky-400 p-1.5 rounded-lg">
//           <div className="w-5 h-5 bg-white rounded-sm rotate-45" />
//         </div> */}
//          {/* <img src="./public/images/logoprestamos.jpeg" alt="logo prestamos express" /> */}
//         <Image 
//     src="/images/logo.png" 
//     alt="Logo Prestamos Express" 
//     width={80} 
//     height={80}
//     className="rounded-lg" // Si quieres redondear las esquinas
//   />
//         <span className="text-white font-bold text-xl tracking-tight">Prestamos Express</span>
//       </div>
//       <nav className="flex-1 space-y-1">
//         {menuItems.map((item) => {
//           const isActive = pathname === item.href; // Compara la ruta actual

//           return (
//             <Link 
//               key={item.label} 
//               href={item.href}
//               className={`flex items-center justify-between p-3 rounded-xl transition-all ${
//                 isActive 
//                   ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-900/50' 
//                   : 'text-slate-400 hover:bg-white/5'
//               }`}
//             >
//               <div className="flex items-center gap-3 text-sm font-medium">
//                 <item.icon size={18} />
//                 <span>{item.label}</span>
//               </div>
            
//             </Link>
//           );
//         })}
//       </nav>

//       <div className="mt-auto space-y-6">
//         <div className="bg-blue-900/20 p-4 rounded-2xl border border-blue-800/30">
//           <p className="text-xs font-bold text-white mb-1">PDF Reporte</p>
//           <p className="text-[10px] mb-3 text-slate-400">Descargar Reporte</p>
//           <button className="w-full bg-blue-800/40 hover:bg-blue-700/50 text-sky-400 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2">
//             Download <span>↓</span>
//           </button>
//         </div>

//         <div className="flex items-center justify-between px-2">
//           <span className="text-xs font-medium">Dark Mode</span>
//           <div className="w-10 h-5 bg-slate-700 rounded-full relative">
//             <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }
'use client';
import { 
  LayoutDashboard, PieChart, Landmark, Coins, Calendar, 
  MessageSquare, User, CalendarSearch, Users, FileText, 
  LogOut, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: PieChart, label: 'Estadísticas', href: '/dashboard/estadisticas' },
  { icon: ShieldAlert, label: 'Cartera Vencida', href: '/dashboard/cartera-vencida' },
  { icon: Users, label: 'Clientes', href: '/dashboard/clientes' },
  { icon: Coins, label: 'Préstamos', href: '/dashboard/prestamos' },
  { icon: Calendar, label: 'Calendario', href: '/dashboard/calendario' },
  { icon: MessageSquare, label: 'Pagos', href: '/dashboard/pagos' },
  { icon: CalendarSearch, label: 'Simulador', href: '/dashboard/simulador' },
  { icon: User, label: 'Perfil Usuario', href: '/dashboard/usuario' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const handleLogout = () => {
    Cookies.remove('access_token'); // Limpiar cookie
  // 1. Eliminamos los tokens del almacenamiento local
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');

  // 2. (Opcional) Si manejas estados globales con Context, aquí lo reseteas
  
  // 3. Redirigimos al usuario fuera del área protegida
  router.push('/login');
};
  return (
    <aside className="w-72 bg-[#050533] text-slate-400 p-8 flex flex-col h-screen sticky top-0 shadow-2xl z-50 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      
      {/* SECCIÓN DEL LOGO SIN FONDO BLANCO */}
      <div className="flex flex-col items-center gap-4 mb-12 border-b border-white/5 pb-8 shrink-0">
        <div className="relative w-20 h-20">
          <Image 
            src="/images/logo.png" 
            alt="Logo Prestamos Express"
            width={80}
            height={80} 
            className="object-contain" // Mantiene la transparencia y forma del logo
            priority
          />
        </div>
        <div className="text-center">
          <span className="text-white font-black text-lg tracking-tighter block leading-none uppercase">Préstamos Express</span>
          <span className="text-[10px] text-sky-500 font-black uppercase tracking-[0.3em] mt-2 block">Management v1.0</span>
        </div>
      </div>

      {/* NAVEGACIÓN */}
      <nav className="flex-1 space-y-2 pr-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex items-center group p-4 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-[#0047AB] text-white shadow-lg shadow-blue-900/60' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                <item.icon size={20} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-sky-400'} transition-colors`} />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER - REPORTES */}
      <div className="mt-auto pt-8 border-t border-white/5 space-y-6 shrink-0">
        

        {/* CERRAR SESIÓN */}
        <button 
        onClick={handleLogout}
         className="flex items-center gap-4 px-4 py-2 w-full text-slate-500 hover:text-red-400 transition-colors group mb-2">
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}