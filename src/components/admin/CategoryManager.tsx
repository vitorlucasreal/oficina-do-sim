import React, { useState, useMemo, useRef } from "react";
import {
  Tag,
  Plus,
  Edit2,
  Check,
  X,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Search,
  Package,
  Loader2,
  Star,
  Upload,
  Image as ImageIcon,
  ArrowUpDown,
  Home,
  HelpCircle,
} from "lucide-react";
import { Category } from "../../types";
import { useCategories } from "../../hooks/useCategories";
import {
  generateSlug,
  isExactDuplicate,
  findSimilarCategory,
} from "../../utils/categoryUtils";

export default function CategoryManager() {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    toggleActive,
    deleteCategory,
    uploadCategoryImage,
    refetch,
  } = useCategories();

  // Busca e Filtros
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "featured">("all");

  // Feedback geral no topo
  const [actionAlert, setActionAlert] = useState<{
    type: "error" | "warning" | "success";
    message: string;
  } | null>(null);

  // Novo cadastro
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [newCategoryImageUrl, setNewCategoryImageUrl] = useState("");
  const [newCategoryFeatured, setNewCategoryFeatured] = useState(false);
  const [newCategoryOrder, setNewCategoryOrder] = useState<number>(1);
  const [isUploadingNewImage, setIsUploadingNewImage] = useState(false);
  const [createFeedback, setCreateFeedback] = useState<{
    type: "error" | "warning" | "success";
    message: string;
    similarCategory?: Category;
  } | null>(null);

  // Modal / Edição completa de categoria
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editHomeOrder, setEditHomeOrder] = useState<number>(1);
  const [editActive, setEditActive] = useState(true);
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmação de exclusão
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Referências para inputs de arquivo ocultos
  const fileInputNewRef = useRef<HTMLInputElement | null>(null);
  const fileInputEditRef = useRef<HTMLInputElement | null>(null);

  // Categorias destacadas para a Home atualmente (máximo 6)
  const homeFeaturedCategories = useMemo(() => {
    return categories
      .filter((c) => c.is_featured_home)
      .sort((a, b) => (a.home_order ?? 0) - (b.home_order ?? 0));
  }, [categories]);

  // Quantidade de destaques ativos
  const totalFeaturedCount = homeFeaturedCategories.length;

  // Categorias filtradas para a tabela
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.slug.toLowerCase().includes(search.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && cat.active) ||
        (statusFilter === "inactive" && !cat.active) ||
        (statusFilter === "featured" && cat.is_featured_home);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  // Handler de validação em tempo real ao digitar nova categoria
  const handleNewNameChange = (val: string) => {
    setNewCategoryName(val);
    setCreateFeedback(null);

    const trimmed = val.trim();
    if (!trimmed) return;

    if (isExactDuplicate(trimmed, categories)) {
      setCreateFeedback({
        type: "error",
        message: "Essa categoria já existe. Escolha outro nome ou selecione a existente.",
      });
      return;
    }

    const similar = findSimilarCategory(trimmed, categories);
    if (similar) {
      setCreateFeedback({
        type: "warning",
        message: `Já existe uma categoria semelhante: "${similar.name}".`,
        similarCategory: similar,
      });
    }
  };

  // Upload para Nova Categoria
  const handleUploadNewImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingNewImage(true);
      setCreateFeedback(null);
      const url = await uploadCategoryImage(file);
      setNewCategoryImageUrl(url);
    } catch (err: any) {
      setCreateFeedback({
        type: "error",
        message: err.message || "Falha no envio da imagem.",
      });
    } finally {
      setIsUploadingNewImage(false);
      if (fileInputNewRef.current) fileInputNewRef.current.value = "";
    }
  };

  // Upload para Edição de Categoria
  const handleUploadEditImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingEditImage(true);
      setEditModalError(null);
      const url = await uploadCategoryImage(file);
      setEditImageUrl(url);
    } catch (err: any) {
      setEditModalError(err.message || "Falha no envio da imagem.");
    } finally {
      setIsUploadingEditImage(false);
      if (fileInputEditRef.current) fileInputEditRef.current.value = "";
    }
  };

  // Criar categoria
  const handleCreate = async (force: boolean = false) => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setCreateFeedback({
        type: "error",
        message: "Por favor, digite o nome da categoria.",
      });
      return;
    }

    if (isExactDuplicate(trimmed, categories)) {
      setCreateFeedback({
        type: "error",
        message: "Essa categoria já existe. Selecione a categoria existente.",
      });
      return;
    }

    if (newCategoryFeatured) {
      if (!newCategoryImageUrl) {
        setCreateFeedback({
          type: "error",
          message: "Adicione uma imagem à categoria antes de colocá-la em destaque na página inicial.",
        });
        return;
      }

      if (totalFeaturedCount >= 6) {
        setCreateFeedback({
          type: "error",
          message: "Você pode exibir no máximo 6 categorias na página inicial.",
        });
        return;
      }
    }

    const similar = findSimilarCategory(trimmed, categories);
    if (similar && !force && createFeedback?.type !== "warning") {
      setCreateFeedback({
        type: "warning",
        message: `Já existe uma categoria semelhante: "${similar.name}". Deseja continuar e criar mesmo assim?`,
        similarCategory: similar,
      });
      return;
    }

    setIsSubmitting(true);
    const result = await createCategory({
      name: trimmed,
      description: newCategoryDesc,
      image_url: newCategoryImageUrl,
      is_featured_home: newCategoryFeatured,
      home_order: newCategoryOrder,
    });
    setIsSubmitting(false);

    if (result.success) {
      setNewCategoryName("");
      setNewCategoryDesc("");
      setNewCategoryImageUrl("");
      setNewCategoryFeatured(false);
      setNewCategoryOrder(1);
      setCreateFeedback({
        type: "success",
        message: `Categoria "${result.category?.name}" cadastrada com sucesso!`,
      });
      setTimeout(() => {
        setIsCreating(false);
        setCreateFeedback(null);
      }, 1500);
    } else {
      setCreateFeedback({
        type: "error",
        message: result.error || "Erro ao criar categoria.",
      });
    }
  };

  // Abrir Modal de Edição Completa
  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditDescription(cat.description || "");
    setEditImageUrl(cat.image_url || cat.image || "");
    setEditIsFeatured(Boolean(cat.is_featured_home));
    setEditHomeOrder(cat.home_order || 1);
    setEditActive(cat.active);
    setEditModalError(null);
  };

  const closeEditModal = () => {
    setEditingCategory(null);
    setEditModalError(null);
  };

  // Salvar Edição Completa
  const handleSaveModalEdit = async () => {
    if (!editingCategory) return;

    const trimmed = editName.trim();
    if (!trimmed) {
      setEditModalError("O nome da categoria não pode ficar vazio.");
      return;
    }

    const otherCats = categories.filter((c) => c.id !== editingCategory.id);
    if (isExactDuplicate(trimmed, otherCats)) {
      setEditModalError("Já existe outra categoria com este mesmo nome ou slug.");
      return;
    }

    // Regras de validação de Destaque na Home
    if (editIsFeatured) {
      if (!editImageUrl || !editImageUrl.trim()) {
        setEditModalError("Adicione uma imagem à categoria antes de colocá-la em destaque na página inicial.");
        return;
      }

      const otherFeatured = categories.filter(
        (c) => c.id !== editingCategory.id && c.is_featured_home
      );
      if (otherFeatured.length >= 6) {
        setEditModalError("Você pode exibir no máximo 6 categorias na página inicial.");
        return;
      }
    }

    setIsSubmitting(true);
    setEditModalError(null);

    const res = await updateCategory(editingCategory.id, {
      name: trimmed,
      description: editDescription,
      image_url: editImageUrl,
      is_featured_home: editIsFeatured,
      home_order: Number(editHomeOrder) || 1,
      active: editActive,
    });

    setIsSubmitting(false);

    if (res.success) {
      setActionAlert({
        type: "success",
        message: `Categoria "${trimmed}" atualizada com sucesso!`,
      });
      setTimeout(() => setActionAlert(null), 4000);
      closeEditModal();
    } else {
      setEditModalError(res.error || "Erro ao atualizar categoria.");
    }
  };

  // Alternar rapidamente o destaque da Home direto na tabela
  const handleToggleHomeFeatured = async (cat: Category) => {
    setActionAlert(null);
    const willBeFeatured = !cat.is_featured_home;

    if (willBeFeatured) {
      // 1. Validar se possui imagem
      const hasImage = Boolean(cat.image_url || cat.image);
      if (!hasImage) {
        setActionAlert({
          type: "warning",
          message: "Adicione uma imagem à categoria antes de colocá-la em destaque na página inicial.",
        });
        openEditModal(cat);
        return;
      }

      // 2. Validar limite de 6
      const currentFeatured = categories.filter((c) => c.id !== cat.id && c.is_featured_home);
      if (currentFeatured.length >= 6) {
        setActionAlert({
          type: "warning",
          message: "Você pode exibir no máximo 6 categorias na página inicial.",
        });
        return;
      }
    }

    // Próxima ordem sugerida (primeira posição livre de 1 a 6)
    let nextOrder = 0;
    if (willBeFeatured) {
      const occupied = new Set(
        categories
          .filter((c) => c.id !== cat.id && c.is_featured_home && c.home_order)
          .map((c) => c.home_order)
      );
      for (let i = 1; i <= 6; i++) {
        if (!occupied.has(i)) {
          nextOrder = i;
          break;
        }
      }
      if (nextOrder === 0) nextOrder = 1;
    }

    setIsSubmitting(true);
    const res = await updateCategory(cat.id, {
      is_featured_home: willBeFeatured,
      home_order: nextOrder,
    });
    setIsSubmitting(false);

    if (res.success) {
      setActionAlert({
        type: "success",
        message: willBeFeatured
          ? `Categoria "${cat.name}" adicionada aos destaques da Home (Ordem #${nextOrder})!`
          : `Categoria "${cat.name}" removida dos destaques da Home.`,
      });
      setTimeout(() => setActionAlert(null), 3500);
    } else {
      setActionAlert({
        type: "error",
        message: res.error || "Erro ao alterar destaque.",
      });
    }
  };

  // Alternar Status Ativo / Inativo
  const handleToggleActive = async (cat: Category) => {
    setIsSubmitting(true);
    const res = await toggleActive(cat.id, !cat.active);
    setIsSubmitting(false);

    if (res.success) {
      setActionAlert({
        type: "success",
        message: `Categoria "${cat.name}" ${!cat.active ? "ativada" : "desativada"} com sucesso.`,
      });
      setTimeout(() => setActionAlert(null), 3000);
    } else {
      setActionAlert({
        type: "error",
        message: res.error || "Não foi possível alterar o status da categoria.",
      });
    }
  };

  // Excluir Categoria
  const handleDelete = async (id: string) => {
    setDeleteError(null);
    setIsSubmitting(true);
    const res = await deleteCategory(id);
    setIsSubmitting(false);

    if (res.success) {
      setDeleteConfirmId(null);
      setActionAlert({
        type: "success",
        message: "Categoria excluída com sucesso.",
      });
      setTimeout(() => setActionAlert(null), 3000);
    } else {
      setDeleteError(res.error || "Não foi possível excluir a categoria.");
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Alerta de erro de sincronização com o banco de dados */}
      {error && (
        <div className="p-4 rounded-2xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Aviso de sincronização com o Supabase:</p>
              <p className="mt-0.5 text-charcoal/80 font-normal">{error}</p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3.5 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-charcoal hover:bg-amber-100 transition-colors cursor-pointer shrink-0 ml-4"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Alerta de feedback do sistema */}
      {actionAlert && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200 ${
            actionAlert.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : actionAlert.type === "warning"
              ? "bg-amber-50 text-amber-900 border border-amber-200"
              : "bg-green-50 text-green-800 border border-green-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionAlert.type === "error" && <AlertTriangle size={16} className="text-red-600 shrink-0" />}
            {actionAlert.type === "warning" && <AlertTriangle size={16} className="text-amber-600 shrink-0" />}
            {actionAlert.type === "success" && <CheckCircle2 size={16} className="text-green-600 shrink-0" />}
            <span>{actionAlert.message}</span>
          </div>
          <button onClick={() => setActionAlert(null)} className="p-1 hover:opacity-75">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-2xl font-bold text-charcoal">
            Gerenciamento de Categorias
          </h3>
          <p className="text-xs text-charcoal/70 mt-1">
            Controle a taxonomia, as imagens das coleções e exatamente quais categorias aparecem na página inicial da loja.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreating(!isCreating);
            setCreateFeedback(null);
            setNewCategoryName("");
            setNewCategoryDesc("");
            setNewCategoryImageUrl("");
            setNewCategoryFeatured(false);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold-default hover:bg-gold-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm focus:outline-none cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>{isCreating ? "Fechar Cadastro" : "Nova Categoria"}</span>
        </button>
      </div>

      {/* Widget Visual: Categorias em Destaque na Home (Slots 1 a 6) */}
      <div className="bg-gradient-to-r from-pink-light/30 via-white to-gold-light/20 border border-pink-default/20 rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gold-default/15 text-gold-dark flex items-center justify-center">
              <Home size={16} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-charcoal text-sm">
                Seção "Navegar pelas Coleções" na Home
              </h4>
              <p className="text-[11px] text-charcoal/60">
                A Home exibe exatamente 6 cards organizados pela ordem definida abaixo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                totalFeaturedCount === 6
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : totalFeaturedCount > 0
                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                  : "bg-gray-100 text-charcoal/60"
              }`}
            >
              {totalFeaturedCount} de 6 posições preenchidas
            </span>
          </div>
        </div>

        {/* Grade compacta com os 6 slots */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((position) => {
            const featuredInSlot = homeFeaturedCategories.find((c) => c.home_order === position);
            const fallbackFeatured = !featuredInSlot ? homeFeaturedCategories[position - 1] : featuredInSlot;
            const category = fallbackFeatured;

            return (
              <div
                key={position}
                onClick={() => category && openEditModal(category)}
                className={`relative rounded-2xl border p-2.5 transition-all text-left group ${
                  category
                    ? "bg-white border-gold-default/30 hover:border-gold-default shadow-2xs cursor-pointer hover:shadow-xs"
                    : "bg-offwhite/50 border-dashed border-charcoal/20 flex flex-col items-center justify-center min-h-[90px]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark bg-gold-light/40 px-2 py-0.5 rounded-md">
                    #{position}
                  </span>
                  {category && (
                    <Edit2
                      size={12}
                      className="text-charcoal/30 group-hover:text-gold-default transition-colors"
                    />
                  )}
                </div>

                {category ? (
                  <div className="space-y-1.5">
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 relative">
                      {category.image_url || category.image ? (
                        <img
                          src={category.image_url || category.image}
                          alt={category.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-charcoal/30">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </div>
                    <p className="font-serif font-bold text-xs text-charcoal truncate" title={category.name}>
                      {category.name}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <span className="text-[10px] text-charcoal/40 font-medium">Vago</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Painel de Criação de Categoria */}
      {isCreating && (
        <div className="bg-white border border-pink-default/30 rounded-3xl p-6 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-5 border-b border-pink-default/15 pb-3">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-gold-dark" />
              <h4 className="font-serif font-bold text-charcoal text-lg">
                Cadastrar Nova Categoria
              </h4>
            </div>
            <button
              onClick={() => setIsCreating(false)}
              className="text-charcoal/40 hover:text-charcoal p-1 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lado Esquerdo: Nome, Descrição e Destaque */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => handleNewNameChange(e.target.value)}
                  placeholder="Ex: Kits para Padrinhos, Lembrancinhas..."
                  className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/20 rounded-xl focus:outline-none focus:border-gold-default text-sm text-charcoal"
                  autoFocus
                />
                {newCategoryName.trim() && (
                  <span className="text-[11px] text-charcoal/50 block mt-1">
                    Slug automático:{" "}
                    <code className="bg-pink-light/40 px-1.5 py-0.5 rounded text-charcoal/80 font-mono text-[10px]">
                      {generateSlug(newCategoryName)}
                    </code>
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Descrição Curta (para o card da Home)
                </label>
                <textarea
                  rows={3}
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="Ex: Conjuntos completos e sofisticados para convidar ou agradecer seus padrinhos..."
                  className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/20 rounded-xl focus:outline-none focus:border-gold-default text-xs text-charcoal resize-none"
                />
                <span className="text-[10px] text-charcoal/50">
                  Ideal entre 80 e 130 caracteres para um alinhamento harmonioso no layout.
                </span>
              </div>

              {/* Opção de Destaque na Home */}
              <div className="p-4 bg-offwhite rounded-2xl border border-pink-default/20 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newCategoryFeatured}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      if (checked && !newCategoryImageUrl) {
                        setCreateFeedback({
                          type: "warning",
                          message:
                            "Adicione uma imagem à categoria antes de colocá-la em destaque na página inicial.",
                        });
                        return;
                      }
                      if (checked && totalFeaturedCount >= 6) {
                        setCreateFeedback({
                          type: "warning",
                          message: "Você pode exibir no máximo 6 categorias na página inicial.",
                        });
                        return;
                      }
                      setNewCategoryFeatured(checked);
                      setCreateFeedback(null);
                    }}
                    className="w-4 h-4 text-gold-default rounded border-gray-300 focus:ring-gold-default cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                      <Star size={13} className="text-gold-dark fill-gold-default" />
                      Mostrar na seção de coleções da Home
                    </span>
                    <span className="text-[10px] text-charcoal/60 block">
                      Aparecerá nos 6 cards de destaque na página inicial da loja.
                    </span>
                  </div>
                </label>

                {newCategoryFeatured && (
                  <div className="pt-2 border-t border-pink-default/15 flex items-center gap-3">
                    <label className="text-xs font-semibold text-charcoal">
                      Ordem de Exibição (1 a 6):
                    </label>
                    <select
                      value={newCategoryOrder}
                      onChange={(e) => setNewCategoryOrder(Number(e.target.value))}
                      className="px-3 py-1.5 bg-white border border-pink-default/30 rounded-xl text-xs font-bold text-charcoal focus:outline-none focus:border-gold-default"
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>
                          Posição #{num}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Lado Direito: Upload da Imagem da Categoria */}
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                Imagem da Categoria {newCategoryFeatured ? "*" : "(Opcional)"}
              </label>

              <input
                ref={fileInputNewRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleUploadNewImage}
                className="hidden"
              />

              {newCategoryImageUrl ? (
                <div className="space-y-3">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-pink-default/20 relative group bg-charcoal/5">
                    <img
                      src={newCategoryImageUrl}
                      alt="Prévia da categoria"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-charcoal/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputNewRef.current?.click()}
                        disabled={isUploadingNewImage}
                        className="px-3 py-1.5 bg-white text-charcoal hover:bg-gold-light rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Upload size={13} />
                        <span>Substituir</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewCategoryImageUrl("");
                          if (newCategoryFeatured) setNewCategoryFeatured(false);
                        }}
                        className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Remover</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-charcoal/60">
                    <span>Imagem carregada com sucesso</span>
                    <button
                      type="button"
                      onClick={() => fileInputNewRef.current?.click()}
                      className="text-gold-dark font-bold hover:underline cursor-pointer"
                    >
                      Alterar imagem
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputNewRef.current?.click()}
                  className="aspect-video w-full rounded-2xl border-2 border-dashed border-pink-default/40 hover:border-gold-default bg-offwhite/50 hover:bg-pink-light/10 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors"
                >
                  {isUploadingNewImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-gold-dark" />
                      <span className="text-xs font-semibold text-charcoal">Enviando imagem para o Supabase...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-pink-light/40 text-gold-dark flex items-center justify-center mx-auto">
                        <Upload size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-charcoal">
                          Clique para selecionar a imagem
                        </p>
                        <p className="text-[11px] text-charcoal/50 mt-0.5">
                          Formatos aceitos: JPG, PNG, WEBP (Máx. 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Alertas de validação e similaridade */}
              {createFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex flex-col gap-2 ${
                    createFeedback.type === "error"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : createFeedback.type === "warning"
                      ? "bg-amber-50 text-amber-900 border border-amber-200"
                      : "bg-green-50 text-green-800 border border-green-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {createFeedback.type === "error" && (
                      <AlertTriangle size={15} className="shrink-0 text-red-500 mt-0.5" />
                    )}
                    {createFeedback.type === "warning" && (
                      <AlertTriangle size={15} className="shrink-0 text-amber-600 mt-0.5" />
                    )}
                    {createFeedback.type === "success" && (
                      <CheckCircle2 size={15} className="shrink-0 text-green-600 mt-0.5" />
                    )}
                    <span className="font-medium">{createFeedback.message}</span>
                  </div>

                  {createFeedback.type === "warning" && createFeedback.similarCategory && (
                    <div className="flex items-center gap-2 pt-1 border-t border-amber-200/50">
                      <button
                        onClick={() => handleCreate(true)}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Confirmar e Criar Mesmo Assim
                      </button>
                      <button
                        onClick={() => {
                          setNewCategoryName("");
                          setCreateFeedback(null);
                        }}
                        className="px-3 py-1 bg-white border border-amber-300 text-amber-900 rounded-lg text-[11px] font-semibold hover:bg-amber-100/50 transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botões do Rodapé de Criação */}
          <div className="flex items-center gap-3 pt-6 border-t border-pink-default/15 mt-6">
            <button
              onClick={() => handleCreate(false)}
              disabled={isSubmitting || !newCategoryName.trim() || isUploadingNewImage}
              className="px-6 py-2.5 bg-charcoal hover:bg-gold-default text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Salvar Categoria</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsCreating(false);
                setNewCategoryName("");
                setNewCategoryDesc("");
                setNewCategoryImageUrl("");
                setNewCategoryFeatured(false);
                setCreateFeedback(null);
              }}
              className="px-4 py-2.5 border border-pink-default/20 text-charcoal/70 hover:bg-offwhite rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-3.5 rounded-2xl border border-pink-default/20 shadow-2xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input
            type="text"
            placeholder="Buscar por nome, slug ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-offwhite text-xs pl-9 pr-4 py-2 rounded-xl border border-pink-default/15 focus:outline-none focus:border-gold-default text-charcoal"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === "all"
                ? "bg-gold-light/60 text-gold-dark font-bold"
                : "text-charcoal/60 hover:bg-offwhite"
            }`}
          >
            Todas ({categories.length})
          </button>
          <button
            onClick={() => setStatusFilter("featured")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              statusFilter === "featured"
                ? "bg-gold-default text-white font-bold"
                : "text-charcoal/60 hover:bg-offwhite"
            }`}
          >
            <Star size={12} className={statusFilter === "featured" ? "fill-white" : ""} />
            <span>Home ({categories.filter((c) => c.is_featured_home).length})</span>
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === "active"
                ? "bg-green-100 text-green-800 font-bold"
                : "text-charcoal/60 hover:bg-offwhite"
            }`}
          >
            Ativas ({categories.filter((c) => c.active).length})
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === "inactive"
                ? "bg-gray-200 text-gray-800 font-bold"
                : "text-charcoal/60 hover:bg-offwhite"
            }`}
          >
            Inativas ({categories.filter((c) => !c.active).length})
          </button>
        </div>
      </div>

      {/* Alerta de erro de exclusão */}
      {deleteError && (
        <div className="p-3.5 rounded-xl text-xs bg-red-50 text-red-700 border border-red-200 flex items-start justify-between">
          <div className="flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <span>{deleteError}</span>
          </div>
          <button onClick={() => setDeleteError(null)} className="p-1 hover:text-red-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabela de Categorias */}
      <div className="bg-white rounded-3xl border border-pink-default/20 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-offwhite text-charcoal/60 uppercase tracking-widest text-[10px] font-bold border-b border-pink-default/15">
              <tr>
                <th className="px-5 py-4 w-16">Imagem</th>
                <th className="px-5 py-4">Categoria & Detalhes</th>
                <th className="px-4 py-4 text-center">Destaque na Home</th>
                <th className="px-4 py-4 text-center">Produtos</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-default/10">
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="w-12 h-8 bg-gray-200 rounded-lg" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 bg-gray-200 rounded w-36 mb-1" />
                        <div className="h-3 bg-gray-200 rounded w-24" />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="h-5 bg-gray-200 rounded-full w-20 mx-auto" />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="h-4 bg-gray-200 rounded w-8 mx-auto" />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="h-5 bg-gray-200 rounded-full w-14 mx-auto" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="h-6 bg-gray-200 rounded w-20 ml-auto" />
                      </td>
                    </tr>
                  ))
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-charcoal/50">
                    Nenhuma categoria encontrada para os critérios selecionados.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const isDeleting = deleteConfirmId === cat.id;
                  const productCount = cat.productCount || 0;
                  const categoryImage = cat.image_url || cat.image;

                  return (
                    <tr
                      key={cat.id}
                      className={`hover:bg-pink-light/20 transition-colors ${
                        !cat.active ? "opacity-65 bg-gray-50/50" : ""
                      }`}
                    >
                      {/* Miniatura da Imagem */}
                      <td className="px-5 py-3.5">
                        <div
                          onClick={() => openEditModal(cat)}
                          className="w-12 h-9 rounded-lg overflow-hidden bg-pink-light/40 border border-pink-default/20 relative group cursor-pointer"
                          title="Clique para editar imagem"
                        >
                          {categoryImage ? (
                            <img
                              src={categoryImage}
                              alt={cat.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-charcoal/30">
                              <ImageIcon size={14} />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Nome, Slug e Descrição */}
                      <td className="px-5 py-3.5 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-charcoal text-xs">{cat.name}</span>
                          <span className="text-[10px] text-charcoal/40 font-mono">({cat.slug})</span>
                        </div>
                        {cat.description && (
                          <p className="text-[11px] text-charcoal/60 line-clamp-1 mt-0.5" title={cat.description}>
                            {cat.description}
                          </p>
                        )}
                      </td>

                      {/* Destaque na Home */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleHomeFeatured(cat)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                              cat.is_featured_home
                                ? "bg-gold-light/60 text-gold-dark border border-gold-default/30 shadow-2xs"
                                : "bg-gray-100 text-charcoal/40 hover:bg-gray-200"
                            }`}
                            title={
                              cat.is_featured_home
                                ? `Exibida na Home na posição #${cat.home_order}. Clique para remover.`
                                : "Clique para exibir na Home (máximo 6 categorias)"
                            }
                          >
                            <Star
                              size={12}
                              className={cat.is_featured_home ? "fill-gold-default text-gold-dark" : "text-charcoal/40"}
                            />
                            <span>
                              {cat.is_featured_home
                                ? `Posição #${cat.home_order || 1}`
                                : "Não exibida"}
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* Quantidade de Produtos */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            productCount > 0
                              ? "bg-pink-light/60 text-charcoal/80"
                              : "bg-gray-100 text-charcoal/40"
                          }`}
                        >
                          <Package size={11} />
                          <span>{productCount}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            cat.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {cat.active ? <Eye size={10} /> : <EyeOff size={10} />}
                          <span>{cat.active ? "Ativa" : "Inativa"}</span>
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-5 py-3.5 text-right">
                        {isDeleting ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[10px] text-red-600 font-bold">
                              Excluir?
                            </span>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              disabled={isSubmitting}
                              className="px-2 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold hover:bg-red-700 transition-colors cursor-pointer"
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-gray-100 text-charcoal/70 rounded-lg text-[10px] hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Alternar Ativo/Inativo */}
                            <button
                              onClick={() => handleToggleActive(cat)}
                              disabled={isSubmitting}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                cat.active
                                  ? "text-charcoal/50 hover:text-amber-600 hover:bg-amber-50 border-transparent hover:border-amber-200"
                                  : "text-charcoal/50 hover:text-green-600 hover:bg-green-50 border-transparent hover:border-green-200"
                              }`}
                              title={cat.active ? "Desativar Categoria" : "Ativar Categoria"}
                            >
                              {cat.active ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>

                            {/* Editar Completo (Modal) */}
                            <button
                              onClick={() => openEditModal(cat)}
                              className="p-1.5 text-charcoal/50 hover:text-gold-default hover:bg-pink-light/40 rounded-lg border border-transparent hover:border-pink-default/20 transition-colors cursor-pointer"
                              title="Editar Categoria, Imagem e Destaques"
                            >
                              <Edit2 size={14} />
                            </button>

                            {/* Excluir Categoria */}
                            <button
                              onClick={() => {
                                if (productCount > 0) {
                                  setDeleteError(
                                    `A categoria "${cat.name}" possui ${productCount} produto(s) associado(s). Para segurança do catálogo, desative a categoria ao invés de excluí-la.`
                                  );
                                } else {
                                  setDeleteConfirmId(cat.id);
                                  setDeleteError(null);
                                }
                              }}
                              className="p-1.5 text-charcoal/40 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                              title={
                                productCount > 0
                                  ? "Possui produtos associados (desative em vez de excluir)"
                                  : "Excluir Categoria"
                              }
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição Completa da Categoria */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-xl border border-pink-default/30 space-y-6 my-8 text-left">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between border-b border-pink-default/15 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold-dark bg-gold-light/40 px-2.5 py-0.5 rounded-full">
                  Configuração de Coleção
                </span>
                <h3 className="font-serif text-xl font-bold text-charcoal mt-1">
                  Editar Categoria: {editingCategory.name}
                </h3>
              </div>
              <button
                onClick={closeEditModal}
                className="text-charcoal/40 hover:text-charcoal p-1.5 rounded-xl hover:bg-offwhite transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Alerta de Erro no Modal */}
            {editModalError && (
              <div className="p-3.5 rounded-xl text-xs bg-red-50 text-red-700 border border-red-200 flex items-start gap-2">
                <AlertTriangle size={15} className="shrink-0 text-red-500 mt-0.5" />
                <span>{editModalError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Lado Esquerdo: Imagem da Categoria */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                  Imagem da Categoria {editIsFeatured ? "*" : "(Opcional)"}
                </label>

                <input
                  ref={fileInputEditRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleUploadEditImage}
                  className="hidden"
                />

                {editImageUrl ? (
                  <div className="space-y-3">
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-pink-default/20 relative group bg-charcoal/5">
                      <img
                        src={editImageUrl}
                        alt={editName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-charcoal/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => fileInputEditRef.current?.click()}
                          disabled={isUploadingEditImage}
                          className="px-3 py-1.5 bg-white text-charcoal hover:bg-gold-light rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Upload size={13} />
                          <span>Substituir</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditImageUrl("");
                            if (editIsFeatured) setEditIsFeatured(false);
                          }}
                          className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Remover</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-charcoal/60">
                      <span className="text-green-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Imagem configurada
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputEditRef.current?.click()}
                        className="text-gold-dark font-bold hover:underline cursor-pointer"
                      >
                        Substituir foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputEditRef.current?.click()}
                    className="aspect-video w-full rounded-2xl border-2 border-dashed border-pink-default/40 hover:border-gold-default bg-offwhite/50 hover:bg-pink-light/10 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors"
                  >
                    {isUploadingEditImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={24} className="animate-spin text-gold-dark" />
                        <span className="text-xs font-semibold text-charcoal">Enviando imagem...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-full bg-pink-light/40 text-gold-dark flex items-center justify-center mx-auto">
                          <Upload size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-charcoal">
                            Clique para selecionar foto
                          </p>
                          <p className="text-[11px] text-charcoal/50 mt-0.5">
                            Formatos: JPG, PNG, WEBP (Máx. 5MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-[10px] text-charcoal/50 leading-relaxed">
                  A imagem é salva no bucket organizado e exibida com proporção 16:9 na Home e catálogo.
                </p>
              </div>

              {/* Lado Direito: Nome, Descrição e Destaques */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-offwhite border border-pink-default/20 rounded-xl focus:outline-none focus:border-gold-default text-xs text-charcoal"
                  />
                  <span className="text-[10px] text-charcoal/50 block mt-1">
                    Slug: <code className="font-mono text-charcoal/80">{generateSlug(editName)}</code>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    Descrição Curta da Coleção
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Descrição exibida no card da página inicial..."
                    className="w-full px-3.5 py-2.5 bg-offwhite border border-pink-default/20 rounded-xl focus:outline-none focus:border-gold-default text-xs text-charcoal resize-none"
                  />
                  <span className="text-[10px] text-charcoal/50 block">
                    {editDescription.length} caracteres
                  </span>
                </div>

                {/* Status Ativa / Inativa */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    Status da Categoria
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditActive(true)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        editActive
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-offwhite text-charcoal/50 border border-pink-default/20"
                      }`}
                    >
                      Ativa
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditActive(false)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        !editActive
                          ? "bg-gray-200 text-charcoal border border-gray-300"
                          : "bg-offwhite text-charcoal/50 border border-pink-default/20"
                      }`}
                    >
                      Inativa
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco de Configuração da Home */}
            <div className="p-4 bg-gradient-to-r from-gold-light/20 to-pink-light/20 rounded-2xl border border-gold-default/20 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editIsFeatured}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      // 1. Validar imagem
                      if (!editImageUrl || !editImageUrl.trim()) {
                        setEditModalError(
                          "Adicione uma imagem à categoria antes de colocá-la em destaque na página inicial."
                        );
                        return;
                      }
                      // 2. Validar limite de 6
                      const otherFeatured = categories.filter(
                        (c) => c.id !== editingCategory.id && c.is_featured_home
                      );
                      if (otherFeatured.length >= 6) {
                        setEditModalError(
                          "Você pode exibir no máximo 6 categorias na página inicial."
                        );
                        return;
                      }
                    }
                    setEditIsFeatured(checked);
                    setEditModalError(null);
                  }}
                  className="w-4 h-4 text-gold-default rounded border-gray-300 focus:ring-gold-default cursor-pointer mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                    <Star size={13} className="text-gold-dark fill-gold-default" />
                    Mostrar na página inicial (Home)
                  </span>
                  <span className="text-[11px] text-charcoal/65 block mt-0.5">
                    Exibe este card na seção "Navegar pelas Coleções" (limite total de 6 categorias).
                  </span>
                </div>
              </label>

              {editIsFeatured && (
                <>
                  <div className="pt-3 border-t border-gold-default/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown size={14} className="text-gold-dark" />
                      <span className="text-xs font-bold text-charcoal">
                        Ordem de Exibição na Home:
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setEditHomeOrder(num)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            editHomeOrder === num
                              ? "bg-gold-default text-white shadow-xs scale-105"
                              : "bg-white text-charcoal/70 border border-gold-default/30 hover:bg-gold-light/40"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(() => {
                    const conflictingCat = categories.find(
                      (c) => c.id !== editingCategory.id && c.is_featured_home && c.home_order === editHomeOrder
                    );
                    return conflictingCat ? (
                      <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl font-medium">
                        A posição #{editHomeOrder} está com "{conflictingCat.name}". Ao salvar, as posições serão trocadas automaticamente.
                      </p>
                    ) : null;
                  })()}
                </>
              )}
            </div>

            {/* Ações do Modal */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-pink-default/15">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-5 py-2.5 border border-pink-default/25 text-charcoal/70 hover:bg-offwhite rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveModalEdit}
                disabled={isSubmitting || isUploadingEditImage || !editName.trim()}
                className="px-6 py-2.5 bg-gold-default hover:bg-gold-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
