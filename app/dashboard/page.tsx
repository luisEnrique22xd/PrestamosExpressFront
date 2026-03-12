'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  DollarSign, ArrowRight, Search, TrendingUp, 
  Users, Wallet, Calendar, ArrowUpRight, Loader2 
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip
} from 'recharts';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function GlobalDashboard() {
  const [resumen, setResumen] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/estadisticas-globales/');
        setResumen(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalData();
  }, []);

  // Lógica de búsqueda rápida
  const handleSearch = async (val: string) => {
    setBusqueda(val);
    if (val.length > 2) {
      try {
        const res = await api.get(`/clientes/?search=${val}`);
        setSugerencias(res.data.slice(0, 5));
      } catch (e) { console.error(e); }
    } else {
      setSugerencias([]);
    }
  };

  const capitalEnCalle = resumen?.rangos?.reduce((acc: number, r: any) => {
    const valor = parseFloat(r.total.replace(/[^0-9.-]+/g, ""));
    return acc + valor;
  }, 0) || 0;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="font-black uppercase tracking-widest text-xs italic">Cargando Inteligencia Financiera...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      
      {/* HEADER CON BUSCADOR INTEGRADO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">
            Sistema <span className="text-[#0047AB]">Express</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
            Control Central • 
Santa Maria Acuitlapilco

, Tlaxcala
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar cliente rápido..."
            value={busqueda}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-[#0047AB] outline-none font-bold text-sm"
          />
          {sugerencias.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 border border-slate-50 overflow-hidden">
              {sugerencias.map((c) => (
                <button 
                  key={c.id}
                  onClick={() => router.push(`/dashboard/${c.id}`)}
                  className="w-full p-4 flex items-center justify-between hover:bg-blue-50 transition-colors border-b last:border-none"
                >
                  <span className="font-black text-slate-700 text-xs uppercase">{c.nombre}</span>
                  <ArrowUpRight size={14} className="text-[#0047AB]" />
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* METRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="bg-[#050533] p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={80} />
          </div>
          <p className="text-sky-400 text-[10px] font-black uppercase tracking-widest relative z-10">Total Recuperado</p>
          <h2 className="text-4xl font-black mt-2 relative z-10 tracking-tighter italic">
            {resumen?.total_recuperado || "$0.00"}
          </h2>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-[#0047AB]">
            <Users size={80} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Préstamos Activos</p>
          <h2 className="text-4xl font-black text-slate-800 mt-2 tracking-tighter">
            {resumen?.prestamos_activos || 0}
          </h2>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Inversión en Calle</p>
          <h2 className="text-4xl font-black text-red-600 mt-2 tracking-tighter italic">
            ${capitalEnCalle.toLocaleString('es-MX')}
          </h2>
        </div>

        <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100">
          <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">Cobranza del Día</p>
          <h2 className="text-4xl font-black text-emerald-700 mt-2 tracking-tighter">
            {resumen?.cobrado_hoy || "$0.00"}
          </h2>
        </div>

      </div>

      {/* SECCIÓN INTERMEDIA: GRÁFICA Y DESGLOSE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GRÁFICA DE TENDENCIA */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-800 uppercase italic flex items-center gap-2">
              <Calendar size={18} className="text-[#0047AB]" />
              Rendimiento Semanal
            </h3>
            <span className="text-[10px] font-black bg-blue-50 text-[#0047AB] px-3 py-1 rounded-full uppercase">Flujo de Caja</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resumen?.grafica_semanal || []}>
                <defs>
                  <linearGradient id="colorRecup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0047AB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0047AB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                   contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                   itemStyle={{color: '#0047AB', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="monto" stroke="#0047AB" strokeWidth={4} fillOpacity={1} fill="url(#colorRecup)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DESGLOSE POR RANGOS */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden relative">
          <h3 className="font-black text-slate-800 uppercase italic mb-8 flex items-center gap-2">
            <Wallet size={18} className="text-[#0047AB]" />
            Concentración
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar">
            {resumen?.rangos?.filter((r: any) => r.cant > 0).map((r: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-5 bg-slate-50 rounded-[1.8rem] border border-transparent hover:border-blue-100 transition-all group">
                <div>
                  <p className="text-xs font-black text-slate-700 group-hover:text-[#0047AB] transition-colors">{r.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <p className="text-[9px] text-slate-400 uppercase font-black">{r.cant} Casos</p>
                  </div>
                </div>
                <p className="text-sm font-black text-slate-800">{r.total}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BANNER DE ACCIÓN */}
      <div className="bg-gradient-to-r from-[#0047AB] to-[#050533] p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-900/30">
        <div className="text-center md:text-left">
          <h4 className="text-2xl font-black italic uppercase tracking-tighter">Expansión de Cartera</h4>
          <p className="text-blue-200 text-sm mt-1 font-medium">Gestiona nuevos créditos y contratos legales desde el módulo central.</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/prestamos')}
          className="bg-white text-[#050533] px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-3"
        >
          Módulo de Préstamos
          <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
}