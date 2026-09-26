/**
 * categoryUtils.ts
 * Utilitários para normalização de slugs, detecção de duplicatas
 * e verificação de categorias semelhantes (sem inferência forçada).
 */

/**
 * Valida se uma string é um UUID válido no formato v4/padrão.
 */
export function isUUID(str?: string | null): boolean {
  if (!str || typeof str !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
}

/**
 * Gera um slug normalizado e limpo a partir de qualquer string.
 * Ex: "  Caixas Personalizadas! " -> "caixas-personalizadas"
 * Ex: "ROUPAS" -> "roupas"
 * Ex: "Acessórios da Noiva" -> "acessorios-da-noiva"
 */
export function generateSlug(text: string): string {
  if (!text) return "";

  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
    .replace(/[\s_]+/g, "-") // Espaços e underscores viram traço
    .replace(/-+/g, "-") // Múltiplos traços viram um só
    .replace(/^-+|-+$/g, ""); // Remove traço inicial/final
}

/**
 * Calcula a distância de Levenshtein entre duas strings.
 */
function levenshteinDistance(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0));

  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let j = 0; j <= bn; j++) matrix[j][0] = j;

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // inserção
        matrix[j - 1][i] + 1, // remoção
        matrix[j - 1][i - 1] + cost // substituição
      );
    }
  }

  return matrix[bn][an];
}

/**
 * Verifica se já existe uma categoria idêntica (mesmo slug ou mesmo nome normalizado).
 */
export function isExactDuplicate(
  name: string,
  categories: Array<{ name: string; slug: string }>
): boolean {
  const targetSlug = generateSlug(name);
  const targetNormalized = name.trim().toLowerCase();

  return categories.some((cat) => {
    return (
      cat.slug.toLowerCase() === targetSlug ||
      cat.name.trim().toLowerCase() === targetNormalized
    );
  });
}

/**
 * Identifica se existe uma categoria semelhante, mas não idêntica.
 * Ex: "Roupas" e "Roupa" -> Semelhante
 * Ex: "Vela Aromática" e "Velas Aromáticas" -> Semelhante
 * Retorna a categoria encontrada ou null se não houver similaridade.
 */
export function findSimilarCategory<T extends { name: string; slug: string }>(
  name: string,
  categories: T[]
): T | null {
  const targetSlug = generateSlug(name);
  const targetNormalized = name.trim().toLowerCase();

  if (!targetSlug) return null;

  for (const cat of categories) {
    const catSlug = generateSlug(cat.slug || cat.name);
    const catNormalized = cat.name.trim().toLowerCase();

    // Se for idêntico, a validação de duplicata é quem trata
    if (catSlug === targetSlug || catNormalized === targetNormalized) {
      continue;
    }

    // 1. Singular/Plural simples (termina com 's')
    if (
      catSlug + "s" === targetSlug ||
      targetSlug + "s" === catSlug ||
      catSlug.replace(/s$/, "") === targetSlug.replace(/s$/, "")
    ) {
      return cat;
    }

    // 2. Um contém o outro como prefixo/sufixo significativo (>= 4 caracteres)
    if (
      (catSlug.length >= 4 && targetSlug.startsWith(catSlug)) ||
      (targetSlug.length >= 4 && catSlug.startsWith(targetSlug))
    ) {
      return cat;
    }

    // 3. Distância de Levenshtein pequena para palavras de comprimento similar
    const dist = levenshteinDistance(targetSlug, catSlug);
    const maxLen = Math.max(targetSlug.length, catSlug.length);

    if (maxLen >= 5 && dist <= 2) {
      return cat;
    }
  }

  return null;
}

/**
 * Formata erros retornados pelo Supabase/PostgreSQL de forma legível e clara para o painel administrativo.
 */
export function formatCategoryDbError(
  error: any,
  fallback = "Erro ao processar operação no banco de dados."
): string {
  if (!error) return fallback;
  const msg = typeof error === "string" ? error : error.message || "";
  const code = error.code || "";

  if (code === "PGRST205" || msg.includes("Could not find the table 'public.categories'")) {
    return "A tabela 'public.categories' não foi encontrada no Supabase (código PGRST205). Certifique-se de executar a migration de categorias no Supabase SQL Editor para habilitar a persistência permanente.";
  }
  if (code === "42501" || msg.includes("permission denied") || msg.includes("row-level security")) {
    return "Permissão negada pelo banco de dados (código 42501). Apenas administradores autenticados têm permissão para criar, editar ou excluir categorias.";
  }
  if (code === "23505" || msg.includes("duplicate key") || msg.includes("unique")) {
    if (msg.includes("home_order") || msg.includes("uq_categories_featured_home_order")) {
      return "Já existe outra categoria em destaque ocupando esta posição na Home. Escolha outra ordem de 1 a 6.";
    }
    if (msg.includes("slug") || msg.includes("name")) {
      return "Já existe uma categoria cadastrada com este mesmo nome ou slug.";
    }
    return "Violação de registro único: já existe um registro com esses dados no banco.";
  }
  if (code === "23514" || msg.includes("chk_categories_home_order_range")) {
    return "A ordem de exibição na Home deve ser um número inteiro entre 1 e 6 para categorias em destaque.";
  }
  if (code === "22P02" || msg.includes("invalid input syntax for type uuid")) {
    return "Identificador da categoria inválido no banco de dados (esperado formato UUID).";
  }
  if (code === "PGRST116") {
    return "Nenhuma categoria correspondente foi encontrada no banco de dados para a operação.";
  }
  return msg || fallback;
}
