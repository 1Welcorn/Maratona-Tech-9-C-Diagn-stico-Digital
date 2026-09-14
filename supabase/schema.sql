-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: diagnostic_forms
CREATE TABLE public.diagnostic_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    group_name TEXT,
    content_analyzed TEXT,
    knowledge_area TEXT,
    problem_description TEXT,
    data_types TEXT[],
    data_which TEXT,
    data_usage TEXT,
    algorithm_influence TEXT[],
    algorithm_explain TEXT,
    risk_informacional TEXT,
    risk_emocional TEXT,
    risk_social TEXT,
    cause_types TEXT[],
    cause_explain TEXT,
    strategy_professional TEXT,
    strategy_school TEXT,
    checklist_n2 TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX diagnostic_forms_user_id_idx ON public.diagnostic_forms(user_id);

-- Table: coexistence_guides
CREATE TABLE public.coexistence_guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    group_name TEXT,
    content_analyzed TEXT,
    problem_description TEXT,
    cause_identification TEXT,
    risks_school TEXT,
    awareness_strategies TEXT,
    mitigation_proposals TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX coexistence_guides_user_id_idx ON public.coexistence_guides(user_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coexistence_guides ENABLE ROW LEVEL SECURITY;

-- Trigger Function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'student');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: on_auth_user_created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger Function: touch_updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS diagnostic_forms_updated_at ON public.diagnostic_forms;
CREATE TRIGGER diagnostic_forms_updated_at
    BEFORE UPDATE ON public.diagnostic_forms
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS coexistence_guides_updated_at ON public.coexistence_guides;
CREATE TRIGGER coexistence_guides_updated_at
    BEFORE UPDATE ON public.coexistence_guides
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RPC: become_teacher
CREATE OR REPLACE FUNCTION public.become_teacher(p_password TEXT)
RETURNS VOID AS $$
DECLARE
    v_uid UUID;
    v_profile_exists BOOLEAN;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Não autenticado';
    END IF;
    
    IF p_password != '250286' THEN
        RAISE EXCEPTION 'Senha de acesso incorreta';
    END IF;

    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_uid) INTO v_profile_exists;
    IF NOT v_profile_exists THEN
        RAISE EXCEPTION 'Perfil não encontrado';
    END IF;

    UPDATE public.profiles SET role = 'teacher' WHERE id = v_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: get_profiles_by_ids
CREATE OR REPLACE FUNCTION public.get_profiles_by_ids(p_ids UUID[])
RETURNS TABLE(id UUID, email TEXT, role TEXT) AS $$
BEGIN
    RETURN QUERY SELECT p.id, p.email, p.role FROM public.profiles p WHERE p.id = ANY(p_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies: profiles
CREATE POLICY "usuário vê próprio perfil" ON public.profiles FOR SELECT USING (auth.uid() = id);
-- GRANT UPDATE apenas em email via ROLE policies (or RLS with check)
CREATE POLICY "usuário atualiza próprio perfil email" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
REVOKE UPDATE (role) ON public.profiles FROM authenticated, anon;
GRANT UPDATE (email) ON public.profiles TO authenticated;

-- RLS Policies: diagnostic_forms
CREATE POLICY "dono vê próprio registro OU teacher vê todos diagnostic" ON public.diagnostic_forms FOR SELECT USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "apenas dono insert diagnostic" ON public.diagnostic_forms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "apenas dono update diagnostic" ON public.diagnostic_forms FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "apenas dono delete diagnostic" ON public.diagnostic_forms FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: coexistence_guides
CREATE POLICY "dono vê próprio registro OU teacher vê todos coexistence" ON public.coexistence_guides FOR SELECT USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "apenas dono insert coexistence" ON public.coexistence_guides FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "apenas dono update coexistence" ON public.coexistence_guides FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "apenas dono delete coexistence" ON public.coexistence_guides FOR DELETE USING (auth.uid() = user_id);
