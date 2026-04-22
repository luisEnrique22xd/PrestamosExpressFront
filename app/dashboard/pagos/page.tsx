"use client";
import { useState, useEffect, useMemo } from 'react';
import {
  Search, DollarSign, X, CheckCircle2,
  Loader2, ArrowUpRight, Users, User, AlertCircle
} from "lucide-react";
import api from '@/lib/api';
import { generarPDFRecibo } from '@/lib/generateTicket';

export default function PagosPage() {
  const [alerta, setAlerta] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const lanzarAlerta = (type: 'success' | 'error', msg: string) => {
    setAlerta({ type, msg });
    setTimeout(() => setAlerta(null), 5000);
  };
  const [montoPenalizacion, setMontoPenalizacion] = useState(0);
  const [tienePenalizaciones, setTienePenalizaciones] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [clienteSel, setClienteSel] = useState<any>(null);
  const [montoAbono, setMontoAbono] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<string>('');
  const [modalidadPago, setModalidadPago] = useState('E');

  // --- LÓGICA DINÁMICA DE PENALIZACIONES ---
  useEffect(() => {
    if (clienteSel) {
      const penalizacionesActivas = clienteSel.penalizaciones?.filter((p: any) => p.activa) || [];
      if (penalizacionesActivas.length > 0 || Number(clienteSel.total_penalizaciones) > 0) {
        setTienePenalizaciones(true);
        setMontoPenalizacion(Number(clienteSel.total_penalizaciones) || 0);
      } else {
        setTienePenalizaciones(false);
        setMontoPenalizacion(0);
      }
    } else {
      setTienePenalizaciones(false);
      setMontoPenalizacion(0);
    }
  }, [clienteSel]);

  // --- 🔥 CORRECCIÓN DE RUTAS PARA CUOTA SUGERIDA ---
  useEffect(() => {
    if (clienteSel && semanaSeleccionada) {
      const prestamo = clienteSel.prestamos_activos?.[0];

      if (prestamo) {
        const montoTotal = Number(prestamo.monto_total) || 0;

        // 🔥 CAMBIO AQUÍ: Usamos las cuotas que vienen del backend
        // Si no vienen (mientras actualizas el back), 12 para Nancy y 8 para Luis
        const numCuotas = Number(prestamo.cuotas) || (montoTotal === 3600 ? 8 : 12);

        const sugerencia = montoTotal / numCuotas;
        setMontoAbono(sugerencia.toFixed(2));
      }
    }
  }, [semanaSeleccionada, clienteSel]);

  const buscarEntidades = async (val: string) => {
    setBusqueda(val);
    if (val.length > 1) {
      try {
        const res = await api.get(`/clientes/directorio-hibrido/?search=${val}`);
        const conDeuda = res.data.filter((e: any) => e.tiene_prestamo_activo);
        setSugerencias(conDeuda.slice(0, 5));
      } catch (e) { console.error("Error buscando entidades:", e); }
    } else { setSugerencias([]); }
  };

  const saldoTotalAnterior = useMemo(() => {
    return Number(clienteSel?.saldo_actual) || 0;
  }, [clienteSel]);

  const nuevoSaldoCalculado = useMemo(() => {
  // 1. Saldo actual que manda el servidor (Capital + Moras detectadas)
  const saldoTotalConMora = Number(clienteSel?.saldo_actual) || 0;
  
  // 2. Lo que Alexander está cobrando en este momento
  const abonoCuotaRecibido = montoAbono === '' ? 0 : Number(montoAbono);
  const pagoMultaRecibido = Number(montoPenalizacion) || 0;

  // 3. LA MATEMÁTICA REAL:
  // Restamos la multa del saldo total para limpiar el capital, 
  // y luego restamos el abono a capital.
  // Ejemplo Luis: (3195 - 45) - 450 = 2700
  const resultado = (saldoTotalConMora - pagoMultaRecibido) - abonoCuotaRecibido;

  return Math.max(0, resultado);
}, [clienteSel, montoAbono, montoPenalizacion]);

  const seleccionarEntidad = (entidad: any) => {
    setClienteSel(entidad);
    setSugerencias([]);
    setBusqueda(entidad.nombre);
    setSemanaSeleccionada('');
  };

  const handleAplicarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSel || !montoAbono) return;

    setLoading(true);
    try {
      const prestamoId = clienteSel.prestamos_activos?.[0]?.id || clienteSel.ultimo_prestamo_id;

      const res = await api.post('/abonos/', {
        prestamo: prestamoId,
        monto: Number(montoAbono),
        semana_numero: Number(semanaSeleccionada),
        monto_penalizacion: Number(montoPenalizacion),
        modalidad: modalidadPago,
      });

      generarPDFRecibo({
        folio: res.data.id.toString().padStart(8, '0'),
        cliente: res.data.cliente,
        monto: res.data.monto,
        semana: semanaSeleccionada,
        saldoAnterior: saldoTotalAnterior,
        nuevoSaldo: nuevoSaldoCalculado,
        penalizacion: res.data.penalizaciones_pagadas || montoPenalizacion,
        fecha: res.data.fecha,
        hora: res.data.hora
      });

      lanzarAlerta('success', "✅ Pago aplicado con éxito");
      setClienteSel(null);
      setBusqueda('');
      setMontoAbono('');
      setMontoPenalizacion(0);
    } catch (error) {
      lanzarAlerta('error', "❌ Error al procesar el pago");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 md:py-10 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className={`absolute -top-10 -right-10 opacity-5 transition-colors ${clienteSel?.es_grupo ? 'text-purple-600' : 'text-[#0047AB]'}`}>
          {clienteSel?.es_grupo ? <Users size={240} /> : <DollarSign size={240} />}
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 italic tracking-tighter">Caja de Cobranza</h2>
          <p className="text-slate-400 text-sm mb-10 font-medium italic">Gestión de Abonos y Recuperación de Capital</p>

          <form onSubmit={handleAplicarPago} className="space-y-8">
            {/* BUSCADOR */}
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
              {sugerencias.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-[100] border border-slate-100 overflow-hidden">
                  {sugerencias.map((c) => (
                    <button key={`${c.es_grupo ? 'G' : 'I'}-${c.id}`} type="button" onClick={() => seleccionarEntidad(c)} className="w-full p-4 flex justify-between items-center hover:bg-blue-50 border-b last:border-none group">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${c.es_grupo ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                          {c.es_grupo ? <Users size={16} /> : <User size={16} />}
                        </div>
                        <div className="text-left">
                          <p className="font-black text-slate-700 text-xs uppercase">{c.nombre}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Saldo: ${Number(c.saldo_actual).toLocaleString()}</p>
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
              <select required value={semanaSeleccionada} onChange={(e) => setSemanaSeleccionada(e.target.value)} className="w-full p-5 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-[#0047AB] font-bold text-slate-700 cursor-pointer">
                <option value="">Selecciona el periodo de pago...</option>
                {[...Array(clienteSel?.prestamos_activos?.[0]?.cuotas || 12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Abono #{i + 1}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Monto Recibido ($)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-emerald-500 text-xl">$</span>
                  <input
                    type="number"
                    min={0}
                    required
                    value={montoAbono}
                    onChange={(e) => setMontoAbono(e.target.value)}
                    className="w-full pl-12 pr-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none border-2 border-transparent focus:border-emerald-500 font-black text-2xl md:text-3xl text-[#050533]"
                    placeholder="0.00"
                  />
                </div>

                {/* 🔥 RESUMEN CORREGIDO ABAJO DEL INPUT */}
                {clienteSel && (
                  <div className="flex justify-between px-2 text-[10px] text-[#0047AB] font-black uppercase italic animate-in fade-in duration-300">
                    <span>Cuota sugerida:</span>
                    <span>
                      {clienteSel.prestamos_activos?.[0]
                        ? `$${(Number(clienteSel.prestamos_activos[0].monto_total) / (Number(clienteSel.prestamos_activos[0].cuotas) || 12)).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits:2 })}`
                        : '---'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className={`text-[10px] font-black uppercase ml-2 tracking-widest ${tienePenalizaciones ? 'text-red-500' : 'text-slate-400'}`}>
                  {tienePenalizaciones ? '⚠️ Cobro Penalización' : 'Penalizaciones'}
                </label>
                <div className="relative">
                  <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-black text-xl ${tienePenalizaciones ? 'text-red-500' : 'text-slate-300'}`}>$</span>
                  <input
                    type="number"
                    min={0}
                    value={montoPenalizacion}
                    onChange={(e) => setMontoPenalizacion(Number(e.target.value))}
                    disabled={!tienePenalizaciones}
                    className={`w-full pl-12 pr-6 py-5 rounded-[1.5rem] outline-none border-2 font-black text-xl md:text-2xl transition-all ${tienePenalizaciones
                      ? 'bg-red-50 border-red-200 text-red-600 focus:border-red-500'
                      : 'bg-slate-100 border-transparent text-slate-400 cursor-not-allowed'
                      }`}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* MODALIDAD */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Modalidad de Pago</label>
              <div className="grid grid-cols-3 gap-2">
                {[{ id: 'E', label: 'Efectivo' }, { id: 'D', label: 'Depósito' }, { id: 'T', label: 'Transferencia' }].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModalidadPago(m.id)}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${modalidadPago === m.id
                      ? `border-slate-800 bg-slate-800 text-white shadow-md`
                      : `border-slate-100 bg-slate-50 text-slate-400`
                      }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* RESUMEN ACTUALIZADO */}
            {clienteSel && (
              <div className={`p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border animate-in slide-in-from-bottom-2 duration-500 ${clienteSel.es_grupo ? 'bg-purple-50 border-purple-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-500 font-bold text-xs">
                    <span>SALDO TOTAL (CON MORA):</span>
                    <span className="text-slate-700 font-black">${saldoTotalAnterior.toLocaleString('es-MX')}</span>
                  </div>

                  <div className="space-y-1 px-1">
                    <div className="flex justify-between text-[10px] text-blue-600 font-black uppercase italic mb-1">
                      <span>Abono sugerido:</span>
                      <span>
                        {clienteSel.prestamos_activos?.[0]
                          ? `$${(Number(clienteSel.prestamos_activos[0].monto_total) / (Number(clienteSel.prestamos_activos[0].cuotas) || 12)).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '---'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px] italic font-medium">
                      <span>Capital actual: ${Number(clienteSel.saldo_actual).toLocaleString()}</span>
                      <span>+ Mora detectada: ${Number(montoPenalizacion).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-rose-500 text-[10px] font-black uppercase tracking-tighter pt-1">
                      <span>Abono a aplicar:</span>
                      <span>- ${(Number(montoAbono) + Number(montoPenalizacion)).toLocaleString('es-MX')}</span>
                    </div>
                  </div>

                  <div className={`flex justify-between pt-4 border-t ${clienteSel.es_grupo ? 'border-purple-200' : 'border-emerald-200'}`}>
                    <span className="text-xs font-black uppercase">NUEVO SALDO CAPITAL:</span>
                    <span className={`text-xl md:text-2xl font-black tracking-tighter ${clienteSel.es_grupo ? 'text-purple-900' : 'text-emerald-900'}`}>
                      ${nuevoSaldoCalculado.toLocaleString('es-MX')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading || !clienteSel || !montoAbono} className={`w-full py-5 md:py-6 text-white font-black rounded-2xl md:rounded-[2rem] shadow-xl transition-all uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 ${clienteSel?.es_grupo ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#050533] hover:bg-[#0047AB]'}`}>
              {loading ? <Loader2 className="animate-spin" /> : <>Confirmar y Emitir Recibo <CheckCircle2 size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}