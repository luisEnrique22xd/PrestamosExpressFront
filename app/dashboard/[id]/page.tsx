"use client";
import React, { useEffect, useState, use, useRef } from 'react';
import {
  Search, X, TrendingUp, CheckCircle2, Printer,
  DollarSign, UserCheck, Users, Phone,
  User, ArrowRight, Loader2, AlertTriangle,
  AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Cell, PieChart as RePie, Pie
} from 'recharts';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { generarPDFRecibo } from '@/lib/generateTicket';

const COLORS = {
  azulRey: '#0047AB',
  verdeExito: '#10B981',
  rojoAlerta: '#DC2626',
  amarilloCuidado: '#FBBF24',
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 relative overflow-hidden">
    <div className={`absolute top-0 right-0 p-4 opacity-10`}>
      <Icon size={80} color={color} />
    </div>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{title}</p>
    <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{value}</h3>
  </div>
);


export default function ClienteDashboard({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const [selectedPrestamoId, setSelectedPrestamoId] = useState<number | null>(null);
  const params = use(paramsPromise);
  const router = useRouter();
  const [alerta, setAlerta] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const lanzarAlerta = (type: 'success' | 'error', msg: string) => {
    setAlerta({ type, msg });
    setTimeout(() => setAlerta(null), 5000);
  };

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // MODAL ABONO
  const [showModal, setShowModal] = useState(false);
  const [montoAbono, setMontoAbono] = useState('');
  const [semanaAbono, setSemanaAbono] = useState('1');
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [datosRecibo, setDatosRecibo] = useState<any>(null);

  // BUSCADOR
  const [busqueda, setBusqueda] = useState('');
  const [listaEntidades, setListaEntidades] = useState<any[]>([]);
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // CONDONACIÓN
  const [showCondonarModal, setShowCondonarModal] = useState(false);
  const [selectedPenalizacion, setSelectedPenalizacion] = useState<any>(null);
  const [motivoCondonacion, setMotivoCondonacion] = useState('');
  const [procesandoCondonacion, setProcesandoCondonacion] = useState(false);

  const [user, setUser] = useState<{ role: string | null }>({ role: null });

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role');
    setUser({ role: savedRole });
  }, []);

  // --- 1. CARGA DE DATOS DEL EXPEDIENTE ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let endpoint = params.id.startsWith('grupo-') 
          ? `/grupos/${params.id.replace('grupo-', '')}/detalle/` 
          : `/clientes/${params.id}/`;

        const res = await api.get(endpoint);
        setData(res.data);
      } catch (error) {
        console.error("Error al localizar entidad:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  // --- 2. CARGA DE DIRECTORIO HÍBRIDO ---
  useEffect(() => {
    const cargarDirectorio = async () => {
      try {
        const res = await api.get('/clientes/directorio-hibrido/');
        setListaEntidades(res.data);
      } catch (e) { console.error(e); }
    };
    cargarDirectorio();
  }, []);

  // --- 3. LÓGICA DEL BUSCADOR ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusqueda(valor);
    if (valor.length > 1) {
      const filtrados = listaEntidades.filter(entidad => {
        const nombre = (entidad.nombre || entidad.nombre_grupo || '').toLowerCase();
        return nombre.includes(valor.toLowerCase()) || entidad.id.toString().includes(valor);
      }).slice(0, 5);
      setSugerencias(filtrados);
      setMostrarSugerencias(true);
    } else {
      setMostrarSugerencias(false);
    }
  };

  const seleccionarEntidad = (entidad: any) => {
    setMostrarSugerencias(false);
    setBusqueda('');
    const path = entidad.es_grupo ? `grupo-${entidad.id}` : entidad.id;
    router.push(`/dashboard/${path}`);
  };

  // --- 4. LÓGICA DE ABONO (Ajustada para ID Seleccionado) ---
  const handleRegistrarPago = async () => {
    if (!montoAbono) return lanzarAlerta('error', "❌ Ingresa un monto válido");
    if (!selectedPrestamoId) return lanzarAlerta('error', "❌ Error: Seleccione una cuenta.");

    try {
      setLoading(true);
      const response = await api.post('/abonos/', {
        prestamo: selectedPrestamoId, 
        monto: montoAbono,
        semana_numero: semanaAbono
      });

      // Cálculos para el ticket basados en la deuda seleccionada
      const pActual = data.prestamos_activos?.find((p:any) => p.id === selectedPrestamoId);
      const capitalOriginal = parseFloat(pActual?.capital || 0);
      const abonoActual = parseFloat(montoAbono);
      const saldoAnteriorManual = parseFloat(pActual?.monto_total || 0);
      const nuevoSaldoCapital = saldoAnteriorManual - abonoActual;

      setDatosRecibo({
        cliente: data.nombre,
        monto: abonoActual.toFixed(2),
        fecha: new Date().toLocaleDateString('es-MX'),
        folio: response.data.id_abono || "001",
        saldoRestante: nuevoSaldoCapital.toFixed(2),
        capitalOriginal: capitalOriginal.toFixed(2),
        saldoAnterior: saldoAnteriorManual.toFixed(2),
        semana: semanaAbono
      });

      setPagoExitoso(true);
      setMontoAbono('');
      
      const endpoint = params.id.startsWith('grupo-') 
        ? `/grupos/${params.id.replace('grupo-', '')}/detalle/` 
        : `/clientes/${params.id}/`;
      const resRefresh = await api.get(endpoint);
      setData(resRefresh.data);
    } catch (error: any) {
      lanzarAlerta('error', "❌ Error al registrar el pago.");
    } finally { setLoading(false); }
  };

  const handleCondonar = async () => {
  if (motivoCondonacion.length < 10) return lanzarAlerta('error', "⚠️ Justificación muy corta.");
  try {
    setProcesandoCondonacion(true);
    await api.post(`/penalizaciones/${selectedPenalizacion.id}/condonar/`, { 
      motivo: motivoCondonacion 
    });
    setShowCondonarModal(false);
    const res = await api.get(`/clientes/${params.id}/`);
    setData(res.data);
    lanzarAlerta('success', "✅ Recargos condonados. El saldo ha sido actualizado.");
  } catch (error) { 
    lanzarAlerta('error', "❌ Error al condonar la mora."); 
  } finally { 
    setProcesandoCondonacion(false); 
  }
};

  if (loading && !data) return <div className="p-10 flex items-center gap-3 font-black italic text-slate-400"><Loader2 className="animate-spin"/> Sincronizando Acuitlapilco...</div>;
  if (!data) return <div className="p-10 font-black italic text-red-400 text-center">⚠️ Error: Entidad no localizada en el sistema.</div>;

  const cumplimientoData = [
    { name: 'Pagado', value: data.progreso_pagos?.pagado || 0, color: COLORS.verdeExito },
    { name: 'Pendiente', value: 100 - (data.progreso_pagos?.pagado || 0), color: '#F1F5F9' },
  ];

  const StatusBadge = ({ data }: { data: any }) => {
    const isLiquidado = !data.tiene_prestamo_activo && Number(data.saldo_actual) <= 0;
    if (isLiquidado) {
      return (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm animate-in zoom-in duration-500">
          <CheckCircle2 size={14} className="animate-bounce" />
          <span className="text-[10px] font-black uppercase tracking-[0.15em]">Préstamo Liquidado</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 bg-blue-50 text-[#0047AB] px-4 py-1.5 rounded-full border border-blue-100 shadow-sm">
        <div className="w-1.5 h-1.5 bg-[#0047AB] rounded-full animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.15em]">Cuenta en Cobro</span>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFE]">
      <main className="flex-1 p-10 overflow-auto">

        {/* BUSCADOR */}
        <div className="mb-8 flex justify-end" ref={searchRef}>
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text" placeholder="Buscar cliente o grupo..."
              value={busqueda} onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-3 bg-white shadow-sm rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold"
            />
            {mostrarSugerencias && sugerencias.length > 0 && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] w-full">
                {sugerencias.map((c) => (
                  <button key={`${c.es_grupo ? 'G' : 'I'}-${c.id}`} onClick={() => seleccionarEntidad(c)} className="w-full px-5 py-4 hover:bg-blue-50 text-left border-b last:border-none flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${c.es_grupo ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {c.es_grupo ? <Users size={14}/> : <User size={14}/>}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{c.nombre}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{c.es_grupo ? 'Grupo Solidario' : `ID: ${c.id}`}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-[#0047AB] transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* HEADER */}
        <header className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center font-black text-3xl text-white shadow-xl shadow-blue-200 uppercase ${data.tipo === 'G' ? 'bg-purple-600' : 'bg-[#0047AB]'}`}>
              {data.tipo === 'G' ? <Users size={32}/> : data.nombre[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
                  <TrendingUp size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Saldo Total Cliente</span>
                </div>
                <StatusBadge data={data} />
              </div>
              <h1 className="text-4xl font-black text-slate-800 italic tracking-tighter">
                {data.tipo === 'G' ? `Grupo: ${data.nombre}` : data.nombre}
              </h1>
              <p className="text-slate-400 text-sm font-medium mt-1">{data.direccion}</p>
            </div>
          </div>
          {/* Mostramos el saldo total global del cliente a la derecha */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center min-w-[200px]">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Deuda Consolidada</p>
             <p className="text-3xl font-black text-red-600 italic tracking-tighter">${(data.saldo_actual || 0).toLocaleString()}</p>
          </div>
        </header>

        {/* 🔥 SECCIÓN DE DEUDAS SEPARADAS (REEMPLAZA LAS 4 CARDS FIJAS) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {data.prestamos_activos && data.prestamos_activos.length > 0 ? (
            data.prestamos_activos.map((p: any) => (
              <div key={p.id} className="bg-white p-8 rounded-[3rem] border-l-[12px] border-[#0047AB] shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 bg-[#050533] text-white px-5 py-2 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest">
                  Folio: PR-{p.folio.toString().padStart(5, '0')}
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase italic mb-1">Saldo de esta cuenta ({p.modalidad})</p>
                    <h2 className="text-4xl font-black text-slate-800 italic tracking-tighter">
                      ${p.monto_total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Capital</p>
                      <p className="font-bold text-slate-600 text-sm">${p.capital.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Aval</p>
                      <p className="font-bold text-slate-600 text-[10px] uppercase">{p.aval}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedPrestamoId(p.id);
                      setPagoExitoso(false);
                      setShowModal(true);
                    }}
                    className="w-full py-4 bg-slate-50 hover:bg-[#0047AB] hover:text-white rounded-2xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2"
                  >
                    <DollarSign size={14} /> Registrar Abono
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-10 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center">
              <p className="text-slate-400 font-black italic uppercase text-xs">No hay préstamos activos</p>
            </div>
          )}
        </div>

        {/* GRAFICAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
            <h4 className="font-black text-slate-800 text-lg uppercase italic mb-8">Flujo de Abonos</h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.historial_grafico || []}>
                  <CartesianGrid vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <Tooltip cursor={{ fill: '#F8FAFE' }} contentStyle={{ borderRadius: '20px', border: 'none' }} />
                  <Bar dataKey="pago" fill={data.tipo === 'G' ? '#7C3AED' : COLORS.azulRey} radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col items-center">
            <h4 className="font-black text-slate-800 mb-2 uppercase italic">Liquidación Global</h4>
            <div className="flex-1 relative w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePie data={cumplimientoData} innerRadius={70} outerRadius={90} dataKey="value" startAngle={90} endAngle={450}>
                  {cumplimientoData.map((e, i) => (<Cell key={i} fill={e.color} />))}
                </RePie>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-slate-800">{Math.round(data.progreso_pagos?.pagado || 0)}%</span>
                <span className="text-[8px] text-slate-400 font-black uppercase">Completado</span>
              </div>
            </div>
          </div>
        </div>

        {/* RECARGOS */}
        <div className="mt-8">
           <div className="bg-[#050533] p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-900/20">
              <h4 className="font-black mb-6 uppercase italic text-sky-400">Recargos Activos (1.5%)</h4>
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                {data.total_penalizaciones > 0 ? (
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div>
                      <p className="text-[9px] text-red-400 font-black uppercase">Mora Detectada</p>
                      <p className="text-sm font-bold text-white">${parseFloat(data.total_penalizaciones).toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => { 
                        setSelectedPenalizacion({ id: data.id_mora_activa, monto_penalizado: data.total_penalizaciones }); 
                        setShowCondonarModal(true); 
                      }} 
                      className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                    >
                      Condonar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-emerald-400 py-4 italic font-bold">
                    <CheckCircle2 size={18} />
                    <span>✓ El cliente está al corriente</span>
                  </div>
                )}
              </div>
            </div>
        </div>
      </main>

      {/* MODAL COBRO */}
      {showModal && (
        <div className="fixed inset-0 bg-[#050533]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            {!pagoExitoso ? (
              <div className="animate-in fade-in">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-800 italic uppercase">
                    Registrar Abono 
                    {selectedPrestamoId && (
                      <span className="text-[#0047AB] ml-2">
                        #{data.prestamos_activos?.find((p:any) => p.id === selectedPrestamoId)?.folio}
                      </span>
                    )}
                  </h2>
                  <button onClick={() => {setShowModal(false); setSelectedPrestamoId(null);}} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Monto del Pago ($)</label>
                    <input type="number" value={montoAbono} onChange={(e) => setMontoAbono(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-black text-2xl text-slate-800" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Número de Cuota</label>
                    <select value={semanaAbono} onChange={(e) => setSemanaAbono(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>Cuota {num}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={handleRegistrarPago} disabled={loading} className="w-full py-5 bg-[#0047AB] text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 transition-all">
                    {loading ? 'Procesando...' : 'Confirmar Abono'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 py-4 animate-in slide-in-from-bottom">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 size={44} /></div>
                <h2 className="text-2xl font-black text-slate-800 uppercase italic">¡Abono Aplicado!</h2>
                <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-dashed border-slate-200">
                  <p className="text-[10px] font-black text-[#0047AB] uppercase tracking-widest mb-1">Nuevo Saldo Pendiente</p>
                  <p className="text-4xl font-black text-[#0047AB] tracking-tighter italic">${datosRecibo?.saldoRestante}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button onClick={() => { setShowModal(false); setPagoExitoso(false); setSelectedPrestamoId(null); }} className="py-4 text-slate-400 font-black uppercase text-[10px]">Cerrar</button>
                  <button onClick={() => generarPDFRecibo(datosRecibo)} className="py-4 bg-[#050533] text-white rounded-2xl font-black uppercase text-[10px] shadow-xl flex items-center justify-center gap-2"><Printer size={16} /> Recibo</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CONDONAR */}
      {showCondonarModal && (
        <div className="fixed inset-0 bg-[#050533]/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in">
            <h2 className="text-2xl font-black text-slate-800 italic mb-2">Condonar Recargo</h2>
            <p className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-widest">Monto a perdonar: <span className="text-red-500">${selectedPenalizacion?.monto_penalizado}</span></p>
            <div className="space-y-4">
              <textarea value={motivoCondonacion} onChange={(e) => setMotivoCondonacion(e.target.value)} placeholder="Motivo de la condonación..." className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 text-sm min-h-[120px]" />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowCondonarModal(false)} className="py-4 bg-slate-100 text-slate-500 font-black text-[10px] uppercase rounded-2xl">Cancelar</button>
                {user.role === 'admin' && (<button onClick={handleCondonar} disabled={procesandoCondonacion || motivoCondonacion.length < 10} className="py-4 bg-red-600 text-white font-black text-[10px] uppercase rounded-2xl shadow-lg disabled:opacity-30">Confirmar</button>)}
              </div>
            </div>
          </div>
        </div>
      )}
      {alerta && (
        <div className={`fixed top-10 right-10 z-[130] p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border-b-4 bg-white animate-in slide-in-from-right duration-500 ${
          alerta.type === 'success' ? 'border-emerald-500' : 'border-red-500'
        }`}>
          <div className={`p-3 rounded-2xl ${
            alerta.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
          }`}>
            {alerta.type === 'success' ? <CheckCircle2 size={24}/> : <AlertCircle size={24}/>}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
              {alerta.type === 'success' ? 'Sistema Express' : 'Atención'}
            </p>
            <p className="font-bold text-sm italic text-slate-700">{alerta.msg}</p>
          </div>
          <button onClick={() => setAlerta(null)} className="ml-4 text-slate-300 hover:text-slate-500">
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}