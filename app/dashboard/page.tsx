'use client';
import React, { useEffect, useState } from 'react';
import { Users, DollarSign, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function GlobalDashboard() {
  const [resumen, setResumen] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        // Crearemos un endpoint en Django que nos dé el resumen de TODO
        const res = await api.get('/estadisticas-globales/');
        setResumen(res.data);
      } catch (e) { console.error(e); }
    };
    fetchGlobalData();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">Bienvenido, Alexander</h1>
        <p className="text-slate-400 font-medium">Resumen general de Préstamos Express Huamantla</p>
      </header>

      {/* METRICAS GLOBALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#050533] p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-900/20">
          <p className="text-sky-400 text-[10px] font-black uppercase tracking-widest">Capital en la Calle</p>
          <h2 className="text-4xl font-black mt-2">{resumen?.total_prestado || "$0.00"}</h2>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Clientes Activos</p>
          <h2 className="text-4xl font-black text-slate-800 mt-2">{resumen?.clientes_totales || "0"}</h2>
        </div>

        <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100">
          <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">Cartera en Riesgo</p>
          <h2 className="text-4xl font-black text-red-600 mt-2">{resumen?.clientes_mora || "0"} Clientes</h2>
        </div>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 uppercase italic mb-6">Alertas de Cobranza Hoy</h3>
          <div className="space-y-4">
            {/* Aquí mapearíamos a los clientes que deben pagar hoy */}
            <p className="text-slate-400 text-sm italic">Cargando lista de cobros prioritarios...</p>
          </div>
        </div>

        <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-[#0047AB] text-white rounded-2xl flex items-center justify-center mb-4">
            <DollarSign size={32} />
          </div>
          <h4 className="font-black text-slate-800 text-lg">¿Nuevo Préstamo?</h4>
          <p className="text-slate-400 text-sm mb-6">Inicia el proceso de alta para un cliente nuevo o recurrente.</p>
          <button 
            onClick={() => router.push('/dashboard/prestamos')}
            className="bg-[#0047AB] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            Ir a Módulo de Préstamos <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}