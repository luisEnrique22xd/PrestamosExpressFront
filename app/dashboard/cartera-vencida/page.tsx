'use client';
import { useEffect, useState } from 'react';
import { 
  Users, ChevronDown, ChevronRight, ChevronLeft, ExternalLink, 
  User, Phone, MapPin, Search, ShieldCheck, Loader2, AlertCircle 
} from 'lucide-react';
import React from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CarteraVencidaPage() {
  const router = useRouter();
  const [entidades, setEntidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPorPagina = 6;

  // 1. CARGA DE DATOS DESDE EL ENDPOINT HÍBRIDO
  const fetchCartera = async () => {
    try {
      setLoading(true);
      // 🔥 IMPORTANTE: Usamos el directorio híbrido para ver Grupos y Clientes
      const response = await api.get('/clientes/directorio-hibrido/');
      setEntidades(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error al obtener cartera:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCartera(); }, []);

  // 2. FILTRADO PARA MOSTRAR SOLO DEUDORES (Saldo > 0)
  const deudoresFiltrados = entidades.filter(e => {
    const nombre = (e.nombre || e.nombre_grupo || '').toLowerCase();
    const matchesSearch = nombre.includes(searchTerm.toLowerCase()) || e.id.toString().includes(searchTerm);
    
    // Convertimos a número para evitar errores de string
    const saldoCap = parseFloat(e.saldo_actual || '0');
    const saldoMora = parseFloat(e.total_penalizaciones || '0');

    // 🔥 REGLA DE MOROSIDAD CORREGIDA:
    // Aparece si el nombre coincide Y (tiene capital pendiente O tiene alguna multa)
    // Quitamos la obligación de que "tieneRecargos" sea true para que las manuales salgan
    return matchesSearch && (saldoCap > 0 || saldoMora > 0);
  });

  // 2. ORDENAMIENTO (Prioridad a los que tienen más dinero en mora)
  const deudoresOrdenados = [...deudoresFiltrados].sort((a, b) => 
    parseFloat(b.total_penalizaciones || '0') - parseFloat(a.total_penalizaciones || '0')
  );

  const totalPaginas = Math.ceil(deudoresFiltrados.length / itemsPorPagina);
  const deudoresActuales = deudoresFiltrados.slice((currentPage - 1) * itemsPorPagina, currentPage * itemsPorPagina);

  const condonarMora = async (idPenalizacion: number, nombre: string) => {
    const motivo = window.prompt(`¿Por qué condonas la deuda de ${nombre}? (Mín. 10 carac.)`);
    if (!motivo || motivo.length < 10) return alert("❌ Motivo inválido.");
    try {
      await api.post(`/condonar-mora/${idPenalizacion}/`, { motivo });
      alert("✅ Condonación exitosa.");
      fetchCartera();
    } catch (e) { alert("❌ Error en servidor."); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen text-slate-400">
      <Loader2 className="animate-spin mb-4" size={40} color="#DC2626" />
      <p className="font-black uppercase tracking-widest text-xs italic text-red-500">Escaneando Cartera Vencida Tlaxcala...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
      
      {/* HEADER ROJO DE ALERTA */}
      <div className="p-8 border-b border-red-50 bg-red-50/20 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
            <AlertCircle size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 italic">Cartera en Mora</h2>
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">Recuperación Urgente: {deudoresFiltrados.length} Cuentas</p>
          </div>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600" size={18} />
          <input 
            type="text" 
            placeholder="Buscar deudor moroso..." 
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-600 outline-none transition-all shadow-sm" 
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Cliente / Grupo</th>
              <th className="px-8 py-5">Tipo</th>
              <th className="px-8 py-5 text-center">Deuda Total</th>
              <th className="px-8 py-5 text-center">Atraso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {deudoresActuales.length > 0 ? deudoresActuales.map((e) => {
              const uniqueKey = `${e.es_grupo ? 'G' : 'I'}-${e.id}`;
              const isExpanded = expandedId === uniqueKey;
              const tieneMora = parseFloat(e.total_penalizaciones || '0') > 0;

              return (
                <React.Fragment key={uniqueKey}>
                  <tr 
                    onClick={() => setExpandedId(isExpanded ? null : uniqueKey)} 
                    className={`transition-all cursor-pointer ${isExpanded ? 'bg-red-50/50' : 'hover:bg-slate-50/50'}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${e.es_grupo ? 'bg-purple-600' : 'bg-[#0047AB]'}`}>
                          {e.es_grupo ? <Users size={18} /> : <User size={18} />}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm tracking-tight capitalize">{e.nombre || e.nombre_grupo}</p>
                          <p className="text-[9px] text-slate-400 font-bold italic">REF: {e.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {/* Badge dinámico de tipo */}
                      <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border ${e.es_grupo ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {e.es_grupo ? 'Grupal Solidario' : 'Individual'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
  <span className="font-black text-sm text-red-600">
    {/* Sumamos saldo_actual (capital) + total_penalizaciones */}
    ${(parseFloat(e.saldo_actual || '0') + parseFloat(e.total_penalizaciones || '0')).toLocaleString('es-MX')}
  </span>
</td>
                    <td className="px-8 py-6 text-center">
    <div className="flex flex-col items-center">
      {tieneMora ? (
        <>
          <span className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1">
            <AlertCircle size={10} /> Mora Activa
          </span>
          {/* Mostramos el desglose para que Alexander sepa de dónde salen los $45 */}
          <span className="text-[9px] text-slate-400 font-bold italic">
             Cap: ${parseFloat(e.saldo_actual).toLocaleString()} + Mora: ${e.total_penalizaciones}
          </span>
        </>
      ) : (
        <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">Pendiente de Pago</span>
      )}
    </div>
</td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-red-50/20">
                      <td colSpan={4} className="px-16 py-8 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 bg-white p-6 rounded-[2rem] border border-red-100 shadow-xl shadow-red-900/5">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-300 uppercase">Domicilio</p>
                            <p className="text-xs text-slate-600 font-bold leading-tight flex items-center gap-2">
                               <MapPin size={12} className="text-red-500" /> {e.direccion}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-300 uppercase">Responsable / Aval</p>
                            <p className="text-xs text-slate-800 font-black">
                               {e.es_grupo ? (e.nombre_aval || 'S/N') : (e.datos_ultimo_aval?.nombre_aval || 'Ninguno')}
                            </p>
                          </div>
                          <div className="flex gap-2 col-span-2 justify-end">
                            
                            <button 
                              onClick={(event) => { event.stopPropagation(); condonarMora(e.id_mora_activa, e.nombre || e.nombre_grupo); }}
                              className="flex items-center gap-2 bg-amber-500 text-white text-[9px] font-black uppercase px-4 py-3 rounded-xl hover:bg-amber-600 transition-all"
                            >
                              <ShieldCheck size={14}/> Condonar
                            </button>
                            <button 
                              onClick={(event) => { 
                                event.stopPropagation(); 
                                router.push('/dashboard/pagos'); 
                              }} 
                              className={`flex items-center gap-2 text-white text-[9px] font-black uppercase px-6 py-3 rounded-xl shadow-lg transition-all ${e.es_grupo ? 'bg-purple-700 hover:bg-purple-800' : 'bg-red-700 hover:bg-red-800'}`}
                            >
                              Gestionar Cobro <ExternalLink size={14}/>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            }) : (
              <tr>
                <td colSpan={4} className="p-20 text-center">
                   <div className="flex flex-col items-center opacity-20">
                      <ShieldCheck size={80} />
                      <p className="font-black italic uppercase text-xs mt-4">No se detectaron deudas vencidas</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
         <p className="text-[10px] text-slate-400 font-black uppercase italic">Página {currentPage} de {totalPaginas || 1}</p>
         <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} className="p-2 bg-white rounded-lg border border-slate-200"><ChevronLeft size={16}/></button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPaginas, p+1))} className="p-2 bg-white rounded-lg border border-slate-200"><ChevronRight size={16}/></button>
         </div>
      </div>
    </div>
  );
}