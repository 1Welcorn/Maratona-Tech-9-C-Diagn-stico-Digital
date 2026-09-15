import React, { useState, useEffect } from 'react';
import { Download, Save, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { FormSection, TextField, InputField } from './FormFields';
import { downloadCoexistencePdf } from '../lib/pdf';

export const CoexistenceTab: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  const [formData, setFormData] = useState({
    group_name: '',
    content_analyzed: '',
    problem_description: '',
    cause_identification: '',
    risks_school: '',
    awareness_strategies: '',
    mitigation_proposals: '',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        // Fallback for students using the bypass (no auth)
        const localData = localStorage.getItem('coexistence_guide');
        if (localData) {
          try {
            setFormData(JSON.parse(localData));
            setHasExisting(true);
          } catch(e) {}
        }
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('coexistence_guides')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setFormData(data);
          setHasExisting(true);
        }
      } catch (err) {
        console.error('Error loading coexistence guide:', err);
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
    setSaving(true);
    try {
      if (!user) {
        // Save locally for anonymous students
        localStorage.setItem('coexistence_guide', JSON.stringify(formData));
        alert('Salvo com sucesso no seu dispositivo!');
        setHasExisting(true);
        setSaving(false);
        return;
      }

      if (hasExisting) {
        await supabase
          .from('coexistence_guides')
          .update(formData)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('coexistence_guides')
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
    downloadCoexistencePdf(formData, user?.email || localStorage.getItem('student_name') || 'Aluno');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>;
  }

  return (
    <div className="pb-24 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-6 mb-6 shadow-lg shadow-teal-500/10">
        <h2 className="text-xl font-bold text-teal-400 mb-6 flex items-center gap-2">
          Cabeçalho
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Nome do Grupo/Aluno" value={formData.group_name} onChange={e => handleChange('group_name', e.target.value)} className="focus:ring-teal-500/50 focus:border-teal-500" />
          <InputField label="Conteúdo Analisado" value={formData.content_analyzed} onChange={e => handleChange('content_analyzed', e.target.value)} className="focus:ring-teal-500/50 focus:border-teal-500" />
        </div>
      </div>

      <div className="[&>div>div>div]:bg-teal-500/20 [&>div>div>div]:text-teal-500">
        <FormSection number={1} title="Descrição do Problema Digital">
          <TextField 
            label="Descreva o problema de forma clara e como ele se manifesta no ambiente escolar." 
            value={formData.problem_description} 
            onChange={e => handleChange('problem_description', e.target.value)} 
            className="focus:ring-teal-500/50 focus:border-teal-500"
          />
        </FormSection>

        <FormSection number={2} title="Identificação da Causa">
          <TextField 
            label="Quais são as raízes desse problema? Como ele se espalha?" 
            value={formData.cause_identification} 
            onChange={e => handleChange('cause_identification', e.target.value)} 
            className="focus:ring-teal-500/50 focus:border-teal-500"
          />
        </FormSection>

        <FormSection number={3} title="Riscos para a Escola">
          <TextField 
            label="Como isso afeta os alunos, professores e a comunidade escolar?" 
            value={formData.risks_school} 
            onChange={e => handleChange('risks_school', e.target.value)} 
            className="focus:ring-teal-500/50 focus:border-teal-500"
          />
        </FormSection>

        <FormSection number={4} title="Estratégias de Conscientização">
          <TextField 
            label="Como informar e educar a comunidade escolar sobre este problema?" 
            value={formData.awareness_strategies} 
            onChange={e => handleChange('awareness_strategies', e.target.value)} 
            className="focus:ring-teal-500/50 focus:border-teal-500"
          />
        </FormSection>

        <FormSection number={5} title="Propostas Práticas de Mitigação">
          <TextField 
            label="Ações concretas e regras sugeridas para melhorar a convivência digital." 
            value={formData.mitigation_proposals} 
            onChange={e => handleChange('mitigation_proposals', e.target.value)} 
            className="focus:ring-teal-500/50 focus:border-teal-500"
          />
        </FormSection>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 p-4 z-40">
        <div className="max-w-4xl mx-auto flex gap-4 justify-end">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 transition-colors border border-teal-500/30"
          >
            <Download className="w-5 h-5" />
            PDF
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
