'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import { BarChart3, Loader2, Landmark, Percent, Wallet } from 'lucide-react';
import api from '@/lib/api';
import { exportToExcel, exportToPDF } from '@/lib/generateStatsReport';

const COLORS = {
  azulRey: '#0047AB',
  verdeExito: '#10B981',
  purpura: '#8B5CF6',
};

export default function EstadisticasPage() {
  const [dataGrafica, setDataGrafica] = useState([]);
  const [statsGenerales, setStatsGenerales] = useState<any>(null);
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'anio'>('semana');
  const [loading, setLoading] = useState(true);

  // 1. Carga de totales iniciales
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/estadisticas-globales/');
        setStatsGenerales(res.data);
      } catch (error) { console.error(error); }
    };
    fetchStats();
  }, []);

  // 2. Carga de gráfica según periodo
  useEffect(() => {
    const fetchGrafica = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/estadisticas-dinamicas/?periodo=${periodo}`);
        setDataGrafica(res.data);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchGrafica();
  }, [periodo]);

  if (!statsGenerales && loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="animate-spin" size={40} />
        <p className="font-black italic uppercase tracking-widest text-xs text-center">Consultando saldos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="lg:col-span-2 relative overflow-hidden bg-[#050533] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl text-white text-center md:text-left">

        {/* 1. BANNER PRINCIPAL DE CAPITAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Landmark size={120} />
          </div>
          <p className="text-sky-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 italic">Capital Vigente en Calle</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">            {statsGenerales?.capital_en_calle || "$0.00"}
          </h2>
          <div className="flex gap-4">
            <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/5">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Préstamos Activos</p>
              <p className="text-sm font-black text-emerald-400">{statsGenerales?.prestamos_activos || 0} Contratos</p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/5">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Total Recuperado</p>
              <p className="text-sm font-black text-sky-400">{statsGenerales?.total_recuperado || "$0.00"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Percent size={20} /></div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Salud Financiera</p>
          </div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter italic">Óptima</h3>
          <p className="text-slate-400 text-xs mt-2 font-medium italic italic">Cartera con flujo de abonos constante.</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-2">
        <button
          onClick={() => exportToExcel(statsGenerales, dataGrafica)}
          className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-emerald-100 hover:bg-emerald-100 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
        >
          <div className="p-2 bg-emerald-500 text-white rounded-lg group-hover:rotate-12 transition-transform">
            <Wallet size={14} />
          </div>
          Exportar a Excel
        </button>

        <button
          onClick={() => exportToPDF(statsGenerales, dataGrafica)}
          className="flex items-center gap-3 bg-white text-slate-700 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-slate-200 hover:bg-slate-50 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
        >
          <div className="p-2 bg-[#050533] text-white rounded-lg group-hover:scale-110 transition-transform">
            <Landmark size={14} />
          </div>
          Generar Reporte PDF
        </button>
      </div>

      {/* 2. RANGOS DE CARTERA */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">        {(statsGenerales?.rangos || []).map((item: any, index: number) => (
        <div key={index} className="bg-white p-5 rounded-[2rem] border border-slate-50 shadow-sm hover:border-blue-200 transition-all">
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-tighter mb-2">{item.label}</p>
          <div className="flex justify-between items-end">
            <div>
              <h4 className="text-lg font-black text-slate-800 leading-none">{item.total}</h4>
              <p className="text-[8px] text-slate-300 font-bold uppercase mt-1">Colocado</p>
            </div>
            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-black">
              {item.cant}
            </div>
          </div>
        </div>
      ))}
      </div>

      {/* 3. GRÁFICA DE CAPITAL VS GANANCIA */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-6 md:mb-10 gap-6 text-center lg:text-left">          <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><BarChart3 size={24} /></div>
          <div>
            <h3 className="font-black text-slate-800 text-xl tracking-tight uppercase italic">Capital vs Ganancia Real</h3>
            <p className="text-slate-400 text-xs font-medium italic tracking-tighter">Montos en Pesos Mexicanos ($) • {periodo}</p>
          </div>
        </div>

          <div className="flex w-full lg:w-auto bg-slate-100 p-1 rounded-xl md:rounded-2xl border border-slate-200 overflow-x-auto">            {(['semana', 'mes', 'anio'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${periodo === p ? 'bg-[#0047AB] text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {p}
            </button>
          ))}
          </div>
        </div>

        <div className="h-[300px] md:h-[400px] w-full">          <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dataGrafica} barGap={12}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              cursor={{ fill: '#f8f9fe' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const capital = payload[0].value as number;
                  const interes = payload[1].value as number;
                  return (
                    <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{label}</p>
                      <p className="text-xs font-bold text-blue-600">Capital: ${capital.toLocaleString()}</p>
                      <p className="text-xs font-bold text-emerald-600">Interés: ${interes.toLocaleString()}</p>
                      <hr className="my-2 border-slate-100" />
                      <p className="text-xs font-black text-slate-800 italic">Total: ${(capital + interes).toLocaleString()}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', paddingBottom: '30px' }}
            />

            <Bar
              dataKey="capital"
              fill={COLORS.azulRey}
              radius={[8, 8, 0, 0]}
              barSize={window.innerWidth < 768 ? 15 : 40}
              name="Capital Prestado ($)"
            />
            <Bar
              dataKey="interes"
              fill={COLORS.verdeExito}
              radius={[8, 8, 0, 0]}
              barSize={window.innerWidth < 768 ? 15 : 40}
              name="Ganancia Interés ($)"
            />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}