"use client";
import { useState, useEffect, useMemo } from 'react';
import {
  UserPlus, RefreshCcw, ShieldCheck, 
  X, Check, Plus, AlertCircle, Users, User, Search, Info
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

  // Estados para Grupos y Autocompletado
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

  // Carga inicial de grupos
  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const res = await api.get('/clientes/directorio-hibrido/');
        setGruposExistentes(res.data.filter((e: any) => e.es_grupo));
      } catch (e) { console.error("Error al cargar grupos"); }
    };
    fetchGrupos();
  }, []);

  // REGLAS DE BLOQUEO: Préstamo activo o moras
  const tieneBloqueo = clienteEncontrado?.tiene_prestamo_activo || (clienteEncontrado?.total_penalizaciones > 0);

  // --- BUSCADORES Y SUGERENCIAS ---
  const buscarSocios = async (val: string) => {
    setBusquedaSocio(val);
    if (val.length > 1) {
      try {
        const res = await api.get(`/clientes/directorio-hibrido/?search=${val}`);
        setSugerenciasSocios(res.data.filter((c: any) => !c.es_grupo).slice(0, 5));
      } catch (e) { console.error(e); }
    } else { setSugerenciasSocios([]); }
  };

  const agregarIntegrante = (socio: any) => {
    // RESTRICCIÓN: Si ya tiene préstamo individual, no puede entrar a grupo
    if (socio.tiene_prestamo_activo) {
      lanzarAlerta('error', `${socio.nombre} tiene un crédito activo y no puede participar en grupos.`);
      return;
    }
    if (!integrantes.find(i => i.id === socio.id)) {
      setIntegrantes([...integrantes, socio]);
    }
    setBusquedaSocio('');
    setSugerenciasSocios([]);
  };

  const buscarCliente = async (id: string) => {
    if (!id || tipoPrestamo === 'G') return;
    try {
      const response = await api.get(`/clientes/directorio-hibrido/?search=${id}`);
      const cliente = response.data.find((c: any) => c.id === parseInt(id));
      if (cliente) {
        setClienteEncontrado(cliente);
        if (cliente.tiene_prestamo_activo) {
          lanzarAlerta('error', "Este cliente ya cuenta con un préstamo vigente.");
        }
        // Auto-relleno de aval
        setFormData(prev => ({
          ...prev,
          cliente: id,
          nombre_aval: cliente.datos_ultimo_aval?.nombre_aval || '',
          telefono_aval: cliente.datos_ultimo_aval?.telefono_aval || '',
        }));
      }
    } catch (e) { setClienteEncontrado(null); }
  };

  const calculos = useMemo(() => {
    const capital = Number(formData.monto_capital) || 0;
    const tasa = Number(formData.tasa_interes) / 100;
    const nCuotas = Number(formData.cuotas) || 1;
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
    setConfirmando(false);
  };

  const ejecutarGuardado = async () => {
    setLoading(true);
    setConfirmando(false);
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
      lanzarAlerta('success', "Crédito autorizado y folio generado con éxito.");
      handleReset();
    } catch (error: any) {
      const msg = error.response?.data?.error || "Error al procesar el préstamo.";
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
          {tipoPrestamo === 'I' ? 'Autorizar Crédito' : 'Apertura de Grupo'}
        </h2>

        <form onSubmit={(e) => { e.preventDefault(); setConfirmando(true); }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* LÓGICA DE IDENTIFICACIÓN */}
          {tipoPrestamo === 'G' ? (
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="relative">
                <label className="text-[10px] font-black text-purple-600 uppercase ml-2 tracking-widest">Nombre del Grupo</label>
                <input
                  type="text"
                  value={formData.nombre_grupo}
                  onChange={(e) => { setFormData({ ...formData, nombre_grupo: e.target.value, grupo_id: '' }); setMostrarSugerenciasGrupo(true); }}
                  className="w-full p-4 bg-purple-50/30 rounded-2xl outline-none border-2 border-transparent focus:border-purple-600 font-bold"
                  placeholder="Ej. Los Comerciantes"
                  required
                />
                {mostrarSugerenciasGrupo && formData.nombre_grupo.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 border border-slate-100 overflow-hidden">
                    {gruposExistentes.filter(g => g.nombre.toLowerCase().includes(formData.nombre_grupo.toLowerCase())).map(g => (
                      <button key={g.id} type="button" onClick={() => {
                        if(g.tiene_prestamo_activo) return lanzarAlerta('error', 'El grupo ya tiene deuda activa.');
                        setFormData({...formData, nombre_grupo: g.nombre, grupo_id: g.id});
                        setMostrarSugerenciasGrupo(false);
                      }} className="w-full p-4 text-left hover:bg-purple-50 flex justify-between border-b">
                        <span className="text-xs font-bold uppercase">{g.nombre}</span>
                        {g.tiene_prestamo_activo && <span className="text-[8px] bg-red-100 text-red-600 px-2 py-1 rounded">DEUDOR</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Añadir Integrantes</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="text" value={busquedaSocio} onChange={(e) => buscarSocios(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none" placeholder="Buscar cliente por nombre..." />
                </div>
                {sugerenciasSocios.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 border border-slate-100 overflow-hidden">
                    {sugerenciasSocios.map(s => (
                      <button key={s.id} type="button" onClick={() => agregarIntegrante(s)} className="w-full p-4 text-left hover:bg-blue-50 border-b flex justify-between">
                        <span className="text-xs font-black uppercase">{s.nombre}</span>
                        {s.tiene_prestamo_activo ? <X size={14} className="text-red-400" /> : <Plus size={14} className="text-blue-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {integrantes.map(i => (
                  <div key={i.id} className="bg-[#0047AB] text-white px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-2">
                    {i.nombre} <button type="button" onClick={() => setIntegrantes(integrantes.filter(it => it.id !== i.id))}><X size={12}/></button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">ID Cliente</label>
              <input type="number" value={formData.cliente} onChange={(e) => setFormData({ ...formData, cliente: e.target.value })} onBlur={(e) => buscarCliente(e.target.value)} className={`w-full p-4 rounded-2xl outline-none font-bold ${tieneBloqueo ? 'bg-red-50 border-red-200 border' : 'bg-slate-50'}`} placeholder="Ej. 102" required/>
              {clienteEncontrado && <p className={`text-[10px] font-black uppercase ml-2 italic ${tieneBloqueo ? 'text-red-500' : 'text-emerald-500'}`}>{tieneBloqueo ? '❌ Bloqueado' : '✅ Encontrado'}: {clienteEncontrado.nombre}</p>}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Capital a Entregar ($)</label>
            <input type="number" value={formData.monto_capital} onChange={(e) => setFormData({ ...formData, monto_capital: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-xl text-[#0047AB]" placeholder="0.00" required/>
          </div>

          {/* FORMULARIO DE AVAL */}
          <div className="col-span-1 md:col-span-2 p-8 bg-blue-50/30 rounded-[2.5rem] border border-blue-100 space-y-6">
            <h3 className="text-[11px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2 italic">
              <ShieldCheck size={18} /> Respaldo de Crédito (Aval)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Nombre completo" value={formData.nombre_aval} onChange={(e) => setFormData({ ...formData, nombre_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" required/>
              <input type="tel" placeholder="Teléfono" value={formData.telefono_aval} onChange={(e) => setFormData({ ...formData, telefono_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" required/>
              <input type="text" placeholder="Dirección" value={formData.direccion_aval} onChange={(e) => setFormData({ ...formData, direccion_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm md:col-span-2" />
              <input type="text" placeholder="Parentesco" value={formData.parentesco_aval} onChange={(e) => setFormData({ ...formData, parentesco_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" />
              <input type="text" placeholder="Garantía" value={formData.garantia_descripcion} onChange={(e) => setFormData({ ...formData, garantia_descripcion: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 italic">Frecuencia</label>
            <select value={formData.modalidad} onChange={(e) => {
              const mod = e.target.value as 'S' | 'Q' | 'M';
              setFormData({ ...formData, modalidad: mod, tasa_interes: TASAS_POR_MODALIDAD[mod].toString() });
            }} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold">
              <option value="S">Semanal (2.5%)</option>
              <option value="Q">Quincenal (7.5%)</option>
              <option value="M">Mensual (20%)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 italic">Plazo (Cuotas)</label>
            <select value={formData.cuotas} onChange={(e) => setFormData({ ...formData, cuotas: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold">
              {[4, 8, 12, 16, 24].map(n => <option key={n} value={n}>{n} Pagos</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={tieneBloqueo || loading || !formData.monto_capital}
            className={`col-span-1 md:col-span-2 mt-4 py-6 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-2xl ${
              tieneBloqueo ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-2 border-slate-300' : 'bg-[#050533] text-white hover:bg-[#0047AB]'
            }`}
          >
            <ShieldCheck size={18} />
            <span>{loading ? 'Sincronizando...' : 'Revisar y Autorizar'}</span>
          </button>
        </form>
      </div>

      {/* --- MODAL DE CONFIRMACIÓN FINAL --- */}
      {confirmando && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 space-y-8 shadow-2xl border-t-8 border-[#0047AB]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black italic text-slate-800 uppercase leading-none">Confirmar Datos</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Resumen de la operación</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-2xl text-[#0047AB]"><Info size={28} /></div>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-4 font-bold text-sm">
               <div className="flex justify-between uppercase text-slate-500 text-[10px]"><span>Sujeto:</span> <span className="text-slate-800 text-xs">{tipoPrestamo === 'I' ? clienteEncontrado?.nombre : formData.nombre_grupo}</span></div>
               <div className="flex justify-between"><span>Capital:</span> <span>${Number(formData.monto_capital).toLocaleString()}</span></div>
               <div className="flex justify-between text-red-500"><span>Interés Total:</span> <span>${calculos.interesTotal.toLocaleString()}</span></div>
               <div className="flex justify-between text-xl font-black text-emerald-600 pt-4 border-t-2 border-dashed border-slate-200"><span>Total a Pagar:</span> <span>${calculos.totalPagar.toLocaleString()}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setConfirmando(false)} className="py-5 rounded-3xl font-black text-[10px] uppercase text-slate-400 bg-slate-100 hover:bg-slate-200">Cancelar</button>
              <button onClick={ejecutarGuardado} className="py-5 rounded-3xl font-black text-[10px] uppercase text-white bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-100">Generar Folio</button>
            </div>
          </div>
        </div>
      )}

      {/* ALERTAS */}
      {alerta && (
        <div className={`fixed top-10 right-10 z-[130] p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-right border-b-4 bg-white ${alerta.type === 'success' ? 'border-emerald-500' : 'border-red-500'}`}>
          {alerta.type === 'success' ? <Check className="text-emerald-500" /> : <AlertCircle className="text-red-500" />}
          <p className="font-bold text-sm text-slate-800">{alerta.msg}</p>
        </div>
      )}
    </div>
  );
}