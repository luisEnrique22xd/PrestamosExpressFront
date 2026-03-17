"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { generarPDFSimulacion } from '@/lib/generateSimulation';
import { generarPagare } from '@/lib/generatePagare';
import api from '@/lib/api';
import { 
  Calendar as CalendarIcon, 
  DollarSign, 
  PieChart, 
  Info, 
  Search, 
  ArrowRight, 
  User, 
  MapPin, 
  Phone, 
  Fingerprint,
  Printer,
  ChevronRight,
  Users // Icono para grupos
} from 'lucide-react';

export default function ProyeccionPage() {
  const [loading, setLoading] = useState(false);
  // --- ESTADOS DE DATOS DEL CLIENTE / GRUPO ---
  const [nombreCliente, setNombreCliente] = useState('');
  const [direccion, setDireccion] = useState('');
  const [curp, setCurp] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nombreAval, setNombreAval] = useState('');
  const [telefonoAval, setTelefonoAval] = useState('');
  const [esGrupal, setEsGrupal] = useState(false);
  const [numIntegrantes, setNumIntegrantes] = useState(1);

  // --- ESTADOS PARA AUTOCOMPLETADO Y FOLIO ---
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [folioConsecutivo, setFolioConsecutivo] = useState(1);
  const searchRef = useRef<HTMLDivElement>(null);

  // --- ESTADOS FINANCIEROS ---
  const [monto, setMonto] = useState(3000);
  const [modalidad, setModalidad] = useState('semanal');
  const [cuotas, setCuotas] = useState(8);
  const [interes, setInteres] = useState(2.5);
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);

  // --- 1. CARGAR FOLIO CONSECUTIVO ---
  // useEffect(() => {
  //   const fetchFolio = async () => {
  //     try {
  //       const res = await api.get('/proximo-folio/');
  //       setFolioConsecutivo(res.data.proximo_folio);
  //     } catch (e) { console.error("Error al obtener folio"); }
  //   };
  //   fetchFolio();
  // }, []);

  // --- 2. BUSCADOR HÍBRIDO (CLIENTES Y GRUPOS) ---
  const buscarEntidades = async (query: string) => {
    setBusqueda(query);
    if (query.length > 1) {
      try {
        // Usamos el directorio híbrido para que salgan grupos también
        const res = await api.get(`/clientes/directorio-hibrido/?search=${query}`);
        setSugerencias(res.data.slice(0, 5));
        setMostrarSugerencias(true);
      } catch (e) { console.error(e); }
    } else {
      setMostrarSugerencias(false);
    }
  };

  const seleccionarEntidad = (c: any) => {
    setEsGrupal(c.es_grupo);
    setNombreCliente(c.nombre || c.nombre_grupo || '');
    setDireccion(c.direccion || (c.es_grupo ? 'Crédito Grupal Solidario' : ''));
    setCurp(c.curp || '');
    setTelefono(c.telefono || '');
    setNumIntegrantes(c.num_integrantes || 1);
    
    if (c.es_grupo) {
        setNombreAval(c.nombre_aval || '');
        setTelefonoAval(c.telefono_aval || '');
    } else if (c.datos_ultimo_aval) {
      setNombreAval(c.datos_ultimo_aval.nombre_aval || '');
      setTelefonoAval(c.datos_ultimo_aval.telefono_aval || '');
    }

    setMostrarSugerencias(false);
    setBusqueda('');
  };

  // --- 3. TASAS AUTOMÁTICAS ---
  useEffect(() => {
    if (modalidad === 'semanal') setInteres(2.5);
    else if (modalidad === 'quincenal') setInteres(7.5);
    else if (modalidad === 'mensual') setInteres(20);
  }, [modalidad]);

  // --- 4. CÁLCULOS FINANCIEROS HÍBRIDOS ---
  const { montoTotal, pagoPorCuota, cuotaPorSocio } = useMemo(() => {
    const interesPorCuota = monto * (interes / 100); 
    const capitalPorCuota = monto / (cuotas || 1);
    const pagoFinalCuota = capitalPorCuota + interesPorCuota;
    return {
      montoTotal: pagoFinalCuota * cuotas,
      pagoPorCuota: pagoFinalCuota,
      cuotaPorSocio: esGrupal ? (pagoFinalCuota / numIntegrantes) : pagoFinalCuota
    };
  }, [monto, interes, cuotas, esGrupal, numIntegrantes]);

  // --- 5. FECHAS DE PAGO ---
  const fechasPago = useMemo(() => {
    let fechas = [];
    const [year, month, day] = fechaInicio.split('-').map(Number);
    let fechaReferencia = new Date(year, month - 1, day);

    for (let i = 1; i <= cuotas; i++) {
      if (modalidad === 'semanal') fechaReferencia.setDate(fechaReferencia.getDate() + 7);
      else if (modalidad === 'quincenal') fechaReferencia.setDate(fechaReferencia.getDate() + 15);
      else if (modalidad === 'mensual') fechaReferencia.setMonth(fechaReferencia.getMonth() + 1);
      
      let fechaMostrar = new Date(fechaReferencia);
      if (fechaMostrar.getDay() === 0) fechaMostrar.setDate(fechaMostrar.getDate() + 1);
      fechas.push({ fechaCobro: fechaMostrar });
    }
    return fechas;
  }, [fechaInicio, modalidad, cuotas]);

useEffect(() => {
  const fetchFolio = async () => {
    try {
      const res = await api.get('/proximo-folio/');
      // Guardamos el "2" en nuestro estado de React
      setFolioConsecutivo(res.data.proximo_folio);
    } catch (e) {
      console.error("Error al obtener folio");
    }
  };
  fetchFolio();
}, []);

// 6. EXPORTAR (Simulación y Pagaré sin guardar en DB)
const exportarDocumentacion = () => {
  // 1. Ya no usamos async/await porque no llamamos a la API aquí
  setLoading(true); 

  // 2. Usamos el folio que cargamos con el useEffect al inicio (folioConsecutivo)
  const folioReal = folioConsecutivo;

  // 3. Calculamos la fecha final
  const ultimaFecha = fechasPago[fechasPago.length - 1]?.fechaCobro;
  
  // 4. Preparamos el paquete de datos
  const datosFinales = {
    nombreCliente, 
    direccion, 
    curp, 
    telefono,
    nombreAval, 
    telefonoAval,
    monto, 
    modalidad, 
    cuotas, 
    interes, 
    pagoPorCuota, 
    montoTotal,
    esGrupal, 
    numIntegrantes, 
    cuotaPorSocio,
    fechaVencimiento: ultimaFecha,
    folio_consecutivo: folioReal, // Usamos el estado del contador
    poblacion: "HUAMANTLA, TLAXCALA"
  };

  // 5. Generamos los archivos
  generarPDFSimulacion(datosFinales, fechasPago);
  generarPagare(datosFinales);

  // 6. Feedback para Alexander
  alert(`✅ Documentos generados con Folio: ${folioReal.toString().padStart(3, '0')}`);
  
  setLoading(false);
};
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
      
      {/* PANEL IZQUIERDO: CONFIGURACIÓN */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
          
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${esGrupal ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-[#0047AB]'}`}>
              {esGrupal ? <Users size={24} /> : <PieChart size={24} />}
            </div>
            <h3 className="font-black text-slate-800 text-xl italic uppercase tracking-tighter">
                {esGrupal ? 'Simulador Grupal' : 'Simulador Pro'}
            </h3>
          </div>

          {/* BUSCADOR AUTOCOMPLETADO HÍBRIDO */}
          <div className="relative" ref={searchRef}>
            <label className={`text-[10px] font-black uppercase ml-2 tracking-widest block mb-2 italic ${esGrupal ? 'text-purple-600' : 'text-[#0047AB]'}`}>Buscador de Socio o Grupo</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text"
                placeholder="Buscar en el directorio..."
                value={busqueda}
                onChange={(e) => buscarEntidades(e.target.value)}
                className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none border border-slate-100 focus:ring-2 focus:ring-[#0047AB] font-bold text-sm"
              />
            </div>
            {mostrarSugerencias && sugerencias.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-[100] border border-slate-100 overflow-hidden">
                {sugerencias.map((c) => (
                  <button key={`${c.es_grupo ? 'G' : 'I'}-${c.id}`} onClick={() => seleccionarEntidad(c)} className="w-full p-4 flex items-center justify-between hover:bg-blue-50 border-b last:border-none transition-colors">
                    <div className="flex items-center gap-3">
                      {c.es_grupo ? <Users size={16} className="text-purple-600"/> : <User size={16} className="text-blue-600"/>}
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-black text-slate-800 uppercase">{c.nombre || c.nombre_grupo}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{c.es_grupo ? 'Grupo Solidario' : `ID: ${c.id}`}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-300" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* FORMULARIO DE DATOS */}
          <div className="space-y-3 pt-4 border-t border-slate-50">
            <div className="relative">
              <User className="absolute left-4 top-4 text-slate-300" size={16} />
              <input placeholder={esGrupal ? "Nombre del Grupo" : "Nombre del Cliente"} value={nombreCliente} onChange={e => setNombreCliente(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-sm" />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-slate-300" size={16} />
              <input placeholder="Domicilio / Ubicación" value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-slate-50 pt-4">
              <input placeholder="Presidente / Aval" value={nombreAval} onChange={e => setNombreAval(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-emerald-50 focus:ring-2 focus:ring-emerald-500 font-bold text-xs uppercase" />
              <input placeholder="Tel. Contacto" value={telefonoAval} onChange={e => setTelefonoAval(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-emerald-50 focus:ring-2 focus:ring-emerald-500 font-bold text-xs" />
            </div>
          </div>

          {/* CONFIGURACIÓN FINANCIERA */}
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Capital</label>
                <input type="number" value={monto} onChange={e => setMonto(Number(e.target.value))} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-[#0047AB] outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Cuotas</label>
                <input type="number" value={cuotas} onChange={e => setCuotas(Number(e.target.value))} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-slate-700 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Modalidad</label>
                <select value={modalidad} onChange={e => setModalidad(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-600 outline-none">
                  <option value="semanal">Semanal</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Interés (%)</label>
                <input value={interes} readOnly className="w-full p-4 bg-slate-100 rounded-2xl font-black text-[#0047AB] outline-none" />
              </div>
            </div>
          </div>

          <button 
            onClick={exportarDocumentacion}
            className={`w-full py-5 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${esGrupal ? 'bg-purple-600 shadow-purple-900/20' : 'bg-[#0047AB] shadow-blue-900/20'}`}
          >
             Generar Documentos #PR-{folioConsecutivo.toString().padStart(3, '0')}
          </button>
        </div>
      </div>

      {/* PANEL DERECHO: VISTA PREVIA */}
      <div className="lg:col-span-2 space-y-6">
        <div className={`p-10 rounded-[3rem] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 transition-colors duration-500 ${esGrupal ? 'bg-gradient-to-br from-purple-900 to-slate-900' : 'bg-[#050533]'}`}>
          <div className="text-center md:text-left">
            <p className="text-sky-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Pago por Grupo ({modalidad})</p>
            <h2 className="text-6xl font-black tracking-tighter italic text-white">${pagoPorCuota.toFixed(2)}</h2>
            {esGrupal && (
                <div className="mt-4 flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                    <Users size={14} className="text-purple-400"/>
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-200">
                        Cada integrante: <span className="text-white text-sm">${cuotaPorSocio.toFixed(2)}</span>
                    </span>
                </div>
            )}
          </div>
          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 text-right min-w-[200px]">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total del Crédito</p>
            <h2 className="text-3xl font-black text-emerald-400">${montoTotal.toFixed(2)}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fechasPago.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between shadow-sm group">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border border-slate-100 font-bold transition-colors ${esGrupal ? 'bg-purple-50 group-hover:bg-purple-100' : 'bg-slate-50 group-hover:bg-blue-50'}`}>
                  <span className="text-[8px] text-slate-400 uppercase">{item.fechaCobro.toLocaleDateString('es-MX', { month: 'short' })}</span>
                  <span className="text-xl text-slate-800">{item.fechaCobro.getDate()}</span>
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm">Pago #{index + 1}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{item.fechaCobro.toLocaleDateString('es-MX', { weekday: 'long' })}</p>
                    {item.fechaCobro.getDay() === 1 && <span className="text-[7px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-black">RECORRIDO</span>}
                  </div>
                </div>
              </div>
              <p className={`text-2xl font-black italic ${esGrupal ? 'text-purple-600' : 'text-[#0047AB]'}`}>${pagoPorCuota.toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className={`p-8 rounded-[3rem] border flex items-start gap-4 ${esGrupal ? 'bg-purple-50 border-purple-100' : 'bg-blue-50 border-blue-100'}`}>
          <Info size={24} className={`${esGrupal ? 'text-purple-600' : 'text-[#0047AB]'} shrink-0 mt-1`} />
          <p className={`text-xs font-medium leading-relaxed italic ${esGrupal ? 'text-purple-700' : 'text-blue-700/80'}`}>
            <strong>Proyección Solidaria:</strong> {esGrupal 
              ? `Este cálculo divide la cuota total entre los ${numIntegrantes} socios responsables. En caso de que un integrante no aporte, el grupo deberá cubrir su parte solidariamente.` 
              : `Este cálculo es individual. Los domingos se recorren al lunes para asegurar la efectividad del cobro en Huamantla.`}
          </p>
        </div>
      </div>
    </div>
  );
}

function setLoading(arg0: boolean) {
  throw new Error('Function not implemented.');
}
