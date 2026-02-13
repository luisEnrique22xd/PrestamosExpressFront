// "use client";
// import { useState } from 'react';
// import { UserPlus, RefreshCcw, ShieldCheck, UserCircle } from 'lucide-react';

// export default function PrestamosPage() {
//   const [riesgo, setRiesgo] = useState<'verde' | 'amarillo' | 'rojo'>('verde');
//   const [tipoCliente, setTipoCliente] = useState<'nuevo' | 'recurrente'>('nuevo');

//   return (
//     <div className="max-w-4xl mx-auto space-y-6">
//       {/* SELECTOR DE SITUACIÓN */}
//       <div className="grid grid-cols-2 gap-4">
//         <button 
//           onClick={() => setTipoCliente('nuevo')}
//           className={`p-6 rounded-3xl border-2 transition-all flex items-center gap-4 ${
//             tipoCliente === 'nuevo' 
//             ? 'border-sky-500 bg-white shadow-lg shadow-sky-100' 
//             : 'border-transparent bg-slate-100 text-slate-400 hover:bg-slate-200'
//           }`}
//         >
//           <div className={`p-3 rounded-2xl ${tipoCliente === 'nuevo' ? 'bg-sky-500 text-white' : 'bg-slate-300 text-white'}`}>
//             <UserPlus size={24} />
//           </div>
//           <div className="text-left">
//             <p className="font-bold text-slate-800 leading-none">Cliente Nuevo</p>
//             <p className="text-[10px] mt-1 uppercase font-bold tracking-tighter">Requiere datos de Aval</p>
//           </div>
//         </button>

//         <button 
//           onClick={() => setTipoCliente('recurrente')}
//           className={`p-6 rounded-3xl border-2 transition-all flex items-center gap-4 ${
//             tipoCliente === 'recurrente' 
//             ? 'border-sky-500 bg-white shadow-lg shadow-sky-100' 
//             : 'border-transparent bg-slate-100 text-slate-400 hover:bg-slate-200'
//           }`}
//         >
//           <div className={`p-3 rounded-2xl ${tipoCliente === 'recurrente' ? 'bg-sky-500 text-white' : 'bg-slate-300 text-white'}`}>
//             <RefreshCcw size={24} />
//           </div>
//           <div className="text-left">
//             <p className="font-bold text-slate-800 leading-none">Cliente Recurrente</p>
//             <p className="text-[10px] mt-1 uppercase font-bold tracking-tighter">Historial sin atrasos</p>
//           </div>
//         </button>
//       </div>

//       {/* FORMULARIO PRINCIPAL */}
//       <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
//         <div className="flex justify-between items-start mb-10">
//           <div>
//             <h2 className="text-2xl font-bold text-slate-800">
//               Pre-aprobación: {tipoCliente === 'nuevo' ? 'Alta de Préstamo' : 'Renovación'}
//             </h2>
//             <p className="text-slate-400 text-sm">
//               {tipoCliente === 'nuevo' 
//                 ? 'Complete los datos del aval para proceder con el primer préstamo.' 
//                 : 'Verifique el ID del cliente para confirmar el estatus de riesgo.'}
//             </p>
//           </div>
          
//           {/* Badge de Riesgo (Semáforo) */}
//           <div className={`px-6 py-2 rounded-2xl border-2 flex items-center gap-3 transition-all ${
//             riesgo === 'verde' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' :
//             riesgo === 'amarillo' ? 'border-amber-100 bg-amber-50 text-amber-600' :
//             'border-red-100 bg-red-50 text-red-600'
//           }`}>
//             <div className={`w-3 h-3 rounded-full animate-pulse ${
//               riesgo === 'verde' ? 'bg-emerald-500' : riesgo === 'amarillo' ? 'bg-amber-500' : 'bg-red-500'
//             }`} />
//             <span className="font-bold text-sm uppercase tracking-widest">{riesgo}</span>
//           </div>
//         </div>

//         <form className="grid grid-cols-2 gap-6">
//           {/* CAMPOS COMUNES */}
//           <div className="space-y-2">
//             <label className="text-xs font-bold text-slate-400 uppercase ml-2">ID del Cliente</label>
//             <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-sky-400" placeholder="Ej. 1024" />
//           </div>
//           <div className="space-y-2">
//             <label className="text-xs font-bold text-slate-400 uppercase ml-2">Monto Solicitado</label>
//             <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-sky-400" placeholder="$0.00" />
//           </div>

//           {/* CAMPOS ESPECÍFICOS PARA CLIENTE NUEVO (AVAL) */}
//           {tipoCliente === 'nuevo' && (
//             <div className="col-span-2 mt-4 p-6 bg-sky-50/50 rounded-3xl border border-sky-100 space-y-6">
//               <div className="flex items-center gap-2 text-sky-600 font-bold text-sm uppercase">
//                 <ShieldCheck size={20} /> Información del Aval
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Nombre del Aval</label>
//                   <input type="text" className="w-full p-3 bg-white rounded-xl outline-none border border-sky-100 focus:ring-2 focus:ring-sky-400" placeholder="Nombre completo" />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Teléfono Aval</label>
//                   <input type="tel" className="w-full p-3 bg-white rounded-xl outline-none border border-sky-100 focus:ring-2 focus:ring-sky-400" placeholder="246 000 0000" />
//                 </div>
//                 <div className="col-span-2 space-y-2">
//                   <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Dirección Aval</label>
//                   <input type="text" className="w-full p-3 bg-white rounded-xl outline-none border border-sky-100 focus:ring-2 focus:ring-sky-400" placeholder="Calle, número y colonia" />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* CAMPOS ESPECÍFICOS PARA RECURRENTE (HISTORIAL) */}
//           {tipoCliente === 'recurrente' && (
//              <div className="col-span-2 flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
//                 <UserCircle className="text-emerald-500" size={32} />
//                 <div>
//                   <p className="text-sm font-bold text-emerald-800 leading-none">Historial Verificado</p>
//                   <p className="text-xs text-emerald-600 mt-1 italic">El aval previo se mantendrá como referencia predeterminada.</p>
//                 </div>
//              </div>
//           )}

//           <div className="space-y-2">
//             <label className="text-xs font-bold text-slate-400 uppercase ml-2">Interés (%)</label>
//             <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-sky-400" placeholder="10%" />
//           </div>
//           <div className="space-y-2">
//             <label className="text-xs font-bold text-slate-400 uppercase ml-2">Modalidad (Semanas)</label>
//             <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-sky-400 appearance-none">
//               <option value="4">4 Semanas</option>
//               <option value="8">8 Semanas</option>
//               <option value="12">12 Semanas</option>
//             </select>
//           </div>
          
//           <button 
//             type="submit"
//             disabled={riesgo === 'rojo'}
//             className={`col-span-2 mt-4 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
//               riesgo === 'rojo' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#050533] text-white hover:bg-sky-500 shadow-xl shadow-blue-900/20'
//             }`}
//           >
//             {riesgo === 'rojo' ? 'Bloqueado por Incumplimiento' : 'Finalizar Pre-aprobación'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
"use client";
import { useState } from 'react';
import { UserPlus, RefreshCcw, ShieldCheck, UserCircle, CheckCircle2 } from 'lucide-react';

// --- COLORES INSTITUCIONALES ---
const COLORS = {
  azulRey: '#0047AB',
  azulOscuro: '#050533',
  verdeExito: '#10B981',
  rojoAlerta: '#DC2626',
  amarilloCuidado: '#FBBF24',
};

export default function PrestamosPage() {
  const [riesgo, setRiesgo] = useState<'verde' | 'amarillo' | 'rojo'>('verde');
  const [tipoCliente, setTipoCliente] = useState<'nuevo' | 'recurrente'>('nuevo');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* SELECTOR DE SITUACIÓN INSTITUCIONAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => setTipoCliente('nuevo')}
          className={`p-8 rounded-[2.5rem] border-2 transition-all flex items-center gap-6 relative overflow-hidden group ${
            tipoCliente === 'nuevo' 
            ? 'border-[#0047AB] bg-white shadow-xl shadow-blue-100' 
            : 'border-transparent bg-slate-100 text-slate-400 hover:bg-slate-200'
          }`}
        >
          <div className={`p-4 rounded-2xl transition-colors ${tipoCliente === 'nuevo' ? 'bg-[#0047AB] text-white' : 'bg-slate-300 text-white'}`}>
            <UserPlus size={28} />
          </div>
          <div className="text-left relative z-10">
            <p className={`font-black text-lg leading-none ${tipoCliente === 'nuevo' ? 'text-slate-800' : 'text-slate-400'}`}>Cliente Nuevo</p>
            <p className="text-[10px] mt-2 uppercase font-black tracking-[0.1em]">Requiere validación de Aval</p>
          </div>
          {tipoCliente === 'nuevo' && <CheckCircle2 className="absolute -right-2 -bottom-2 text-blue-50 opacity-50" size={100} />}
        </button>

        <button 
          onClick={() => setTipoCliente('recurrente')}
          className={`p-8 rounded-[2.5rem] border-2 transition-all flex items-center gap-6 relative overflow-hidden group ${
            tipoCliente === 'recurrente' 
            ? 'border-[#0047AB] bg-white shadow-xl shadow-blue-100' 
            : 'border-transparent bg-slate-100 text-slate-400 hover:bg-slate-200'
          }`}
        >
          <div className={`p-4 rounded-2xl transition-colors ${tipoCliente === 'recurrente' ? 'bg-[#0047AB] text-white' : 'bg-slate-300 text-white'}`}>
            <RefreshCcw size={28} />
          </div>
          <div className="text-left relative z-10">
            <p className={`font-black text-lg leading-none ${tipoCliente === 'recurrente' ? 'text-slate-800' : 'text-slate-400'}`}>Cliente Recurrente</p>
            <p className="text-[10px] mt-2 uppercase font-black tracking-[0.1em]">Historial de cumplimiento</p>
          </div>
          {tipoCliente === 'recurrente' && <CheckCircle2 className="absolute -right-2 -bottom-2 text-blue-50 opacity-50" size={100} />}
        </button>
      </div>

      {/* FORMULARIO PRINCIPAL */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic">
              {tipoCliente === 'nuevo' ? 'Alta de Préstamo' : 'Renovación de Crédito'}
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1">
              {tipoCliente === 'nuevo' 
                ? 'Proceso de registro inicial y vinculación de garantía.' 
                : 'Carga automática de datos históricos del cliente.'}
            </p>
          </div>
          
          {/* Semáforo de Riesgo Dinámico */}
          <div className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-4 transition-all shadow-sm ${
            riesgo === 'verde' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' :
            riesgo === 'amarillo' ? 'border-amber-100 bg-amber-50 text-amber-600' :
            'border-red-100 bg-red-50 text-red-600'
          }`}>
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              riesgo === 'verde' ? 'bg-emerald-500' : riesgo === 'amarillo' ? 'bg-amber-500' : 'bg-red-500'
            }`} />
            <span className="font-black text-xs uppercase tracking-[0.2em]">{riesgo}</span>
          </div>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">ID del Cliente</label>
            <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-700 transition-all border border-transparent focus:bg-white" placeholder="Ej. 1024" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Monto Solicitado</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
              <input type="number" className="w-full p-4 pl-8 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-black text-slate-800 transition-all border border-transparent focus:bg-white" placeholder="0.00" />
            </div>
          </div>

          {/* SECCIÓN AVAL - CLIENTE NUEVO */}
          {tipoCliente === 'nuevo' && (
            <div className="col-span-1 md:col-span-2 mt-4 p-8 bg-blue-50/30 rounded-[2rem] border border-blue-100 space-y-6">
              <div className="flex items-center gap-3 text-[#0047AB] font-black text-xs uppercase tracking-widest">
                <ShieldCheck size={22} /> Garantía de Pago (Aval)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest text-blue-800/40">Nombre Completo del Aval</label>
                  <input type="text" className="w-full p-4 bg-white rounded-2xl outline-none border border-blue-100 focus:ring-2 focus:ring-[#0047AB] font-bold" placeholder="Responsable solidario" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest text-blue-800/40">Teléfono de Contacto</label>
                  <input type="tel" className="w-full p-4 bg-white rounded-2xl outline-none border border-blue-100 focus:ring-2 focus:ring-[#0047AB] font-bold" placeholder="246 000 0000" />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest text-blue-800/40">Domicilio Particular del Aval</label>
                  <input type="text" className="w-full p-4 bg-white rounded-2xl outline-none border border-blue-100 focus:ring-2 focus:ring-[#0047AB] font-bold" placeholder="Dirección completa comprobable" />
                </div>
              </div>
            </div>
          )}

          {/* VERIFICACIÓN RECURRENTE */}
          {tipoCliente === 'recurrente' && (
             <div className="col-span-1 md:col-span-2 flex items-center gap-6 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-500">
                  <UserCircle size={32} />
                </div>
                <div>
                  <p className="text-base font-black text-emerald-900 leading-none">Perfil de Confianza</p>
                  <p className="text-xs text-emerald-600 mt-2 italic font-medium">El sistema vinculará automáticamente el historial de abonos y el aval registrado previamente.</p>
                </div>
             </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Tasa de Interés Sugerida</label>
            <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold" placeholder="10%" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Esquema de Pagos</label>
            <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] appearance-none font-bold text-slate-700">
              <option value="4">4 Semanas (Periodo Corto)</option>
              <option value="8">8 Semanas (Periodo Estándar)</option>
              <option value="12">12 Semanas (Periodo Extendido)</option>
            </select>
          </div>
          
          <button 
            type="submit"
            disabled={riesgo === 'rojo'}
            className={`col-span-1 md:col-span-2 mt-6 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] transition-all ${
              riesgo === 'rojo' 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
              : 'bg-[#050533] text-white hover:bg-[#0047AB] shadow-2xl shadow-blue-900/30'
            }`}
          >
            {riesgo === 'rojo' ? 'Operación Bloqueada por Incumplimiento' : 'Emitir Orden de Pre-aprobación'}
          </button>
        </form>
      </div>
    </div>
  );
}