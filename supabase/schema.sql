-- ============================================================================
-- 🛡️ PHANTOM-X ENTERPRISE DATABASE SCHEMA & ROW-LEVEL SECURITY (RLS)
-- ============================================================================
-- Projeto: vabwqlkmngabpwnzrdel (Phantom-X)
-- Objetivo: Isolamento estrito de dados por operador, tabelas blindadas e índices

-- 1. EXTENSÕES OBRIGATÓRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABELA DE PERFIS DE OPERADOR (PROFILES)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nickname TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  phone_country_code TEXT DEFAULT '+55',
  role TEXT DEFAULT 'operator',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  organization_id TEXT,
  organization_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. TABELA DE DOMÍNIOS (DOMAINS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.domains (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  ssl_status TEXT DEFAULT 'valid',
  dns_records JSONB DEFAULT '[]'::jsonb,
  events_count INT DEFAULT 0,
  active_campaigns INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. TABELA DE CAMPANHAS (CAMPAIGNS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain_id TEXT REFERENCES public.domains(id) ON DELETE SET NULL,
  domain_name TEXT,
  status TEXT DEFAULT 'active',
  target_url TEXT NOT NULL,
  fallback_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  total_events INT DEFAULT 0,
  clean_events INT DEFAULT 0,
  bot_events INT DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. TABELA DE EVENTOS DE TRÁFEGO & TELEMETRIA (TRAFFIC_EVENTS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.traffic_events (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  click_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  domain TEXT,
  campaign_id TEXT REFERENCES public.campaigns(id) ON DELETE SET NULL,
  campaign_name TEXT,
  ip TEXT,
  ip_masked TEXT,
  country TEXT,
  country_code TEXT,
  state TEXT,
  state_code TEXT,
  city TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  device TEXT,
  browser TEXT,
  os TEXT,
  referrer TEXT,
  target_url TEXT,
  routed_to TEXT,
  risk_score INT,
  risk_category TEXT,
  classification TEXT,
  decision TEXT,
  asn INT,
  asn_org TEXT,
  detected_layer TEXT,
  http_status INT DEFAULT 200,
  reverse_proxy_delivery BOOLEAN DEFAULT TRUE,
  webgl_renderer TEXT,
  is_headless BOOLEAN DEFAULT FALSE,
  canvas_hash TEXT,
  isp_org TEXT,
  latency_ms INT DEFAULT 14,
  is_threat BOOLEAN DEFAULT FALSE,
  threat_reasons JSONB DEFAULT '[]'::jsonb
);

-- ============================================================================
-- 6. TABELA DE CONFIGURAÇÕES DO CLOAKER (CLOAKER_CONFIGS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cloaker_configs (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  modo TEXT DEFAULT 'AUTOMATICO',
  whitepage_url TEXT NOT NULL,
  oferta_url TEXT NOT NULL,
  paises_permitidos JSONB DEFAULT '["BR"]'::jsonb,
  parametro_utm TEXT DEFAULT '',
  exigir_fbclid BOOLEAN DEFAULT FALSE,
  permitir_mobile BOOLEAN DEFAULT TRUE,
  permitir_desktop BOOLEAN DEFAULT TRUE,
  risco_maximo INT DEFAULT 60,
  proxy_check_api_key TEXT,
  blocked_asns JSONB DEFAULT '[]'::jsonb,
  bot_patterns JSONB DEFAULT '[]'::jsonb,
  enable_client_fingerprint BOOLEAN DEFAULT TRUE,
  block_headless BOOLEAN DEFAULT TRUE,
  block_swift_shader BOOLEAN DEFAULT TRUE,
  client_action TEXT DEFAULT 'redirect_whitepage',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. ÍNDICES DE ALTA PERFORMANCE (QUERY OPTIMIZATION)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_domains_user_id ON public.domains(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_traffic_events_user_id ON public.traffic_events(user_id);
CREATE INDEX IF NOT EXISTS idx_traffic_events_timestamp ON public.traffic_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_traffic_events_click_id ON public.traffic_events(click_id);
CREATE INDEX IF NOT EXISTS idx_cloaker_configs_user_id ON public.cloaker_configs(user_id);

-- ============================================================================
-- 8. ATIVAÇÃO DE ROW LEVEL SECURITY (RLS) EM 100% DAS TABELAS
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloaker_configs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. POLÍTICAS DE RLS ESTREITAS (OPERADOR SÓ ACESSA OS PRÓPRIOS DADOS)
-- ============================================================================

-- PROFILES
DROP POLICY IF EXISTS "Profiles isolation policy" ON public.profiles;
CREATE POLICY "Profiles isolation policy" ON public.profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DOMAINS
DROP POLICY IF EXISTS "Domains isolation policy" ON public.domains;
CREATE POLICY "Domains isolation policy" ON public.domains
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CAMPAIGNS
DROP POLICY IF EXISTS "Campaigns isolation policy" ON public.campaigns;
CREATE POLICY "Campaigns isolation policy" ON public.campaigns
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- TRAFFIC EVENTS
DROP POLICY IF EXISTS "Traffic events isolation policy" ON public.traffic_events;
CREATE POLICY "Traffic events isolation policy" ON public.traffic_events
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CLOAKER CONFIGS
DROP POLICY IF EXISTS "Cloaker configs isolation policy" ON public.cloaker_configs;
CREATE POLICY "Cloaker configs isolation policy" ON public.cloaker_configs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 10. TRIGGER AUTOMÁTICO: NOVO USUÁRIO -> CRIA PERFIL ZERADO
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    nickname,
    email,
    phone,
    phone_country_code,
    role,
    timezone
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'phone_country_code', '+55'),
    'operator',
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'America/Sao_Paulo')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
