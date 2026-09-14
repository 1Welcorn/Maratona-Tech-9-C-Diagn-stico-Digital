import React, { useState } from 'react';
import { Cpu, LogOut, ClipboardList, BookOpen, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { DiagnosticTab } from './DiagnosticTab';
import { CoexistenceTab } from './CoexistenceTab';

export const Dashboard: React.FC = () => {
  const { user, setRoleImmediately } = useAuth();
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'coexistence'>('diagnostic');
  
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherAccessCode, setTeacherAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignOut = () => {
    supabase.auth.signOut();
  };

  const handleTeacherAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: rpcError } = await supabase.rpc('become_teacher', {
        p_password: teacherAccessCode
      });

      if (rpcError) throw rpcError;

      setRoleImmediately('teacher');
    } catch (err: any) {
      setError(err.message || 'Erro no acesso do professor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Teacher Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-2">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-2 text-sm text-amber-500">
          <AlertCircle className="w-4 h-4" />
          Professor? Clique no botão "Professor" no topo para acessar o painel.
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 shadow-lg shadow-black/20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <h1 className="font-bold text-slate-100 hidden sm:block">Maratona Tech <span className="text-cyan-500">· 9°C</span></h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-400 hidden md:block">{user?.email}</span>
            <button 
              onClick={() => setShowTeacherModal(true)}
              className="px-4 py-2 text-sm font-medium text-amber-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-lg shadow-amber-500/20 animate-pulse"
            >
              Professor
            </button>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 bg-slate-800 hover:text-red-400 hover:bg-slate-800/80 rounded-lg transition-colors border border-slate-700"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('diagnostic')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'diagnostic' 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/5' 
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Diagnóstico Digital
            </button>
            <button
              onClick={() => setActiveTab('coexistence')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'coexistence' 
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-lg shadow-teal-500/5' 
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Guia de Convivência
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'diagnostic' ? <DiagnosticTab /> : <CoexistenceTab />}
      </main>

      {/* Teacher Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 w-full max-w-sm shadow-2xl shadow-amber-500/10">
            <h2 className="text-xl font-bold text-amber-500 mb-2 text-center">Acesso Professor</h2>
            <p className="text-sm text-slate-400 text-center mb-6">Insira a senha de acesso para visualizar o painel.</p>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-4 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleTeacherAccess} className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  value={teacherAccessCode}
                  onChange={e => setTeacherAccessCode(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-amber-500/50 outline-none placeholder:text-slate-600 text-center text-lg tracking-widest"
                  placeholder="Senha"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTeacherModal(false)}
                  className="flex-1 py-3 rounded-xl font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-medium text-slate-900 bg-amber-500 hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Aguarde...' : 'Acessar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
