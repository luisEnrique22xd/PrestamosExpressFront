// "use client";
// import React, { useState } from 'react';
// import { ChevronLeft, ChevronRight, Info, User, X, Phone, DollarSign, Calendar as CalendarIcon } from 'lucide-react';

// export default function CalendarioCobranza() {
//   const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
//   // Datos simulados (En el futuro vendrán de Django)
//   const [proyecciones] = useState([
//     { id: '1', cliente: 'Juan Pérez', fecha: 'Tue Feb 17 2026', monto: 250, idCliente: '1024', tel: '246-123-4455' },
//     { id: '2', cliente: 'María Sosa', fecha: 'Sat Feb 14 2026', monto: 500, idCliente: '1025', tel: '246-998-1122' },
//     { id: '3', cliente: 'Alex T.', fecha: 'Tue Feb 17 2026', monto: 150, idCliente: '1026', tel: '246-555-0011' },
//     { id: '4', cliente: 'Lucía Méndez', fecha: 'Sat Feb 28 2026', monto: 300, idCliente: '1027', tel: '246-777-8899' },
//   ]);

//   const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
//   const diasMes = Array.from({ length: 28 }, (_, i) => i + 1);

//   // Filtrar cobros para el panel lateral
//   const cobrosDelDiaSeleccionado = proyecciones.filter(p => p.fecha === selectedDate);

//   return (
//     <div className="relative flex gap-6 max-w-7xl mx-auto h-200">
      
//       {/* CALENDARIO PRINCIPAL */}
//       <div className={`transition-all duration-500 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 ${selectedDate ? 'w-2/3' : 'w-full'}`}>
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h2 className="text-2xl font-black text-slate-800 tracking-tight">Calendario de Cobros</h2>
//             <p className="text-sm text-slate-400 font-medium">Selecciona un día para ver la lista de abonos</p>
//           </div>
//           <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
//             <button className="p-2 hover:bg-white rounded-xl transition-all text-slate-400"><ChevronLeft size={20}/></button>
//             <span className="font-bold text-slate-700 self-center px-6 text-sm uppercase tracking-widest">Febrero 2026</span>
//             <button className="p-2 hover:bg-white rounded-xl transition-all text-slate-400"><ChevronRight size={20}/></button>
//           </div>
//         </div>

//         <div className="grid grid-cols-7 gap-3 mb-4">
//           {diasSemana.map(dia => (
//             <div key={dia} className={`text-center text-[10px] font-black uppercase tracking-widest ${dia === 'Sáb' ? 'text-sky-500' : 'text-slate-300'}`}>
//               {dia}
//             </div>
//           ))}
//         </div>

//         <div className="grid grid-cols-7 gap-3">
//           {diasMes.map(dia => {
//             const fechaActual = new Date(2026, 1, dia).toDateString();
//             const cobros = proyecciones.filter(p => p.fecha === fechaActual);
//             const esHoy = dia === 10;
//             const isSelected = selectedDate === fechaActual;

//             return (
//               <button 
//                 key={dia}
//                 onClick={() => setSelectedDate(fechaActual)}
//                 className={`h-24 p-3 rounded-3xl border transition-all flex flex-col items-start gap-1 relative overflow-hidden group ${
//                   isSelected ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-100' : 
//                   cobros.length > 0 ? 'border-slate-100 bg-white hover:border-sky-200' : 'border-slate-50 bg-white/50 opacity-40'
//                 }`}
//               >
//                 <span className={`text-sm font-black ${isSelected ? 'text-sky-600' : 'text-slate-400'}`}>{dia}</span>
                
//                 {cobros.length > 0 && (
//                   <div className="flex flex-col gap-1 w-full">
//                     <div className="flex -space-x-2">
//                       {cobros.map((_, i) => (
//                         <div key={i} className="w-5 h-5 rounded-full bg-sky-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">
//                           {i + 1}
//                         </div>
//                       ))}
//                     </div>
//                     <p className="text-[9px] font-bold text-sky-600 uppercase tracking-tighter">
//                       {cobros.length} {cobros.length === 1 ? 'Cobro' : 'Cobros'}
//                     </p>
//                   </div>
//                 )}

//                 {esHoy && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* PANEL LATERAL (LISTA DE CLIENTES) */}
//       {selectedDate && (
//         <div className="w-1/3 bg-[#050533] rounded-[2.5rem] p-8 text-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
//           <div className="flex justify-between items-center mb-8">
//             <h3 className="text-lg font-bold flex items-center gap-2">
//               <CalendarIcon size={20} className="text-sky-400" />
//               Cobros del Día
//             </h3>
//             <button 
//               onClick={() => setSelectedDate(null)}
//               className="p-2 hover:bg-white/10 rounded-xl transition-all"
//             >
//               <X size={20} />
//             </button>
//           </div>

//           <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-6">
//             <p className="text-xs text-slate-400 uppercase font-black tracking-widest">Fecha Seleccionada</p>
//             <p className="text-xl font-bold text-sky-400">{selectedDate}</p>
//           </div>

//           <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
//             {cobrosDelDiaSeleccionado.length > 0 ? (
//               cobrosDelDiaSeleccionado.map((cobro) => (
//                 <div key={cobro.id} className="bg-white/10 p-5 rounded-3xl border border-white/5 hover:bg-white/[0.15] transition-all group">
//                   <div className="flex justify-between items-start mb-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
//                         <User size={20} />
//                       </div>
//                       <div>
//                         <p className="font-bold text-sm leading-none">{cobro.cliente}</p>
//                         <p className="text-[10px] text-slate-400 mt-1">ID: {cobro.idCliente}</p>
//                       </div>
//                     </div>
//                     <span className="text-xs font-black text-sky-400 bg-sky-400/10 px-3 py-1 rounded-full border border-sky-400/20">
//                       ${cobro.monto}
//                     </span>
//                   </div>
                  
//                   <div className="flex gap-2">
//                     <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 rounded-xl text-[10px] font-bold uppercase hover:bg-sky-500 transition-all">
//                       <Phone size={12} /> Llamar
//                     </button>
//                     <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 rounded-xl text-[10px] font-bold uppercase hover:bg-emerald-500 transition-all">
//                       <DollarSign size={12} /> Cobrar
//                     </button>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-20 opacity-30">
//                 <p className="text-sm italic">No hay cobros programados para este día.</p>
//               </div>
//             )}
//           </div>

//           <div className="mt-6 pt-6 border-t border-white/10 text-center text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">
//             Cartera Vencida v1.0
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Info, User, X, Phone, DollarSign, Calendar as CalendarIcon } from 'lucide-react';

// --- COLORES INSTITUCIONALES ---
const COLORS = {
  azulRey: '#0047AB',
  azulOscuro: '#050533',
  verdeExito: '#10B981',
  rojoAlerta: '#DC2626',
};

export default function CalendarioCobranza() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const [proyecciones] = useState([
    { id: '1', cliente: 'Juan Pérez', fecha: 'Tue Feb 17 2026', monto: 250, idCliente: '1024', tel: '246-123-4455' },
    { id: '2', cliente: 'María Sosa', fecha: 'Sat Feb 14 2026', monto: 500, idCliente: '1025', tel: '246-998-1122' },
    { id: '3', cliente: 'Alex T.', fecha: 'Tue Feb 17 2026', monto: 150, idCliente: '1026', tel: '246-555-0011' },
    { id: '4', cliente: 'Lucía Méndez', fecha: 'Sat Feb 28 2026', monto: 300, idCliente: '1027', tel: '246-777-8899' },
  ]);

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const diasMes = Array.from({ length: 28 }, (_, i) => i + 1);

  const cobrosDelDiaSeleccionado = proyecciones.filter(p => p.fecha === selectedDate);

  return (
    <div className="relative flex gap-6 max-w-7xl mx-auto min-h-[800px] pb-10">
      
      {/* CALENDARIO PRINCIPAL */}
      <div className={`transition-all duration-500 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 ${selectedDate ? 'w-2/3' : 'w-full'}`}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic">Calendario de Cobros</h2>
            <p className="text-sm text-slate-400 font-medium">Gestión de abonos programados por fecha</p>
          </div>
          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
            <button className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-[#0047AB]"><ChevronLeft size={20}/></button>
            <span className="font-black text-slate-700 self-center px-6 text-xs uppercase tracking-[0.2em]">Febrero 2026</span>
            <button className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-[#0047AB]"><ChevronRight size={20}/></button>
          </div>
        </div>

        {/* CABECERA DÍAS SEMANA */}
        <div className="grid grid-cols-7 gap-4 mb-6">
          {diasSemana.map(dia => (
            <div key={dia} className={`text-center text-[10px] font-black uppercase tracking-[0.25em] ${dia === 'Sáb' ? 'text-[#0047AB]' : 'text-slate-300'}`}>
              {dia}
            </div>
          ))}
        </div>

        {/* GRID DE DÍAS */}
        <div className="grid grid-cols-7 gap-4">
          {diasMes.map(dia => {
            const fechaActual = new Date(2026, 1, dia).toDateString();
            const cobros = proyecciones.filter(p => p.fecha === fechaActual);
            const esHoy = dia === 10;
            const isSelected = selectedDate === fechaActual;

            return (
              <button 
                key={dia}
                onClick={() => setSelectedDate(fechaActual)}
                className={`h-28 p-4 rounded-[2rem] border-2 transition-all flex flex-col items-start gap-2 relative overflow-hidden group ${
                  isSelected ? 'border-[#0047AB] bg-blue-50/50 ring-4 ring-blue-50' : 
                  cobros.length > 0 ? 'border-slate-100 bg-white hover:border-blue-200 shadow-sm' : 'border-slate-50 bg-white opacity-40'
                }`}
              >
                <span className={`text-sm font-black ${isSelected ? 'text-[#0047AB]' : 'text-slate-400'}`}>{dia}</span>
                
                {cobros.length > 0 && (
                  <div className="flex flex-col gap-2 w-full mt-auto">
                    <div className="flex -space-x-2">
                      {cobros.map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-lg bg-[#0047AB] border-2 border-white flex items-center justify-center text-[8px] text-white font-black shadow-sm">
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <p className="text-[8px] font-black text-[#0047AB] uppercase tracking-wider">
                      {cobros.length} {cobros.length === 1 ? 'Abono' : 'Abonos'}
                    </p>
                  </div>
                )}

                {esHoy && <div className="absolute top-4 right-4 w-2 h-2 bg-[#DC2626] rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse"></div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* PANEL LATERAL (LISTA DE CLIENTES) */}
      {selectedDate && (
        <div className="w-1/3 bg-[#050533] rounded-[2.5rem] p-8 text-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col border border-white/5">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl text-sky-400">
                <CalendarIcon size={24} />
              </div>
              <h3 className="text-xl font-black italic tracking-tighter">Cobros del Día</h3>
            </div>
            <button 
              onClick={() => setSelectedDate(null)}
              className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <div className="bg-white/5 p-5 rounded-3xl border border-white/10 mb-8 backdrop-blur-sm">
            <p className="text-[10px] text-sky-400 uppercase font-black tracking-[0.2em] mb-1">Fecha de Operación</p>
            <p className="text-lg font-bold text-white tracking-tight">{selectedDate}</p>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {cobrosDelDiaSeleccionado.length > 0 ? (
              cobrosDelDiaSeleccionado.map((cobro) => (
                <div key={cobro.id} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#0047AB] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        <User size={22} className="text-white" />
                      </div>
                      <div>
                        <p className="font-black text-base leading-none tracking-tight">{cobro.cliente}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">ID: {cobro.idCliente}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-sm font-black text-sky-400 block">${cobro.monto}</span>
                       <span className="text-[8px] text-sky-400/50 font-bold uppercase">Abono</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-3 bg-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/5">
                      <Phone size={14} className="text-sky-400" /> Llamar
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 bg-[#10B981] rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-900/40">
                      <DollarSign size={14} /> Cobrar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <CalendarIcon size={64} className="mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest italic">Sin cobros</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-500 font-black uppercase tracking-widest">
            <span>Sábados Incluidos</span>
            <span className="text-sky-400/30 italic">Pre-Beta v1.0</span>
          </div>
        </div>
      )}
    </div>
  );
}