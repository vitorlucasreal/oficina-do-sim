-- ====================================================================
-- MIGRATION: 20260922_categories_home_featured.sql
-- Módulo: Gestão Estrutural de Categorias da Home (Imagem, Destaque e Ordem)
-- Oficina do Sim
-- ====================================================================

-- 1. Adicionar colunas incrementais na tabela public.categories (idempotente)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'description'
    ) THEN
        ALTER TABLE public.categories ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.categories ADD COLUMN image_url TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'is_featured_home'
    ) THEN
        ALTER TABLE public.categories ADD COLUMN is_featured_home BOOLEAN NOT NULL DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'home_order'
    ) THEN
        ALTER TABLE public.categories ADD COLUMN home_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Índice de performance para consulta rápida de categorias da Home
CREATE INDEX IF NOT EXISTS idx_categories_home_featured 
ON public.categories (is_featured_home, home_order) 
WHERE is_featured_home = true;

-- 3. Criação do bucket de storage 'category-images' no Supabase Storage (EXCLUSIVO para categorias)
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Políticas de RLS para o bucket de imagens de categorias (storage.objects)
-- Leitura pública para que qualquer visitante veja as fotos das categorias na Home
DROP POLICY IF EXISTS "Imagens de categorias públicas para visualização" ON storage.objects;
CREATE POLICY "Imagens de categorias públicas para visualização"
ON storage.objects FOR SELECT
USING (bucket_id = 'category-images');

-- Upload / edição / exclusão de imagens de categorias restrito a 'admin' e 'owner'
DROP POLICY IF EXISTS "Apenas admin e owner podem gerenciar imagens de categorias" ON storage.objects;
CREATE POLICY "Apenas admin e owner podem gerenciar imagens de categorias"
ON storage.objects FOR ALL
USING (
    bucket_id = 'category-images'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = auth.uid()
          AND public.profiles.role IN ('admin', 'owner')
    )
)
WITH CHECK (
    bucket_id = 'category-images'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = auth.uid()
          AND public.profiles.role IN ('admin', 'owner')
    )
);

-- 5. Atualização/Migração inicial: dados das 6 categorias oficiais em destaque na Home
UPDATE public.categories SET
    description = 'Conjuntos completos e sofisticados para convidar ou agradecer seus padrinhos de forma inesquecível.',
    image_url = 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=600',
    is_featured_home = true,
    home_order = 1
WHERE slug = 'kits-padrinhos' AND (image_url IS NULL OR image_url = '');

UPDATE public.categories SET
    description = 'Produtos avulsos de alta qualidade para você compor sua caixa de forma livre e criativa.',
    image_url = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=600',
    is_featured_home = true,
    home_order = 2
WHERE slug = 'itens-montagem' AND (image_url IS NULL OR image_url = '');

UPDATE public.categories SET
    description = 'Mimos delicados para encantar seus convidados e eternizar a memória do seu grande dia.',
    image_url = 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600',
    is_featured_home = true,
    home_order = 3
WHERE slug = 'lembrancinhas' AND (image_url IS NULL OR image_url = '');

UPDATE public.categories SET
    description = 'Cristais e vidros personalizados com gravação permanente para brindar em alto estilo.',
    image_url = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600',
    is_featured_home = true,
    home_order = 4
WHERE slug = 'tacas-copos' AND (image_url IS NULL OR image_url = '');

UPDATE public.categories SET
    description = 'Cabides gravados, robes de cetim, caixas de alianças e mimos exclusivos para o seu dia de noiva.',
    image_url = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600',
    is_featured_home = true,
    home_order = 5
WHERE slug = 'acessorios-noiva' AND (image_url IS NULL OR image_url = '');

UPDATE public.categories SET
    description = 'Terços, acessórios e detalhes especiais para noivos e padrinhos.',
    image_url = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600',
    is_featured_home = true,
    home_order = 6
WHERE slug = 'acessorios' AND (image_url IS NULL OR image_url = '');

-- 6. CONSTRAINT DE FAIXA (CHECK CONSTRAINT)
-- Garante que quando is_featured_home = true, home_order esteja entre 1 e 6
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'chk_categories_home_order_range' 
          AND table_name = 'categories'
    ) THEN
        ALTER TABLE public.categories DROP CONSTRAINT chk_categories_home_order_range;
    END IF;

    ALTER TABLE public.categories
    ADD CONSTRAINT chk_categories_home_order_range
    CHECK (
        is_featured_home = false 
        OR (home_order >= 1 AND home_order <= 6)
    );
END $$;

-- 7. ÍNDICE ÚNICO PARCIAL (UNIQUE INDEX)
-- Garante que duas categorias em destaque nunca ocupem a mesma posição na Home
DROP INDEX IF EXISTS public.uq_categories_featured_home_order;
CREATE UNIQUE INDEX uq_categories_featured_home_order 
ON public.categories (home_order) 
WHERE is_featured_home = true;
