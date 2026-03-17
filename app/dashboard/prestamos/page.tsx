"use client";
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  UserPlus, RefreshCcw, ShieldCheck, UserCog,
  Trash2, ArrowRight, Info, Users, User, Search, X, Check, Plus,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';

const TASAS_POR_MODALIDAD = {
  'S': 2.5,  // Semanal
  'Q': 7.5,  // Quincenal
  'M': 20.0, // Mensual
};

export default function PrestamosPage() {
  const [tipoPrestamo, setTipoPrestamo] = useState<'I' | 'G'>('I');
  const [tipoCliente, setTipoCliente] = useState<'nuevo' | 'recurrente'>('nuevo');
  const [clienteEncontrado, setClienteEncontrado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editandoAval, setEditandoAval] = useState(true);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);

  // Supongamos que tu objeto cliente trae un booleano 'tiene_moras' 
  // o lo verificas al seleccionarlo:
  const tieneBloqueo = clienteSeleccionado?.tiene_moras_activas;

  // Estados para Grupos y Autocompletado
  const [busquedaSocio, setBusquedaSocio] = useState('');
  const [sugerenciasSocios, setSugerenciasSocios] = useState<any[]>([]);
  const [integrantes, setIntegrantes] = useState<any[]>([]);

  // Estados para nombres de grupo existentes
  const [gruposExistentes, setGruposExistentes] = useState<any[]>([]);
  const [mostrarSugerenciasGrupo, setMostrarSugerenciasGrupo] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<any>(null);

  const [formData, setFormData] = useState({
    cliente: '',
    nombre_grupo: '',
    grupo_id: '', // Agregamos grupo_id para el backend
    monto_capital: '',
    tasa_interes: '2.5',
    cuotas: '8',
    modalidad: 'S',
    nombre_aval: '',
    direccion_aval: '',
    telefono_aval: '',
    curp_aval: '',
    parentesco_aval: '',
    garantia_descripcion: ''
  });

  const [alerta, setAlerta] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // 2. Función auxiliar para lanzar la alerta
  const lanzarAlerta = (type: 'success' | 'error', msg: string) => {
    setAlerta({ type, msg });
    setTimeout(() => setAlerta(null), 5000); // Se quita tras 5 segundos
  };

  // --- CARGA INICIAL DE GRUPOS ---
  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const res = await api.get('/clientes/directorio-hibrido/');
        setGruposExistentes(res.data.filter((e: any) => e.es_grupo));
      } catch (e) { console.error("Error al cargar grupos"); }
    };
    fetchGrupos();
  }, []);

  // --- BUSCADOR DE SOCIOS PARA INTEGRANTES ---
  const buscarSocios = async (val: string) => {
    setBusquedaSocio(val);
    if (val.length > 1) {
      try {
        const res = await api.get(`/clientes/?search=${val}`);
        setSugerenciasSocios(res.data.slice(0, 5));
      } catch (e) { console.error(e); }
    } else { setSugerenciasSocios([]); }
  };

  const agregarIntegrante = (socio: any) => {
    if (!integrantes.find(i => i.id === socio.id)) {
      setIntegrantes([...integrantes, socio]);
    }
    setBusquedaSocio('');
    setSugerenciasSocios([]);
  };

  // --- LÓGICA SELECTOR DE GRUPO ---
  const handleNombreGrupoChange = (val: string) => {
    setFormData({ ...formData, nombre_grupo: val, grupo_id: '' });
    setGrupoSeleccionado(null);
    setMostrarSugerenciasGrupo(true);
  };

  const seleccionarGrupoExistente = (g: any) => {
    setFormData({
      ...formData,
      nombre_grupo: g.nombre,
      grupo_id: g.id,
      nombre_aval: g.nombre_aval || '', // Auto-rellenar representante
      telefono_aval: g.telefono_aval || ''
    });
    setGrupoSeleccionado(g);
    setMostrarSugerenciasGrupo(false);
  };

  // --- CÁLCULOS DINÁMICOS ---
  const calculos = useMemo(() => {
    const capital = Number(formData.monto_capital) || 0;
    const tasa = Number(formData.tasa_interes) / 100;
    const nCuotas = Number(formData.cuotas) || 1;
    const interesTotal = capital * tasa * nCuotas;
    const totalPagar = capital + interesTotal;
    const pagoPorPeriodo = totalPagar / nCuotas;
    return { interesTotal, totalPagar, pagoPorPeriodo };
  }, [formData.monto_capital, formData.tasa_interes, formData.cuotas]);

  const handleReset = () => {
    setFormData({
      cliente: '', nombre_grupo: '', grupo_id: '', monto_capital: '', tasa_interes: '2.5', cuotas: '8',
      modalidad: 'S', nombre_aval: '', direccion_aval: '', telefono_aval: '',
      curp_aval: '', parentesco_aval: '', garantia_descripcion: ''
    });
    setIntegrantes([]);
    setClienteEncontrado(null);
    setGrupoSeleccionado(null);
  };

  const buscarCliente = async (id: string) => {
    if (!id || tipoPrestamo === 'G') return;
    try {
      const response = await api.get(`/clientes/${id}/`);
      const cliente = response.data;
      setClienteEncontrado(cliente);
      // 🔥 IMPORTANTE: Sincroniza el cliente seleccionado para activar el bloqueo
      setClienteSeleccionado({cliente, tiene_moras_activas: cliente.tiene_moras_activas});

      setTipoCliente('recurrente');
      setEditandoAval(false);

      if (cliente.datos_ultimo_aval) {
        setFormData(prev => ({
          ...prev,
          cliente: id,
          nombre_aval: cliente.datos_ultimo_aval.nombre_aval || '',
          telefono_aval: cliente.datos_ultimo_aval.telefono_aval || '',
          direccion_aval: cliente.datos_ultimo_aval.direccion_aval || '',
          curp_aval: cliente.datos_ultimo_aval.curp_aval || '',
          parentesco_aval: cliente.datos_ultimo_aval.parentesco_aval || '',
          garantia_descripcion: cliente.datos_ultimo_aval.garantia_descripcion || '',
        }));
      }
    } catch (error) {
      setTipoCliente('nuevo');
      setClienteEncontrado(null);
      setEditandoAval(true);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      tipo: tipoPrestamo,
      integrantes: tipoPrestamo === 'G' ? integrantes.map(i => i.id) : [],
      monto_capital: Number(formData.monto_capital),
      monto_total_pagar: calculos.totalPagar,
      fecha_inicio: new Date().toISOString().split('T')[0],
    };

    try {
      await api.post('/prestamos/', payload);
      lanzarAlerta('success', `Préstamo ${tipoPrestamo === 'I' ? 'Individual' : 'Grupal'} creado con éxito`);
    handleReset();
    } catch (error: any) {
      const msg = error.response?.data?.error || "Error al guardar el préstamo.";
    // ❌ USAMOS TU ALERTA BONITA AQUÍ TAMBIÉN
    lanzarAlerta('error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">

      {/* SELECTOR TIPO PRÉSTAMO */}
      <div className="flex bg-slate-100 p-2 rounded-[2.5rem] w-fit mx-auto shadow-inner">
        <button onClick={() => { setTipoPrestamo('I'); handleReset(); }} className={`flex items-center gap-3 px-10 py-4 rounded-[2.2rem] text-xs font-black uppercase tracking-widest transition-all ${tipoPrestamo === 'I' ? 'bg-[#0047AB] text-white shadow-lg' : 'text-slate-400'}`}>
          <User size={16} /> Individual
        </button>
        <button onClick={() => { setTipoPrestamo('G'); handleReset(); }} className={`flex items-center gap-3 px-10 py-4 rounded-[2.2rem] text-xs font-black uppercase tracking-widest transition-all ${tipoPrestamo === 'G' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400'}`}>
          <Users size={16} /> Grupal Solidario
        </button>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 relative">
        <h2 className="text-3xl font-black text-slate-800 italic tracking-tighter mb-10 uppercase">
          {tipoPrestamo === 'I' ? 'Nuevo Préstamo Socio' : 'Apertura de Crédito Grupal'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* LÓGICA DE GRUPOS CON SELECTOR */}
          {tipoPrestamo === 'G' ? (
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="relative">
                <label className="text-[10px] font-black text-purple-600 uppercase ml-2 tracking-widest">Nombre del Grupo Solidario</label>
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${grupoSeleccionado ? 'text-emerald-500' : 'text-slate-300'}`}>
                    {grupoSeleccionado ? <Check size={18} /> : <Users size={18} />}
                  </div>
                  <input
                    type="text"
                    value={formData.nombre_grupo}
                    onChange={(e) => handleNombreGrupoChange(e.target.value)}
                    className="w-full p-4 pl-12 bg-purple-50/30 rounded-2xl outline-none border-2 border-transparent focus:border-purple-600 font-bold"
                    placeholder="Ej. Los Comerciantes"
                  />
                </div>

                {/* SUGERENCIAS DE GRUPOS EXISTENTES */}
                {mostrarSugerenciasGrupo && formData.nombre_grupo.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 border border-slate-100 overflow-hidden">
                    {gruposExistentes.filter(g => g.nombre.toLowerCase().includes(formData.nombre_grupo.toLowerCase())).length === 0 ? (
                      <div className="p-4 text-[10px] font-black text-purple-600 flex items-center gap-2 uppercase">
                        <Plus size={14} /> Se creará como grupo nuevo
                      </div>
                    ) : (
                      gruposExistentes.filter(g => g.nombre.toLowerCase().includes(formData.nombre_grupo.toLowerCase())).map(g => (
                        <button key={g.id} type="button" onClick={() => seleccionarGrupoExistente(g)} className="w-full p-4 text-left hover:bg-purple-50 flex items-center justify-between border-b last:border-none">
                          <span className="text-xs font-bold uppercase">{g.nombre} <span className="text-[9px] text-slate-400 font-normal ml-2">(ID: {g.id})</span></span>
                          <div className="text-[8px] bg-emerald-100 text-emerald-600 px-2 py-1 rounded font-black">EXISTENTE</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* BUSCADOR DE INTEGRANTES */}
              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Agregar Integrantes (Socios)</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="text" value={busquedaSocio} onChange={(e) => buscarSocios(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none" placeholder="Buscar socio por nombre..." />
                </div>
                {sugerenciasSocios.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 border border-slate-100 overflow-hidden">
                    {sugerenciasSocios.map(s => (
                      <button key={s.id} type="button" onClick={() => agregarIntegrante(s)} className="w-full p-4 text-left hover:bg-blue-50 border-b flex justify-between items-center">
                        <span className="text-xs font-black uppercase">{s.nombre}</span>
                        <UserPlus size={14} className="text-[#0047AB]" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {integrantes.map(i => (
                  <div key={i.id} className="flex items-center gap-2 bg-[#0047AB] text-white px-4 py-2 rounded-full text-[10px] font-black uppercase">
                    {i.nombre}
                    <button type="button" onClick={() => setIntegrantes(integrantes.filter(it => it.id !== i.id))} className="hover:text-red-300"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">ID Socio</label>
              <input type="number" value={formData.cliente} onChange={(e) => setFormData({ ...formData, cliente: e.target.value })} onBlur={(e) => buscarCliente(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold" placeholder="Ej. 102" />
              {clienteEncontrado && <p className="text-[10px] text-emerald-500 font-black uppercase ml-2 italic">✅ {clienteEncontrado.nombre}</p>}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Capital Solicitado ($)</label>
            <input type="number" value={formData.monto_capital} onChange={(e) => setFormData({ ...formData, monto_capital: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-black text-xl text-[#0047AB]" placeholder="0.00" />
          </div>

          {/* RESUMEN FINANCIERO */}
          {Number(formData.monto_capital) > 0 && (
            <div className="col-span-1 md:col-span-2 bg-[#050533] p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-around items-center gap-6 shadow-2xl">
              <div className="text-center">
                <p className="text-[9px] font-black text-sky-400 uppercase mb-1">Abono {formData.modalidad === 'S' ? 'Semanal' : 'Estimado'}</p>
                <p className="text-3xl font-black italic">${calculos.pagoPorPeriodo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">Interés Total</p>
                <p className="text-3xl font-black italic">${calculos.interesTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total a Pagar</p>
                <p className="text-3xl font-black italic text-white">${calculos.totalPagar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          )}

          {/* SECCIÓN REPRESENTANTE / AVAL */}
          <div className="col-span-1 md:col-span-2 p-8 bg-blue-50/30 rounded-[2.5rem] border border-blue-100 space-y-6">
            <h3 className="text-[11px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={18} /> {tipoPrestamo === 'I' ? 'Información del Aval' : 'Representante / Presidente del Grupo'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Nombre completo" value={formData.nombre_aval} onChange={(e) => setFormData({ ...formData, nombre_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm" />
              <input type="tel" placeholder="Teléfono" value={formData.telefono_aval} onChange={(e) => setFormData({ ...formData, telefono_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm" />
              <input
                type="text"
                placeholder="Dirección del Representante"
                value={formData.direccion_aval}
                onChange={(e) => setFormData({ ...formData, direccion_aval: e.target.value })}
                className="p-4 rounded-xl border border-blue-100 outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm md:col-span-2"
              />
              <input type="text" placeholder="Cargo / Parentesco" value={formData.parentesco_aval} onChange={(e) => setFormData({ ...formData, parentesco_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm" />
              <input type="text" placeholder="Garantía" value={formData.garantia_descripcion} onChange={(e) => setFormData({ ...formData, garantia_descripcion: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 italic">Frecuencia</label>
            <select value={formData.modalidad} onChange={(e) => {
              const mod = e.target.value as 'S' | 'Q' | 'M';
              setFormData({ ...formData, modalidad: mod, tasa_interes: TASAS_POR_MODALIDAD[mod].toString() });
            }} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-700">
              <option value="S">Semanal (2.5%)</option>
              <option value="Q">Quincenal (7.5%)</option>
              <option value="M">Mensual (20%)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 italic">Plazo (Cuotas)</label>
            <select value={formData.cuotas} onChange={(e) => setFormData({ ...formData, cuotas: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-700">
              {[...Array(24)].map((_, i) => (<option key={i + 1} value={i + 1}>{i + 1} Periodos</option>))}
            </select>
          </div>

          {tieneBloqueo && (
            <div className="col-span-1 md:col-span-2 bg-red-50 border-2 border-red-200 p-6 rounded-[2.5rem] flex items-center gap-5 animate-in slide-in-from-top-4 duration-500 shadow-sm">
              <div className="bg-red-500 p-3 rounded-2xl text-white shadow-lg shadow-red-200">
                <AlertCircle size={28} />
              </div>
              <div className="flex-1">
                <h4 className="text-red-800 font-black uppercase text-xs tracking-tighter italic">Acceso Restringido a Crédito</h4>
                <p className="text-red-500 text-[11px] font-bold leading-tight">
                  El socio presenta **recargos pendientes** de pago. El sistema ha bloqueado la emisión de nuevos folios hasta que la cuenta esté al corriente.
                </p>
              </div>
              <div className="text-[8px] font-black bg-white text-red-500 px-3 py-1 rounded-full border border-red-100 uppercase">
                Cód. 403
              </div>
            </div>
          )}

          {/* --- BOTÓN DINÁMICO --- */}
          <button
            type="submit"
            disabled={tieneBloqueo || loading}
            className={`col-span-1 md:col-span-2 mt-4 py-6 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-4 shadow-2xl ${tieneBloqueo
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-2 border-slate-300'
                : 'bg-[#050533] text-white hover:bg-[#0047AB] active:scale-95'
              }`}
          >
            {loading ? (
              <>
                <RefreshCcw className="animate-spin" size={18} />
                <span>Sincronizando...</span>
              </>
            ) : tieneBloqueo ? (
              <>
                <X size={18} className="text-red-400" />
                <span>Socio Bloqueado por Moras</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Autorizar Crédito {tipoPrestamo === 'I' ? 'Individual' : 'Grupal'}</span>
              </>
            )}
          </button>
        </form>
      </div>
      {alerta && (
  <div className={`fixed top-10 right-10 z-[100] p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-500 border-b-4 ${
    alerta.type === 'success' ? 'bg-white border-emerald-500 text-slate-800' : 'bg-white border-red-500 text-slate-800'
  }`}>
    <div className={`p-3 rounded-2xl ${alerta.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
      {alerta.type === 'success' ? <Check size={24} /> : <AlertCircle size={24} />}
    </div>
    <div>
      <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-1">Notificación del Sistema</p>
      <p className="font-bold text-sm italic">{alerta.msg}</p>
    </div>
    <button onClick={() => setAlerta(null)} className="ml-4 text-slate-300 hover:text-slate-600">
      <X size={18} />
    </button>
  </div>
)}
    </div>
  );
}