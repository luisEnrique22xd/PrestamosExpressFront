// "use client";
// import React from 'react';
// import { Search, Bell, TrendingUp, TrendingDown } from 'lucide-react';
// import { 
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, 
//   ResponsiveContainer, Tooltip, PieChart as RePie, Pie, Cell 
// } from 'recharts';

// // --- COLORES INSTITUCIONALES ---
// const COLORS = {
//   azulRey: '#0047AB',     // Color base institucional
//   azulOscuro: '#050533',  // Contraste profundo
//   rojoAlerta: '#DC2626',  // Para penalizaciones/atrasos
//   verdeExito: '#10B981',  // Para a tiempo/recuperado
//   grisFondo: '#F8FAFE'
// };

// const revenueData = [
//   { month: 'Sep', llegada: 480, gasto: 180 },
//   { month: 'Oct', llegada: 380, gasto: 120 },
//   { month: 'Nov', llegada: 300, gasto: 440 },
//   { month: 'Dic', llegada: 140, gasto: 280 },
//   { month: 'Ene', llegada: 110, gasto: 180 },
//   { month: 'Feb', llegada: 460, gasto: 260 },
// ];

// const efficiencyData = [
//   { name: 'A tiempo', value: 45, color: COLORS.verdeExito },
//   { name: 'Retraso', value: 28, color: '#FBBF24' }, // Amarillo ámbar para precaución
//   { name: 'Penalización', value: 27, color: COLORS.rojoAlerta },
// ];

// // --- COMPONENTES ---

// const StatCard = ({ title, value, trend, isNegative }: any) => (
//   <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 hover:shadow-md transition-all">
//     <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-3">{title}</p>
//     <div className="flex items-center justify-between">
//       <h3 className="text-3xl font-black text-slate-800">{value}</h3>
//       <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
//         isNegative ? 'text-red-500 bg-red-50' : 'text-emerald-500 bg-emerald-50'
//       }`}>
//         {isNegative ? <TrendingDown size={14}/> : <TrendingUp size={14}/>}
//         {trend}
//       </div>
//     </div>
//   </div>
// );

// export default function Dashboard() {
//   return (
//     <div className="flex min-h-screen bg-[#F8FAFE]">
//       <main className="flex-1 p-10 overflow-auto">
//         {/* HEADER */}
//         <header className="flex justify-between items-center mb-10">
//           <div>
//             <h1 className="text-2xl font-black text-slate-800">Panel de Control</h1>
//             <p className="text-slate-400 text-sm font-medium italic">Gestión de Cartera Vencida</p>
//           </div>
//           <div className="flex items-center gap-4">
//             <div className="relative group">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={18}/>
//               <input type="text" placeholder="Buscar..." className="pl-10 pr-4 py-2 bg-white rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all w-64"/>
//             </div>
//             <button className="p-2.5 bg-white text-slate-400 hover:text-blue-600 rounded-xl shadow-sm relative transition-all">
//               <Bell size={20}/>
//               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
//             </button>
//             <div className="w-10 h-10 rounded-xl bg-blue-600 p-0.5 shadow-lg shadow-blue-200">
//               <img src="https://i.pravatar.cc/150?u=alexander" alt="Profile" className="rounded-[10px] border-2 border-white"/>
//             </div>
//           </div>
//         </header>

//         {/* TOP CARDS */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <StatCard title="Saldo Total" value="$127,632" trend="12%" />
//           <StatCard title="Abonos Hoy" value="$20,199" trend="4.5%" />
//           <StatCard title="Préstamos Activos" value="142" trend="2%" isNegative />
//         </div>

//         {/* CHARTS SECTION */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//           {/* Gráfico de Barras - Azul Rey e Institucional */}
//           <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
//             <div className="flex justify-between items-center mb-8">
//               <h4 className="font-bold text-slate-800 text-lg italic">Flujo de Préstamos</h4>
//               <div className="flex items-center gap-4">
//                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
//                     <span className="w-3 h-3 rounded-full bg-[#0047AB]"></span> Llegada
//                  </div>
//                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
//                     <span className="w-3 h-3 rounded-full bg-[#10B981]"></span> Gasto
//                  </div>
//               </div>
//             </div>
//             <div className="h-[300px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={revenueData} barGap={8}>
//                   <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
//                   <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 'bold'}} />
//                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
//                   <Tooltip cursor={{fill: '#F8FAFE'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
//                   <Bar dataKey="llegada" fill={COLORS.azulRey} radius={[6, 6, 0, 0]} barSize={25} />
//                   <Bar dataKey="gasto" fill={COLORS.verdeExito} radius={[6, 6, 0, 0]} barSize={25} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* Gráfico de Dona - Semáforo Institucional */}
//           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col">
//             <h4 className="font-bold text-slate-800 mb-6 italic text-lg text-center">Estatus de Cartera</h4>
//             <div className="flex-1 relative flex items-center justify-center">
//               <ResponsiveContainer width="100%" height="100%">
//                 <RePie data={efficiencyData} innerRadius={75} outerRadius={95}  dataKey="value" >
//                   {efficiencyData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-all cursor-pointer" />
//                   ))}
//                 </RePie>
//               </ResponsiveContainer>
//               <div className="absolute inset-0 flex flex-col items-center justify-center">
//                 <span className="text-4xl font-black text-slate-800 tracking-tighter">28%</span>
//                 <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">En Mora</span>
//               </div>
//             </div>
//             <div className="space-y-3 mt-6">
//               {efficiencyData.map((d, i) => (
//                 <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
//                   <div className="flex items-center gap-3">
//                     <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
//                     <span className="text-xs font-bold text-slate-600 uppercase">{d.name}</span>
//                   </div>
//                   <span className="text-sm font-black text-slate-800">{d.value}%</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* BOTTOM SECTION */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
//             <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 italic">
//               <span className="w-2 h-6 bg-blue-600 rounded-full"></span> Recuperación de Capital
//             </h4>
//             <div className="space-y-6">
//               {[
//                 { title: 'Pagos Recibidos', val: '$14,200', total: '$20,000', prog: 71, color: COLORS.azulRey },
//                 { title: 'Intereses Generados', val: '$3,100', total: '$5,000', prog: 62, color: COLORS.verdeExito }
//               ].map((item, i) => (
//                 <div key={i}>
//                   <div className="flex justify-between items-end mb-2">
//                     <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.title}</span>
//                     <span className="text-sm font-black text-slate-800">{item.prog}%</span>
//                   </div>
//                   <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
//                     <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.prog}%`, backgroundColor: item.color }}></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
//              <div className="flex justify-between items-center mb-6">
//                 <h4 className="font-bold text-slate-800 italic">Últimos Movimientos</h4>
//                 <button className="text-[10px] font-black uppercase text-blue-600 hover:underline">Ver todo</button>
//              </div>
//              <div className="space-y-4">
//                 {[
//                   { name: 'Luis Sanchez', type: 'Abono', amount: '+$500', status: 'Exitoso', color: COLORS.verdeExito },
//                   { name: 'Rosa Maria', type: 'Multa', amount: '-$150', status: 'Penalizado', color: COLORS.rojoAlerta }
//                 ].map((row, i) => (
//                   <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
//                     <div className="flex items-center gap-4">
//                       <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: row.color }}>
//                         {row.name[0]}
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-slate-800">{row.name}</p>
//                         <p className="text-[10px] text-slate-400 font-bold uppercase">{row.type}</p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-sm font-black text-slate-800">{row.amount}</p>
//                       <p className={`text-[9px] font-bold uppercase ${row.status === 'Exitoso' ? 'text-emerald-500' : 'text-red-500'}`}>{row.status}</p>
//                     </div>
//                   </div>
//                 ))}
//              </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
"use client";
import React from 'react';
import { Search, Bell, TrendingUp, Calendar, DollarSign, UserCheck, AlertTriangle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, Tooltip, PieChart as RePie, Pie, Cell 
} from 'recharts';

// --- COLORES INSTITUCIONALES ---
const COLORS = {
  azulRey: '#0047AB',
  verdeExito: '#10B981',
  rojoAlerta: '#DC2626',
  amarilloCuidado: '#FBBF24',
};

// Datos: Pagos realizados vs Intereses (Personal del cliente)
const historialPagosData = [
  { semana: 'Sem 1', pago: 500, interes: 50 },
  { semana: 'Sem 2', pago: 500, interes: 50 },
  { semana: 'Sem 3', pago: 0, interes: 50 }, // Incumplimiento
  { semana: 'Sem 4', pago: 500, interes: 50 },
];

const cumplimientoData = [
  { name: 'Pagado', value: 75, color: COLORS.verdeExito },
  { name: 'Pendiente', value: 25, color: '#E2E8F0' }, 
];

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 relative overflow-hidden">
    <div className={`absolute top-0 right-0 p-4 opacity-10`}>
      <Icon size={80} color={color} />
    </div>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{title}</p>
    <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{value}</h3>
  </div>
);

export default function ClienteDashboard() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFE]">
      <main className="flex-1 p-10 overflow-auto">
        
        {/* HEADER PERFIL CLIENTE */}
        <header className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] bg-blue-600 p-1 shadow-xl shadow-blue-200">
              <img src="https://i.pravatar.cc/150?u=juan" alt="Juan" className="rounded-[1.8rem] border-4 border-white h-full w-full object-cover"/>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Juan Pérez</h1>
                <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">Cartera Vencida</span>
              </div>
              <p className="text-slate-400 text-sm font-medium mt-1">ID Cliente: #1024 • Préstamo Activo #1</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all uppercase tracking-widest">
                <Calendar size={16} /> Ver Calendario
             </button>
             <button className="flex items-center gap-2 bg-[#0047AB] text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest">
                <DollarSign size={16} /> Registrar Pago
             </button>
          </div>
        </header>

        {/* MÉTRICAS CLAVE DEL PRÉSTAMO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Saldo Pendiente" value="$2,500" icon={DollarSign} color={COLORS.rojoAlerta} />
          <StatCard title="Total Pagado" value="$7,500" icon={UserCheck} color={COLORS.verdeExito} />
          <StatCard title="Interés Acumulado" value="$450" icon={TrendingUp} color={COLORS.azulRey} />
          <StatCard title="Días de Atraso" value="12 Días" icon={AlertTriangle} color={COLORS.amarilloCuidado} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* GRÁFICO DE PAGOS SEMANALES */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
            <div className="flex justify-between items-center mb-8">
              <h4 className="font-black text-slate-800 text-lg uppercase tracking-tighter italic">Historial de Abonos (Mensual)</h4>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase"><span className="w-2 h-2 rounded-full bg-[#0047AB]"></span> Abono</div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase"><span className="w-2 h-2 rounded-full bg-[#E2E8F0]"></span> Interés</div>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historialPagosData}>
                  <CartesianGrid vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#F8FAFE'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="pago" fill={COLORS.azulRey} radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DONA DE PROGRESO DEL PRÉSTAMO */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col items-center">
            <h4 className="font-black text-slate-800 mb-2 uppercase tracking-tighter italic">Progreso del Crédito</h4>
            <div className="flex-1 relative w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePie data={cumplimientoData} innerRadius={80} outerRadius={100} dataKey="value"  startAngle={90} endAngle={450}>
                  {cumplimientoData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </RePie>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-slate-800">75%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Completado</span>
              </div>
            </div>
            <div className="w-full space-y-3 mt-4">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Próximo Pago:</span>
                  <span className="text-xs font-black text-blue-600 uppercase">17 Feb 2026</span>
               </div>
            </div>
          </div>
        </div>

        {/* DETALLES ADICIONALES Y AVAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
            <h4 className="text-slate-800 font-black mb-6 uppercase tracking-tighter italic border-b pb-4">Información del Aval</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Nombre:</span>
                <span className="text-sm font-bold text-slate-700">Pedro Sánchez</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Parentesco:</span>
                <span className="text-sm font-bold text-slate-700">Hermano</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Teléfono:</span>
                <span className="text-sm font-bold text-blue-600">246-443-2211</span>
              </div>
            </div>
          </div>

          <div className="bg-[#050533] p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-900/20">
            <h4 className="font-black mb-6 uppercase tracking-tighter italic border-b border-white/10 pb-4 text-sky-400">Estado de Reestructuración</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sky-400 italic font-black">!</div>
                <div>
                  <p className="text-sm font-bold">Sin reestructuras activas</p>
                  <p className="text-[10px] text-slate-400 uppercase font-medium mt-1">El cliente mantiene sus términos originales.</p>
                </div>
              </div>
              <button className="w-full py-4 bg-red-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/40">
                Sancionar por Atraso
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}