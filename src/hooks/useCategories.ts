import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { Category } from "../types";
import { CATEGORIES as INITIAL_CATEGORIES } from "../data";
import {
  generateSlug,
  isExactDuplicate,
  formatCategoryDbError,
  isUUID,
} from "../utils/categoryUtils";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Tentar buscar categorias da tabela 'categories' no Supabase
      let dbCategories: any[] | null = null;
      let catError: any = null;

      const firstAttempt = await supabase
        .from("categories")
        .select("*")
        .order("home_order", { ascending: true })
        .order("name", { ascending: true });

      if (
        firstAttempt.error &&
        (firstAttempt.error.code === "42703" ||
          firstAttempt.error.message?.includes("home_order"))
      ) {
        // Se a coluna home_order ainda não existir (Script 1 sem Script 2), busca ordenado apenas por name
        const retry = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });

        dbCategories = retry.data;
        catError = retry.error;
      } else {
        dbCategories = firstAttempt.data;
        catError = firstAttempt.error;
      }

      if (catError) {
        console.error("[useCategories] fetchCategories error:", catError);
        setError(formatCategoryDbError(catError, "Não foi possível sincronizar com a tabela de categorias."));
      } else {
        setError(null);
      }

      // 2. Buscar contagem de produtos vinculados por categoria
      const { data: productsData } = await supabase
        .from("products")
        .select("id, category, category_id");

      // Mapa de contagem de produtos por category_id e por slug/category text
      const countByCatId = new Map<string, number>();
      const countBySlugOrName = new Map<string, number>();

      if (productsData) {
        for (const p of productsData) {
          if (p.category_id) {
            countByCatId.set(
              p.category_id,
              (countByCatId.get(p.category_id) || 0) + 1
            );
          }
          if (p.category) {
            const raw = p.category.toLowerCase().trim();
            countBySlugOrName.set(
              raw,
              (countBySlugOrName.get(raw) || 0) + 1
            );
            const slg = generateSlug(p.category);
            countBySlugOrName.set(
              slg,
              (countBySlugOrName.get(slg) || 0) + 1
            );
          }
        }
      }

      if (!catError && dbCategories && dbCategories.length > 0) {
        // Mapear dados retornados do Supabase com os campos reais
        const mapped: Category[] = dbCategories.map((c: any) => {
          const countById = countByCatId.get(c.id) || 0;
          const countByName = countBySlugOrName.get((c.slug || "").toLowerCase()) || 0;
          const img = c.image_url || c.image || "";
          return {
            id: c.id,
            name: c.name,
            slug: c.slug,
            active: c.active ?? true,
            description: c.description || "",
            image_url: img,
            image: img,
            is_featured_home: Boolean(c.is_featured_home),
            home_order: typeof c.home_order === "number" ? c.home_order : 0,
            created_at: c.created_at,
            updated_at: c.updated_at,
            productCount: Math.max(countById, countByName),
          };
        });

        setCategories(mapped);
      } else {
        // Fallback apenas para exibição inicial quando a tabela ainda não possui dados ou está pendente
        const initialList: Category[] = INITIAL_CATEGORIES.map((c) => {
          const slug = c.slug || generateSlug(c.name || c.id);
          const count =
            countBySlugOrName.get(slug) ||
            countBySlugOrName.get(c.name.toLowerCase().trim()) ||
            countBySlugOrName.get(c.id.toLowerCase().trim()) ||
            0;
          const img = c.image_url || c.image || "";
          return {
            ...c,
            slug,
            active: c.active ?? true,
            description: c.description || "",
            image_url: img,
            image: img,
            is_featured_home: Boolean(c.is_featured_home),
            home_order: typeof c.home_order === "number" ? c.home_order : 0,
            productCount: count,
          };
        });

        if (productsData) {
          for (const p of productsData) {
            if (p.category) {
              const slug = generateSlug(p.category);
              const exists = initialList.some(
                (item) => item.slug === slug || item.name.toLowerCase() === p.category.toLowerCase()
              );
              if (!exists && slug) {
                initialList.push({
                  id: slug,
                  name: p.category,
                  slug,
                  active: true,
                  description: "",
                  image_url: "",
                  image: "",
                  is_featured_home: false,
                  home_order: 0,
                  productCount: countBySlugOrName.get(slug) || 1,
                });
              }
            }
          }
        }

        setCategories(initialList);
      }
    } catch (err: any) {
      console.error("[useCategories] Erro inesperado ao carregar categorias:", err);
      setError("Não foi possível carregar as categorias.");
      setCategories(INITIAL_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Lista apenas das categorias ativas (para filtros e seleção no produto)
  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.active);
  }, [categories]);

  // Categorias destacadas para a Home (ordenadas por home_order e limitadas a 6)
  // REGRA DEFINITIVA: Exclusivamente as ativas marcadas com is_featured_home = true e com imagem
  const featuredHomeCategories = useMemo(() => {
    return categories
      .filter((c) => c.active && c.is_featured_home && Boolean(c.image_url || c.image))
      .sort((a, b) => (a.home_order ?? 0) - (b.home_order ?? 0))
      .slice(0, 6);
  }, [categories]);

  // Upload de Imagem no Supabase Storage EXCLUSIVAMENTE no bucket 'category-images'
  const uploadCategoryImage = async (file: File): Promise<string> => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Formato inválido. Por favor, envie uma imagem válida (JPG, PNG, WEBP).");
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error("A imagem é muito grande. O limite máximo permitido é de 5MB.");
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() ||
      file.type.split("/")[1] ||
      "jpg";

    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${extension}`;
    const filePath = `categories/${uniqueName}`;

    const { error: uploadError } = await supabase.storage
      .from("category-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("[useCategories] Erro no upload para bucket category-images:", uploadError);
      throw new Error(
        "Não foi possível enviar a imagem da categoria. Verifique o armazenamento do bucket category-images."
      );
    }

    const { data } = supabase.storage.from("category-images").getPublicUrl(filePath);
    if (!data.publicUrl) {
      throw new Error(
        "Não foi possível obter a URL pública da imagem enviada."
      );
    }

    return data.publicUrl;
  };

  // Criar categoria (INSERT no banco public.categories)
  const createCategory = async (
    input: string | {
      name: string;
      description?: string;
      image_url?: string;
      is_featured_home?: boolean;
      home_order?: number;
    }
  ): Promise<{ success: boolean; category?: Category; error?: string }> => {
    const data = typeof input === "string" ? { name: input } : input;
    const trimmed = (data.name || "").trim();

    if (!trimmed) {
      return { success: false, error: "O nome da categoria é obrigatório." };
    }

    const slug = generateSlug(trimmed);

    // Validação de unicidade no frontend
    if (isExactDuplicate(trimmed, categories)) {
      return {
        success: false,
        error: "Essa categoria já existe. Selecione a categoria existente.",
      };
    }

    let finalOrder = 0;

    // Validações para Destaque na Home
    if (data.is_featured_home) {
      if (!data.image_url || !data.image_url.trim()) {
        return {
          success: false,
          error: "Adicione uma imagem à categoria antes de colocá-la em destaque na página inicial.",
        };
      }
      const featuredCount = categories.filter((c) => c.is_featured_home).length;
      if (featuredCount >= 6) {
        return {
          success: false,
          error: "Você pode exibir no máximo 6 categorias na página inicial.",
        };
      }
      finalOrder = typeof data.home_order === "number" ? data.home_order : 1;
      if (finalOrder < 1 || finalOrder > 6) {
        return {
          success: false,
          error: "A ordem de exibição na página inicial deve ser entre 1 e 6.",
        };
      }

      // Se a posição já estiver em uso, realoca a conflitante
      const conflicting = categories.find((c) => c.is_featured_home && c.home_order === finalOrder);
      if (conflicting) {
        const occupied = new Set(
          categories.filter((c) => c.is_featured_home && c.home_order).map((c) => c.home_order)
        );
        occupied.add(finalOrder);
        let freeSlot: number | null = null;
        for (let s = 1; s <= 6; s++) {
          if (!occupied.has(s)) {
            freeSlot = s;
            break;
          }
        }
        if (freeSlot) {
          const { error: confError } = await (
            isUUID(conflicting.id)
              ? supabase.from("categories").update({ home_order: freeSlot }).eq("id", conflicting.id)
              : supabase.from("categories").update({ home_order: freeSlot }).eq("slug", conflicting.slug)
          );
          if (confError) {
            console.error("[CategoryManager] create category conflict resolution error:", confError);
            return {
              success: false,
              error: formatCategoryDbError(confError, "Erro ao reorganizar ordem da categoria conflitante."),
            };
          }
        } else {
          const { error: confError } = await (
            isUUID(conflicting.id)
              ? supabase.from("categories").update({ is_featured_home: false, home_order: 0 }).eq("id", conflicting.id)
              : supabase.from("categories").update({ is_featured_home: false, home_order: 0 }).eq("slug", conflicting.slug)
          );
          if (confError) {
            console.error("[CategoryManager] create category conflict unfeature error:", confError);
            return {
              success: false,
              error: formatCategoryDbError(confError, "Erro ao desocupar posição na Home."),
            };
          }
        }
      }
    }

    try {
      const payload: any = {
        name: trimmed,
        slug,
        active: true,
        description: data.description?.trim() || "",
        image_url: data.image_url?.trim() || "",
        is_featured_home: Boolean(data.is_featured_home),
        home_order: finalOrder,
      };

      const { data: inserted, error: insertError } = await supabase
        .from("categories")
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        console.error("[CategoryManager] create category error:", insertError);
        return {
          success: false,
          error: formatCategoryDbError(insertError, "Erro ao cadastrar categoria no banco de dados."),
        };
      }

      if (!inserted) {
        console.error("[CategoryManager] create category returned no data");
        return {
          success: false,
          error: "Não foi possível confirmar o salvamento da categoria no banco de dados.",
        };
      }

      const newCategory: Category = {
        id: inserted.id,
        name: inserted.name,
        slug: inserted.slug,
        active: inserted.active ?? true,
        description: inserted.description || "",
        image_url: inserted.image_url || "",
        image: inserted.image_url || "",
        is_featured_home: Boolean(inserted.is_featured_home),
        home_order: typeof inserted.home_order === "number" ? inserted.home_order : 0,
        created_at: inserted.created_at,
        updated_at: inserted.updated_at,
        productCount: 0,
      };

      // SOMENTE atualiza o estado React após confirmação positiva do Supabase
      setCategories((prev) => [...prev, newCategory]);
      return { success: true, category: newCategory };
    } catch (err: any) {
      console.error("[CategoryManager] create category exception:", err);
      return {
        success: false,
        error: err.message || "Erro inesperado ao salvar a categoria.",
      };
    }
  };

  // Atualizar categoria com suporte a todos os campos (UPDATE no banco public.categories)
  const updateCategory = async (
    id: string,
    updates: {
      name?: string;
      active?: boolean;
      description?: string;
      image_url?: string | null;
      is_featured_home?: boolean;
      home_order?: number;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    const current = categories.find((c) => c.id === id);
    if (!current) {
      return { success: false, error: "Categoria não encontrada na lista local." };
    }

    const newName = updates.name !== undefined ? updates.name.trim() : current.name;
    const newSlug = updates.name !== undefined ? generateSlug(newName) : current.slug;
    const newActive = updates.active !== undefined ? updates.active : current.active;
    const newDescription = updates.description !== undefined ? updates.description : (current.description || "");
    const newImageUrl = updates.image_url !== undefined ? updates.image_url : (current.image_url || current.image || "");
    
    let newIsFeaturedHome = updates.is_featured_home !== undefined ? updates.is_featured_home : Boolean(current.is_featured_home);
    let newHomeOrder = updates.home_order !== undefined ? updates.home_order : (current.home_order ?? 0);

    if (updates.name && isExactDuplicate(newName, categories.filter((c) => c.id !== id))) {
      return {
        success: false,
        error: "Já existe outra categoria com este mesmo nome ou slug.",
      };
    }

    // Regras de validação para Destaque na Home
    if (newIsFeaturedHome) {
      // 1. Imagem obrigatória para destaque
      if (!newImageUrl || !newImageUrl.trim()) {
        return {
          success: false,
          error: "Adicione uma imagem à categoria antes de colocá-la em destaque na página inicial.",
        };
      }

      // 2. Limite máximo de 6 categorias destacadas
      const otherFeatured = categories.filter((c) => c.id !== id && c.is_featured_home);
      if (otherFeatured.length >= 6) {
        return {
          success: false,
          error: "Você pode exibir no máximo 6 categorias na página inicial.",
        };
      }

      // 3. Ordem deve estar rigorosamente entre 1 e 6
      if (newHomeOrder < 1 || newHomeOrder > 6) {
        return {
          success: false,
          error: "A ordem de exibição na página inicial deve ser entre 1 e 6.",
        };
      }
    } else {
      newHomeOrder = 0;
    }

    // Se a imagem for removida e estiver como destaque, desativa o destaque da Home
    if (!newImageUrl && newIsFeaturedHome) {
      newIsFeaturedHome = false;
      newHomeOrder = 0;
    }

    try {
      // Resolução segura de colisão para a restrição UNIQUE (home_order) WHERE is_featured_home = true
      if (newIsFeaturedHome) {
        const conflicting = categories.find(
          (c) => c.id !== id && c.is_featured_home && c.home_order === newHomeOrder
        );

        if (conflicting) {
          const previousOrder =
            current.is_featured_home &&
            current.home_order &&
            current.home_order >= 1 &&
            current.home_order <= 6
              ? current.home_order
              : null;

          if (previousOrder && previousOrder !== newHomeOrder) {
            // Troca direta de posições entre as duas categorias:
            // 1. Libera temporariamente a categoria conflitante para desocupar a restrição UNIQUE
            const { error: swapErr1 } = await (
              isUUID(conflicting.id)
                ? supabase.from("categories").update({ is_featured_home: false, home_order: 0 }).eq("id", conflicting.id)
                : supabase.from("categories").update({ is_featured_home: false, home_order: 0 }).eq("slug", conflicting.slug)
            );

            if (swapErr1) {
              console.error("[CategoryManager] update category swap step 1 error:", swapErr1);
              await fetchCategories();
              return {
                success: false,
                error: formatCategoryDbError(swapErr1, "Erro ao desocupar posição da categoria conflitante."),
              };
            }

            // 2. Coloca a categoria atual na posição desejada
            const { data: updatedTarget, error: swapErr2 } = await (
              isUUID(id)
                ? supabase.from("categories").update({
                    name: newName,
                    slug: newSlug,
                    active: newActive,
                    description: newDescription,
                    image_url: newImageUrl,
                    is_featured_home: true,
                    home_order: newHomeOrder,
                  }).eq("id", id)
                : supabase.from("categories").update({
                    name: newName,
                    slug: newSlug,
                    active: newActive,
                    description: newDescription,
                    image_url: newImageUrl,
                    is_featured_home: true,
                    home_order: newHomeOrder,
                  }).eq("slug", id)
            )
              .select()
              .single();

            if (swapErr2 || !updatedTarget) {
              console.error("[CategoryManager] update category swap step 2 error:", swapErr2);
              await fetchCategories();
              return {
                success: false,
                error: formatCategoryDbError(swapErr2, "Erro ao atualizar a categoria principal no banco."),
              };
            }

            // 3. Reativa a categoria conflitante na posição anterior
            const { data: updatedConflicting, error: swapErr3 } = await (
              isUUID(conflicting.id)
                ? supabase.from("categories").update({
                    is_featured_home: true,
                    home_order: previousOrder,
                  }).eq("id", conflicting.id)
                : supabase.from("categories").update({
                    is_featured_home: true,
                    home_order: previousOrder,
                  }).eq("slug", conflicting.slug)
            )
              .select()
              .single();

            if (swapErr3 || !updatedConflicting) {
              console.error("[CategoryManager] update category swap step 3 error:", swapErr3);
              await fetchCategories();
              return {
                success: false,
                error: formatCategoryDbError(swapErr3, "Erro ao reposicionar a categoria conflitante."),
              };
            }

            // SÓ ATUALIZA ESTADO REACT SE TODAS AS ETAPAS PERSISTIRAM COM SUCESSO
            setCategories((prev) =>
              prev.map((c) => {
                if (c.id === id) {
                  return {
                    ...c,
                    name: updatedTarget.name,
                    slug: updatedTarget.slug,
                    active: updatedTarget.active ?? newActive,
                    description: updatedTarget.description || "",
                    image_url: updatedTarget.image_url || "",
                    image: updatedTarget.image_url || "",
                    is_featured_home: true,
                    home_order: newHomeOrder,
                    updated_at: updatedTarget.updated_at,
                  };
                }
                if (c.id === conflicting.id) {
                  return {
                    ...c,
                    is_featured_home: true,
                    home_order: previousOrder,
                    updated_at: updatedConflicting.updated_at,
                  };
                }
                return c;
              })
            );
            return { success: true };
          } else {
            // Encontra outro slot livre de 1 a 6 para a categoria conflitante
            const occupied = new Set(
              categories
                .filter(
                  (c) =>
                    c.id !== id &&
                    c.id !== conflicting.id &&
                    c.is_featured_home &&
                    c.home_order
                )
                .map((c) => c.home_order)
            );
            occupied.add(newHomeOrder);

            let freeSlot: number | null = null;
            for (let s = 1; s <= 6; s++) {
              if (!occupied.has(s)) {
                freeSlot = s;
                break;
              }
            }

            let conflictingTargetOrder = 0;
            let conflictingIsFeatured = false;

            if (freeSlot !== null) {
              conflictingTargetOrder = freeSlot;
              conflictingIsFeatured = true;
              const { error: moveErr } = await (
                isUUID(conflicting.id)
                  ? supabase.from("categories").update({ is_featured_home: true, home_order: freeSlot }).eq("id", conflicting.id)
                  : supabase.from("categories").update({ is_featured_home: true, home_order: freeSlot }).eq("slug", conflicting.slug)
              );

              if (moveErr) {
                console.error("[CategoryManager] update category slot move error:", moveErr);
                await fetchCategories();
                return {
                  success: false,
                  error: formatCategoryDbError(moveErr, "Erro ao realocar categoria conflitante."),
                };
              }
            } else {
              conflictingTargetOrder = 0;
              conflictingIsFeatured = false;
              const { error: unfeatureErr } = await (
                isUUID(conflicting.id)
                  ? supabase.from("categories").update({ is_featured_home: false, home_order: 0 }).eq("id", conflicting.id)
                  : supabase.from("categories").update({ is_featured_home: false, home_order: 0 }).eq("slug", conflicting.slug)
              );

              if (unfeatureErr) {
                console.error("[CategoryManager] update category unfeature error:", unfeatureErr);
                await fetchCategories();
                return {
                  success: false,
                  error: formatCategoryDbError(unfeatureErr, "Erro ao desmarcar destaque conflitante."),
                };
              }
            }

            // Atualiza a categoria principal
            const payload: any = {
              name: newName,
              slug: newSlug,
              active: newActive,
              description: newDescription,
              image_url: newImageUrl,
              is_featured_home: true,
              home_order: newHomeOrder,
            };

            const { data: updatedTarget, error: updateTargetErr } = await (
              isUUID(id)
                ? supabase.from("categories").update(payload).eq("id", id)
                : supabase.from("categories").update(payload).eq("slug", id)
            )
              .select()
              .single();

            if (updateTargetErr || !updatedTarget) {
              console.error("[CategoryManager] update category target error:", updateTargetErr);
              await fetchCategories();
              return {
                success: false,
                error: formatCategoryDbError(updateTargetErr, "Erro ao atualizar categoria no banco de dados."),
              };
            }

            // SOMENTE atualiza o estado React após TODAS as operações serem confirmadas no Supabase
            setCategories((prev) =>
              prev.map((c) => {
                if (c.id === id) {
                  return {
                    ...c,
                    name: updatedTarget.name,
                    slug: updatedTarget.slug,
                    active: updatedTarget.active ?? newActive,
                    description: updatedTarget.description || "",
                    image_url: updatedTarget.image_url || "",
                    image: updatedTarget.image_url || "",
                    is_featured_home: true,
                    home_order: newHomeOrder,
                    updated_at: updatedTarget.updated_at,
                  };
                }
                if (c.id === conflicting.id) {
                  return {
                    ...c,
                    is_featured_home: conflictingIsFeatured,
                    home_order: conflictingTargetOrder,
                  };
                }
                return c;
              })
            );

            return { success: true };
          }
        }
      }

      const payload: any = {
        name: newName,
        slug: newSlug,
        active: newActive,
        description: newDescription,
        image_url: newImageUrl,
        is_featured_home: newIsFeaturedHome,
        home_order: newHomeOrder,
      };

      const { data: updated, error: updateError } = await (
        isUUID(id)
          ? supabase.from("categories").update(payload).eq("id", id)
          : supabase.from("categories").update(payload).eq("slug", id)
      )
        .select()
        .single();

      if (updateError) {
        console.error("[CategoryManager] update category error:", updateError);
        await fetchCategories();
        return {
          success: false,
          error: formatCategoryDbError(updateError, "Erro ao atualizar categoria no banco de dados."),
        };
      }

      if (!updated) {
        console.error("[CategoryManager] update category: no row returned for id:", id);
        await fetchCategories();
        return {
          success: false,
          error: "Categoria não encontrada no banco de dados para atualização.",
        };
      }

      // SOMENTE atualiza o estado React após confirmação positiva do Supabase
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                name: updated.name,
                slug: updated.slug,
                active: updated.active ?? newActive,
                description: updated.description || "",
                image_url: updated.image_url || "",
                image: updated.image_url || "",
                is_featured_home: Boolean(updated.is_featured_home),
                home_order: typeof updated.home_order === "number" ? updated.home_order : 0,
                updated_at: updated.updated_at,
              }
            : c
        )
      );

      return { success: true };
    } catch (err: any) {
      console.error("[CategoryManager] update category exception:", err);
      await fetchCategories();
      return {
        success: false,
        error: err.message || "Erro inesperado ao atualizar categoria.",
      };
    }
  };

  // Alternar status ativo/inativo
  const toggleActive = async (id: string, active: boolean) => {
    return updateCategory(id, { active });
  };

  // Excluir categoria (DELETE no banco public.categories, apenas se tiver 0 produtos associados)
  const deleteCategory = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    const target = categories.find((c) => c.id === id);
    if (!target) {
      return { success: false, error: "Categoria não encontrada." };
    }

    if (target.productCount && target.productCount > 0) {
      return {
        success: false,
        error: `Não é possível excluir esta categoria porque existem ${target.productCount} produto(s) associado(s) a ela. Desative a categoria em vez de excluí-la.`,
      };
    }

    try {
      const { data: deleted, error: delError } = await (
        isUUID(id)
          ? supabase.from("categories").delete().eq("id", id)
          : supabase.from("categories").delete().eq("slug", id)
      ).select();

      if (delError) {
        console.error("[CategoryManager] delete category error:", delError);
        return {
          success: false,
          error: formatCategoryDbError(delError, "Erro ao excluir categoria do banco de dados."),
        };
      }

      if (!deleted || deleted.length === 0) {
        console.warn("[CategoryManager] delete category: nenhuma linha afetada no banco para id:", id);
        return {
          success: false,
          error: "Não foi possível excluir a categoria. Nenhum registro foi alterado.",
        };
      }

      // SOMENTE atualiza o estado React após confirmação real da exclusão
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return { success: true };
    } catch (err: any) {
      console.error("[CategoryManager] delete category exception:", err);
      return {
        success: false,
        error: err.message || "Erro inesperado ao excluir categoria.",
      };
    }
  };

  return {
    categories,
    activeCategories,
    featuredHomeCategories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    toggleActive,
    deleteCategory,
    uploadCategoryImage,
  };
}
