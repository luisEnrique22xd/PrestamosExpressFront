"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { generarPDFSimulacion } from '@/lib/generateSimulation';
import { Calendar as CalendarIcon, DollarSign, PieChart, Info, CheckCircle2, Percent, Printer } from 'lucide-react';

export default function ProyeccionPage() {
  const [nombreCliente, setNombreCliente] = useState('');
const [nombreAval, setNombreAval] = useState('');
  const exportarPlan = () => {
  const datosSimulacion = {
    monto,
    modalidad,
    cuotas,
    interes,
    pagoPorCuota,
    montoTotal,
    nombreCliente: nombreCliente || "Cliente General", // Valor por defecto
    nombreAval: nombreAval || "No especificado"
  };
  generarPDFSimulacion(datosSimulacion, fechasPago);
};
  const [monto, setMonto] = useState(1000);
  const [modalidad, setModalidad] = useState('semanal');
  const [cuotas, setCuotas] = useState(4);
  const [interes, setInteres] = useState(2.5); // Valor inicial para semanal
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);

  // --- LÓGICA DE TASAS AUTOMÁTICAS ---
  useEffect(() => {
    if (modalidad === 'semanal') {
      setInteres(2.5);
      setCuotas(12); // Sugerencia estándar para semanal, Alexander puede cambiarlo
    } else if (modalidad === 'quincenal') {
      setInteres(7.5);
      setCuotas(6);
    } else if (modalidad === 'mensual') {
      setInteres(20);
      setCuotas(3);
    }
  }, [modalidad]);

  // --- CÁLCULOS FINANCIEROS ---
  const { montoTotal, pagoPorCuota, interesMontoTotal } = useMemo(() => {
  // 1. Calculamos el interés por cada cuota
  const interesPorCuota = monto * (interes / 100); 
  
  // 2. Calculamos la base de capital por cuota
  const capitalPorCuota = monto / (cuotas || 1);
  
  // 3. El pago final es la suma de ambos
  const pagoFinalCuota = capitalPorCuota + interesPorCuota;
  
  // 4. El monto total que Alexander recibirá al final
  const total = pagoFinalCuota * cuotas;

  return {
    interesMontoTotal: interesPorCuota * cuotas,
    montoTotal: total,
    pagoPorCuota: pagoFinalCuota
  };
}, [monto, interes, cuotas]);

  const fechasPago = useMemo(() => {
  let fechas = [];
  let fechaReferencia = new Date(fechaInicio);

  for (let i = 1; i <= cuotas; i++) {
    // 1. Siempre sumamos los días exactos según la modalidad
    if (modalidad === 'semanal') {
      fechaReferencia.setDate(fechaReferencia.getDate() + 7);
    } else if (modalidad === 'quincenal') {
      fechaReferencia.setDate(fechaReferencia.getDate() + 15);
    } else if (modalidad === 'mensual') {
      fechaReferencia.setMonth(fechaReferencia.getMonth() + 1);
    }
    
    // 2. Creamos una copia para mostrar al cliente
    let fechaMostrar = new Date(fechaReferencia);

    // 3. Ajuste visual: Si cae en domingo (0), Alexander cobra el lunes (1)
    // Pero la 'fechaReferencia' sigue siendo el domingo original para no desfasar la siguiente semana
    if (fechaMostrar.getDay() === 0) {
      fechaMostrar.setDate(fechaMostrar.getDate() + 1);
    }
    
    fechas.push({
      fechaReal: new Date(fechaReferencia), // Para el sistema
      fechaCobro: fechaMostrar             // Para Alexander y el cliente
    });
  }
  return fechas;
}, [fechaInicio, modalidad, cuotas]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
      
      {/* PANEL DE CONFIGURACIÓN */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-[#0047AB] rounded-2xl">
              <PieChart size={24} />
            </div>
            <h3 className="font-black text-slate-800 text-xl tracking-tighter italic uppercase">Simulador Pro</h3>
          </div>
          <div className="space-y-4 border-b border-slate-100 pb-6 mb-6">
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nombre del Cliente</label>
    <input 
      type="text" 
      placeholder="Ej. Juan Pérez"
      value={nombreCliente}
      onChange={(e) => setNombreCliente(e.target.value)}
      className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-700 shadow-inner"
    />
  </div>
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nombre del Aval</label>
    <input 
      type="text" 
      placeholder="Ej. María García"
      value={nombreAval}
      onChange={(e) => setNombreAval(e.target.value)}
      className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-700 shadow-inner"
    />
  </div>
</div>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Capital Solicitado</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="number" 
                  value={monto} 
                  onChange={(e) => setMonto(Number(e.target.value))}
                  className="w-full p-4 pl-10 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-black text-slate-700 shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Modalidad de Pago</label>
              <select 
                value={modalidad} 
                onChange={(e) => setModalidad(e.target.value)}
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-600 appearance-none shadow-inner cursor-pointer"
              >
                <option value="semanal">Semanal (2.5%)</option>
                <option value="quincenal">Quincenal (7.5%)</option>
                <option value="mensual">Mensual (20%)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Interés (%)</label>
                <div className="relative">
                  <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="number" 
                    value={interes} 
                    readOnly // Bloqueado para seguir la regla de negocio
                    className="w-full p-4 pl-10 bg-slate-100 rounded-2xl font-black text-[#0047AB] cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nº de Pagos</label>
                <input 
                  type="number" 
                  value={cuotas} 
                  onChange={(e) => setCuotas(Number(e.target.value))}
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-700 shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Fecha de Inicio</label>
              <input 
                type="date" 
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-600 shadow-inner"
              />
            </div>
          </div>

          <div className="p-8 bg-[#050533] rounded-[2rem] text-white relative overflow-hidden shadow-xl">
            <p className="text-[10px] uppercase font-black text-sky-400 mb-3 tracking-[0.2em]">Abono {modalidad}</p>
            <p className="text-4xl font-black tracking-tighter">${pagoPorCuota.toFixed(2)}</p>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
              <div>
                <p className="text-[9px] text-slate-400 uppercase">Interés total:</p>
                <p className="text-sm font-bold text-sky-200">${interesMontoTotal.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-400 uppercase">Total a pagar:</p>
                <p className="text-sm font-bold text-emerald-400">${montoTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VISTA DE PROYECCIÓN */}
      <div className="lg:col-span-2 space-y-6">
       <div className="flex gap-2">
      <button 
        onClick={exportarPlan} // <--- NUEVA FUNCIÓN
        className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
      >
        Descargar PDF
      </button>
      <button onClick={() => window.print()} className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
        <Printer size={16} /> Imprimir
      </button>
    </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fechasPago.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:border-[#0047AB]/30 transition-all shadow-sm">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase">{item.fechaCobro.toLocaleDateString('es-MX', { month: 'short' })}</span>
                  <span className="text-xl font-black text-slate-800 leading-none">{item.fechaCobro.getDate()}</span>
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm leading-none">Pago #{index + 1}</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">{item.fechaCobro.toLocaleDateString('es-MX', { weekday: 'long' })}</p>
                </div>
              </div>
              <p className="text-xl font-black text-[#0047AB] tracking-tighter">${pagoPorCuota.toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start gap-4">
          <Info size={20} className="text-[#0047AB] shrink-0 mt-1" />
          <p className="text-[11px] text-blue-700/70 font-medium leading-relaxed italic">
            Tasas aplicadas según política de riesgo: Semanal (2.5%), Quincenal (7.5%) y Mensual (20%). Los domingos se recorren automáticamente al lunes.
          </p>
        </div>
      </div>
    </div>
  );
}