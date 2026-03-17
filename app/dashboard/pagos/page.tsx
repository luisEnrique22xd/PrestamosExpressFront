"use client";
import { useState, useEffect, useMemo } from 'react';
import {
  Search, DollarSign, Calendar, CheckCircle2,
  Loader2, ArrowUpRight, Users, User, AlertCircle
} from "lucide-react";
import api from '@/lib/api';
import { generarPDFRecibo } from '@/lib/generateTicket';

export default function PagosPage() {
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [clienteSel, setClienteSel] = useState<any>(null);
  const [montoAbono, setMontoAbono] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<string>('');

  // 1. Buscador Híbrido (Filtramos solo entidades con préstamo activo)
  const buscarEntidades = async (val: string) => {
    setBusqueda(val);
    if (val.length > 1) {
      try {
        const res = await api.get(`/clientes/directorio-hibrido/?search=${val}`);
        // Solo mostramos los que sí deben (evita el error de préstamo requerido)
        const conDeuda = res.data.filter((e: any) => e.tiene_prestamo_activo);
        setSugerencias(conDeuda.slice(0, 5));
      } catch (e) { console.error("Error buscando entidades:", e); }
    } else { setSugerencias([]); }
  };

  // 2. Cálculos de Saldo Proyectado
  const nuevoSaldoCalculado = useMemo(() => {
    const actual = Number(clienteSel?.saldo_actual) || 0;
    const abono = Number(montoAbono) || 0;
    return Math.max(0, actual - abono);
  }, [clienteSel, montoAbono]);

  // 3. Selección de Entidad
  const seleccionarEntidad = (entidad: any) => {
    setClienteSel(entidad);
    setSugerencias([]);
    setBusqueda(entidad.nombre);
    setSemanaSeleccionada(''); // Reset de semana al cambiar de cliente
  };

  // 4. Envío al Backend
  const handleAplicarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSel || !montoAbono) return;

    setLoading(true);
    try {
      const res = await api.post('/abonos/', {
        prestamo: clienteSel.ultimo_prestamo_id,
        monto: Number(montoAbono),
        semana_numero: Number(semanaSeleccionada),
      });
      

      // 🔥 USAMOS LOS DATOS REALES DEL BACKEND
      generarPDFRecibo({
        folio: res.data.id.toString().padStart(8, '0'),
        cliente: res.data.cliente,
        monto: res.data.monto,
        semana: semanaSeleccionada,
        saldoAnterior: res.data.saldo_anterior, // Ya no es el estado local, es la DB
        nuevoSaldo: res.data.nuevo_saldo,      // Ya no es el proyectado, es el real
       fecha: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }),
  hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      });

      alert("✅ Pago aplicado");
      setClienteSel(null);
      setBusqueda('');
      setMontoAbono('');

    } catch (error) {
      alert("❌ Error en el servidor");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">

        {/* Fondo Decorativo Dinámico */}
        <div className={`absolute -top-10 -right-10 opacity-5 transition-colors ${clienteSel?.es_grupo ? 'text-purple-600' : 'text-[#0047AB]'}`}>
          {clienteSel?.es_grupo ? <Users size={240} /> : <DollarSign size={240} />}
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-800 mb-2 italic tracking-tighter">Caja de Cobranza</h2>
          <p className="text-slate-400 text-sm mb-10 font-medium italic">Gestión de Abonos y Recuperación de Capital</p>

          <form onSubmit={handleAplicarPago} className="space-y-8">

            {/* BUSCADOR HÍBRIDO */}
            <div className="space-y-3 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.2em]">Localizar Deudor</label>
              <div className="relative group">
                <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${clienteSel ? 'text-emerald-500' : 'text-slate-300'}`} size={20} />
                <input
                  value={busqueda}
                  onChange={(e) => buscarEntidades(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[2rem] outline-none border-2 border-transparent focus:border-[#0047AB] focus:bg-white font-bold text-slate-700"
                  placeholder="Escribe nombre o ID..."
                />
              </div>

              {/* Sugerencias */}
              {sugerencias.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-[100] border border-slate-100 overflow-hidden">
                  {sugerencias.map((c) => (
                    <button
                      key={`${c.es_grupo ? 'G' : 'I'}-${c.id}`}
                      type="button"
                      onClick={() => seleccionarEntidad(c)}
                      className="w-full p-4 flex justify-between items-center hover:bg-blue-50 border-b last:border-none group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${c.es_grupo ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                          {c.es_grupo ? <Users size={16} /> : <User size={16} />}
                        </div>
                        <div className="text-left">
                          <p className="font-black text-slate-700 text-xs uppercase">{c.nombre}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            Saldo actual: ${Number(c.saldo_actual).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SELECTOR DE SEMANA */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Número de Cuota a Liquidar</label>
              <select
                required
                value={semanaSeleccionada}
                onChange={(e) => setSemanaSeleccionada(e.target.value)}
                className="w-full p-5 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-[#0047AB] font-bold text-slate-700 cursor-pointer appearance-none"
              >
                <option value="">Selecciona el periodo de pago...</option>
                {[...Array(clienteSel?.progreso_pagos?.total_cuotas || 12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Abono #{i + 1}</option>
                ))}
              </select>
            </div>

            {/* MONTO Y FECHA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Monto Recibido ($)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-emerald-500 text-xl">$</span>
                  <input
                    type="number"
                    required
                    value={montoAbono}
                    onChange={(e) => setMontoAbono(e.target.value)}
                    className="w-full pl-12 pr-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-emerald-500 font-black text-3xl text-[#050533]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Fecha Contable</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="date" disabled className="w-full pl-14 pr-6 py-5 bg-slate-100 rounded-[1.5rem] font-bold text-slate-400 border-none cursor-not-allowed" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
            </div>

            {/* RESUMEN DE SALDO */}
            {clienteSel && (
              <div className={`p-8 rounded-[2.5rem] border animate-in slide-in-from-bottom-2 duration-500 ${clienteSel.es_grupo ? 'bg-purple-50 border-purple-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${clienteSel.es_grupo ? 'text-purple-600' : 'text-emerald-600'}`}>
                      {clienteSel.es_grupo ? 'Abono Grupal Solidario' : 'Abono Socio Individual'}
                    </p>
                    <h4 className="font-black text-slate-800 uppercase text-lg italic">{clienteSel.nombre}</h4>
                  </div>
                  <div className={`p-3 rounded-2xl ${clienteSel.es_grupo ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {clienteSel.es_grupo ? <Users size={20} /> : <User size={20} />}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-slate-500 font-bold text-xs">
                    <span>SALDO ANTERIOR:</span>
                    <span className="text-slate-700 font-black">${Number(clienteSel.saldo_actual).toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between pt-4 border-t ${clienteSel.es_grupo ? 'border-purple-200' : 'border-emerald-200'}`}>
                    <span className={`text-xs font-black uppercase ${clienteSel.es_grupo ? 'text-purple-700' : 'text-emerald-700'}`}>NUEVO SALDO PENDIENTE:</span>
                    <span className={`text-2xl font-black tracking-tighter ${clienteSel.es_grupo ? 'text-purple-900' : 'text-emerald-900'}`}>
                      ${nuevoSaldoCalculado.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* BOTÓN DE ACCIÓN */}
            <button
              type="submit"
              disabled={loading || !clienteSel || !montoAbono}
              className={`w-full py-6 text-white font-black rounded-[2rem] shadow-xl transition-all uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 disabled:grayscale ${clienteSel?.es_grupo ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#050533] hover:bg-[#0047AB]'}`}
            >
              {loading ? (
                <><Loader2 className="animate-spin" /> Procesando pago...</>
              ) : (
                <>Confirmar y Emitir Recibo <CheckCircle2 size={18} /></>
              )}
            </button>
          </form>

          {!clienteSel && (
            <div className="mt-8 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-60">
              <AlertCircle size={18} className="text-slate-400" />
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-tight">
                Busca a un cliente o grupo con préstamo activo para habilitar la caja.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}