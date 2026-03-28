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

  // Estados para buscadores con sugerencias
  const [busquedaSocio, setBusquedaSocio] = useState('');
  const [sugerenciasSocios, setSugerenciasSocios] = useState<any[]>([]);
  const [sugerenciasIndividual, setSugerenciasIndividual] = useState<any[]>([]);
  
  const [integrantes, setIntegrantes] = useState<any[]>([]);
  const [gruposExistentes, setGruposExistentes] = useState<any[]>([]);
  const [mostrarSugerenciasGrupo, setMostrarSugerenciasGrupo] = useState(false);

  const [formData, setFormData] = useState({
    cliente: '', // Aquí guardaremos el ID real
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

  // REGLA MAESTRA DE BLOQUEO: Si tiene crédito individual O si el saldo es > 0 (deuda por grupo)
  const tieneBloqueo = useMemo(() => {
    if (!clienteEncontrado) return false;
    return clienteEncontrado.tiene_prestamo_activo || (clienteEncontrado.saldo_actual > 0);
  }, [clienteEncontrado]);

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const res = await api.get('/clientes/directorio-hibrido/');
        setGruposExistentes(res.data.filter((e: any) => e.es_grupo));
      } catch (e) { console.error("Error al cargar grupos"); }
    };
    fetchGrupos();
  }, []);

  // --- BUSCADOR POR NOMBRE (INDIVIDUAL) ---
  const buscarClientePorNombre = async (val: string) => {
    setFormData({ ...formData, cliente: val }); // Alexander escribe el nombre
    if (val.length > 1) {
      try {
        const res = await api.get(`/clientes/directorio-hibrido/?search=${val}`);
        setSugerenciasIndividual(res.data.filter((c: any) => !c.es_grupo).slice(0, 5));
      } catch (e) { console.error(e); }
    } else {
      setSugerenciasIndividual([]);
    }
  };

  const seleccionarCliente = (cliente: any) => {
    const deudaGrupal = !cliente.tiene_prestamo_activo && cliente.saldo_actual > 0;
    
    if (cliente.tiene_prestamo_activo || deudaGrupal) {
      setClienteEncontrado(cliente);
      lanzarAlerta('error', deudaGrupal 
        ? `RESTRICCIÓN: ${cliente.nombre} pertenece a un grupo con deuda activa.` 
        : `RESTRICCIÓN: El cliente ya tiene un préstamo individual.`);
      // Seteamos el ID pero el botón se bloqueará por la regla del useMemo
      setFormData(prev => ({ ...prev, cliente: cliente.id.toString() }));
      setSugerenciasIndividual([]);
      return;
    }

    setClienteEncontrado(cliente);
    setFormData({
      ...formData,
      cliente: cliente.id.toString(),
      nombre_aval: cliente.datos_ultimo_aval?.nombre_aval || '',
      telefono_aval: cliente.datos_ultimo_aval?.telefono_aval || '',
      direccion_aval: cliente.datos_ultimo_aval?.direccion_aval || '',
      parentesco_aval: cliente.datos_ultimo_aval?.parentesco_aval || '',
      garantia_descripcion: cliente.datos_ultimo_aval?.garantia_descripcion || '',
    });
    setSugerenciasIndividual([]);
  };

  // --- LÓGICA GRUPAL ---
  const agregarIntegrante = (socio: any) => {
    if (socio.tiene_prestamo_activo || socio.saldo_actual > 0) {
      lanzarAlerta('error', `${socio.nombre} tiene deudas activas y no puede entrar al grupo.`);
      return;
    }
    if (!integrantes.find(i => i.id === socio.id)) {
      setIntegrantes([...integrantes, socio]);
    }
    setBusquedaSocio('');
    setSugerenciasSocios([]);
  };

  const calculos = useMemo(() => {
    const capital = Number(formData.monto_capital) || 0;
    const tasa = Number(formData.tasa_interes) / 100;
    const nCuotas = Number(formData.cuotas) || 1;
    const interesTotal = capital * tasa * nCuotas;
    const totalPagar = capital + interesTotal;
    return { interesTotal, totalPagar };
  }, [formData.monto_capital, formData.tasa_interes, formData.cuotas]);

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
      lanzarAlerta('success', "Préstamo autorizado con éxito.");
      handleReset();
    } catch (error: any) {
      lanzarAlerta('error', error.response?.data?.error || "Error al procesar crédito.");
    } finally { setLoading(false); }
  };

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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* SELECTOR */}
      <div className="flex bg-slate-100 p-2 rounded-[2.5rem] w-fit mx-auto shadow-inner">
        <button onClick={() => { setTipoPrestamo('I'); handleReset(); }} className={`flex items-center gap-3 px-10 py-4 rounded-[2.2rem] text-xs font-black uppercase transition-all ${tipoPrestamo === 'I' ? 'bg-[#0047AB] text-white shadow-lg' : 'text-slate-400'}`}>
          <User size={16} /> Individual
        </button>
        <button onClick={() => { setTipoPrestamo('G'); handleReset(); }} className={`flex items-center gap-3 px-10 py-4 rounded-[2.2rem] text-xs font-black uppercase transition-all ${tipoPrestamo === 'G' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400'}`}>
          <Users size={16} /> Grupal Solidario
        </button>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 relative">
        <h2 className="text-3xl font-black text-slate-800 italic tracking-tighter mb-10 uppercase">
          {tipoPrestamo === 'I' ? 'Autorizar Crédito' : 'Apertura de Grupo'}
        </h2>

        <form onSubmit={(e) => { e.preventDefault(); setConfirmando(true); }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* BUSCADOR POR NOMBRE */}
          {tipoPrestamo === 'I' ? (
            <div className="space-y-2 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nombre del Cliente</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="text" 
                  value={clienteEncontrado ? clienteEncontrado.nombre : formData.cliente} 
                  onChange={(e) => {
                    if(clienteEncontrado) setClienteEncontrado(null);
                    buscarClientePorNombre(e.target.value);
                  }}
                  className={`w-full p-4 pl-12 rounded-2xl outline-none font-bold transition-all ${tieneBloqueo ? 'bg-red-50 border-red-200 border' : 'bg-slate-50'}`} 
                  placeholder="Ej. Dulce María..." 
                  required
                />
              </div>

              {sugerenciasIndividual.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-[100] border border-slate-100 overflow-hidden">
                  {sugerenciasIndividual.map(c => (
                    <button key={c.id} type="button" onClick={() => seleccionarCliente(c)} className="w-full p-4 text-left hover:bg-blue-50 flex items-center justify-between border-b last:border-none">
                      <span className="text-xs font-black uppercase">{c.nombre}</span>
                      {(c.tiene_prestamo_activo || c.saldo_actual > 0) && (
                        <span className="text-[8px] bg-red-100 text-red-600 px-2 py-1 rounded font-black uppercase">Bloqueado</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {clienteEncontrado && (
                <p className={`text-[10px] font-black uppercase ml-2 italic flex items-center gap-1 ${tieneBloqueo ? 'text-red-500' : 'text-emerald-500'}`}>
                  {tieneBloqueo ? <X size={12}/> : <Check size={12}/>} 
                  {tieneBloqueo ? 'RESTRINGIDO: TIENE DEUDA' : 'CLIENTE VALIDADO'}
                </p>
              )}
            </div>
          ) : (
            /* LÓGICA GRUPAL */
            <div className="col-span-1 md:col-span-2 space-y-6">
               <label className="text-[10px] font-black text-purple-600 uppercase ml-2 tracking-widest">Nombre del Grupo Solidario</label>
               <input 
                  type="text" 
                  value={formData.nombre_grupo} 
                  onChange={(e) => setFormData({...formData, nombre_grupo: e.target.value})}
                  className="w-full p-4 bg-purple-50/30 rounded-2xl outline-none border-2 border-transparent focus:border-purple-600 font-bold text-purple-900" 
                  placeholder="Nombre del grupo..." required
               />
               {/* Aquí va tu buscador de integrantes actual */}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Monto ($)</label>
            <input type="number" value={formData.monto_capital} onChange={(e) => setFormData({ ...formData, monto_capital: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-xl text-[#0047AB]" required />
          </div>

          {/* AVAL */}
          <div className="col-span-1 md:col-span-2 p-8 bg-blue-50/30 rounded-[2.5rem] border border-blue-100 space-y-6">
            <h3 className="text-[11px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2 italic">
              <ShieldCheck size={18} /> Información del Aval
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Nombre completo" value={formData.nombre_aval} onChange={(e) => setFormData({ ...formData, nombre_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" required/>
              <input type="tel" placeholder="Teléfono" value={formData.telefono_aval} onChange={(e) => setFormData({ ...formData, telefono_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm" required/>
              <input type="text" placeholder="Dirección" value={formData.direccion_aval} onChange={(e) => setFormData({ ...formData, direccion_aval: e.target.value })} className="p-4 rounded-xl border border-blue-100 outline-none font-bold text-sm md:col-span-2" required />
            </div>
          </div>

          <button
            type="submit"
            disabled={tieneBloqueo || loading || !formData.monto_capital}
            className={`col-span-1 md:col-span-2 mt-4 py-6 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl flex items-center justify-center gap-4 ${
              tieneBloqueo ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-2 border-slate-300' : 'bg-[#050533] text-white hover:bg-[#0047AB]'
            }`}
          >
            <ShieldCheck size={18} />
            <span>{loading ? 'Sincronizando...' : 'Autorizar Crédito'}</span>
          </button>
        </form>
      </div>

      {/* MODAL CONFIRMACIÓN */}
      {confirmando && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#050533]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 space-y-8 shadow-2xl border-t-8 border-[#0047AB]">
            <h3 className="text-2xl font-black italic text-slate-800 uppercase leading-none text-center">Resumen de Crédito</h3>
            <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-4 font-bold text-sm">
               <div className="flex justify-between"><span>Sujeto:</span> <span className="text-slate-800 text-xs">{clienteEncontrado?.nombre || formData.nombre_grupo}</span></div>
               <div className="flex justify-between"><span>Capital:</span> <span>${Number(formData.monto_capital).toLocaleString()}</span></div>
               <div className="flex justify-between text-red-500"><span>Interés Total:</span> <span>${calculos.interesTotal.toLocaleString()}</span></div>
               <div className="flex justify-between text-xl font-black text-emerald-600 border-t pt-4"><span>Total a Pagar:</span> <span>${calculos.totalPagar.toLocaleString()}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setConfirmando(false)} className="py-5 rounded-3xl font-black text-[10px] uppercase text-slate-400 bg-slate-100 hover:bg-slate-200">Cancelar</button>
              <button onClick={ejecutarGuardado} className="py-5 rounded-3xl font-black text-[10px] uppercase text-white bg-emerald-500 shadow-xl">Autorizar</button>
            </div>
          </div>
        </div>
      )}

      {/* ALERTAS */}
      {alerta && (
        <div className={`fixed top-10 right-10 z-[130] p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border-b-4 bg-white animate-in slide-in-from-right ${alerta.type === 'success' ? 'border-emerald-500' : 'border-red-500'}`}>
          <div className={`p-3 rounded-2xl ${alerta.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
            {alerta.type === 'success' ? <Check size={24} /> : <AlertCircle size={24} />}
          </div>
          <p className="font-bold text-sm text-slate-800 italic">{alerta.msg}</p>
        </div>
      )}
    </div>
  );
}