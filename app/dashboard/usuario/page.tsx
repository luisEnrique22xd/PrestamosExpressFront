// import { UserCircle, Landmark, ShieldCheck } from "lucide-react";

// // app/dashboard/usuario/page.tsx
// export default function UsuarioPage() {
//   return (
//     <div className="max-w-5xl mx-auto space-y-6">
//       <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex items-center gap-8">
//         <div className="relative">
//           <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-sky-400 to-blue-600 p-1">
//             <img 
//               src="https://i.pravatar.cc/150?u=alexander" 
//               className="w-full h-full rounded-[22px] object-cover border-4 border-white"
//               alt="Profile" 
//             />
//           </div>
//           <button className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-md text-sky-500 border border-slate-50">
//             <UserCircle size={20} />
//           </button>
//         </div>
        
//         <div className="flex-1">
//           <h2 className="text-3xl font-black text-slate-800">Admin</h2>
//           <p className="text-slate-400 font-medium">Administrador General • Sucursal Tlaxcala</p>
//           <div className="flex gap-3 mt-4">
//             <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-wider italic">Sesión Activa</span>
//             <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-wider italic">v1.0.2</span>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Configuración de Préstamos */}
//         {/* <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
//           <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
//             <Landmark size={20} className="text-sky-500" /> Parámetros de Préstamo
//           </h3>
//           <div className="space-y-4">
//             <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
//               <span className="text-sm font-medium text-slate-600">Interés Global Sugerido</span>
//               <span className="font-bold text-slate-800">10%</span>
//             </div>
//             <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
//               <span className="text-sm font-medium text-slate-600">Monto Máximo (Sin Aval)</span>
//               <span className="font-bold text-slate-800">$3,000</span>
//             </div>
//           </div>
//         </div> */}

//         {/* Seguridad */}
//         <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
//           <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
//             <ShieldCheck size={20} className="text-sky-500" /> Seguridad de Cuenta
//           </h3>
//           <button className="w-full py-3 px-4 bg-slate-50 text-slate-600 font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-100 transition-all text-left">
//             Cambiar Contraseña Administrador
//           </button>
//           <button className="w-full mt-3 py-3 px-4 bg-red-50 text-red-500 font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-red-100 transition-all text-left">
//             Cerrar Sesión del Sistema
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import { UserCircle, Landmark, ShieldCheck, LogOut, Key, Settings, MapPin } from "lucide-react";

// --- COLORES INSTITUCIONALES ---
const COLORS = {
  azulRey: '#0047AB',
  azulOscuro: '#050533',
  verdeExito: '#10B981',
  rojoAlerta: '#DC2626',
};

export default function UsuarioPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      
      {/* CARD DE PERFIL PRINCIPAL */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-20 -mt-20 z-0"></div>
        
        <div className="relative z-10">
          <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-tr from-[#0047AB] to-[#050533] p-1.5 shadow-2xl shadow-blue-900/20">
            <div className="w-full h-full rounded-[2.2rem] bg-white overflow-hidden border-4 border-white">
              <img 
                src="https://i.pravatar.cc/150?u=alexander" 
                className="w-full h-full object-cover"
                alt="Profile" 
              />
            </div>
          </div>
          <button className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl shadow-xl text-[#0047AB] border border-slate-50 hover:scale-110 transition-transform">
            <Settings size={22} />
          </button>
        </div>
        
        <div className="flex-1 relative z-10 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Alexander</h2>
            <span className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100 self-center">
              En Línea
            </span>
          </div>
          <p className="text-slate-400 font-bold flex items-center justify-center md:justify-start gap-2 uppercase text-xs tracking-widest">
            <MapPin size={14} className="text-[#0047AB]" /> Administrador General • Sucursal Tlaxcala
          </p>
          
          <div className="flex justify-center md:justify-start gap-4 mt-6">
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase">Versión</p>
                <p className="text-xs font-bold text-slate-700 font-mono tracking-tighter">v1.0.2-stable</p>
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase">Último Acceso</p>
                <p className="text-xs font-bold text-slate-700 tracking-tighter">Hoy, 13:24 PM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* PARÁMETROS GLOBALES DEL SISTEMA */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 italic uppercase tracking-tighter text-lg">
            <div className="p-2 bg-blue-50 rounded-xl text-[#0047AB]">
              <Landmark size={20} />
            </div>
            Configuración de Préstamos
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-5 bg-slate-50 rounded-[1.5rem] border border-transparent hover:border-blue-100 hover:bg-white transition-all group">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Interés Sugerido</span>
              <div className="flex items-center gap-3">
                <span className="font-black text-[#0047AB] text-xl">10%</span>
                <button className="text-[10px] font-bold text-blue-400 hover:text-blue-600 uppercase">Editar</button>
              </div>
            </div>
            <div className="flex justify-between items-center p-5 bg-slate-50 rounded-[1.5rem] border border-transparent hover:border-blue-100 hover:bg-white transition-all group">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Tope sin Aval</span>
              <div className="flex items-center gap-3">
                <span className="font-black text-slate-800 text-xl">$3,000</span>
                <button className="text-[10px] font-bold text-blue-400 hover:text-blue-600 uppercase">Editar</button>
              </div>
            </div>
          </div>
        </div>

        {/* SEGURIDAD Y SESIÓN */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 italic uppercase tracking-tighter text-lg">
            <div className="p-2 bg-blue-50 rounded-xl text-[#0047AB]">
              <ShieldCheck size={20} />
            </div>
            Seguridad de Cuenta
          </h3>
          
          <div className="space-y-3">
            <button className="group w-full p-5 bg-slate-50 hover:bg-[#0047AB] rounded-[1.5rem] transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl text-slate-400 group-hover:text-[#0047AB]">
                  <Key size={18} />
                </div>
                <span className="text-xs font-black text-slate-600 group-hover:text-white uppercase tracking-widest">Cambiar Contraseña</span>
              </div>
              <span className="text-slate-300 group-hover:text-white/50">→</span>
            </button>

            <button className="group w-full p-5 bg-red-50 hover:bg-red-600 rounded-[1.5rem] transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl text-red-400">
                  <LogOut size={18} />
                </div>
                <span className="text-xs font-black text-red-600 group-hover:text-white uppercase tracking-widest">Cerrar Sesión</span>
              </div>
              <span className="text-red-200 group-hover:text-white/50">→</span>
            </button>
          </div>
          
          <p className="text-[9px] text-slate-300 font-bold uppercase mt-8 text-center tracking-[0.3em]">
            ID de Dispositivo: TLAX-ADM-01
          </p>
        </div>
      </div>
    </div>
  );
}