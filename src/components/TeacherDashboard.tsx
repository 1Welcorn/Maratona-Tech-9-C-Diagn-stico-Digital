import React, { useState, useEffect } from 'react';
import { GraduationCap, RefreshCw, LogOut, ChevronDown, ChevronUp, Download, Loader2, ClipboardList, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { downloadDiagnosticPdf, downloadCoexistencePdf } from '../lib/pdf';

interface Profile {
  id: string;
  email: string;
}

export const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'coexistence'>('diagnostic');
  const [diagnosticForms, setDiagnosticForms] = useState<any[]>([]);
  const [coexistenceGuides, setCoexistenceGuides] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      const [diagRes, coexRes] = await Promise.all([
        supabase.from('diagnostic_forms').select('*').order('created_at', { ascending: false }),
        supabase.from('coexistence_guides').select('*').order('created_at', { ascending: false })
      ]);

      if (diagRes.error) throw diagRes.error;
      if (coexRes.error) throw coexRes.error;

      setDiagnosticForms(diagRes.data || []);
      setCoexistenceGuides(coexRes.data || []);

      // Collect all unique user IDs
      const userIds = new Set<string>();
      (diagRes.data || []).forEach(f => userIds.add(f.user_id));
      (coexRes.data || []).forEach(f => userIds.add(f.user_id));

      if (userIds.size > 0) {
        const { data: profData, error: profError } = await supabase.rpc('get_profiles_by_ids', {
          p_ids: Array.from(userIds)
        });
        
        if (!profError && profData) {
          const profMap: Record<string, string> = {};
          profData.forEach((p: Profile) => {
            profMap[p.id] = p.email;
          });
          setProfiles(profMap);
        }
      }
    } catch (err) {
      console.error('Error fetching teacher data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSignOut = () => {
    supabase.auth.signOut();
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  const currentData = activeTab === 'diagnostic' ? diagnosticForms : coexistenceGuides;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-amber-500/30 shadow-lg shadow-amber-500/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
              <GraduationCap className="w-5 h-5 text-amber-500" />
            </div>
            <h1 className="font-bold text-slate-100 hidden sm:block">Painel do Professor <span className="text-amber-500">· 9°s anos</span></h1>
            <h1 className="font-bold text-slate-100 sm:hidden">Painel do Professor</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData}
              disabled={refreshing}
              className="p-2 text-slate-400 hover:text-amber-400 bg-slate-800 rounded-lg transition-colors border border-slate-700 hover:border-amber-500/50"
              title="Atualizar"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin text-amber-500' : ''}`} />
            </button>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-slate-900 p-2 rounded-2xl border border-slate-800 inline-flex">
          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === 'diagnostic' 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Diagnósticos
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'diagnostic' ? 'bg-amber-900/30 text-amber-950' : 'bg-slate-800'}`}>
              {diagnosticForms.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('coexistence')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === 'coexistence' 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Guias de Convivência
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'coexistence' ? 'bg-amber-900/30 text-amber-950' : 'bg-slate-800'}`}>
              {coexistenceGuides.length}
            </span>
          </button>
        </div>

        {/* List */}
        <div className="space-y-4">
          {currentData.length === 0 ? (
            <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl">
              <p className="text-slate-400 text-lg">Nenhuma resposta encontrada.</p>
            </div>
          ) : (
            currentData.map(item => {
              const isExpanded = expandedId === item.id;
              const email = profiles[item.user_id] || 'Aluno desconhecido';
              const date = new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' });

              return (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-colors">
                  <div 
                    onClick={() => toggleExpand(item.id)}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-slate-200 text-lg">{item.group_name || 'Sem nome'}</h3>
                        <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-medium border border-slate-700">
                          {email}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{item.content_analyzed || 'Sem conteúdo especificado'}</p>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 text-slate-500">
                      <span className="text-sm">{date}</span>
                      <button className="p-2 hover:bg-slate-800 rounded-full transition-colors text-amber-500">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-800/50 bg-slate-900/50">
                      <div className="mt-4 space-y-6 text-sm text-slate-300">
                        {/* Dump all fields nicely */}
                        {Object.entries(item).filter(([k]) => !['id', 'user_id', 'created_at', 'updated_at'].includes(k)).map(([k, v]) => (
                          <div key={k} className="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                            <span className="block font-semibold text-slate-500 mb-1 uppercase tracking-wider text-xs">
                              {k.replace(/_/g, ' ')}
                            </span>
                            <span className="text-slate-200">
                              {Array.isArray(v) ? (
                                <div className="flex gap-2 flex-wrap mt-2">
                                  {v.map((t, i) => <span key={i} className="bg-slate-800 px-3 py-1 rounded-full text-slate-300">{t}</span>)}
                                </div>
                              ) : (
                                v || <span className="italic text-slate-600">Não preenchido</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            activeTab === 'diagnostic' 
                              ? downloadDiagnosticPdf(item, email) 
                              : downloadCoexistencePdf(item, email);
                          }}
                          className="flex items-center gap-2 px-6 py-2.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl font-medium transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Baixar PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};
