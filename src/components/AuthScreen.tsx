import React, { useState } from 'react';
import { Cpu } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only for UI right now
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherAccessCode, setTeacherAccessCode] = useState('');

  const { setRoleImmediately } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Como o Supabase travou a criação de contas por e-mail no plano grátis (Rate Limit / Anti-spam),
      // vamos dar um "bypass" e permitir o acesso direto do aluno preenchendo apenas o nome.
      // O progresso deles ficará salvo localmente na máquina deles durante a aula.
      if (!name) {
        throw new Error('Por favor, informe seu nome para entrar.');
      }
      
      // Simulamos um login forçado armazenando os dados na sessão e liberando o acesso
      localStorage.setItem('student_name', name);
      setRoleImmediately('student');
      
    } catch (err: any) {
      setError(err.message || 'Erro no acesso');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Validação local rígida
      if (teacherAccessCode !== '250286') {
        throw new Error('Senha de acesso restrito incorreta.');
      }
      
      // 2. Atualiza estado do frontend forçando acesso sem envolver o Supabase auth aqui
      setRoleImmediately('teacher');
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Senha incorreta ou erro no acesso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-cyan-500/10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Maratona Tech</h1>
          <p className="text-cyan-400 font-medium">9°C · Diagnóstico Digital</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Como você se chama?</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all"
              placeholder="Digite seu nome completo"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-xl hover:from-cyan-400 hover:to-blue-500 focus:ring-2 focus:ring-cyan-500/50 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Entrando...' : 'Entrar como Aluno'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
          <button
            onClick={() => setShowTeacherModal(true)}
            className="text-sm font-medium text-amber-500/80 hover:text-amber-400 transition-colors"
          >
            Acesso Professor
          </button>
        </div>
      </div>

      {showTeacherModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 w-full max-w-sm shadow-2xl shadow-amber-500/10">
            <h2 className="text-xl font-bold text-amber-500 mb-6 text-center">Painel do Professor</h2>
            <form onSubmit={handleTeacherAccess} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 text-center">Senha de acesso restrito</label>
                <input
                  type="password"
                  required
                  value={teacherAccessCode}
                  onChange={e => setTeacherAccessCode(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-amber-500/50 outline-none placeholder:text-slate-600 text-center text-xl tracking-[0.5em]"
                  placeholder="••••••"
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
                  {loading ? 'Validando...' : 'Acessar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
