// // app/dashboard/estadisticas/page.tsx
// 'use client';
// import { useState } from 'react';
// import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

// export default function EstadisticasPage() {
//   const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'anio'>('semana');
//   const dataSets = {
//   semana: [
//     { name: 'Lun', activos: 10, interes: 5 },
//     { name: 'Mar', activos: 25, interes: 8 },
//     { name: 'Mie', activos: 45, interes: 12 },
//     { name: 'Jue', activos: 30, interes: 10 },
//     { name: 'Vie', activos: 52, interes: 15 },
//   ],
//   mes: [
//     { name: 'Sem 1', activos: 150, interes: 12 },
//     { name: 'Sem 2', activos: 210, interes: 14 },
//     { name: 'Sem 3', activos: 180, interes: 11 },
//     { name: 'Sem 4', activos: 250, interes: 15 },
//   ],
//   anio: [
//     { name: 'Ene', activos: 800, interes: 12 },
//     { name: 'Feb', activos: 950, interes: 13 },
//     { name: 'Mar', activos: 1100, interes: 15 },
//   ]
// };
//   const rangos = [
//     { label: '$500-1500', total: "$24,000", cant: 24 },
//     { label: '$1501-3000', total: "$42,500", cant: 24 },
//     { label: '$3001-5000', total: "$42,500", cant: 24 },
//     { label: '$5001-7500', total: "$42,500", cant: 24 },
//     { label: '$7501-10000', total: "$42,500", cant: 24 },

//   ]

//   return (
//     <div className="space-y-6">
//       <div className="max-w-xs">
//         <div className="bg-[#050533] text-white p-8 rounded-3xl shadow-xl">
//           <p className="text-sky-400 text-xs font-bold uppercase tracking-widest">Dinero Recuperado</p>
//           <h2 className="text-4xl font-black mt-2 text-white">$145,200</h2>
//         </div>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {rangos.map((item, index) => (
//           <div
//             key={index}
//             className="bg-white p-8 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow duration-300"
//           >
//             <div>
//               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
//                 Rango: {item.label}
//               </p>
//               <h2 className="text-2xl font-bold text-slate-800 mt-1">
//                 {item.total}
//                 <span className="text-slate-300 font-medium text-sm ml-1">Total</span>
//               </h2>
//             </div>

//             <div className="text-center bg-sky-50 px-5 py-3 rounded-2xl border border-sky-100">
//               <span className="text-2xl font-black text-sky-600 block leading-none">
//                 {item.cant}
//               </span>
//               <p className="text-sky-400 text-[9px] font-bold uppercase mt-1">Cant.</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//         <div>
//           <h3 className="font-bold text-slate-800 text-lg">Activos e Interés</h3>
//           <p className="text-slate-400 text-xs italic tracking-wide">Mostrando datos por {periodo}</p>
//         </div>

//         {/* CONTROLES DE FILTRO (TABS) */}
//         <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
//           {['semana', 'mes', 'anio'].map((p) => (
//             <button
//               key={p}
//               onClick={() => setPeriodo(p as any)}
//               className={`px-6 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-tighter ${
//                 periodo === p 
//                   ? 'bg-white text-sky-500 shadow-sm' 
//                   : 'text-slate-400 hover:text-slate-600'
//               }`}
//             >
//               {p}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="h-[350px] w-full">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={dataSets[periodo]} barGap={12}>
//             <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
//             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
//             <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
//             <Tooltip 
//               cursor={{fill: '#f8f9fe'}} 
//               contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
//             />
//             <Bar dataKey="activos" fill="#050533" radius={[6, 6, 0, 0]} barSize={35} name="Cantidad" />
//             <Bar dataKey="interes" fill="#38bdf8" radius={[6, 6, 0, 0]} barSize={35} name="Interés %" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//       </div>
//     </div>
//   );
// }
'use client';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Wallet, BarChart3 } from 'lucide-react';

// --- COLORES INSTITUCIONALES ---
const COLORS = {
  azulRey: '#0047AB',
  azulOscuro: '#050533',
  verdeExito: '#10B981',
  rojoAlerta: '#DC2626',
  skyClaro: '#38bdf8'
};

export default function EstadisticasPage() {
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'anio'>('semana');
  
  const dataSets = {
    semana: [
      { name: 'Lun', activos: 10, interes: 5 },
      { name: 'Mar', activos: 25, interes: 8 },
      { name: 'Mie', activos: 45, interes: 12 },
      { name: 'Jue', activos: 30, interes: 10 },
      { name: 'Vie', activos: 52, interes: 15 },
    ],
    mes: [
      { name: 'Sem 1', activos: 150, interes: 12 },
      { name: 'Sem 2', activos: 210, interes: 14 },
      { name: 'Sem 3', activos: 180, interes: 11 },
      { name: 'Sem 4', activos: 250, interes: 15 },
    ],
    anio: [
      { name: 'Ene', activos: 800, interes: 12 },
      { name: 'Feb', activos: 950, interes: 13 },
      { name: 'Mar', activos: 1100, interes: 15 },
    ]
  };

  const rangos = [
    { label: '$500-1500', total: "$24,000", cant: 24 },
    { label: '$1501-3000', total: "$42,500", cant: 24 },
    { label: '$3001-5000', total: "$42,500", cant: 24 },
    { label: '$5001-7500', total: "$42,500", cant: 24 },
    { label: '$7501-10000', total: "$42,500", cant: 24 },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* BANNER PRINCIPAL - DINERO RECUPERADO */}
      <div className="relative overflow-hidden bg-[#050533] p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 max-w-md group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <Wallet size={120} color="white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">Corte de Recuperación</p>
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter">$145,200</h2>
          <p className="text-slate-400 text-xs mt-3 font-medium italic">Felicidades, Alexander. Vas un 12% arriba este mes.</p>
        </div>
      </div>

      {/* GRID DE RANGOS DE PRÉSTAMOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rangos.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-[2rem] border border-slate-50 flex justify-between items-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">
                Monto: {item.label}
              </p>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {item.total}
                <span className="text-slate-300 font-bold text-xs ml-2 uppercase tracking-tighter">Acumulado</span>
              </h2>
            </div>

            <div className="text-center bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100">
              <span className="text-2xl font-black text-emerald-600 block leading-none">
                {item.cant}
              </span>
              <p className="text-emerald-400 text-[9px] font-black uppercase mt-1">Clientes</p>
            </div>
          </div>
        ))}
      </div>

      {/* SECCIÓN DE GRÁFICA INTERACTIVA */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
               <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-xl tracking-tight uppercase italic">Activos e Interés</h3>
              <p className="text-slate-400 text-xs font-medium">Análisis dinámico por {periodo}</p>
            </div>
          </div>

          {/* CONTROLES DE FILTRO (TABS INSTITUCIONALES) */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {['semana', 'mes', 'anio'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p as any)}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                  periodo === p 
                    ? 'bg-[#0047AB] text-white shadow-lg shadow-blue-200' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[400px] w-full pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataSets[periodo]} barGap={12}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 11}} 
              />
              <Tooltip 
                cursor={{fill: '#f8f9fe'}} 
                contentStyle={{ 
                  borderRadius: '20px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  padding: '15px'
                }}
              />
              <Bar 
                dataKey="activos" 
                fill={COLORS.azulRey} 
                radius={[8, 8, 0, 0]} 
                barSize={40} 
                name="Préstamos Activos" 
              />
              <Bar 
                dataKey="interes" 
                fill={COLORS.verdeExito} 
                radius={[8, 8, 0, 0]} 
                barSize={40} 
                name="Interés Generado" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}