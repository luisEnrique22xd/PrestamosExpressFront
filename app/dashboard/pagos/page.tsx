
// import { Search } from "lucide-react";


// // app/dashboard/pagos/page.tsx
// export default function PagosPage() {
//   return (
//     <div className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
//       <h2 className="text-2xl font-bold text-slate-800 mb-2">Registrar Abono</h2>
//       <p className="text-slate-400 text-sm mb-8">Ingrese el pago recibido para actualizar el saldo del cliente.</p>

//       <form className="space-y-6">
//         <div className="space-y-2">
//           <label className="text-xs font-bold text-slate-400 uppercase ml-2">ID o Nombre del Cliente</label>
//           <div className="relative">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
//             <input className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-sky-400" placeholder="Buscar para cobrar..." />
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-6">
//           <div className="space-y-2">
//             <label className="text-xs font-bold text-slate-400 uppercase ml-2">Cantidad a Pagar</label>
//             <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-sky-400 font-bold text-indigo-900" placeholder="$0.00" />
//           </div>
//           <div className="space-y-2">
//             <label className="text-xs font-bold text-slate-400 uppercase ml-2">Fecha del Abono</label>
//             <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-sky-400" defaultValue="2026-02-10" />
//           </div>
//         </div>

//         <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-2">
//           <p className="text-[10px] font-bold text-emerald-600 uppercase">Resumen de Cuenta</p>
//           <div className="flex justify-between">
//             <span className="text-sm text-slate-600">Saldo Pendiente:</span>
//             <span className="text-sm font-bold text-slate-800">$4,500.00</span>
//           </div>
//           <div className="flex justify-between border-t border-emerald-200 pt-2">
//             <span className="text-sm font-bold text-emerald-800">Nuevo Saldo tras pago:</span>
//             <span className="text-sm font-black text-emerald-800">$?.??</span>
//           </div>
//         </div>

//         <button className="w-full py-5 bg-sky-500 text-white font-black rounded-2xl shadow-xl shadow-sky-200 hover:bg-sky-600 transition-all uppercase tracking-widest">
//           Confirmar y Registrar Pago
//         </button>
//       </form>
//     </div>
//   );
// }
"use client";
import { Search, DollarSign, Calendar, CheckCircle2 } from "lucide-react";

// --- COLORES INSTITUCIONALES ---
const COLORS = {
  azulRey: '#0047AB',
  azulOscuro: '#050533',
  verdeExito: '#10B981',
  fondoGris: '#F8FAFE'
};

export default function PagosPage() {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
        {/* DECORACIÓN DE FONDO */}
        <div className="absolute -top-10 -right-10 opacity-5 text-[#0047AB]">
          <DollarSign size={200} />
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-800 mb-2 italic tracking-tighter">Registrar Abono</h2>
          <p className="text-slate-400 text-sm mb-10 font-medium">Actualice el saldo del cliente de forma inmediata.</p>

          <form className="space-y-8">
            {/* BÚSQUEDA DE CLIENTE */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.2em]">Identificación del Cliente</label>
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0047AB] transition-colors" size={20} />
                <input 
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-[#0047AB] focus:bg-white transition-all font-bold text-slate-700 shadow-inner" 
                  placeholder="ID, Nombre o CURP..." 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CANTIDAD */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.2em]">Cantidad a Recibir</label>
                <div className="relative group">
                   <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-[#10B981]">$</span>
                   <input 
                    type="number" 
                    className="w-full pl-10 pr-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-[#10B981] focus:bg-white transition-all font-black text-2xl text-[#050533]" 
                    placeholder="0.00" 
                  />
                </div>
              </div>

              {/* FECHA */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.2em]">Fecha de Operación</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="date" 
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-[#0047AB] focus:bg-white transition-all font-bold text-slate-600" 
                    defaultValue="2026-02-10" 
                  />
                </div>
              </div>
            </div>

            {/* RESUMEN DE IMPACTO FINANCIERO */}
            <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 space-y-4 relative overflow-hidden group">
              <CheckCircle2 className="absolute -right-4 -bottom-4 text-emerald-200 opacity-40 group-hover:scale-110 transition-transform" size={100} />
              
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> 
                Estado de Cuenta Proyectado
              </p>
              
              <div className="space-y-2 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Saldo Actual:</span>
                  <span className="text-base font-black text-slate-700 tracking-tight">$4,500.00</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-emerald-200/50">
                  <span className="text-xs font-black text-emerald-700 uppercase">Nuevo Saldo:</span>
                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-800 tracking-tighter">$?.??</span>
                    <p className="text-[9px] text-emerald-600 font-bold uppercase mt-1">Pendiente de cálculo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÓN DE ACCIÓN */}
            <button className="w-full py-6 bg-[#050533] text-white font-black rounded-[1.5rem] shadow-xl shadow-blue-900/20 hover:bg-[#0047AB] transition-all uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 group">
              Confirmar y Aplicar Pago
              <CheckCircle2 size={18} className="group-hover:scale-125 transition-transform" />
            </button>
          </form>
        </div>
      </div>
      
      <p className="text-center mt-8 text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
        Sistema de Gestión de Cartera • 2026
      </p>
    </div>
  );
}