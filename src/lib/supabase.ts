import { createClient } from '@supabase/supabase-js';

// Vercel/Vite will expose these if we use VITE_, but since Vercel warns about it being a "Secret"
// We added 'SUPABASE_' to the envPrefix in vite.config.ts so we can use these variables safely.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || import.meta.env.PUBLIC_VITE_SUPABASE_ANON_KEY || '';

console.log('Environment Debug Dump:', import.meta.env);

console.log('Supabase config check:', { 
  hasUrl: !!supabaseUrl, 
  hasKey: !!supabaseAnonKey 
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

// Se não estiver configurado, criamos um cliente falso que não faz nada (apenas para não quebrar o app na inicialização)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);


