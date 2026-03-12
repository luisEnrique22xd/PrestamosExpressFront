"use client";
import React, { useEffect, useState, use, useRef } from 'react';
import { 
  Search, X, TrendingUp, CheckCircle2, Printer, 
  DollarSign, UserCheck, AlertTriangle, FileText, 
  User, ArrowRight, Loader2 
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Cell, PieChart as RePie, Pie
} from 'recharts';
import api from '@/lib/api';
import { generarPagare } from '@/lib/generatePagare';
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
  const params = use(paramsPromise);
  const router = useRouter();
  
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
  const [listaClientes, setListaClientes] = useState<any[]>([]);
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // CONDONACIÓN
  const [showCondonarModal, setShowCondonarModal] = useState(false);
  const [selectedPenalizacion, setSelectedPenalizacion] = useState<any>(null);
  const [motivoCondonacion, setMotivoCondonacion] = useState('');
  const [procesandoCondonacion, setProcesandoCondonacion] = useState(false);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/clientes/${params.id}/`);
        setData(res.data);
      } catch (error) {
        console.error("Error:", error);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [params.id]);

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const res = await api.get('/clientes/');
        setListaClientes(res.data);
      } catch (e) { console.error(e); }
    };
    cargarClientes();
  }, []);

  // --- LÓGICA DE ABONO (MATEMÁTICA DE CAPITAL PURO) ---
  const handleRegistrarPago = async () => {
    if (!montoAbono) return alert("Ingresa un monto válido");
    
    try {
      setLoading(true);
      const response = await api.post('/abonos/', {
        prestamo: data.ultimo_prestamo_id,
        monto: montoAbono,
        semana_numero: semanaAbono
      });

      // Cálculo: Capital Inicial - (Pagado Histórico + Abono Actual)
      const capitalOriginal = parseFloat(data.progreso_pagos?.monto_capital || 0);
      const abonoActual = parseFloat(montoAbono);
      const pagadoAnterior = parseFloat(data.progreso_pagos?.monto_pagado || 0);
      
      const saldoAnteriorManual = capitalOriginal - pagadoAnterior;
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

      const resRefresh = await api.get(`/clientes/${params.id}/`);
      setData(resRefresh.data);

    } catch (error: any) {
      alert("❌ Error al registrar el pago.");
    } finally { setLoading(false); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusqueda(valor);
    if (valor.length > 1) {
      const filtrados = listaClientes.filter(c =>
        c.nombre.toLowerCase().includes(valor.toLowerCase()) || c.id.toString().includes(valor)
      ).slice(0, 5);
      setSugerencias(filtrados);
      setMostrarSugerencias(true);
    } else {
      setMostrarSugerencias(false);
    }
  };

  const seleccionarCliente = (id: number) => {
    setMostrarSugerencias(false);
    setBusqueda('');
    router.push(`/dashboard/${id}`);
  };

  const handleCondonar = async () => {
    if (motivoCondonacion.length < 10) return alert("⚠️ Justificación muy corta.");
    try {
      setProcesandoCondonacion(true);
      await api.post(`/penalizaciones/${selectedPenalizacion.id}/condonar/`, { motivo: motivoCondonacion });
      setShowCondonarModal(false);
      setMotivoCondonacion('');
      const res = await api.get(`/clientes/${params.id}/`);
      setData(res.data);
    } catch (error) { alert("❌ Error condonación"); } 
    finally { setProcesandoCondonacion(false); }
  };

  if (loading && !data) return <div className="p-10 font-black italic text-slate-400">Sincronizando...</div>;
  if (!data) return <div className="p-10 font-black italic text-red-400">Error: Cliente no localizado.</div>;

  const cumplimientoData = [
    { name: 'Pagado', value: data.progreso_pagos?.pagado || 0, color: COLORS.verdeExito },
    { name: 'Pendiente', value: data.progreso_pagos?.pendiente || 100, color: '#F1F5F9' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFE]">
      <main className="flex-1 p-10 overflow-auto">
        
        {/* BUSCADOR */}
        <div className="mb-8 flex justify-end" ref={searchRef}>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text" placeholder="Buscar cliente..."
              value={busqueda} onChange={handleInputChange}
              className="w-80 pl-12 pr-4 py-3 bg-white shadow-sm rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB]"
            />
            {mostrarSugerencias && sugerencias.length > 0 && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] w-full">
                {sugerencias.map((c) => (
                  <button key={c.id} onClick={() => seleccionarCliente(c.id)} className="w-full px-5 py-4 hover:bg-blue-50 text-left border-b last:border-none flex justify-between items-center">
                    <div>
                      <p className="text-sm font-black text-slate-800">{c.nombre}</p>
                      <p className="text-[10px] text-slate-400 font-bold tracking-widest">ID: {c.id}</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-300" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* HEADER */}
        <header className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] bg-[#0047AB] flex items-center justify-center font-black text-3xl text-white shadow-xl shadow-blue-200 uppercase">
              {data.nombre[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter">{data.nombre}</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${data.tiene_prestamo_activo ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-100'}`}>
                  {data.tiene_prestamo_activo ? 'Activo' : 'Liquidado'}
                </span>
              </div>
              <p className="text-slate-400 text-sm font-medium mt-1">ID #{data.id} • {data.direccion}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => generarPagare(data)} className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
              <FileText size={16} /> Pagaré
            </button>
            <button 
              onClick={() => { setPagoExitoso(false); setShowModal(true); }} 
              className="flex items-center gap-2 bg-[#0047AB] text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:scale-105 transition-all"
            >
              <DollarSign size={16} /> Registrar Pago
            </button>
          </div>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Saldo Actual" value={`$${(data.saldo_actual || 0).toLocaleString()}`} icon={DollarSign} color={COLORS.rojoAlerta} />
          <StatCard title="Pagado" value={`$${(data.progreso_pagos?.monto_pagado || 0).toLocaleString()}`} icon={UserCheck} color={COLORS.verdeExito} />
          <StatCard title="Contratado" value={`$${(data.progreso_pagos?.monto_capital || 0).toLocaleString()}`} icon={TrendingUp} color={COLORS.azulRey} />
          <StatCard title="Teléfono" value={data.telefono} icon={AlertTriangle} color={COLORS.amarilloCuidado} />
        </div>

        {/* GRAFICAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
            <h4 className="font-black text-slate-800 text-lg uppercase tracking-tighter italic mb-8">Flujo de Abonos</h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.historial_grafico || []}>
                  <CartesianGrid vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <Tooltip cursor={{ fill: '#F8FAFE' }} contentStyle={{ borderRadius: '20px', border: 'none' }} />
                  <Bar dataKey="pago" fill={COLORS.azulRey} radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col items-center">
            <h4 className="font-black text-slate-800 mb-2 uppercase tracking-tighter italic">Liquidación</h4>
            <div className="flex-1 relative w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePie data={cumplimientoData} innerRadius={70} outerRadius={90} dataKey="value" startAngle={90} endAngle={450}>
                  {cumplimientoData.map((e, i) => (<Cell key={i} fill={e.color} />))}
                </RePie>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-slate-800">{Math.round(data.progreso_pagos?.pagado || 0)}%</span>
                <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Completado</span>
              </div>
            </div>
          </div>
        </div>

        {/* AVAL Y RECARGOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
            <h4 className="text-slate-800 font-black mb-6 uppercase tracking-tighter italic border-b pb-4">Detalle del Aval</h4>
            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase">Nombre:</span>
                <span className="text-sm font-bold text-slate-800">{data.datos_ultimo_aval?.nombre_aval || 'S/N'}</span>
              </div>
              <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase">Parentesco:</span>
                <span className="text-sm font-bold text-slate-800">{data.datos_ultimo_aval?.parentesco_aval || 'N/A'}</span>
              </div>
              <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase">Garantía:</span>
                <span className="text-sm font-bold text-slate-800">{data.datos_ultimo_aval?.garantia_descripcion || 'S/N'}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#050533] p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-900/20">
            <h4 className="font-black mb-6 uppercase tracking-tighter italic border-b border-white/10 pb-4 text-sky-400">Recargos Activos (1.5%)</h4>
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              {data.penalizaciones?.filter((p: any) => p.activa).length > 0 ? (
                data.penalizaciones.filter((p: any) => p.activa).map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div>
                      <p className="text-[9px] text-red-400 font-black uppercase">Mora Detectada</p>
                      <p className="text-sm font-bold">${p.monto_penalizado}</p>
                    </div>
                    <button onClick={() => { setSelectedPenalizacion(p); setShowCondonarModal(true); }} className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Condonar</button>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-4 text-emerald-400 py-4 italic font-bold">✓ El cliente está al corriente</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL DE COBRO DINÁMICO --- */}
      {showModal && (
        <div className="fixed inset-0 bg-[#050533]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            
            {!pagoExitoso ? (
              <div className="animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-800 italic uppercase">Registrar Abono</h2>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Monto del Pago ($)</label>
                    <input type="number" value={montoAbono} onChange={(e) => setMontoAbono(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-black text-2xl text-slate-800" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Número de Semana</label>
                    <select value={semanaAbono} onChange={(e) => setSemanaAbono(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => <option key={num} value={num}>Semana {num}</option>)}
                    </select>
                  </div>
                  <button onClick={handleRegistrarPago} disabled={loading} className="w-full py-5 bg-[#0047AB] text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50">
                    {loading ? 'Procesando...' : 'Confirmar Abono'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 py-4 animate-in slide-in-from-bottom duration-500">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={44} />
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-800 uppercase italic">¡Abono Aplicado!</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Semana {datosRecibo?.semana}</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-dashed border-slate-200 relative">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Capital Anterior</span>
                    <span className="font-bold text-slate-600">${datosRecibo?.saldoAnterior}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Abono Realizado</span>
                    <span className="font-black text-emerald-600">-${datosRecibo?.monto}</span>
                  </div>

                  <p className="text-[10px] font-black text-[#0047AB] uppercase tracking-widest mb-1">Nuevo Saldo Pendiente</p>
                  <p className="text-4xl font-black text-[#0047AB] tracking-tighter italic">
                    ${datosRecibo?.saldoRestante}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button 
                    onClick={() => { setShowModal(false); setPagoExitoso(false); }}
                    className="py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest"
                  >
                    Cerrar
                  </button>
                  <button 
                    onClick={() => generarPDFRecibo(datosRecibo)}
                    className="py-4 bg-[#050533] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                  >
                    <Printer size={16} /> Imprimir Recibo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CONDONAR */}
      {showCondonarModal && (
        <div className="fixed inset-0 bg-[#050533]/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-slate-800 italic mb-2">Condonar Recargo</h2>
            <p className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-widest">Monto a perdonar: <span className="text-red-500">${selectedPenalizacion?.monto_penalizado}</span></p>
            <div className="space-y-4">
              <textarea
                value={motivoCondonacion} onChange={(e) => setMotivoCondonacion(e.target.value)}
                placeholder="Motivo de la condonación..."
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 text-sm min-h-[120px]"
              />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowCondonarModal(false)} className="py-4 bg-slate-100 text-slate-500 font-black text-[10px] uppercase rounded-2xl">Cancelar</button>
                <button onClick={handleCondonar} disabled={procesandoCondonacion || motivoCondonacion.length < 10} className="py-4 bg-red-600 text-white font-black text-[10px] uppercase rounded-2xl shadow-lg disabled:opacity-30">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}