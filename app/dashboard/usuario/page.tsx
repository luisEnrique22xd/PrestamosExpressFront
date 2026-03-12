"use client";
import React, { useEffect, useState } from 'react';
import { 
  UserCircle, Landmark, ShieldCheck, LogOut, 
  Key, Settings, MapPin, Loader2, X, CheckCircle2, AlertCircle
} from "lucide-react";
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function UsuarioPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // ESTADOS PARA MODALES
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  
  // FORMULARIOS
  const [formPerfil, setFormPerfil] = useState({ first_name: '', last_name: '', email: '' });
  const [formPass, setFormPass] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [statusMsg, setStatusMsg] = useState({ type: '', msg: '' });

  // 1. CARGA INICIAL
  const fetchPerfil = async () => {
    try {
      setLoading(true);
      const res = await api.get('/usuarios/perfil/'); 
      setPerfil(res.data);
      setFormPerfil({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        email: res.data.email || ''
      });
    } catch (error: any) {
      console.error("Error al obtener perfil:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPerfil(); }, []);

  // 2. ACTUALIZAR DATOS BÁSICOS
  const handleUpdatePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/usuarios/perfil/actualizar/', formPerfil);
      setPerfil({ ...perfil, ...formPerfil });
      setShowEditModal(false);
      mostrarAlerta('success', 'Perfil actualizado con éxito');
    } catch (error) {
      mostrarAlerta('error', 'Error al actualizar perfil');
    }
  };

  // 3. CAMBIAR CONTRASEÑA
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formPass.new_password !== formPass.confirm_password) {
      return mostrarAlerta('error', 'Las contraseñas nuevas no coinciden');
    }
    try {
      await api.post('/usuarios/perfil/cambiar-password/', formPass);
      setShowPassModal(false);
      setFormPass({ old_password: '', new_password: '', confirm_password: '' });
      mostrarAlerta('success', 'Contraseña cambiada correctamente');
    } catch (error: any) {
      mostrarAlerta('error', error.response?.data?.error || 'Error al cambiar contraseña');
    }
  };

  const mostrarAlerta = (type: string, msg: string) => {
    setStatusMsg({ type, msg });
    setTimeout(() => setStatusMsg({ type: '', msg: '' }), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-black uppercase tracking-widest text-xs italic">Sincronizando Cuenta...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-in fade-in duration-700 relative">
      
      {/* ALERTA FLOTANTE */}
      {statusMsg.msg && (
        <div className={`fixed top-10 right-10 z-[100] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${statusMsg.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold text-sm uppercase tracking-tighter">{statusMsg.msg}</span>
        </div>
      )}

      {/* CARD DE PERFIL PRINCIPAL */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-20 -mt-20 z-0 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-tr from-[#0047AB] to-[#050533] p-1.5 shadow-2xl shadow-blue-900/20">
            <div className="w-full h-full rounded-[2.2rem] bg-white overflow-hidden border-4 border-white flex items-center justify-center">
              <div className="text-6xl font-black text-[#0047AB] uppercase select-none">
                {perfil?.first_name?.[0] || perfil?.username?.[0]}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowEditModal(true)}
            className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl shadow-xl text-[#0047AB] border border-slate-50 hover:scale-110 transition-transform active:scale-95"
          >
            <Settings size={22} />
          </button>
        </div>
        
        <div className="flex-1 relative z-10 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-baseline gap-3 mb-2">
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter capitalize leading-none">
              {perfil?.first_name ? `${perfil.first_name} ${perfil.last_name}` : perfil?.username}
            </h2>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 self-center md:self-auto">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-600 text-[9px] font-black uppercase tracking-widest">Activo</span>
            </div>
          </div>
          <p className="text-slate-400 font-bold flex items-center justify-center md:justify-start gap-2 uppercase text-[10px] tracking-[0.2em] mt-1">
            <ShieldCheck size={14} className="text-[#0047AB]" /> 
            {perfil?.puesto} • {perfil?.email}
          </p>
          
          <div className="flex justify-center md:justify-start gap-4 mt-8">
            <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 shadow-sm transition-hover hover:border-blue-200">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">ID Personal</p>
                <p className="text-sm font-black text-slate-700 font-mono tracking-tighter italic">#{perfil?.id?.toString().padStart(3, '0')}</p>
            </div>
            <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 shadow-sm transition-hover hover:border-blue-200">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Última Sesión</p>
                <p className="text-sm font-black text-slate-700 tracking-tighter italic">{perfil?.last_login}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE AJUSTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 italic uppercase tracking-tighter text-lg">
            <div className="p-2 bg-blue-50 rounded-xl text-[#0047AB]"><Landmark size={20} /></div>
            Parámetros del Sistema
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-5 bg-slate-50 rounded-[1.5rem] border border-transparent">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Interés Global</span>
              <span className="font-black text-[#0047AB] text-xl">10%</span>
            </div>
            <div className="flex justify-between items-center p-5 bg-slate-50 rounded-[1.5rem] border border-transparent">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Mora Diaria</span>
              <span className="font-black text-red-500 text-xl">1.5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 italic uppercase tracking-tighter text-lg">
            <div className="p-2 bg-blue-50 rounded-xl text-[#0047AB]"><ShieldCheck size={20} /></div>
            Acciones de Cuenta
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => setShowPassModal(true)}
              className="group w-full p-5 bg-slate-50 hover:bg-[#0047AB] rounded-[1.5rem] transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl text-slate-400 group-hover:text-[#0047AB]"><Key size={18} /></div>
                <span className="text-xs font-black text-slate-600 group-hover:text-white uppercase tracking-widest">Seguridad / Contraseña</span>
              </div>
              <span className="text-slate-300 group-hover:text-white/50">→</span>
            </button>

            <button 
              onClick={handleLogout}
              className="group w-full p-5 bg-red-50 hover:bg-red-600 rounded-[1.5rem] transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl text-red-400"><LogOut size={18} /></div>
                <span className="text-xs font-black text-red-600 group-hover:text-white uppercase tracking-widest">Finalizar Sesión</span>
              </div>
              <span className="text-red-200 group-hover:text-white/50">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: EDITAR PERFIL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdatePerfil} className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">Editar Perfil</h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nombre(s)</label>
                <input 
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-[#0047AB] outline-none font-bold text-slate-700"
                  value={formPerfil.first_name}
                  onChange={(e) => setFormPerfil({...formPerfil, first_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Apellido(s)</label>
                <input 
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-[#0047AB] outline-none font-bold text-slate-700"
                  value={formPerfil.last_name}
                  onChange={(e) => setFormPerfil({...formPerfil, last_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Correo Electrónico</label>
                <input 
                  type="email"
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-[#0047AB] outline-none font-bold text-slate-700"
                  value={formPerfil.email}
                  onChange={(e) => setFormPerfil({...formPerfil, email: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-4 text-slate-400 font-black uppercase text-xs tracking-widest">Cancelar</button>
              <button type="submit" className="flex-1 py-4 bg-[#0047AB] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-900/20 active:scale-95 transition-all">Guardar Cambios</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CAMBIAR PASSWORD */}
      {showPassModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleChangePassword} className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">Seguridad</h3>
              <button type="button" onClick={() => setShowPassModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input 
                type="password" placeholder="Contraseña Actual"
                className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-[#0047AB] outline-none font-bold"
                value={formPass.old_password}
                onChange={(e) => setFormPass({...formPass, old_password: e.target.value})}
                required
              />
              <div className="h-px bg-slate-100 my-2"></div>
              <input 
                type="password" placeholder="Nueva Contraseña"
                className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-[#0047AB] outline-none font-bold"
                value={formPass.new_password}
                onChange={(e) => setFormPass({...formPass, new_password: e.target.value})}
                required
              />
              <input 
                type="password" placeholder="Confirmar Nueva"
                className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-[#0047AB] outline-none font-bold"
                value={formPass.confirm_password}
                onChange={(e) => setFormPass({...formPass, confirm_password: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="w-full mt-8 py-4 bg-[#050533] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">Actualizar Seguridad</button>
          </form>
        </div>
      )}

    </div>
  );
}