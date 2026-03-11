
'use client';
import React, { useState } from "react";
import { useEffect } from "react";
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, ChevronLeft, Phone, MapPin, UserCheck, ExternalLink, Search } from 'lucide-react';

const COLORS = {
  azulRey: '#0047AB',
  rojoMora: '#DC2626',
  verdeOk: '#10B981',
  fondoGris: '#F8FAFE'
};

export default function CarteraVencidaPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const clientesPorPagina = 5;
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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

  // 2. FILTRADO DE CARTERA VENCIDA
  const clientesFiltrados = (clientes || []).filter(c => {
    // CRITERIO DE CARTERA VENCIDA: 
    // 1. Debe tener un préstamo activo.
    // 2. El saldo debe ser mayor a 0.
    // 3. (OPCIONAL) Podrías filtrar solo los que tienen recargos > 0
    const tieneDeudaReal = c.tiene_prestamo_activo && parseFloat(c.saldo_actual) > 0;
    const tieneRecargos = parseFloat(c.total_penalizaciones) > 0;

    const search = searchTerm.toLowerCase().trim();
    const coincideBusqueda = !search || (
      c.nombre?.toLowerCase().includes(search) ||
      c.id?.toString().includes(search)
    );

    return tieneDeudaReal && tieneRecargos && coincideBusqueda;
  });

  // 3. PAGINACIÓN
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const indiceUltimo = currentPage * clientesPorPagina;
  const indicePrimero = indiceUltimo - clientesPorPagina;
  const clientesActuales = clientesFiltrados.slice(indicePrimero, indiceUltimo);

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
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por ID o Nombre..."
            className="bg-slate-50 border-none rounded-2xl px-12 py-3 text-sm w-80 focus:ring-2 focus:ring-[#0047AB] outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      {/* TABLA DE CLIENTES */}
      <div className="overflow-x-auto">
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
                    <td className="px-8 py-6 text-center font-black text-[#DC2626]">
                      ${c.saldo_actual || '0.00'}
                    </td>
                    <td className="px-8 py-6 text-center">

                      <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Desglose de Mora</p>
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-slate-500 font-bold">Recargos Acumulados:</span>
                          <span className="text-xs text-red-600 font-black">+ ${c.total_penalizaciones}</span>
                        </div>
                        <p className="text-[9px] text-red-400 italic mt-2">* Aplicando 1.5% diario sobre capital inicial</p>
                      </div>
                    </td>
                  </tr>

                  {expandedId === c.id && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={4} className="px-16 py-10 animate-in slide-in-from-top-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-l-4 border-red-600 pl-8 bg-white p-6 rounded-r-3xl shadow-inner">
                          <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Domicilio Localizado</p>
                            <div className="text-sm text-slate-600 font-bold flex items-start gap-2">
                              <MapPin size={16} className="text-red-500 shrink-0" />
                              <span>{c.direccion}</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Garantía / Aval</p>
                            <div className="text-sm text-slate-700 font-black">{c.datos_ultimo_aval?.nombre_aval || 'S/N'}</div>
                            <p className="text-[11px] text-slate-400 font-medium">Tel: {c.datos_ultimo_aval?.telefono_aval || 'N/A'}</p>
                          </div>

                          <div className="flex flex-col gap-3 justify-center">
                            <button
                              onClick={() => {
                                const msg = encodeURIComponent(`Hola ${c.nombre}, te recordamos tu saldo pendiente de $${c.saldo_actual} en Préstamos Express. Evita más recargos.`);
                                window.open(`https://wa.me/52${c.telefono}?text=${msg}`, '_blank');
                              }}
                              className="flex items-center justify-center gap-2 bg-[#10B981] text-white text-[10px] font-black uppercase py-3 rounded-xl hover:bg-emerald-600"
                            >
                              <Phone size={14} /> Contactar Cliente
                            </button>
                          </div>

                          <div className="flex flex-col gap-3 justify-center">
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/${c.id}`); }}
                              className="flex items-center justify-center gap-2 bg-[#050533] text-white text-[10px] font-black uppercase py-3 rounded-xl hover:bg-[#0047AB]"
                            >
                              Ver Expediente <ExternalLink size={14} />
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
      </div>

      {/* PAGINACIÓN INSTITUCIONAL */}
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