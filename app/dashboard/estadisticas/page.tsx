'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Wallet, BarChart3, Loader2, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import { exportToExcel, exportToPDF } from '@/lib/generateStatsReport';

const COLORS = {
  azulRey: '#0047AB',
  azulOscuro: '#050533',
  verdeExito: '#10B981',
};

export default function EstadisticasPage() {
  const [dataGrafica, setDataGrafica] = useState([]);
  const [statsGenerales, setStatsGenerales] = useState<any>(null);
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'anio'>('semana');
  const [loading, setLoading] = useState(true);

  // 1. Carga de totales y tarjetas de rangos
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/estadisticas-globales/');
        setStatsGenerales(res.data);
      } catch (error) {
        console.error("Error en tarjetas de rangos:", error);
      }
    };
    fetchStats();
  }, []);

  // 2. Carga de la gráfica según el periodo seleccionado
  useEffect(() => {
    const fetchGrafica = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/estadisticas-dinamicas/?periodo=${periodo}`);
        setDataGrafica(res.data);
      } catch (error) {
        console.error("Error al filtrar gráfica:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrafica();
  }, [periodo]);

  if (!statsGenerales && loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="animate-spin" size={40} />
        <p className="font-black italic uppercase tracking-widest text-xs text-center">
          Conectando con PostgreSQL... <br/> Generando reporte de carteras
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* BANNER - TOTAL RECUPERADO */}
      <div className="relative overflow-hidden bg-[#050533] p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 max-w-md group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <Wallet size={120} color="white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">Recuperación Total</p>
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter">
            {statsGenerales?.total_recuperado || "$0.00"}
          </h2>
          <p className="text-slate-400 text-xs mt-3 font-medium italic">Balance general de todos los abonos registrados.</p>
        </div>
        
      </div>
      <div className="flex gap-3 mb-4">
        <button 
          onClick={() => exportToExcel(statsGenerales, dataGrafica)}
          className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all"
        >
          Descargar Excel
        </button>
        <button 
          onClick={() => exportToPDF(statsGenerales, dataGrafica)}
          className="flex items-center gap-2 bg-white text-slate-700 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all"
        >
          Generar PDF
        </button>
      </div>
      {/* LAS CARDS DE RANGOS (MANTENIDAS Y DINAMIZADAS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(statsGenerales?.rangos || []).map((item: any, index: number) => (
          <div
            key={index}
            className="bg-white p-6 rounded-[2rem] border border-slate-50 flex justify-between items-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-blue-600">
                Rango: {item.label}
              </p>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {item.total}
                <span className="text-slate-300 font-bold text-xs ml-2 uppercase tracking-tighter italic">Acumulado</span>
              </h2>
            </div>

            <div className="text-center bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100">
              <span className="text-2xl font-black text-emerald-600 block leading-none">{item.cant}</span>
              <p className="text-emerald-400 text-[9px] font-black uppercase mt-1">Clientes</p>
            </div>
          </div>
        ))}
      </div>

      {/* SECCIÓN DE GRÁFICA INTERACTIVA */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><BarChart3 size={24} /></div>
            <div>
              <h3 className="font-black text-slate-800 text-xl tracking-tight uppercase italic">Activos e Interés</h3>
              <p className="text-slate-400 text-xs font-medium italic">Distribución temporal por {periodo}</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {(['semana', 'mes', 'anio'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                  periodo === p ? 'bg-[#0047AB] text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[400px] w-full pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataGrafica} barGap={12}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
              <Tooltip cursor={{fill: '#f8f9fe'}} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '15px' }} />
              <Bar dataKey="activos" fill={COLORS.azulRey} radius={[8, 8, 0, 0]} barSize={40} name="Préstamos Activos" />
              <Bar dataKey="interes" fill={COLORS.verdeExito} radius={[8, 8, 0, 0]} barSize={40} name="Interés Generado" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}