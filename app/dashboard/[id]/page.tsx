"use client";
import React, { useEffect, useState, use, useRef } from 'react'; // Agregamos 'use' y 'useRef'
import { Search, Bell, TrendingUp, MapPin, Calendar, DollarSign, UserCheck, AlertTriangle, FileText, User, ArrowRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, PieChart as RePie, Pie, Cell
} from 'recharts';
import api from '@/lib/api';
import { generarPagare } from '@/lib/generatePagare';
import { useRouter } from 'next/navigation';

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
  // --- 1. DESENVOLVER PARAMS (Solución al error de Next.js) ---
  const params = use(paramsPromise);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [montoAbono, setMontoAbono] = useState('');
  const [semanaAbono, setSemanaAbono] = useState('1');
  const router = useRouter();

  // --- 2. LÓGICA DEL BUSCADOR PREDICTIVO ---
  const [busqueda, setBusqueda] = useState('');
  const [listaClientes, setListaClientes] = useState<any[]>([]);
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showCondonarModal, setShowCondonarModal] = useState(false);
  const [selectedPenalizacion, setSelectedPenalizacion] = useState<any>(null);
  const [motivoCondonacion, setMotivoCondonacion] = useState('');
  const [procesandoCondonacion, setProcesandoCondonacion] = useState(false);

  const handleCondonar = async () => {
    if (motivoCondonacion.length < 10) {
      return alert("⚠️ Por favor describe un motivo más detallado (mín. 10 caracteres)");
    }

    try {
      setProcesandoCondonacion(true);
      await api.post(`/penalizaciones/${selectedPenalizacion.id}/condonar/`, {
        motivo: motivoCondonacion
      });

      alert("✅ Recargo condonado exitosamente");
      setShowCondonarModal(false);
      setMotivoCondonacion('');

      // Recargamos los datos del cliente para ver el saldo actualizado
      const res = await api.get(`/clientes/${params.id}/`);
      setData(res.data);
    } catch (error) {
      console.error(error);
      alert("❌ Error al procesar la condonación");
    } finally {
      setProcesandoCondonacion(false);
    }
  };

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const res = await api.get('/clientes/');
        setListaClientes(res.data);
      } catch (e) { console.error(e); }
    };
    cargarClientes();

    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleRegistrarPago = async () => {
    const clientId = params.id || data?.id;
    if (!montoAbono) return alert("Ingresa un monto válido");
    try {
      setLoading(true);
      await api.post('/abonos/', {
        prestamo: data.ultimo_prestamo_id,
        monto: montoAbono,
        semana_numero: semanaAbono
      });
      alert("✅ Abono registrado correctamente");
      setShowModal(false);
      setMontoAbono('');
      const res = await api.get(`/clientes/${clientId}/`);
      setData(res.data);
    } catch (error: any) {
      alert("❌ Error al registrar el pago.");
    } finally { setLoading(false); }
  };

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

  if (loading && !data) return <div className="p-10 font-black italic text-slate-400 animate-pulse">Sincronizando con Huamantla...</div>;
  if (!data) return <div className="p-10 font-black italic text-red-400">Error: Cliente no localizado.</div>;

  const aval = data.datos_ultimo_aval || {};
  const historialPagosData = data.historial_grafico || [];
  const cumplimientoData = [
    { name: 'Pagado', value: data.progreso_pagos?.pagado || 0, color: COLORS.verdeExito },
    {
      name: 'Pendiente',
      // Si pagado es 0, pendiente debe ser 100 para que la dona se vea llena de gris
      value: data.progreso_pagos?.pendiente || 100,
      color: '#F1F5F9'
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFE]">
      <main className="flex-1 p-10 overflow-auto">

        {/* BUSCADOR PREDICTIVO MEJORADO */}
        <div className="mb-8 flex justify-end" ref={searchRef}>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0047AB]" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o ID..."
              value={busqueda}
              onChange={handleInputChange}
              onFocus={() => busqueda.length > 1 && setMostrarSugerencias(true)}
              className="w-80 pl-12 pr-4 py-3 bg-white shadow-sm border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0047AB] outline-none transition-all"
            />
            {mostrarSugerencias && sugerencias.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100]">
                {sugerencias.map((c) => (
                  <button key={c.id} onClick={() => seleccionarCliente(c.id)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-blue-50 transition-colors text-left border-b border-slate-50 last:border-none">
                    <div>
                      <p className="text-sm font-black text-slate-800">{c.nombre}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">ID: {c.id}</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-300" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- RESTO DEL CONTENIDO (HEADER, CARDS, GRÁFICAS) IGUAL QUE TU CÓDIGO --- */}
        <header className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] bg-[#0047AB] p-1 shadow-xl shadow-blue-200 flex items-center justify-center font-black text-3xl text-white">
              {data.nombre[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter">{data.nombre}</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${data.tiene_prestamo_activo
                    ? (data.progreso_pagos?.pendiente > 0 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100')
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                  {data.tiene_prestamo_activo
                    ? (data.progreso_pagos?.pendiente > 0 ? 'Préstamo Activo' : 'Liquidado')
                    : 'Sin Historial de Crédito'}
                </span>
              </div>
              <p className="text-slate-400 text-sm font-medium mt-1">ID Cliente: #{data.id} • Ubicación: {data.direccion}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => generarPagare(data)} className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm">
              <FileText size={16} className="text-blue-600" /> Imprimir Pagaré
            </button>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#0047AB] text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest">
              <DollarSign size={16} /> Registrar Pago
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
    title="Saldo Pendiente" 
    value={`$${(data.saldo_actual || 0).toLocaleString()}`} 
    icon={DollarSign} 
    color={COLORS.rojoAlerta} 
  />
          <StatCard
            title="Total Pagado"
            value={`$${(data.progreso_pagos?.monto_pagado || 0).toLocaleString()}`}
            icon={UserCheck}
            color={COLORS.verdeExito}
          />
          <StatCard
            title="Monto Contratado"
            value={`$${(data.progreso_pagos?.monto_capital || 0).toLocaleString()}`}
            icon={TrendingUp}
            color={COLORS.azulRey}
          />
          <StatCard title="Teléfono" value={data.telefono} icon={AlertTriangle} color={COLORS.amarilloCuidado} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
            <h4 className="font-black text-slate-800 text-lg uppercase tracking-tighter italic mb-8">Historial de Abonos Registrados</h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historialPagosData}>
                  <CartesianGrid vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#F8FAFE' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="pago" fill={COLORS.azulRey} radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col items-center">
            <h4 className="font-black text-slate-800 mb-2 uppercase tracking-tighter italic">Progreso del Crédito</h4>
            <div className="flex-1 relative w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePie data={cumplimientoData} innerRadius={80} outerRadius={100} dataKey="value" startAngle={90} endAngle={450}>
                  {cumplimientoData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                </RePie>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-slate-800">{Math.round(data.progreso_pagos?.pagado || 0)}%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Liquidado</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
            <h4 className="text-slate-800 font-black mb-6 uppercase tracking-tighter italic border-b pb-4">Información del Aval</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Nombre:</span>
                <span className="text-sm font-bold text-slate-700">{aval.nombre_aval || 'S/N'}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Parentesco:</span>
                <span className="text-sm font-bold text-slate-700">{aval.parentesco_aval || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Teléfono:</span>
                <span className="text-sm font-bold text-blue-600">{aval.telefono_aval || 'S/N'}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Garantía:</span>
                <span className="text-sm font-bold text-slate-700">{aval.garantia_descripcion || 'S/N'}</span>
              </div>
            </div>
          </div>
          <div className="bg-[#050533] p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-900/20">
            <h4 className="font-black mb-6 uppercase tracking-tighter italic border-b border-white/10 pb-4 text-sky-400">
              Recargos por Mora (1.5% Diario)
            </h4>
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {data.penalizaciones?.filter((p: any) => p.activa).length > 0 ? (
                data.penalizaciones.filter((p: any) => p.activa).map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div>
                      <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">Atraso detectado</p>
                      <p className="text-sm font-bold text-white">${p.monto_penalizado} <span className="text-[10px] text-slate-400 font-normal">({p.fecha_aplicacion})</span></p>
                    </div>
                    <button
                      onClick={() => { setSelectedPenalizacion(p); setShowCondonarModal(true); }}
                      className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                    >
                      Condonar
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 italic font-black">✓</div>
                  <div>
                    <p className="text-sm font-bold">Sin recargos activos</p>
                    <p className="text-[10px] text-slate-400 uppercase font-medium mt-1">El cliente está al corriente.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-[#050533]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 italic">Registrar Abono</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 font-bold">X</button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Monto ($)</label>
                <input type="number" value={montoAbono} onChange={(e) => setMontoAbono(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-black text-xl text-slate-800" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Semana</label>
                <select value={semanaAbono} onChange={(e) => setSemanaAbono(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-700">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => <option key={num} value={num}>Semana {num}</option>)}
                </select>
              </div>
              <button onClick={handleRegistrarPago} disabled={loading} className="w-full py-4 bg-[#0047AB] text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 shadow-lg">{loading ? 'Sincronizando...' : 'Confirmar Transacción'}</button>
            </div>
          </div>
        </div>
      )}
      {showCondonarModal && (
        <div className="fixed inset-0 bg-[#050533]/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-slate-800 italic mb-2">Condonar Recargo</h2>
            <p className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-widest">
              Monto: <span className="text-red-500">${selectedPenalizacion?.monto_penalizado}</span>
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Justificación (Fuerza Mayor)</label>
                <textarea
                  value={motivoCondonacion}
                  onChange={(e) => setMotivoCondonacion(e.target.value)}
                  placeholder="Ej. El cliente presentó comprobante médico por emergencia familiar..."
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 text-sm text-slate-700 min-h-[120px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowCondonarModal(false)}
                  className="py-4 bg-slate-100 text-slate-500 font-black text-[10px] uppercase rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCondonar}
                  disabled={procesandoCondonacion || motivoCondonacion.length < 10}
                  className="py-4 bg-red-600 text-white font-black text-[10px] uppercase rounded-2xl hover:bg-red-700 shadow-lg shadow-red-200 disabled:opacity-30 transition-all"
                >
                  {procesandoCondonacion ? 'Procesando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
