"use client";
import { useState, useEffect, useMemo } from 'react';
import {
  UserPlus, RefreshCcw, ShieldCheck, 
  X, Check, Plus, AlertCircle, Users, User, Search, Info, Trash2
} from 'lucide-react';
import api from '@/lib/api';

const TASAS_POR_MODALIDAD = {
  'S': 2.5,  // Semanal
  'Q': 7.5,  // Quincenal
  'M': 20.0, // Mensual
};

export default function PrestamosPage() {
  const [tipoPrestamo, setTipoPrestamo] = useState<'I' | 'G'>('I');
  const [clienteEncontrado, setClienteEncontrado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  // Estados para sugerencias y búsqueda
  const [busquedaSocio, setBusquedaSocio] = useState('');
  const [sugerenciasSocios, setSugerenciasSocios] = useState<any[]>([]);
  const [integrantes, setIntegrantes] = useState<any[]>([]);
  const [gruposExistentes, setGruposExistentes] = useState<any[]>([]);
  const [mostrarSugerenciasGrupo, setMostrarSugerenciasGrupo] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<any>(null);

  const [formData, setFormData] = useState({
    cliente: '',
    nombre_grupo: '',
    grupo_id: '',
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

  const lanzarAlerta = (type: 'success' | 'error', msg: string) => {
    setAlerta({ type, msg });
    setTimeout(() => setAlerta(null), 6000);
  };

  // Cargar grupos existentes al inicio
  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const res = await api.get('/clientes/directorio-hibrido/');
        setGruposExistentes(res.data.filter((e: any) => e.es_grupo));
      } catch (e) { console.error("Error al cargar grupos"); }
    };
    fetchGrupos();
  }, []);

  // --- BUSCADOR DE SOCIOS (INTEGRANTES) ---
  const buscarSocios = async (val: string) => {
    setBusquedaSocio(val);
    if (val.length > 1) {
      try {
        const res = await api.get(`/clientes/directorio-hibrido/?search=${val}`);
        // Filtramos solo los que NO son grupos y los limitamos a 5
        setSugerenciasSocios(res.data.filter((c: any) => !c.es_grupo).slice(0, 5));
      } catch (e) { console.error(e); }
    } else { setSugerenciasSocios([]); }
  };

  const agregarIntegrante = (socio: any) => {
    if (socio.tiene_prestamo_activo) {
      lanzarAlerta('error', `No puedes agregar a ${socio.nombre}: Tiene un préstamo individual activo.`);
      return;
    }
    if (!integrantes.find(i => i.id === socio.id)) {
      setIntegrantes([...integrantes, socio]);
    }
    setBusquedaSocio('');
    setSugerenciasSocios([]);
  };

  // --- LÓGICA DE CLIENTE INDIVIDUAL ---
  const buscarClienteIndividual = async (id: string) => {
    if (!id || tipoPrestamo === 'G') return;
    try {
      const response = await api.get(`/clientes/directorio-hibrido/?search=${id}`);
      const cliente = response.data.find((c: any) => c.id === parseInt(id));
      if (cliente) {
        setClienteEncontrado(cliente);
        setFormData(prev => ({
          ...prev,
          cliente: id,
          nombre_aval: cliente.datos_ultimo_aval?.nombre_aval || '',
          telefono_aval: cliente.datos_ultimo_aval?.telefono_aval || '',
        }));
      }
    } catch (e) { setClienteEncontrado(null); }
  };

  // REGLAS DE BLOQUEO
  const tieneBloqueoIndividual = tipoPrestamo === 'I' && (clienteEncontrado?.tiene_prestamo_activo || clienteEncontrado?.total_penalizaciones > 0);

  const calculos = useMemo(() => {
    const capital = Number(formData.monto_capital) || 0;
    const nCuotas = Number(formData.cuotas) || 1;
    const tasa = Number(formData.tasa_interes) / 100;
    const interesTotal = capital * tasa * nCuotas;
    return { interesTotal, totalPagar: capital + interesTotal, pagoPorPeriodo: (capital + interesTotal) / nCuotas };
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
    setConfirmando(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        tipo: tipoPrestamo,
        integrantes: tipoPrestamo === 'G' ? integrantes.map(i => i.id) : [],
        monto_capital: Number(formData.monto_capital),
        monto_total_pagar: calculos.totalPagar,
        fecha_inicio: new Date().toISOString().split('T')[0],
      };
      await api.post('/prestamos/', payload);
      lanzarAlerta('success', "Préstamo autorizado con éxito.");
      handleReset();
    } catch (error: any) {
      lanzarAlerta('error', error.response?.data?.error || "Error al procesar préstamo.");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* SELECTOR TIPO */}
      <div className="flex bg-slate-100 p-2 rounded-[2.5rem] w-fit mx-auto shadow-inner">
        <button onClick={() => { setTipoPrestamo('I'); handleReset(); }} className={`flex items-center gap-3 px-10 py-4 rounded-[2.2rem] text-xs font-black uppercase tracking-widest transition-all ${tipoPrestamo === 'I' ? 'bg-[#0047AB] text-white' : 'text-slate-400'}`}>
          <User size={16} /> Individual
        </button>
        <button onClick={() => { setTipoPrestamo('G'); handleReset(); }} className={`flex items-center gap-3 px-10 py-4 rounded-[2.2rem] text-xs font-black uppercase tracking-widest transition-all ${tipoPrestamo === 'G' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>
          <Users size={16} /> Grupal
        </button>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <form onSubmit={(e) => { e.preventDefault(); setConfirmando(true); }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* CLIENTE INDIVIDUAL */}
          {tipoPrestamo === 'I' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Cliente</label>
              <input 
                type="number" 
                value={formData.cliente} 
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })} 
                onBlur={(e) => buscarClienteIndividual(e.target.value)}
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none" 
                placeholder="ID..." 
                required
              />
              {clienteEncontrado && (
                <p className={`text-[10px] font-black italic ${tieneBloqueoIndividual ? 'text-red-500' : 'text-emerald-500'}`}>
                   {tieneBloqueoIndividual ? '❌ BLOQUEADO' : '✅'} {clienteEncontrado.nombre}
                </p>
              )}
            </div>
          )}

          {/* GRUPO CON SUGERENCIAS */}
          {tipoPrestamo === 'G' && (
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="relative">
                <label className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Nombre del Grupo</label>
                <input
                  type="text"
                  value={formData.nombre_grupo}
                  onChange={(e) => { setFormData({ ...formData, nombre_grupo: e.target.value, grupo_id: '' }); setMostrarSugerenciasGrupo(true); }}
                  className="w-full p-4 bg-purple-50/30 rounded-2xl outline-none"
                  placeholder="Buscar o crear grupo..."
                />
                {mostrarSugerenciasGrupo && formData.nombre_grupo.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 border border-slate-100">
                    {gruposExistentes.filter(g => g.nombre.toLowerCase().includes(formData.nombre_grupo.toLowerCase())).map(g => (
                      <button key={g.id} type="button" onClick={() => {
                        if(g.tiene_prestamo_activo) return lanzarAlerta('error', 'Este grupo ya tiene deuda.');
                        setFormData({...formData, nombre_grupo: g.nombre, grupo_id: g.id});
                        setMostrarSugerenciasGrupo(false);
                      }} className="w-full p-4 text-left hover:bg-purple-50 text-xs font-bold uppercase flex justify-between">
                        {g.nombre} {g.tiene_prestamo_activo && <span className="text-red-500 text-[8px]">CON DEUDA</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* BUSCADOR INTEGRANTES CON SUGERENCIAS */}
              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Añadir Socios al Grupo</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="text" value={busquedaSocio} onChange={(e) => buscarSocios(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none" placeholder="Nombre del cliente..." />
                </div>
                {sugerenciasSocios.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 border border-slate-100">
                    {sugerenciasSocios.map(s => (
                      <button key={s.id} type="button" onClick={() => agregarIntegrante(s)} className="w-full p-4 text-left hover:bg-blue-50 flex justify-between items-center">
                        <span className="text-xs font-black uppercase">{s.nombre}</span>
                        {s.tiene_prestamo_activo ? <X size={14} className="text-red-400" /> : <Plus size={14} className="text-blue-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {integrantes.map(i => (
                  <div key={i.id} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-2">
                    {i.nombre} <button type="button" onClick={() => setIntegrantes(integrantes.filter(it => it.id !== i.id))}><X size={12}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capital ($)</label>
            <input type="number" value={formData.monto_capital} onChange={(e) => setFormData({ ...formData, monto_capital: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-xl" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frecuencia</label>
            <select value={formData.modalidad} onChange={(e) => setFormData({ ...formData, modalidad: e.target.value, tasa_interes: TASAS_POR_MODALIDAD[e.target.value as 'S' | 'Q' | 'M'].toString() })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold">
              <option value="S">Semanal (2.5%)</option>
              <option value="Q">Quincenal (7.5%)</option>
              <option value="M">Mensual (20%)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={tieneBloqueoIndividual || loading || (tipoPrestamo === 'G' && integrantes.length === 0)}
            className="col-span-1 md:col-span-2 mt-4 py-6 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.3em] bg-[#050533] text-white hover:bg-[#0047AB] disabled:bg-slate-200"
          >
            {loading ? <RefreshCcw className="animate-spin" /> : <ShieldCheck size={18} />}
            {loading ? 'Procesando...' : 'Revisar y Generar'}
          </button>
        </form>
      </div>

      {/* MODAL CONFIRMACIÓN */}
      {confirmando && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 space-y-8">
            <h3 className="text-2xl font-black text-slate-800 uppercase italic">Confirmar Crédito</h3>
            <div className="bg-slate-50 p-6 rounded-[2rem] space-y-3">
               <p className="text-[10px] font-black text-slate-400 uppercase">Resumen</p>
               <div className="flex justify-between text-xs font-bold"><span>Capital:</span> <span>${Number(formData.monto_capital).toLocaleString()}</span></div>
               <div className="flex justify-between text-xs font-bold text-red-500"><span>Intereses:</span> <span>${calculos.interesTotal.toLocaleString()}</span></div>
               <div className="flex justify-between text-lg font-black text-emerald-600 pt-2 border-t"><span>Total:</span> <span>${calculos.totalPagar.toLocaleString()}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setConfirmando(false)} className="py-4 bg-slate-100 rounded-2xl font-black text-[10px] uppercase">Cancelar</button>
              <button onClick={handleSubmit} className="py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase">Autorizar</button>
            </div>
          </div>
        </div>
      )}

      {/* ALERTA */}
      {alerta && (
        <div className={`fixed top-10 right-10 z-[120] p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border-b-4 bg-white animate-in slide-in-from-right ${alerta.type === 'success' ? 'border-emerald-500' : 'border-red-500'}`}>
          {alerta.type === 'success' ? <Check className="text-emerald-500" /> : <AlertCircle className="text-red-500" />}
          <p className="font-bold text-sm">{alerta.msg}</p>
        </div>
      )}
    </div>
  );
}