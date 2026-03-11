
"use client";
import { useState } from 'react';
import { UserPlus, RefreshCcw, ShieldCheck, UserCircle, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

const TASAS_POR_MODALIDAD = {
  'S': 2.5,  // Semanal
  'Q': 7.5,  // Quincenal
  'M': 20.0, // Mensual
};

export default function PrestamosPage() {
  // 1. PRIMERO declaramos todos los estados
  const [riesgo, setRiesgo] = useState<'verde' | 'amarillo' | 'rojo'>('verde');
  const [tipoCliente, setTipoCliente] = useState<'nuevo' | 'recurrente'>('nuevo');
  const [clienteEncontrado, setClienteEncontrado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    cliente: '',
    monto_capital: '',
    tasa_interes: '', // Valor por defecto como string para el input
    cuotas: '',   // Valor por defecto como string para el input
    modalidad: '',
    nombre_aval: '',
    direccion_aval: '',
    telefono_aval: '',
    curp_aval: '',
    parentesco_aval: '',
    garantia_descripcion: ''
  });

  // 2. DESPUÉS las funciones que usan esos estados
  const buscarCliente = async (id: string) => {
    if (!id) return;
    try {
      const response = await api.get(`/clientes/${id}/`);
      const cliente = response.data;
      
      setClienteEncontrado(cliente);
      setTipoCliente('recurrente');

      // Si Django configuró 'datos_ultimo_aval' en el Serializer
      if (cliente.datos_ultimo_aval) {
        setFormData(prev => ({
          ...prev,
          cliente: id,
          nombre_aval: cliente.datos_ultimo_aval.nombre_aval,
          telefono_aval: cliente.datos_ultimo_aval.telefono_aval,
          direccion_aval: cliente.datos_ultimo_aval.direccion_aval,
          curp_aval: cliente.datos_ultimo_aval.curp_aval,
          parentesco_aval: cliente.datos_ultimo_aval.parentesco_aval,
          garantia_descripcion: cliente.datos_ultimo_aval.garantia_descripcion,
        }));
      }
    } catch (error) {
      setTipoCliente('nuevo');
      setClienteEncontrado(null);
      // Opcional: limpiar campos de aval si no se encuentra
    }
  };

  const handleModalidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const nuevaModalidad = e.target.value as 'S' | 'Q' | 'M';
  const nuevaTasa = TASAS_POR_MODALIDAD[nuevaModalidad];

  setFormData(prev => ({
    ...prev,
    modalidad: nuevaModalidad,
    tasa_interes: nuevaTasa.toString() // Actualiza la tasa automáticamente
  }));
};

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  // 1. Convertimos strings a números de forma segura
  const capital = Number(formData.monto_capital) || 0;
  const tasa = Number(formData.tasa_interes); // El valor que viene del estado (2.5, 7.5 o 20)
  const cuotas = Number(formData.cuotas) || 8;

  // 2. FÓRMULA DE ALEXANDER (Interés Simple por Plazo)
  // Interés de una sola cuota
  const interesPorCuota = capital * (tasa / 100); 
  // Interés total de todo el préstamo
  const interesTotal = interesPorCuota * cuotas;
  // Monto final (Capital + todos los intereses acumulados)
  const totalPagar = capital + interesTotal;

  const payload = {
    cliente: formData.cliente,
    monto_capital: capital,
    tasa_interes: tasa,         // <--- ENVIAMOS LA TASA REAL (Ej. 2.5)
    monto_total_pagar: totalPagar, // <--- ENVIAMOS EL TOTAL REAL (Ej. 1800)
    cuotas: cuotas,
    modalidad: formData.modalidad,
    nombre_aval: formData.nombre_aval,
    telefono_aval: formData.telefono_aval,
    direccion_aval: formData.direccion_aval,
    curp_aval: formData.curp_aval,
    parentesco_aval: formData.parentesco_aval,
    garantia_descripcion: formData.garantia_descripcion,
    fecha_inicio: new Date().toISOString().split('T')[0],
  };

  console.log("🚀 Calculando Préstamo Express:");
  console.log("- Capital:", capital);
  console.log("- Tasa:", tasa + "%");
  console.log("- Semanas:", cuotas);
  console.log("- Interés Total:", interesTotal);
  console.log("- TOTAL A PAGAR:", totalPagar);

  try {
    const response = await api.post('/prestamos/', payload);
    alert(`✅ Crédito #${response.data.id} emitido por $${capital.toFixed(2)}`);
  } catch (error: any) {
    console.error("Detalle del error:", error.response?.data);
    alert("❌ Error al guardar. Revisa la consola para más detalles.");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* SELECTOR DE SITUACIÓN INSTITUCIONAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => setTipoCliente('nuevo')}
          className={`p-8 rounded-[2.5rem] border-2 transition-all flex items-center gap-6 relative overflow-hidden group ${tipoCliente === 'nuevo'
              ? 'border-[#0047AB] bg-white shadow-xl shadow-blue-100'
              : 'border-transparent bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
        >
          <div className={`p-4 rounded-2xl transition-colors ${tipoCliente === 'nuevo' ? 'bg-[#0047AB] text-white' : 'bg-slate-300 text-white'}`}>
            <UserPlus size={28} />
          </div>
          <div className="text-left relative z-10">
            <p className={`font-black text-lg leading-none ${tipoCliente === 'nuevo' ? 'text-slate-800' : 'text-slate-400'}`}>Cliente Nuevo</p>
            <p className="text-[10px] mt-2 uppercase font-black tracking-[0.1em]">Requiere validación de Aval</p>
          </div>
          {tipoCliente === 'nuevo' && <CheckCircle2 className="absolute -right-2 -bottom-2 text-blue-50 opacity-50" size={100} />}
        </button>

        <button
          onClick={() => setTipoCliente('recurrente')}
          className={`p-8 rounded-[2.5rem] border-2 transition-all flex items-center gap-6 relative overflow-hidden group ${tipoCliente === 'recurrente'
              ? 'border-[#0047AB] bg-white shadow-xl shadow-blue-100'
              : 'border-transparent bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
        >
          <div className={`p-4 rounded-2xl transition-colors ${tipoCliente === 'recurrente' ? 'bg-[#0047AB] text-white' : 'bg-slate-300 text-white'}`}>
            <RefreshCcw size={28} />
          </div>
          <div className="text-left relative z-10">
            <p className={`font-black text-lg leading-none ${tipoCliente === 'recurrente' ? 'text-slate-800' : 'text-slate-400'}`}>Cliente Recurrente</p>
            <p className="text-[10px] mt-2 uppercase font-black tracking-[0.1em]">Historial de cumplimiento</p>
          </div>
          {tipoCliente === 'recurrente' && <CheckCircle2 className="absolute -right-2 -bottom-2 text-blue-50 opacity-50" size={100} />}
        </button>
      </div>

      {/* FORMULARIO PRINCIPAL */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic">
              {tipoCliente === 'nuevo' ? 'Alta de Préstamo' : 'Renovación de Crédito'}
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1">
              {tipoCliente === 'nuevo'
                ? 'Proceso de registro inicial y vinculación de garantía.'
                : 'Carga automática de datos históricos del cliente.'}
            </p>
          </div>

          {/* Semáforo de Riesgo Dinámico */}
          <div className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-4 transition-all shadow-sm ${riesgo === 'verde' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' :
              riesgo === 'amarillo' ? 'border-amber-100 bg-amber-50 text-amber-600' :
                'border-red-100 bg-red-50 text-red-600'
            }`}>
            <div className={`w-3 h-3 rounded-full animate-pulse ${riesgo === 'verde' ? 'bg-emerald-500' : riesgo === 'amarillo' ? 'bg-amber-500' : 'bg-red-500'
              }`} />
            <span className="font-black text-xs uppercase tracking-[0.2em]">{riesgo}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">ID del Cliente</label>
  <input 
    type="number" 
    value={formData.cliente}
    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
    onBlur={(e) => buscarCliente(e.target.value)} // <--- BUSCA AL SALIR DEL CAMPO
    className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-700 transition-all" 
    placeholder="Ej. 1024" 
  />
  
  {/* Feedback visual si se encuentra al cliente */}
  {clienteEncontrado && (
    <p className="text-[10px] text-[#10B981] font-black uppercase ml-2 mt-1 animate-pulse">
      ✅ Cliente Localizado: {clienteEncontrado.nombre}
    </p>
  )}
</div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Monto Solicitado</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
              <input type="number" value={formData.monto_capital}
                onChange={(e) => setFormData({ ...formData, monto_capital: e.target.value })} className="w-full p-4 pl-8 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-black text-slate-800 transition-all border border-transparent focus:bg-white" placeholder="0.00" />
            </div>
          </div>

          {/* SECCIÓN AVAL - CLIENTE NUEVO */}
          {tipoCliente === 'nuevo' && (
            <div className="col-span-1 md:col-span-2 mt-4 p-8 bg-blue-50/30 rounded-[2rem] border border-blue-100 space-y-6">
              <div className="flex items-center gap-3 text-[#0047AB] font-black text-xs uppercase tracking-widest">
                <ShieldCheck size={22} /> Garantía de Pago (Aval)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest text-blue-800/40">Nombre Completo del Aval</label>
                  <input type="text" value={formData.nombre_aval}
                    onChange={(e) => setFormData({ ...formData, nombre_aval: e.target.value })} className="w-full p-4 bg-white rounded-2xl outline-none border border-blue-100 focus:ring-2 focus:ring-[#0047AB] font-bold" placeholder="Responsable solidario" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest text-blue-800/40">Teléfono de Contacto</label>
                  <input type="tel" value={formData.telefono_aval}
                    onChange={(e) => setFormData({ ...formData, telefono_aval: e.target.value })} className="w-full p-4 bg-white rounded-2xl outline-none border border-blue-100 focus:ring-2 focus:ring-[#0047AB] font-bold" placeholder="246 000 0000" />
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest text-blue-800/40">Domicilio Particular del Aval</label>
                <input type="text" value={formData.direccion_aval}
                  onChange={(e) => setFormData({ ...formData, direccion_aval: e.target.value })} className="w-full p-4 bg-white rounded-2xl outline-none border border-blue-100 focus:ring-2 focus:ring-[#0047AB] font-bold" placeholder="Dirección completa comprobable" />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest text-blue-800/40">Parentesco del Aval</label>
                <input type="text" value={formData.parentesco_aval}
                  onChange={(e) => setFormData({ ...formData, parentesco_aval: e.target.value })} className="w-full p-4 bg-white rounded-2xl outline-none border border-blue-100 focus:ring-2 focus:ring-[#0047AB] font-bold" placeholder="Parentesco del Aval" />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest text-blue-800/40">Garantia</label>
                <input type="text" value={formData.garantia_descripcion}
                  onChange={(e) => setFormData({ ...formData, garantia_descripcion: e.target.value })} className="w-full p-4 bg-white rounded-2xl outline-none border border-blue-100 focus:ring-2 focus:ring-[#0047AB] font-bold" placeholder="Garantia a dejar" />
              </div>
            </div>
          )}

          {/* VERIFICACIÓN RECURRENTE */}
          {tipoCliente === 'recurrente' && (
            <div className="col-span-1 md:col-span-2 flex items-center gap-6 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-500">
                <UserCircle size={32} />
              </div>
              <div>
                <p className="text-base font-black text-emerald-900 leading-none">Perfil de Confianza</p>
                <p className="text-xs text-emerald-600 mt-2 italic font-medium">El sistema vinculará automáticamente el historial de abonos y el aval registrado previamente.</p>
              </div>
            </div>
          )}

          {/* --- SELECT DE MODALIDAD (ESQUEMA) --- */}
<div className="space-y-2">
  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Modalidad de Pago</label>
  <select 
    value={formData.modalidad}
    onChange={handleModalidadChange}
    className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] font-bold text-slate-700"
  >
    <option value="S">Semanal (2.5%)</option>
    <option value="Q">Quincenal (7.5%)</option>
    <option value="M">Mensual (20%)</option>
  </select>
</div>

{/* --- INPUT DE TASA (BLOQUEADO) --- */}
<div className="space-y-2">
  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Tasa de Interés (%)</label>
  <div className="relative">
    <input 
      type="number" 
      value={formData.tasa_interes}
      readOnly // <--- ESTO BLOQUEA EL INPUT
      className="w-full p-4 bg-slate-100 rounded-2xl outline-none border border-slate-200 font-black text-slate-400 cursor-not-allowed" 
      placeholder="0%" 
    />
    <span className="absolute right-4 top-1/2 -translate-y-1/2">
      <ShieldCheck size={18} className="text-slate-300" />
    </span>
  </div>
  <p className="text-[9px] text-slate-400 italic ml-2">* Tasa fija según modalidad seleccionada.</p>
</div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Esquema de Pagos</label>
            <select value={formData.cuotas} 
    // AGREGAR ESTA LÍNEA:
    onChange={(e) => setFormData({ ...formData, cuotas: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0047AB] appearance-none font-bold text-slate-700">
              {[...Array(20)].map((_, i) => (
      <option key={i + 1} value={i + 1}>{i + 1} Semanas</option>
    ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={riesgo === 'rojo' || loading}
            className={`col-span-1 md:col-span-2 mt-6 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] transition-all ${riesgo === 'rojo'
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-[#050533] text-white hover:bg-[#0047AB] shadow-2xl shadow-blue-900/30'
              }`}
          >
            {loading ? 'Sincronizando con Postgres...' : riesgo === 'rojo' ? 'Operación Bloqueada' : 'Emitir Orden de Pre-aprobación'}
          </button>
        </form>
      </div>
    </div>
  );
}