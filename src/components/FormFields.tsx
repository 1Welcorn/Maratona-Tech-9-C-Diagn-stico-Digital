import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const FormSection: React.FC<{
  number: number;
  title: string;
  children: React.ReactNode;
}> = ({ number, title, children }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-sm">
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-500 font-bold">
        {number}
      </div>
      <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

interface TextFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextField: React.FC<TextFieldProps> = ({ label, className, ...props }) => (
  <div className="flex flex-col gap-2">
    {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
    <textarea
      className={cn(
        "bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-600",
        "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500",
        "min-h-[100px] resize-y",
        className
      )}
      {...props}
    />
  </div>
);

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, className, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-slate-300">{label}</label>
    <input
      className={cn(
        "bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-600",
        "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500",
        className
      )}
      {...props}
    />
  </div>
);

export const CheckboxGroup: React.FC<{
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}> = ({ options, selected, onChange }) => {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
            selected.includes(opt)
              ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
              : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

export const RiskTable: React.FC<{
  values: { informacional: string; emocional: string; social: string };
  onChange: (key: 'informacional' | 'emocional' | 'social', value: string) => void;
}> = ({ values, onChange }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium w-1/4">Tipo de Risco</th>
            <th className="px-4 py-3 font-medium">Descrição</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-900">
          <tr>
            <td className="px-4 py-4 font-medium text-slate-200 align-top">Risco Informacional</td>
            <td className="px-4 py-4">
              <textarea
                value={values.informacional}
                onChange={(e) => onChange('informacional', e.target.value)}
                placeholder="Ex: Fake news, desinformação, viés de confirmação..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:outline-none min-h-[80px]"
              />
            </td>
          </tr>
          <tr>
            <td className="px-4 py-4 font-medium text-slate-200 align-top">Risco Emocional</td>
            <td className="px-4 py-4">
              <textarea
                value={values.emocional}
                onChange={(e) => onChange('emocional', e.target.value)}
                placeholder="Ex: Ansiedade, comparação, cyberbullying..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:outline-none min-h-[80px]"
              />
            </td>
          </tr>
          <tr>
            <td className="px-4 py-4 font-medium text-slate-200 align-top">Risco Social</td>
            <td className="px-4 py-4">
              <textarea
                value={values.social}
                onChange={(e) => onChange('social', e.target.value)}
                placeholder="Ex: Isolamento, polarização, cancelamento..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:outline-none min-h-[80px]"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
