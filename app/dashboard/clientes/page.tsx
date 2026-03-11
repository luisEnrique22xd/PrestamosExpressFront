'use client';
import { useEffect, useState, useRef } from 'react';
import { 
  ChevronDown, ChevronLeft, ChevronRight, ExternalLink, 
  MapPin, Phone, UserCheck, X, Search, UserPlus 
} from 'lucide-react';
import React from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- ESTADOS DE BÚSQUEDA Y PAGINACIÓN ---
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const clientesPorPagina = 5;

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    telefono: '',
    curp: '',
    direccion: '',
    fecha_nacimiento: ''
  });

  // 1. CARGA DE DATOS UNIFICADA
  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clientes/');
      // Verificamos si la respuesta es un array directo
      const data = Array.isArray(response.data) ? response.data : [];
      setClientes(data);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      setClientes([]); // Evita que el map falle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // 2. FILTRADO CORREGIDO
  // Usamos trim() para evitar que espacios accidentales oculten los resultados
  const clientesFiltrados = (clientes || []).filter(c => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    return (
      c.nombre?.toLowerCase().includes(search) || 
      c.id?.toString().includes(search)
    );
  });

  // 3. PAGINACIÓN
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const indiceUltimo = currentPage * clientesPorPagina;
  const indicePrimero = indiceUltimo - clientesPorPagina;
  const clientesActuales = clientesFiltrados.slice(indicePrimero, indiceUltimo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nacimiento = new Date(nuevoCliente.fecha_nacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    if (hoy < new Date(nacimiento.setFullYear(nacimiento.getFullYear() + edad))) edad--;

    if (edad < 18) {
      return alert("❌ Error: El cliente debe ser mayor de edad (18+) para recibir un préstamo.");
    }
    
    try {
      const response = await api.post('/clientes/', nuevoCliente);
      // Recargamos todos los clientes para asegurar consistencia
      await fetchClientes();
      
      setNuevoCliente({ nombre: '', telefono: '', curp: '', direccion: '', fecha_nacimiento: '' });
      setIsModalOpen(false);
      alert("✅ Cliente guardado con éxito");
    } catch (error: any) {
      console.error("❌ Error:", error.response?.data);
      alert(`❌ Error: ${JSON.stringify(error.response?.data)}`);
    }
  };
  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">Sincronizando base de datos de 
Santa Maria Acuitlapilco

...</div>;

  return (
    
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      
      
      {/* HEADER CON BUSCADOR */}
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter italic">Directorio General</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Total Clientes: {clientes.length}</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por ID o Nombre..." 
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0047AB] outline-none" 
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#0047AB] text-white font-black px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all text-xs uppercase">
            <UserPlus size={18} /> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* MODAL DE NUEVO CLIENTE (MANTENIDO) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050533]/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg p-10 rounded-[2.5rem] shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500"><X size={24} /></button>
            <h2 className="text-2xl font-black text-slate-800 mb-2 italic">Registro de Cliente</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nombre Completo</label>
                <input type="text" required value={nuevoCliente.nombre} onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB]" placeholder="Ej. Juan Pérez" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Teléfono</label>
                <input type="tel" required value={nuevoCliente.telefono} onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB]" placeholder="246 123 4567" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">CURP</label>
                <input type="text" required maxLength={18} value={nuevoCliente.curp} onChange={(e) => setNuevoCliente({...nuevoCliente, curp: e.target.value.toUpperCase()})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-mono" placeholder="18 Caracteres" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Dirección</label>
                <input type="text" required value={nuevoCliente.direccion} onChange={(e) => setNuevoCliente({...nuevoCliente, direccion: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB]" placeholder="Calle, #, Colonia" />
              </div>
              <div className="col-span-2 space-y-1">
  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
    Fecha de Nacimiento
  </label>
  <input 
    type="date" 
    required 
    value={nuevoCliente.fecha_nacimiento} 
    onChange={(e) => setNuevoCliente({...nuevoCliente, fecha_nacimiento: e.target.value})} 
    className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#0047AB]" 
  />
</div>
              <button type="submit" className="col-span-2 mt-4 bg-[#050533] text-white font-black py-5 rounded-2xl hover:bg-[#0047AB] transition-all uppercase text-xs tracking-[0.2em]">Guardar en Postgres</button>
            </form>
          </div>
        </div>
      )}

      {/* TABLA DINÁMICA */}
      <table className="w-full text-left">
        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
          <tr>
            <th className="px-8 py-5">Identidad / ID</th>
            <th className="px-8 py-5">Contacto</th>
            <th className="px-8 py-5 text-center">Saldo</th>
            <th className="px-8 py-5 text-center">Estatus</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {clientesActuales.length > 0 ? (
            clientesActuales.map((c) => (
              <React.Fragment key={c.id}>
                <tr 
                  onClick={() => setExpandedId(expandedId === c.id ? null : c.id)} 
                  className={`transition-all cursor-pointer ${expandedId === c.id ? 'bg-blue-50/30' : 'hover:bg-slate-50/40'}`}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${expandedId === c.id ? 'bg-[#0047AB] text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {expandedId === c.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-base">{c.nombre}</p>
                        <p className="text-[10px] text-[#0047AB] font-bold uppercase">ID: {c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium">{c.telefono}</td>
                  <td className="px-8 py-6 text-center">
  {/* El saldo se pone rojo si es mayor a 0 */}
  <span className={`font-black text-base ${parseFloat(c.saldo_actual) > 0 ? 'text-red-500' : 'text-slate-400'}`}>
    ${parseFloat(c.saldo_actual || '0').toLocaleString('es-MX', { minimumFractionDigits: 2 })}
  </span>
</td>
<td className="px-8 py-6 text-center">
  {/* Badge de estatus más "Premium" */}
  <div className={`mx-auto w-fit px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border-2 transition-all ${
    c.tiene_prestamo_activo 
    ? 'bg-red-50 text-red-600 border-red-100 shadow-sm shadow-red-100' 
    : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-50'
  }`}>
    {c.tiene_prestamo_activo ? '● Con Deuda' : '● Sin Adeudo'}
  </div>
</td>
                </tr>

                {expandedId === c.id && (
                  <tr className="bg-slate-50/50">
                    <td colSpan={4} className="px-16 py-10 animate-in slide-in-from-top-4 duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-l-4 border-[#0047AB] pl-8">
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ubicación</p>
                          <div className="text-sm text-slate-600 font-medium"><span>{c.direccion}</span></div>
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Garantías</p>
                          <div className="text-sm text-slate-600 font-bold">Aval: {c.datos_ultimo_aval?.nombre_aval || 'S/N'}</div>
                        </div>
                        <div className="flex flex-col justify-center gap-3">
  {/* BOTÓN WHATSAPP RÁPIDO */}
  <button 
    onClick={(e) => {
      e.stopPropagation();
      const msg = encodeURIComponent(`Hola ${c.nombre}, te contactamos de Préstamos Express Santa Maria Acuitlapilco

...`);
      window.open(`https://wa.me/52${c.telefono}?text=${msg}`, '_blank');
    }}
    className="flex items-center justify-center gap-2 bg-[#10B981] text-white text-[10px] font-black uppercase py-3 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-900/10"
  >
    <Phone size={14}/> Contactar
  </button>

  <button 
    onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/${c.id}`); }} 
    className="flex items-center justify-center gap-2 bg-[#050533] text-white text-[10px] font-black uppercase py-3 rounded-xl hover:bg-[#0047AB] transition-all"
  >
    Ver Expediente <ExternalLink size={14}/>
  </button>
</div>
                      </div>
                    </td>
                  </tr>
                )} 
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="p-20 text-center text-slate-400 italic">No se encontraron clientes</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINACIÓN (MANTENIDA) */}
      <div className="p-8 bg-slate-50/30 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          Mostrando <span className="text-[#0047AB] font-black">{indicePrimero + 1} - {Math.min(indiceUltimo, clientesFiltrados.length)}</span> de {clientesFiltrados.length}
        </p>
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#0047AB] disabled:opacity-30"><ChevronLeft size={20} /></button>
          <div className="flex gap-2">
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 text-xs font-black rounded-2xl transition-all ${currentPage === i + 1 ? 'bg-[#0047AB] text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>{i + 1}</button>
            ))}
          </div>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPaginas))} disabled={currentPage === totalPaginas} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#0047AB] disabled:opacity-30"><ChevronRight size={20} /></button>
        </div>
      </div>
    </div>
  );
}