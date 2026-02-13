// "use client";
// import React, { useState } from 'react';
// import { Calendar as CalendarIcon, ArrowRight } from 'lucide-react';

// export default function ProyeccionPage() {
//   const [monto, setMonto] = useState(1000);
//   const [modalidad, setModalidad] = useState('semanal');
//   const [cuotas, setCuotas] = useState(4);
//   const [interes, setInteres] = useState(10); // 10%

//   // Cálculo de montos
//   const montoTotal = monto + (monto * (interes / 100));
//   const pagoPorCuota = montoTotal / cuotas;
// const calcularProyeccion = (fechaInicio: string, modalidad: string, cuotas: number) => {
//   let fechas = [];
//   let fechaActual = new Date(fechaInicio);

//   for (let i = 1; i <= cuotas; i++) {
//     if (modalidad === 'semanal') {
//       fechaActual.setDate(fechaActual.getDate() + 7);
//     } else if (modalidad === 'quincenal') {
//       fechaActual.setDate(fechaActual.getDate() + 15);
//     } else if (modalidad === 'mensual') {
//       fechaActual.setMonth(fechaActual.getMonth() + 1);
//     }
//     fechas.push(new Date(fechaActual));
//   }
//   return fechas;
// };
//   // Generar fechas (Simulando inicio hoy 10 Feb)
//   const fechasPago = calcularProyeccion('2026-02-10', modalidad, cuotas);

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
//       {/* PANEL DE CONFIGURACIÓN */}
//       <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
//         <h3 className="font-bold text-slate-800 flex items-center gap-2">
//           <CalendarIcon className="text-sky-500" size={20} /> 
//           Simulador de Cobro
//         </h3>
        
//         <div className="space-y-4">
//           <div>
//             <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Monto</label>
//             <input 
//               type="number" 
//               value={monto} 
//               onChange={(e) => setMonto(Number(e.target.value))}
//               className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-sky-400 font-bold"
//             />
//           </div>

//           <div>
//             <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Modalidad</label>
//             <select 
//               value={modalidad} 
//               onChange={(e) => setModalidad(e.target.value)}
//               className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-sky-400"
//             >
//               <option value="semanal">Semanal</option>
//               <option value="quincenal">Quincenal</option>
//               <option value="mensual">Mensual</option>
//             </select>
//           </div>
//         </div>

//         <div className="p-6 bg-[#050533] rounded-3xl text-white">
//           <p className="text-[10px] uppercase font-bold text-sky-300 mb-2">Resumen de cuota</p>
//           <p className="text-3xl font-black">${pagoPorCuota.toFixed(2)}</p>
//           <p className="text-xs text-slate-400 mt-1">Total a recuperar: ${montoTotal.toFixed(2)}</p>
//         </div>
//       </div>

//       {/* VISTA DE PROYECCIÓN (CALENDARIO/LISTA) */}
//       <div className="lg:col-span-2 space-y-4">
//         <h3 className="font-bold text-slate-800 px-2">Fechas Programadas de Cobro</h3>
        
//         <div className="grid grid-cols-1 gap-3">
//           {fechasPago.map((fecha, index) => (
//             <div 
//               key={index} 
//               className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between hover:border-sky-200 transition-all group"
//             >
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-sky-50 group-hover:border-sky-100">
//                   <span className="text-[10px] font-bold text-slate-400 uppercase">
//                     {fecha.toLocaleDateString('es-MX', { month: 'short' })}
//                   </span>
//                   <span className="text-lg font-black text-slate-700 leading-none">
//                     {fecha.getDate()}
//                   </span>
//                 </div>
//                 <div>
//                   <p className="font-bold text-slate-800">Pago #{index + 1}</p>
//                   <p className="text-xs text-slate-400">
//                     {fecha.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric' })}
//                   </p>
//                 </div>
//               </div>

//               <div className="text-right">
//                 <p className="text-lg font-black text-sky-500">${pagoPorCuota.toFixed(2)}</p>
//                 <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg uppercase">
//                   Proyectado
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* NOTA SOBRE SÁBADOS */}
//         <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
//           <div className="text-amber-500 mt-1 italic font-bold text-xs">i</div>
//           <p className="text-xs text-amber-700">
//             <strong>Nota de ingeniería:</strong> El sistema está configurado para incluir sábados como días hábiles de cobro. Si una fecha cae en domingo, el sistema puede ajustarse automáticamente al lunes siguiente (opcional).
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import React, { useState } from 'react';
import { Calendar as CalendarIcon, DollarSign, PieChart, Info, CheckCircle2 } from 'lucide-react';

// --- COLORES INSTITUCIONALES ---
const COLORS = {
  azulRey: '#0047AB',
  azulOscuro: '#050533',
  verdeExito: '#10B981',
  skyClaro: '#38bdf8'
};

export default function ProyeccionPage() {
  const [monto, setMonto] = useState(1000);
  const [modalidad, setModalidad] = useState('semanal');
  const [cuotas, setCuotas] = useState(4);
  const [interes, setInteres] = useState(10); // 10%

  // Cálculo de montos
  const montoTotal = monto + (monto * (interes / 100));
  const pagoPorCuota = montoTotal / cuotas;

  const calcularProyeccion = (fechaInicio: string, modalidad: string, cuotas: number) => {
    let fechas = [];
    let fechaActual = new Date(fechaInicio);

    for (let i = 1; i <= cuotas; i++) {
      if (modalidad === 'semanal') {
        fechaActual.setDate(fechaActual.getDate() + 7);
      } else if (modalidad === 'quincenal') {
        fechaActual.setDate(fechaActual.getDate() + 15);
      } else if (modalidad === 'mensual') {
        fechaActual.setMonth(fechaActual.getMonth() + 1);
      }
      // Ajuste de Domingo a Lunes (Ingeniería de Negocio)
      if (fechaActual.getDay() === 0) {
        fechaActual.setDate(fechaActual.getDate() + 1);
      }
      fechas.push(new Date(fechaActual));
    }
    return fechas;
  };

  const fechasPago = calcularProyeccion('2026-02-10', modalidad, cuotas);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
      
      {/* PANEL DE CONFIGURACIÓN */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-[#0047AB] rounded-2xl">
              <PieChart size={24} />
            </div>
            <h3 className="font-black text-slate-800 text-xl tracking-tighter italic uppercase">Simulador</h3>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Capital Solicitado</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="number" 
                  value={monto} 
                  onChange={(e) => setMonto(Number(e.target.value))}
                  className="w-full p-4 pl-10 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-black text-slate-700 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Periodo de Cobro</label>
              <select 
                value={modalidad} 
                onChange={(e) => setModalidad(e.target.value)}
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-600 appearance-none shadow-inner cursor-pointer"
              >
                <option value="semanal">Cada Semana</option>
                <option value="quincenal">Cada Quincena</option>
                <option value="mensual">Cada Mes</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Número de Pagos</label>
              <input 
                type="number" 
                value={cuotas} 
                onChange={(e) => setCuotas(Number(e.target.value))}
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-700 shadow-inner"
              />
            </div>
          </div>

          <div className="p-8 bg-[#050533] rounded-[2rem] text-white relative overflow-hidden group shadow-xl shadow-blue-900/20">
            <CheckCircle2 className="absolute -right-4 -bottom-4 text-white opacity-5 group-hover:scale-110 transition-transform" size={120} />
            <p className="text-[10px] uppercase font-black text-sky-400 mb-3 tracking-[0.2em]">Cuota Calculada</p>
            <p className="text-4xl font-black tracking-tighter">${pagoPorCuota.toFixed(2)}</p>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-slate-400 font-medium italic">Retorno total esperado:</p>
              <p className="text-sm font-bold text-emerald-400">${montoTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* VISTA DE PROYECCIÓN */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center px-4">
          <h3 className="font-black text-slate-800 text-lg uppercase tracking-tighter italic">Proyección de Pagos</h3>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest border border-blue-100">
            {cuotas} Exhibiciones
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fechasPago.map((fecha, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:border-[#0047AB]/30 transition-all group hover:shadow-lg hover:shadow-blue-900/5"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:border-[#0047AB]/20 transition-colors">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                    {fecha.toLocaleDateString('es-MX', { month: 'short' })}
                  </span>
                  <span className="text-xl font-black text-slate-800 leading-none">
                    {fecha.getDate()}
                  </span>
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm leading-none">Abono #{index + 1}</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
                    {fecha.toLocaleDateString('es-MX', { weekday: 'long' })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xl font-black text-[#0047AB] tracking-tighter">${pagoPorCuota.toFixed(2)}</p>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                   <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Activo</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* NOTA INSTITUCIONAL */}
        <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start gap-4 shadow-sm shadow-blue-100/50">
          <div className="p-2 bg-white rounded-xl text-[#0047AB] shadow-sm">
            <Info size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black text-[#0047AB] uppercase tracking-widest">Política de Cobranza Sábado/Domingo</p>
            <p className="text-xs text-blue-700/70 font-medium leading-relaxed italic">
              El simulador incluye los sábados como días hábiles. Si una proyección coincide con un domingo, la fecha se recorre automáticamente al lunes inmediato superior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}