// 'use client';
// import React, { useState } from "react";
// import { ChevronDown, ChevronRight, ChevronLeft, Phone, MapPin, UserCheck, ExternalLink } from 'lucide-react';

// const clientes = [
//   { id: '1024', nombre: 'Juan Pérez', contacto: '246-123-4455', deuda: '$2,500', status: 'Vencido', direccion: 'Av. Juárez #12, Tlaxcala', aval: 'Pedro S.', curp: 'PERJ90...' },
//   { id: '1025', nombre: 'María Sosa', contacto: '246-998-1122', deuda: '$1,800', status: 'Vencido', direccion: 'Calle 5 de Mayo #4, Huamantla', aval: 'Lucía M.', curp: 'SOSM85...' },
// ];

// export default function ClientesPage() {
//   // Guardamos el ID del cliente expandido (null si ninguno lo está)
//   const [expandedId, setExpandedId] = useState<string | null>(null);

//   const toggleRow = (id: string) => {
//     setExpandedId(expandedId === id ? null : id);
//   };

//   return (
//     <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
//       {/* HEADER */}
//       <div className="p-8 border-b border-slate-50 flex justify-between items-center">
//         <h2 className="text-xl font-bold text-slate-800">Directorio de Clientes en Cartera Vencida</h2>
//         <input 
//           type="text" 
//           placeholder="Buscar por ID o Nombre..." 
//           className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm w-64 focus:ring-2 focus:ring-sky-400 outline-none" 
//         />
//       </div>

//       {/* TABLA */}
//       <table className="w-full text-left">
//         <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
//           <tr>
//             <th className="px-8 py-4">ID / Nombre</th>
//             <th className="px-8 py-4">Contacto</th>
//             <th className="px-8 py-4">Monto en Mora</th>
//             <th className="px-8 py-4 text-center">Estatus</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-slate-50">
//           {clientes.map((c) => (
//             <React.Fragment key={c.id}>
//               {/* FILA PRINCIPAL */}
//               <tr 
//                 onClick={() => toggleRow(c.id)}
//                 className={`transition-colors cursor-pointer ${expandedId === c.id ? 'bg-sky-50/30' : 'hover:bg-slate-50/30'}`}
//               >
//                 <td className="px-8 py-5">
//                   <div className="flex items-center gap-3">
//                     {expandedId === c.id ? <ChevronDown size={16} className="text-sky-500" /> : <ChevronRight size={16} className="text-slate-300" />}
//                     <div>
//                       <p className="font-bold text-slate-700">{c.nombre}</p>
//                       <p className="text-[10px] text-slate-400">ID: {c.id}</p>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-8 py-5 text-sm text-slate-500">{c.contacto}</td>
//                 <td className="px-8 py-5 font-bold text-red-500">{c.deuda}</td>
//                 <td className="px-8 py-5 text-center">
//                   <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold">
//                     {c.status}
//                   </span>
//                 </td>
//               </tr>

//               {/* FILA DE DETALLES (CONDICIONAL) */}
//               {expandedId === c.id && (
//                 <tr className="bg-slate-50/50">
//                   <td colSpan={4} className="px-16 py-8 animate-in slide-in-from-top-2 duration-300">
//                     <div className="grid grid-cols-3 gap-12">
//                       <div className="space-y-3">
//                         <p className="text-[10px] font-black text-slate-300 uppercase">Datos de Ubicación</p>
//                         <div className="flex items-start gap-2 text-sm text-slate-600">
//                           <MapPin size={16} className="text-sky-400 mt-0.5" />
//                           <span>{c.direccion}</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-sm text-slate-600">
//                           <Phone size={16} className="text-sky-400" />
//                           <span>{c.contacto}</span>
//                         </div>
//                       </div>
                      
//                       <div className="space-y-3">
//                         <p className="text-[10px] font-black text-slate-300 uppercase">Referencias</p>
//                         <div className="flex items-center gap-2 text-sm text-slate-600">
//                           <UserCheck size={16} className="text-sky-400" />
//                           <span>Aval: <span className="font-bold">{c.aval}</span></span>
//                         </div>
//                         <p className="text-xs text-slate-500">CURP: {c.curp}</p>
//                       </div>

//                       <div className="flex flex-col justify-end gap-3">
//                         <button className="flex items-center justify-center gap-2 bg-[#050533] text-white text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-sky-600 transition-all">
//                           Ver Historial <ExternalLink size={14}/>
//                         </button>
//                       </div>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </React.Fragment>
//           ))}
//         </tbody>
//       </table>

//       {/* CONTROLES DE PAGINACIÓN */}
//       <div className="p-6 bg-white border-t border-slate-50 flex items-center justify-between">
//         <p className="text-xs text-slate-400 font-medium">
//           Mostrando <span className="text-slate-700 font-bold">1 a {clientes.length}</span> de <span className="text-slate-700 font-bold">120</span> clientes
//         </p>
//         <div className="flex items-center gap-2">
//           <button className="p-2 border border-slate-100 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-30">
//             <ChevronLeft size={18} />
//           </button>
//           <div className="flex gap-1">
//             {[1, 2, 3, '...', 12].map((page, i) => (
//               <button 
//                 key={i} 
//                 className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${page === 1 ? 'bg-sky-500 text-white shadow-md shadow-sky-200' : 'text-slate-400 hover:bg-slate-50'}`}
//               >
//                 {page}
//               </button>
//             ))}
//           </div>
//           <button className="p-2 border border-slate-100 rounded-lg text-slate-400 hover:bg-slate-50">
//             <ChevronRight size={18} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';
import React, { useState } from "react";
import { ChevronDown, ChevronRight, ChevronLeft, Phone, MapPin, UserCheck, ExternalLink, Search } from 'lucide-react';

const COLORS = {
  azulRey: '#0047AB',
  rojoMora: '#DC2626',
  verdeOk: '#10B981',
  fondoGris: '#F8FAFE'
};

const clientes = [
  { id: '1024', nombre: 'Juan Pérez', contacto: '246-123-4455', deuda: '$2,500', status: 'Vencido', direccion: 'Av. Juárez #12, Tlaxcala', aval: 'Pedro S.', curp: 'PERJ90...', diasAtraso: 12 },
  { id: '1025', nombre: 'María Sosa', contacto: '246-998-1122', deuda: '$1,800', status: 'Vencido', direccion: 'Calle 5 de Mayo #4, Huamantla', aval: 'Lucía M.', curp: 'SOSM85...', diasAtraso: 5 },
];

export default function CarteraVencidaPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      {/* HEADER DE LA TABLA */}
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter italic">Cartera Vencida</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Directorio de Recuperación</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0047AB] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por ID o Nombre..." 
            className="bg-slate-50 border-none rounded-2xl px-12 py-3 text-sm w-80 focus:ring-2 focus:ring-[#0047AB] outline-none transition-all shadow-inner" 
          />
        </div>
      </div>

      {/* TABLA DE CLIENTES */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Cliente / Expediente</th>
              <th className="px-8 py-5">Información de Contacto</th>
              <th className="px-8 py-5 text-center">Saldo en Mora</th>
              <th className="px-8 py-5 text-center">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {clientes.map((c) => (
              <React.Fragment key={c.id}>
                {/* FILA PRINCIPAL */}
                <tr 
                  onClick={() => toggleRow(c.id)}
                  className={`transition-all cursor-pointer group ${expandedId === c.id ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl transition-colors ${expandedId === c.id ? 'bg-[#0047AB] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100'}`}>
                        {expandedId === c.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-base">{c.nombre}</p>
                        <p className="text-[10px] text-[#0047AB] font-bold uppercase tracking-tighter">Expediente: {c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                      <Phone size={14} className="text-slate-300" />
                      {c.contacto}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <p className="font-black text-lg text-[#DC2626]">{c.deuda}</p>
                    <p className="text-[9px] text-red-400 font-bold uppercase tracking-tighter">+{c.diasAtraso} días de atraso</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="bg-red-100 text-[#DC2626] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-200 shadow-sm shadow-red-100">
                      {c.status}
                    </span>
                  </td>
                </tr>

                {/* FILA DE DETALLES (EXPANDIBLE) */}
                {expandedId === c.id && (
                  <tr className="bg-slate-50/50">
                    <td colSpan={4} className="px-16 py-10 animate-in slide-in-from-top-4 duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-l-4 border-[#0047AB] pl-8">
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Localización</p>
                          <div className="flex items-start gap-3 text-sm text-slate-600 font-medium leading-relaxed">
                            <MapPin size={18} className="text-[#0047AB] shrink-0" />
                            <span>{c.direccion}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Garantía / Aval</p>
                          <div className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                            <UserCheck size={18} className="text-[#0047AB]" />
                            <span>Aval: {c.aval}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 bg-white px-3 py-1 rounded-lg border border-slate-100 inline-block font-mono">CURP: {c.curp}</p>
                        </div>

                        <div className="flex flex-col justify-center gap-3">
                          <button className="flex items-center justify-center gap-3 bg-[#0047AB] text-white text-xs font-black uppercase tracking-[0.15em] py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                            Abrir Historial <ExternalLink size={16}/>
                          </button>
                          <button className="flex items-center justify-center gap-3 bg-white text-[#DC2626] border-2 border-red-100 text-xs font-black uppercase tracking-[0.15em] py-4 rounded-2xl hover:bg-red-50 transition-all">
                             Aplicar Sanción
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN INSTITUCIONAL */}
      <div className="p-8 bg-slate-50/30 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          Mostrando <span className="text-[#0047AB] font-black underline decoration-2 underline-offset-4">1 a {clientes.length}</span> de 120 Clientes
        </p>
        
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-300 hover:text-[#0047AB] hover:border-[#0047AB] transition-all disabled:opacity-30">
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex gap-2">
            {[1, 2, 3, 12].map((page, i) => (
              <button 
                key={i} 
                className={`w-10 h-10 text-xs font-black rounded-2xl transition-all shadow-sm ${
                  page === 1 
                  ? 'bg-[#0047AB] text-white shadow-blue-200' 
                  : 'bg-white text-slate-400 hover:bg-blue-50 hover:text-[#0047AB]'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#0047AB] hover:border-[#0047AB] transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}