"use client";
import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, User, X, Phone,
  DollarSign, Calendar as CalendarIcon, Loader2, CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

// --- COLORES INSTITUCIONALES ---
const COLORS = {
  azulRey: '#0047AB',
  azulOscuro: '#050533',
  verdeExito: '#10B981',
  rojoAlerta: '#DC2626',
};

export default function CalendarioCobranza() {
  const router = useRouter(); // <--- CORREGIDO: router inicializado
  const hoy = new Date();
  
  // Estados de fecha actual
  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [anioActual, setAnioActual] = useState(hoy.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [proyecciones, setProyecciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- CORREGIDO: Función contactarCliente dentro del componente ---
  const contactarCliente = (tel: string, nombre: string) => {
    const msg = encodeURIComponent(`Hola *${nombre}*, te recordamos tu abono de hoy en *Préstamos Express*. 🏦 ¿A qué hora podríamos pasar?`);
    window.open(`https://wa.me/52${tel.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  // Obtener nombre del mes y días
  const nombreMes = new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(new Date(anioActual, mesActual));
  const primerDiaMes = new Date(anioActual, mesActual, 1).getDay();
  const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();

  useEffect(() => {
    const fetchProyecciones = async () => {
      try {
        setLoading(true);
        // Consumimos el endpoint de Django con los filtros de fecha
        const res = await api.get(`/calendario-pagos/?mes=${mesActual + 1}&anio=${anioActual}`);
        setProyecciones(res.data);
      } catch (error) {
        console.error("Error cargando calendario:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProyecciones();
  }, [mesActual, anioActual]);

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const celdas = [];
  for (let i = 0; i < primerDiaMes; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  // --- CORREGIDO: cobrosDelDiaSeleccionado definido antes de ser usado ---
  const cobrosDelDiaSeleccionado = proyecciones.filter(p => p.fecha === selectedDate);
  const totalMontoDia = cobrosDelDiaSeleccionado.reduce((acc, cobro) => acc + Number(cobro.monto), 0);
  if (loading && proyecciones.length === 0) return (
    <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-4">
      <Loader2 className="animate-spin" size={40} />
      <p className="font-black italic uppercase tracking-widest text-xs">Sincronizando agenda...</p>
    </div>
  );

  return (
    <div className="relative flex gap-6 max-w-7xl mx-auto min-h-200 pb-10">

      {/* CALENDARIO PRINCIPAL */}
      <div className={`transition-all duration-500 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 ${selectedDate ? 'w-2/3' : 'w-full'}`}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase">Cobranza {nombreMes}</h2>
            <p className="text-sm text-slate-400 font-medium">Gestión de abonos programados para {anioActual}</p>
          </div>

          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <button onClick={() => setMesActual(m => m - 1)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-[#0047AB]"><ChevronLeft size={20} /></button>
            <span className="font-black text-slate-700 self-center px-6 text-xs uppercase tracking-[0.2em]">{nombreMes} {anioActual}</span>
            <button onClick={() => setMesActual(m => m + 1)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-[#0047AB]"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4 mb-6">
          {diasSemana.map(dia => (
            <div key={dia} className="text-center text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">{dia}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-4">
          {celdas.map((dia, index) => {
            if (dia === null) return <div key={`empty-${index}`} className="h-28" />;

            const fechaActual = new Date(anioActual, mesActual, dia).toDateString();

            // --- DENTRO DEL MAP DE CELDAS ---
            const dObj = new Date(anioActual, mesActual, dia);
            // Formato YYYY-MM-DD (Ej: 2026-03-11)
            const fechaISO = dObj.toISOString().split('T')[0];

            // Comparamos con el formato que viene de Django
            const cobros = proyecciones.filter(p => p.fecha === fechaISO);
            const esHoy = dia === hoy.getDate() && mesActual === hoy.getMonth() && anioActual === hoy.getFullYear();
            const isSelected = selectedDate === fechaISO;
            return (
              <button

                key={dia}
                onClick={() => {
                  // Creamos la fecha asegurando que sea el formato YYYY-MM-DD
                  const d = new Date(anioActual, mesActual, dia);
                  const yyyy = d.getFullYear();
                  const mm = String(d.getMonth() + 1).padStart(2, '0');
                  const dd = String(d.getDate()).padStart(2, '0');
                  const fechaISO = `${yyyy}-${mm}-${dd}`;

                  setSelectedDate(fechaISO); // <--- Guardamos "2026-03-26"
                }}
              >
                <span className={`text-sm font-black ${isSelected ? `text-[${COLORS.azulRey}]` : 'text-slate-400'}`}>{dia}</span>
                {cobros.length > 0 && (
                  <div className="flex -space-x-1 mb-1">
                    {cobros.slice(0, 3).map((c: any, i: number) => (
                      <div
                        key={i}
                        className={`w-5 h-5 rounded-lg border border-white ${c.estatus === 'pagado' ? 'bg-emerald-500' :
                          c.estatus === 'vencido' ? 'bg-red-500' : 'bg-[#0047AB]'
                          }`}
                      />
                    ))}
                  </div>
                )}
                {esHoy && <div className={`absolute top-4 right-4 w-2 h-2 bg-[${COLORS.rojoAlerta}] rounded-full animate-pulse`}></div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* PANEL LATERAL: DETALLE DEL DÍA */}
      {selectedDate && (
        <div className={`w-1/3 bg-[${COLORS.azulOscuro}] rounded-[2.5rem] p-8 text-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col border border-white/5`}>
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl text-sky-400">
                <CalendarIcon size={24} />
              </div>
              <h3 className="text-xl font-black italic tracking-tighter">Cobros del Día</h3>
            </div>
            <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <div className="bg-white/5 p-5 rounded-3xl border border-white/10 mb-8 backdrop-blur-sm text-center">
  <p className="text-[10px] text-sky-400 uppercase font-black tracking-[0.2em] mb-1">Fecha Seleccionada</p>
  <p className="text-lg font-bold text-white tracking-tight capitalize">
    {/* Convertimos el ISO a algo elegante como "Jueves, 26 de marzo" */}
    {selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString('es-MX', { 
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
    }) : ''}
  </p>
</div>
<div className="grid grid-cols-2 gap-3 mb-8">
      <div className="bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-sm">
        <p className="text-[9px] text-sky-400 uppercase font-black tracking-widest mb-1">Cobros</p>
        <p className="text-xl font-black text-white">{cobrosDelDiaSeleccionado.length}</p>
      </div>
      <div className="bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/20 backdrop-blur-sm">
        <p className="text-[9px] text-emerald-400 uppercase font-black tracking-widest mb-1">Total Día</p>
        <p className="text-xl font-black text-emerald-400">
          ${totalMontoDia.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {cobrosDelDiaSeleccionado.length > 0 ? (
              // --- CORREGIDO: cobro ahora tiene tipo explícito ---
              cobrosDelDiaSeleccionado.map((cobro: any) => (
                <div key={cobro.id} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-[${COLORS.azulRey}] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <User size={22} className="text-white" />
                      </div>
                      <div>
                        <p className="font-black text-base leading-none tracking-tight">{cobro.cliente}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">ID: {cobro.idCliente}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${cobro.estatus === 'pagado' ? 'bg-emerald-500/20 text-emerald-400' :
                        cobro.estatus === 'vencido' ? 'bg-red-500/20 text-red-400' : 'bg-sky-500/20 text-sky-400'
                        }`}>
                        {cobro.estatus}
                      </span>
                      <span className="text-sm font-black text-white block mt-1">${cobro.monto}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => contactarCliente(cobro.tel, cobro.cliente)}
                      className="flex items-center justify-center gap-2 py-3 bg-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600/20 transition-all border border-white/5"
                    >
                      <Phone size={14} className="text-green-400" /> WhatsApp
                    </button>
                    <button 
  onClick={() => router.push(`/dashboard/${cobro.idCliente}`)}
  disabled={cobro.estatus === 'pagado'} // <--- BLOQUEAR SI YA PAGÓ
  className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg ${
    cobro.estatus === 'pagado'
      ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50' 
      : 'bg-[#10B981] text-white hover:bg-emerald-600 shadow-emerald-900/40'
  }`}
>
  {cobro.estatus === 'pagado' ? (
    <> <CheckCircle2 size={14} /> Liquidado </>
  ) : (
    <> <DollarSign size={14} /> Cobrar </>
  )}
</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                <CalendarIcon size={64} className="mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest italic">Sin actividades</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
            Express Huamantla
          </div>
        </div>
      )}
    </div>
  );
}