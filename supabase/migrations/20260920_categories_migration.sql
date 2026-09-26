-- ====================================================================
-- MIGRATION: 20260920_categories_migration.sql
-- Módulo: Gerenciamento Estruturado de Categorias e Referência por Chave Estrangeira
-- Oficina do Sim
-- ====================================================================

-- 1. Criação da tabela categories com constraints seguras
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices únicos para impedir duplicatas no banco (slug e nome normalizados)
CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_unique_idx ON public.categories (lower(trim(slug)));
CREATE UNIQUE INDEX IF NOT EXISTS categories_name_unique_idx ON public.categories (lower(trim(name)));

-- 2. Trigger de updated_at para manter carimbo de data/hora atualizado
CREATE OR REPLACE FUNCTION public.set_category_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_categories_updated_at ON public.categories;
CREATE TRIGGER trigger_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.set_category_updated_at();

-- 3. Adicionar coluna category_id na tabela products (referência com ON DELETE RESTRICT)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'category_id'
    ) THEN
        ALTER TABLE public.products 
        ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

-- 4. Inserir categorias existentes no catálogo da Oficina do Sim (idempotente)
INSERT INTO public.categories (name, slug, active)
VALUES
    ('Kits para Padrinhos', 'kits-padrinhos', true),
    ('Itens para Montagem', 'itens-montagem', true),
    ('Lembrancinhas', 'lembrancinhas', true),
    ('Taças e Copos', 'tacas-copos', true),
    ('Acessórios da Noiva', 'acessorios-noiva', true),
    ('Acessórios', 'acessorios', true),
    ('Topos de Bolo', 'topos-bolo', true),
    ('Velas Aromáticas', 'velas-aromaticas', true),
    ('Embalagens', 'embalagens', true),
    ('Convites', 'convites', true),
    ('Caixas Personalizadas', 'caixas-personalizadas', true),
    ('Teste', 'teste', true)
ON CONFLICT (lower(trim(slug))) DO UPDATE 
SET active = EXCLUDED.active;

-- 5. Migração Segura: Associar os produtos existentes às categorias criadas
-- Mapeamento por slug normalizado ou nome existente
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category_id IS NULL
  AND (
    lower(trim(p.category)) = c.slug
    OR lower(trim(p.category)) = lower(trim(c.name))
    OR (lower(trim(p.category)) = 'caixas-personalizadas' AND c.slug = 'caixas-personalizadas')
    OR (lower(trim(p.category)) = 'acessórios' AND c.slug = 'acessorios')
    OR (lower(trim(p.category)) = 'teste' AND c.slug = 'teste')
  );

-- 6. Configuração de RLS (Row Level Security) para a tabela categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Política de Leitura (SELECT):
-- - Usuários anônimos e clientes autenticados podem ver categorias ativas.
-- - Usuários com role 'admin' ou 'owner' em profiles podem ver todas as categorias (incluindo inativas).
DROP POLICY IF EXISTS "Categorias ativas visíveis para todos ou todas para admin" ON public.categories;
CREATE POLICY "Categorias ativas visíveis para todos ou todas para admin"
ON public.categories FOR SELECT
USING (
    active = true
    OR (
        auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = auth.uid()
              AND public.profiles.role IN ('admin', 'owner')
        )
    )
);

-- Políticas de Modificação (INSERT, UPDATE, DELETE):
-- Apenas admin e owner podem criar, atualizar e excluir categorias.
DROP POLICY IF EXISTS "Apenas admin e owner podem inserir categorias" ON public.categories;
CREATE POLICY "Apenas admin e owner podem inserir categorias"
ON public.categories FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = auth.uid()
          AND public.profiles.role IN ('admin', 'owner')
    )
);

DROP POLICY IF EXISTS "Apenas admin e owner podem atualizar categorias" ON public.categories;
CREATE POLICY "Apenas admin e owner podem atualizar categorias"
ON public.categories FOR UPDATE
USING (
    auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = auth.uid()
          AND public.profiles.role IN ('admin', 'owner')
    )
)
WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = auth.uid()
          AND public.profiles.role IN ('admin', 'owner')
    )
);

DROP POLICY IF EXISTS "Apenas admin e owner podem deletar categorias" ON public.categories;
CREATE POLICY "Apenas admin e owner podem deletar categorias"
ON public.categories FOR DELETE
USING (
    auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = auth.uid()
          AND public.profiles.role IN ('admin', 'owner')
    )
);

-- ====================================================================
-- Fim da migration
-- ====================================================================
