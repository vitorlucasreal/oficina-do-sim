-- ====================================================================
-- MIGRATION: 20260922_categories_home_order_constraints.sql
-- Módulo: Proteção e Integridade da Ordem das Categorias na Home (1 a 6)
-- Oficina do Sim
-- ====================================================================

-- 1. SANITIZAÇÃO SEGURA DOS DADOS EXISTENTES (SEM DESTRUIÇÃO DE DADOS OU IDs)
-- 1.1 Garantir que categorias NÃO destacadas tenham home_order = 0
UPDATE public.categories
SET home_order = 0
WHERE is_featured_home = false AND (home_order IS NULL OR home_order <> 0);

-- 1.2 Categorias destacadas que possuam home_order nulo ou fora da faixa 1-6 são desmarcadas
UPDATE public.categories
SET is_featured_home = false, home_order = 0
WHERE is_featured_home = true AND (home_order IS NULL OR home_order < 1 OR home_order > 6);

-- 1.3 Se houver categorias destacadas duplicadas na mesma posição (ex: duas na posição 1),
-- preserva a mais recentemente atualizada e desmarca as duplicadas excedentes
WITH ranked_featured AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY home_order 
               ORDER BY updated_at DESC, created_at DESC
           ) as rn
    FROM public.categories
    WHERE is_featured_home = true AND home_order BETWEEN 1 AND 6
)
UPDATE public.categories
SET is_featured_home = false, home_order = 0
WHERE id IN (
    SELECT id FROM ranked_featured WHERE rn > 1
);

-- 2. CONSTRAINT DE FAIXA (CHECK CONSTRAINT)
-- Garante que uma categoria marcada como destaque (is_featured_home = true)
-- OBRIGATORIAMENTE tenha home_order entre 1 e 6.
-- Categorias não destacadas continuam livres com home_order = 0.
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

-- 3. ÍNDICE ÚNICO PARCIAL (UNIQUE CONSTRAINT / INDEX)
-- Garante que duas categorias em destaque NUNCA possam ocupar a mesma posição (1 a 6).
-- A unicidade se aplica EXCLUSIVAMENTE quando is_featured_home = true.
DROP INDEX IF EXISTS public.uq_categories_featured_home_order;
CREATE UNIQUE INDEX uq_categories_featured_home_order 
ON public.categories (home_order) 
WHERE is_featured_home = true;
