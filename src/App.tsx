/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { isSupabaseConfigured } from './lib/supabase';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { Loader2, Database } from 'lucide-react';

const MainApp: React.FC = () => {
  const { session, role, loading } = useAuth();

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Database className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-4">Banco de dados não configurado</h2>
          <p className="text-slate-400 mb-6 text-sm">
            Para usar o Maratona Tech — Diagnóstico Digital, você precisa configurar as variáveis de ambiente do Supabase.
          </p>
          <div className="text-left bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2 text-sm text-slate-300">
            <p className="font-mono text-xs text-slate-500 mb-2">Configure em Settings (Configurações):</p>
            <p>VITE_SUPABASE_URL</p>
            <p>VITE_SUPABASE_ANON_KEY</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        <p className="text-slate-400 font-medium">Carregando Maratona Tech...</p>
      </div>
    );
  }

  if (role === 'teacher') {
    return <TeacherDashboard />;
  }

  // Se for aluno (via bypass local) ou tiver sessão, vai pro Dashboard
  if (role === 'student' || session) {
    return <Dashboard bypass={role === 'student' && !session} />;
  }

  return <AuthScreen />;
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

