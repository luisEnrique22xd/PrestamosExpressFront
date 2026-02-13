// // app/dashboard/clientes/page.tsx
// 'use client';
// import { useState } from 'react';
// import {ChevronDown, ChevronLeft, ChevronRight, ExternalLink, MapPin, Phone, UserCheck, X} from 'lucide-react';
// import React from 'react';

// const clientes = [
//   { id: '1024', nombre: 'Juan Pérez', contacto: '246-123-4455', deuda: '$2,500', status: 'Vencido', direccion: 'Av. Juárez #12, Tlaxcala', aval: 'Pedro S.', curp: 'PERJ90...' },
//   { id: '1025', nombre: 'María Sosa', contacto: '246-998-1122', deuda: '$1,800', status: 'Corriente', direccion: 'Calle 5 de Mayo #4, Huamantla', aval: 'Lucía M.', curp: 'SOSM85...' },
// ];

// export default function ClientesPage() {
//    const [expandedId, setExpandedId] = useState<string | null>(null);
  
//     const toggleRow = (id: string) => {
//       setExpandedId(expandedId === id ? null : id);
//     };
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   return (
//     <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
//       <div className="p-8 border-b border-slate-50 flex justify-between items-center">
//         <h2 className="text-xl font-bold text-slate-800">Directorio de Clientes</h2>
//         <button onClick={()=> setIsModalOpen(true)} className="w-big bg-sky-500 text-white font-bold py-3 rounded-xl hover:bg-sky-600 transition-all" >
//             Nuevo Cliente
//         </button>
//         <input type="text" placeholder="Buscar por ID o Nombre..." className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm w-64 focus:ring-2 focus:ring-sky-400" />
//       </div>
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//           {/* Contenedor del Formulario Flotante */}
//           <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
//             {/* Botón Cerrar */}
//             <button 
//               onClick={() => setIsModalOpen(false)}
//               className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
//             >
//               <X size={24} />
//             </button>

//             <h2 className="text-2xl font-bold text-slate-800 mb-6">Registro de Cliente</h2>
            
//             <form className="space-y-4">
//               <div>
//                 <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nombre Completo</label>
//                 <input type="text" className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-sky-400" placeholder="Ej. Juan Pérez" />
//               </div>
              
//               <div>
//                 <label className="text-xs font-bold text-slate-400 uppercase ml-1">Teléfono</label>
//                 <input type="tel" className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-sky-400" placeholder="246 123 4567" />
//               </div>

//               <div>
//                 <label className="text-xs font-bold text-slate-400 uppercase ml-1">Direccion</label>
//                 <input type="text" className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-sky-400" placeholder="246 123 4567" />
//               </div>

//               <div>
//                 <label className="text-xs font-bold text-slate-400 uppercase ml-1">Fecha de Nacimiento</label>
//                 <input type="date" className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-sky-400" placeholder="Fecha de Nacimiento" />
//               </div> 

//               {/* <div>
//                 <label className="text-xs font-bold text-slate-400 uppercase ml-1">Aval</label>
//                 <input type="text" className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-sky-400" placeholder="Ej.Juan Pérez" />
//               </div> 

//               <div>
//                 <label className="text-xs font-bold text-slate-400 uppercase ml-1">Teléfono Aval</label>
//                 <input type="tel" className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-sky-400" placeholder="246 123 4567" />
//               </div> */}

//               <div className="pt-4">
//                 <button 
//                   type="submit"
//                   className="w-full bg-[#050533] text-white font-bold py-3 rounded-xl hover:bg-sky-600 transition-all"
//                 >
//                   Guardar Cliente
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
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
import { useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink, MapPin, Phone, UserCheck, X, Search, UserPlus } from 'lucide-react';
import React from 'react';
import api from '@/lib/api';

interface Cliente {
  id?: number;
  nombre: string;
  telefono: string;
  curp: string;
  direccion: string;
  fecha_nacimiento: string;
  status?: string;
  deuda?: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- NUEVO ESTADO PARA EL FORMULARIO ---
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    telefono: '',
    curp: '',
    direccion: '',
    fecha_nacimiento: '' // Asegúrate de que coincida con el nombre en Django
  });

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await api.get('/clientes/');
        setClientes(response.data);
      } catch (error) {
        console.error('Error al obtener clientes:', error);
      } finally {
        setLoading(false)
      }
    };
    fetchClientes();
  }, [])

  // --- FUNCIÓN PARA GUARDAR ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/clientes/', nuevoCliente);
      // Actualizamos la tabla localmente
      setClientes([...clientes, response.data]);
      // Limpiamos y cerramos
      setNuevoCliente({ nombre: '', telefono: '', curp: '', direccion: '', fecha_nacimiento: '' });
      setIsModalOpen(false);
      alert("✅ Cliente guardado con éxito");
    } catch (error: any) {
      console.error('Error al guardar:', error.response?.data);
      alert("❌ Error al guardar. Revisa que el CURP sea único.");
    }
  };

  const toggleRow = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <div className="p-10 text-center font-black animate-pulse">Cargando base de datos...</div>;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      {/* HEADER DINÁMICO */}
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter italic">Directorio General</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Gestión de Clientes Activos</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0047AB]" size={18} />
            <input type="text" placeholder="Buscar cliente..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0047AB] outline-none transition-all" />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#0047AB] text-white font-black px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-xs uppercase tracking-widest">
            <UserPlus size={18} /> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* MODAL CON LÓGICA CONECTADA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050533]/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg p-10 rounded-[2.5rem] shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>

            <h2 className="text-2xl font-black text-slate-800 mb-2 italic">Registro de Cliente</h2>
            <p className="text-slate-400 text-sm mb-8">Ingrese la información básica para el alta en el sistema.</p>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={nuevoCliente.nombre}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#0047AB]" 
                  placeholder="Ej. Juan Pérez" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Teléfono</label>
                <input 
                  type="tel" 
                  required
                  value={nuevoCliente.telefono}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#0047AB]" 
                  placeholder="246 123 4567" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">CURP</label>
                <input 
                  type="text" 
                  required
                  maxLength={18}
                  value={nuevoCliente.curp}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, curp: e.target.value.toUpperCase()})}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#0047AB] font-mono" 
                  placeholder="CURP123456..." 
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Dirección Particular</label>
                <input 
                  type="text" 
                  required
                  value={nuevoCliente.direccion}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, direccion: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#0047AB]" 
                  placeholder="Calle, #, Colonia" 
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nacimiento</label>
                <input 
                  type="date" 
                  required
                  value={nuevoCliente.fecha_nacimiento}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, fecha_nacimiento: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#0047AB]" 
                />
              </div>

              <button type="submit" className="col-span-2 mt-4 bg-[#050533] text-white font-black py-5 rounded-2xl hover:bg-[#0047AB] transition-all uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-900/20">
                Guardar Cliente en Base de Datos
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TABLA Y PAGINACIÓN (Continúa igual) */}
      <table className="w-full text-left">
        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
          <tr>
            <th className="px-8 py-5">Identidad / ID</th>
            <th className="px-8 py-5">Contacto Directo</th>
            <th className="px-8 py-5 text-center">Estado Financiero</th>
            <th className="px-8 py-5 text-center">Estatus</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {clientes.map((c:any) => (
            <React.Fragment key={c.id}>
              <tr 
                onClick={() => toggleRow(c.id)}
                className={`transition-all cursor-pointer ${expandedId === c.id ? 'bg-blue-50/30' : 'hover:bg-slate-50/40'}`}
              >
                <td className="px-8 py-6 text-sm">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl transition-colors ${expandedId === c.id ? 'bg-[#0047AB] text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {expandedId === c.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-base">{c.nombre}</p>
                      <p className="text-[10px] text-[#0047AB] font-bold uppercase">ID: {c.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Phone size={14} className="text-slate-300" />
                    {c.telefono}
                  </div>
                </td>
                <td className={`px-8 py-6 text-center font-black text-base ${c.status === 'Vencido' ? 'text-[#DC2626]' : 'text-slate-300'}`}>
                  {c.status === 'Vencido' ? c.deuda : 'Sin Mora'}
                </td>
                <td className="px-8 py-6 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                    c.status === 'Vencido' 
                    ? 'bg-red-50 text-[#DC2626] border-red-100 shadow-red-50' 
                    : 'bg-emerald-50 text-[#10B981] border-emerald-100 shadow-emerald-50'
                  }`}>
                    {c.status}
                  </span>
                </td>
              </tr>

              {/* DETALLES EXPANDIBLES */}
              {/* {expandedId === c.id && (
                <tr className="bg-slate-50/50">
                  <td colSpan={4} className="px-16 py-10 animate-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-l-4 border-[#0047AB] pl-8">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ubicación Registrada</p>
                        <div className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                          <MapPin size={18} className="text-[#0047AB] mt-0.5" />
                          <span>{c.direccion}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Garantías</p>
                        <div className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                          <UserCheck size={18} className="text-[#0047AB]" />
                          <span>Aval: {c.aval}</span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 bg-white px-3 py-1 rounded-lg border border-slate-100 inline-block">CURP: {c.curp}</p>
                      </div>

                      <div className="flex flex-col justify-center gap-3">
                        <button className="flex items-center justify-center gap-2 bg-[#050533] text-white text-[10px] font-black uppercase tracking-[0.15em] py-4 rounded-2xl hover:bg-[#0047AB] transition-all shadow-xl shadow-blue-900/20">
                          Ir al Expediente <ExternalLink size={16}/>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )} */}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div className="p-8 bg-slate-50/30 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          Resultados: <span className="text-[#0047AB] font-black">1 - {clientes.length}</span> de 120
        </p>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#0047AB] disabled:opacity-30">
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2">
            {[1, 2, 3].map((page) => (
              <button 
                key={page} 
                className={`w-10 h-10 text-xs font-black rounded-2xl transition-all ${
                  page === 1 ? 'bg-[#0047AB] text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-400 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#0047AB]">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}