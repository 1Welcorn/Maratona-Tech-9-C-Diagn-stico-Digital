import React, { useState, useEffect } from 'react';
import { Download, Save, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { FormSection, TextField, InputField, CheckboxGroup, RiskTable } from './FormFields';
import { downloadDiagnosticPdf } from '../lib/pdf';

export const DiagnosticTab: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  const [formData, setFormData] = useState({
    group_name: '',
    content_analyzed: '',
    knowledge_area: '',
    problem_description: '',
    data_types: [] as string[],
    data_which: '',
    data_usage: '',
    algorithm_influence: [] as string[],
    algorithm_explain: '',
    risk_informacional: '',
    risk_emocional: '',
    risk_social: '',
    cause_types: [] as string[],
    cause_explain: '',
    strategy_professional: '',
    strategy_school: '',
    checklist_n2: [] as string[],
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('diagnostic_forms')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setFormData(data);
          setHasExisting(true);
        }
      } catch (err) {
        console.error('Error loading diagnostic form:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (hasExisting) {
        await supabase
          .from('diagnostic_forms')
          .update(formData)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('diagnostic_forms')
          .insert([{ ...formData, user_id: user.id }]);
        setHasExisting(true);
      }
      alert('Salvo com sucesso!');
    } catch (err) {
      console.error('Error saving form:', err);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    downloadDiagnosticPdf(formData, user?.email || 'Aluno');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 text-cyan-500 animate-spin" /></div>;
  }

  return (
    <div className="pb-24 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 mb-6 shadow-lg shadow-cyan-500/10">
        <h2 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
          Cabeçalho
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField label="Nome do Grupo/Aluno" value={formData.group_name} onChange={e => handleChange('group_name', e.target.value)} />
          <InputField label="Conteúdo Analisado" value={formData.content_analyzed} onChange={e => handleChange('content_analyzed', e.target.value)} />
          <InputField label="Área do Conhecimento" value={formData.knowledge_area} onChange={e => handleChange('knowledge_area', e.target.value)} />
        </div>
      </div>

      <FormSection number={1} title="Descrição Objetiva do Problema">
        <TextField 
          label="Qual é o problema digital central abordado?" 
          value={formData.problem_description} 
          onChange={e => handleChange('problem_description', e.target.value)} 
          placeholder="Ex: Usuários são expostos a um excesso de conteúdo padronizado sobre dietas irrealistas..."
        />
      </FormSection>

      <FormSection number={2} title="Dados Envolvidos">
        <div className="mb-4">
          <label className="text-sm font-medium text-slate-300 block mb-2">Quais tipos de dados o problema envolve?</label>
          <CheckboxGroup 
            options={['Dados Pessoais', 'Dados Sensíveis']} 
            selected={formData.data_types} 
            onChange={v => handleChange('data_types', v)} 
          />
        </div>
        <TextField 
          label="Quais dados especificamente?" 
          value={formData.data_which} 
          onChange={e => handleChange('data_which', e.target.value)} 
        />
        <TextField 
          label="Como esses dados estão sendo usados?" 
          value={formData.data_usage} 
          onChange={e => handleChange('data_usage', e.target.value)} 
        />
      </FormSection>

      <FormSection number={3} title="Papel do Algoritmo">
        <div className="mb-4">
          <label className="text-sm font-medium text-slate-300 block mb-2">O algoritmo deste conteúdo influencia:</label>
          <CheckboxGroup 
            options={['O que aparece', 'A frequência', 'A viralização', 'A segmentação']} 
            selected={formData.algorithm_influence} 
            onChange={v => handleChange('algorithm_influence', v)} 
          />
        </div>
        <TextField 
          label="Explique como o algoritmo atua neste problema:" 
          value={formData.algorithm_explain} 
          onChange={e => handleChange('algorithm_explain', e.target.value)} 
        />
      </FormSection>

      <FormSection number={4} title="Riscos Identificados">
        <RiskTable 
          values={{ informacional: formData.risk_informacional, emocional: formData.risk_emocional, social: formData.risk_social }}
          onChange={(k, v) => handleChange(`risk_${k}`, v)}
        />
      </FormSection>

      <FormSection number={5} title="Causa do Problema">
        <div className="mb-4">
          <label className="text-sm font-medium text-slate-300 block mb-2">Principais causas identificadas:</label>
          <CheckboxGroup 
            options={['Falta de informação', 'Busca por engajamento', 'Uso inadequado de dados', 'Desconhecimento sobre privacidade']} 
            selected={formData.cause_types} 
            onChange={v => handleChange('cause_types', v)} 
          />
        </div>
        <TextField 
          label="Justifique a escolha das causas:" 
          value={formData.cause_explain} 
          onChange={e => handleChange('cause_explain', e.target.value)} 
        />
      </FormSection>

      <FormSection number={6} title="Estratégias">
        <TextField 
          label="Estratégia Profissional (O que as plataformas deveriam fazer?)" 
          value={formData.strategy_professional} 
          onChange={e => handleChange('strategy_professional', e.target.value)} 
        />
        <div className="mt-4">
          <TextField 
            label="Estratégia Escola (O que a escola/alunos podem fazer?)" 
            value={formData.strategy_school} 
            onChange={e => handleChange('strategy_school', e.target.value)} 
          />
        </div>
      </FormSection>

      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-bold text-slate-200 mb-4">Checklist de Revisão</h3>
        <CheckboxGroup 
          options={['Identificamos dados e algoritmo', 'Explicamos a causa', 'Propusemos estratégias']} 
          selected={formData.checklist_n2} 
          onChange={v => handleChange('checklist_n2', v)} 
        />
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 p-4 z-40">
        <div className="max-w-4xl mx-auto flex gap-4 justify-end">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors border border-cyan-500/30"
          >
            <Download className="w-5 h-5" />
            PDF
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
