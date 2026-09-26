import { AdminProduct } from "./types";
import {
  Save,
  X,
  Loader2,
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Check,
} from "lucide-react";
import { useEffect, useRef, useState, FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { useCategories } from "../../hooks/useCategories";
import {
  generateSlug,
  isExactDuplicate,
  findSimilarCategory,
  isUUID,
} from "../../utils/categoryUtils";

interface ProductFormProps {
  mode: "create" | "edit";
  product?: AdminProduct;
  onCancel: () => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProductForm({
  mode,
  product,
  onCancel,
}: ProductFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Hook de Categorias
  const { categories, activeCategories, createCategory } = useCategories();

  // Form State
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState<number | "">(product?.price ?? "");

  // Inicializar Categoria:
  // CRÍTICO: categoryId deve ser EXCLUSIVAMENTE um UUID válido, NUNCA um slug!
  const initialCategoryId =
    product?.categoryId && isUUID(product.categoryId)
      ? product.categoryId
      : "";
  const [categoryId, setCategoryId] = useState<string>(initialCategoryId);
  const [category, setCategory] = useState<string>(
    product?.category && !isUUID(product.category)
      ? product.category
      : ""
  );

  // Sincronizar categoria quando a lista de categorias carregar ou produto mudar
  useEffect(() => {
    if (categories.length === 0) return;

    // Se já temos um UUID válido em categoryId, sincronizar o slug em category
    if (categoryId && isUUID(categoryId)) {
      const found = categories.find((c) => c.id === categoryId);
      if (found) {
        const expectedSlug = found.slug || generateSlug(found.name);
        if (category !== expectedSlug) {
          setCategory(expectedSlug);
        }
      }
      return;
    }

    // Se não temos categoryId UUID válido ainda, procurar correspondência nos dados do produto
    const candidateSearch = (
      product?.categoryId ||
      product?.category ||
      category ||
      ""
    )
      .trim()
      .toLowerCase();

    if (!candidateSearch) return;

    const matched = categories.find((c) => {
      const cId = (c.id || "").toLowerCase();
      const cSlug = (c.slug || "").toLowerCase();
      const cName = (c.name || "").toLowerCase();
      return (
        (isUUID(c.id) && cId === candidateSearch) ||
        cSlug === candidateSearch ||
        cName === candidateSearch ||
        generateSlug(c.name) === generateSlug(candidateSearch)
      );
    });

    if (matched) {
      if (isUUID(matched.id)) {
        setCategoryId(matched.id);
      }
      const matchedSlug = matched.slug || generateSlug(matched.name);
      setCategory(matchedSlug);
    }
  }, [categories, product]);

  // Estado da criação inline de nova categoria
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatFeedback, setNewCatFeedback] = useState<{
    type: "error" | "warning" | "success";
    message: string;
    similarCategory?: any;
  } | null>(null);
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Validação em tempo real para nova categoria inline
  const handleInlineCategoryNameChange = (val: string) => {
    setNewCatName(val);
    setNewCatFeedback(null);

    const trimmed = val.trim();
    if (!trimmed) return;

    if (isExactDuplicate(trimmed, categories)) {
      const existing = categories.find(
        (c) =>
          c.slug.toLowerCase() === generateSlug(trimmed) ||
          c.name.trim().toLowerCase() === trimmed.toLowerCase()
      );
      setNewCatFeedback({
        type: "error",
        message: "Essa categoria já existe. Selecione a categoria existente.",
        similarCategory: existing,
      });
      return;
    }

    const similar = findSimilarCategory(trimmed, categories);
    if (similar) {
      setNewCatFeedback({
        type: "warning",
        message: `Já existe uma categoria semelhante: "${similar.name}".`,
        similarCategory: similar,
      });
    }
  };

  const handleCreateInlineCategory = async (force: boolean = false) => {
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setNewCatFeedback({
        type: "error",
        message: "O nome da categoria não pode ficar vazio.",
      });
      return;
    }

    if (isExactDuplicate(trimmed, categories)) {
      setNewCatFeedback({
        type: "error",
        message: "Essa categoria já existe. Selecione a categoria existente.",
      });
      return;
    }

    const similar = findSimilarCategory(trimmed, categories);
    if (similar && !force && newCatFeedback?.type !== "warning") {
      setNewCatFeedback({
        type: "warning",
        message: `Já existe uma categoria semelhante: "${similar.name}". Deseja continuar e criar mesmo assim?`,
        similarCategory: similar,
      });
      return;
    }

    setIsSubmittingCat(true);
    const result = await createCategory(trimmed);
    setIsSubmittingCat(false);

    if (result.success && result.category) {
      // Seleciona automaticamente a categoria recém-criada
      if (isUUID(result.category.id)) {
        setCategoryId(result.category.id);
      } else {
        setCategoryId("");
      }
      setCategory(result.category.slug || generateSlug(result.category.name));
      setNewCatName("");
      setNewCatFeedback(null);
      setIsAddingNewCat(false);
    } else {
      setNewCatFeedback({
        type: "error",
        message: result.error || "Erro ao criar categoria.",
      });
    }
  };
  const [rating, setRating] = useState<number | "">(product?.rating ?? 5);
  const [customizable, setCustomizable] = useState(
    product?.customizable ?? false
  );
  const [isBestSeller, setIsBestSeller] = useState(
    product?.isBestSeller ?? false
  );
  const [isPromo, setIsPromo] = useState(product?.isPromo ?? false);
  const [promoPrice, setPromoPrice] = useState<number | "">(
    product?.promoPrice ?? ""
  );
  const [active, setActive] = useState(product?.active ?? true);
  const [features, setFeatures] = useState(
    product?.features?.join(", ") || ""
  );

  // Imagem principal
  const [mainImageUrl, setMainImageUrl] = useState(product?.image || "");
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState(
    product?.image || ""
  );

  // Galeria existente
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    product?.galleryImages || []
  );

  // Novas imagens da galeria aguardando upload
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      if (mainImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(mainImagePreview);
      }

      galleryPreviews.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [mainImagePreview, galleryPreviews]);

  const validateImage = (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Formato inválido. Use JPG, PNG ou WebP.";
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return "A imagem deve ter no máximo 5 MB.";
    }

    return null;
  };

  const handleMainImageChange = (file?: File) => {
    if (!file) return;

    const validationError = validateImage(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    if (mainImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(mainImagePreview);
    }

    const preview = URL.createObjectURL(file);

    setMainImageFile(file);
    setMainImagePreview(preview);
  };

  const handleGalleryChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files);
    const validFiles: File[] = [];

    for (const file of selectedFiles) {
      const validationError = validateImage(file);

      if (validationError) {
        setError(`${file.name}: ${validationError}`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setError(null);

    const previews = validFiles.map((file) => URL.createObjectURL(file));

    setGalleryFiles((current) => [...current, ...validFiles]);
    setGalleryPreviews((current) => [...current, ...previews]);
  };

  const removeMainImage = () => {
    if (mainImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(mainImagePreview);
    }

    setMainImageFile(null);
    setMainImageUrl("");
    setMainImagePreview("");
  };

  const removeGalleryUrl = (index: number) => {
    setGalleryUrls((current) => current.filter((_, i) => i !== index));
  };

  const removeGalleryFile = (index: number) => {
    const preview = galleryPreviews[index];

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setGalleryFiles((current) => current.filter((_, i) => i !== index));
    setGalleryPreviews((current) => current.filter((_, i) => i !== index));
  };

  const uploadImage = async (file: File) => {
    const extension =
      file.name.split(".").pop()?.toLowerCase() ||
      file.type.split("/")[1] ||
      "jpg";

    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}.${extension}`;

    const filePath = `products/${uniqueName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      throw new Error("Não foi possível obter a URL pública da imagem.");
    }

    return data.publicUrl;
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (isSaving) return;

    const numPrice = Number(price);
    const numRating = Number(rating);
    const numPromo = Number(promoPrice);

    if (!name.trim()) {
      setError("O nome do produto é obrigatório.");
      return;
    }

    if (numPrice < 0 || !Number.isFinite(numPrice)) {
      setError("O preço deve ser um valor válido maior ou igual a zero.");
      return;
    }

    if (!categoryId && !category.trim()) {
      setError("Selecione uma categoria para o produto.");
      return;
    }

    if (!Number.isFinite(numRating) || numRating < 0 || numRating > 5) {
      setError("A avaliação deve estar entre 0 e 5.");
      return;
    }

    if (isPromo) {
      if (
        !Number.isFinite(numPromo) ||
        numPromo <= 0
      ) {
        setError(
          "O preço promocional deve ser maior que zero quando a promoção está ativa."
        );
        return;
      }

      if (numPromo >= numPrice) {
        setError(
          "O preço promocional deve ser menor que o preço normal."
        );
        return;
      }
    }

    // Produto novo precisa ter imagem principal.
    if (mode === "create" && !mainImageFile && !mainImageUrl) {
      setError("Adicione uma imagem principal ao produto.");
      return;
    }

    setIsSaving(true);
    setIsUploading(false);

    try {
      let finalMainImageUrl = mainImageUrl;

      // Upload da imagem principal somente se uma nova foi selecionada.
      if (mainImageFile) {
        setIsUploading(true);
        finalMainImageUrl = await uploadImage(mainImageFile);
        setIsUploading(false);
      }

      // Upload das novas imagens da galeria.
      let uploadedGalleryUrls: string[] = [];

      if (galleryFiles.length > 0) {
        setIsUploading(true);

        uploadedGalleryUrls = await Promise.all(
          galleryFiles.map((file) => uploadImage(file))
        );

        setIsUploading(false);
      }

      const finalGalleryUrls = [
        ...galleryUrls,
        ...uploadedGalleryUrls,
      ];

      // Resolver categoria selecionada:
      // Procurar categoria por UUID (categoryId) ou por slug/nome (category)
      const selectedCategoryObj = categories.find((c) => {
        if (categoryId && isUUID(categoryId) && c.id === categoryId) return true;
        if (category) {
          const lowerCat = category.trim().toLowerCase();
          return (
            (c.slug && c.slug.toLowerCase() === lowerCat) ||
            (c.name && c.name.toLowerCase() === lowerCat) ||
            generateSlug(c.name) === generateSlug(category)
          );
        }
        return false;
      });

      // Slug garantido para o campo legado products.category (NUNCA UUID)
      let legacyCategorySlug = "";
      if (selectedCategoryObj?.slug) {
        legacyCategorySlug = selectedCategoryObj.slug;
      } else if (category && !isUUID(category)) {
        legacyCategorySlug = generateSlug(category);
      } else if (selectedCategoryObj?.name) {
        legacyCategorySlug = generateSlug(selectedCategoryObj.name);
      }

      // UUID garantido para products.category_id (NUNCA SLUG)
      let realCategoryUuid: string | null = null;
      if (selectedCategoryObj && isUUID(selectedCategoryObj.id)) {
        realCategoryUuid = selectedCategoryObj.id;
      } else if (categoryId && isUUID(categoryId)) {
        realCategoryUuid = categoryId;
      }

      const payload: any = {
        name: name.trim(),
        description: description.trim(),
        price: numPrice,
        category: legacyCategorySlug, // SEMPRE o slug textual, NUNCA UUID
        rating: numRating,
        customizable,
        is_bestseller: isBestSeller,
        is_promo: isPromo,
        promo_price: isPromo ? numPromo : null,
        active,
        image_url: finalMainImageUrl,
        gallery_images: finalGalleryUrls,
        features: features
          .split(",")
          .map((feature) => feature.trim())
          .filter((feature) => feature.length > 0),
      };

      // CRÍTICO: category_id recebe EXCLUSIVAMENTE um UUID válido, NUNCA um slug!
      if (realCategoryUuid && isUUID(realCategoryUuid)) {
        payload.category_id = realCategoryUuid;
      }

      if (mode === "create") {
        let insertRes = await supabase
          .from("products")
          .insert(payload);

        // Fallback de resiliência caso o banco rejeite category_id por incompatibilidade de tipo/coluna
        if (
          insertRes.error &&
          (insertRes.error.code === "22P02" ||
            insertRes.error.message?.includes("category_id") ||
            insertRes.error.message?.includes("uuid"))
        ) {
          console.warn("[ProductForm] Repetindo insert sem category_id após erro de UUID:", insertRes.error);
          delete payload.category_id;
          insertRes = await supabase
            .from("products")
            .insert(payload);
        }

        if (insertRes.error) {
          throw insertRes.error;
        }

        setSuccess("Produto criado com sucesso!");

        setTimeout(() => {
          onCancel();
        }, 800);
      } else {
        if (!product) {
          throw new Error("Produto não encontrado para edição.");
        }

        let updateRes = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);

        // Fallback de resiliência caso o banco rejeite category_id por incompatibilidade de tipo/coluna
        if (
          updateRes.error &&
          (updateRes.error.code === "22P02" ||
            updateRes.error.message?.includes("category_id") ||
            updateRes.error.message?.includes("uuid"))
        ) {
          console.warn("[ProductForm] Repetindo update sem category_id após erro de UUID:", updateRes.error);
          delete payload.category_id;
          updateRes = await supabase
            .from("products")
            .update(payload)
            .eq("id", product.id);
        }

        if (updateRes.error) {
          throw updateRes.error;
        }

        setSuccess("Produto atualizado com sucesso!");

        setTimeout(() => {
          onCancel();
        }, 800);
      }
    } catch (err) {
      console.error(
        mode === "create"
          ? "Error creating product:"
          : "Error updating product:",
        err
      );

      setIsUploading(false);

      const message =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao salvar o produto.";

      setError(
        `Não foi possível salvar o produto. ${message}`
      );
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-pink-default/20 p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-pink-default/20">
        <h3 className="font-serif text-2xl font-bold text-charcoal">
          {mode === "create"
            ? "Criar Novo Produto"
            : `Editar: ${product?.name}`}
        </h3>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="p-2 text-charcoal/50 hover:text-charcoal rounded-full hover:bg-offwhite transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          <strong className="block mb-1">Não foi possível salvar.</strong>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* COLUNA 1 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">
                Nome do Produto
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-charcoal mb-1">
                  Preço (R$)
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-charcoal mb-1">
                  Avaliação (0-5)
                </label>

                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={rating}
                  onChange={(e) =>
                    setRating(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm"
                  required
                />
              </div>
            </div>

            {/* SELETOR DE CATEGORIA */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-charcoal">
                  Categoria <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewCat(!isAddingNewCat);
                    setNewCatFeedback(null);
                    setNewCatName("");
                  }}
                  className="text-xs text-gold-dark hover:text-gold-default font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>{isAddingNewCat ? "Cancelar nova" : "Criar nova categoria"}</span>
                </button>
              </div>

              <div className="relative">
                <select
                  value={
                    categoryId && isUUID(categoryId)
                      ? categoryId
                      : (categories.find(
                          (c) =>
                            (c.slug && c.slug === category) ||
                            (c.name && c.name.toLowerCase() === category.toLowerCase())
                        )?.id || "")
                  }
                  onChange={(e) => {
                    const selectedVal = e.target.value;
                    if (!selectedVal) {
                      setCategoryId("");
                      setCategory("");
                      return;
                    }
                    const found = categories.find(
                      (c) =>
                        c.id === selectedVal ||
                        c.slug === selectedVal ||
                        generateSlug(c.name) === generateSlug(selectedVal)
                    );
                    if (found) {
                      if (isUUID(found.id)) {
                        setCategoryId(found.id);
                      } else {
                        setCategoryId("");
                      }
                      setCategory(found.slug || generateSlug(found.name));
                    } else {
                      setCategoryId(isUUID(selectedVal) ? selectedVal : "");
                      setCategory(selectedVal);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm text-charcoal appearance-none cursor-pointer pr-10"
                  required
                >
                  <option value="">-- Selecionar categoria ▼ --</option>
                  {activeCategories.map((cat) => {
                    const optVal = isUUID(cat.id) ? cat.id : (cat.slug || cat.id);
                    return (
                      <option key={cat.id || cat.slug} value={optVal}>
                        {cat.name}
                      </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-charcoal/50">
                  <Tag size={15} />
                </div>
              </div>

              {/* PAINEL INLINE DE CRIAÇÃO DE NOVA CATEGORIA */}
              {isAddingNewCat && (
                <div className="p-4 bg-white border border-gold-default/40 rounded-xl shadow-xs space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-pink-default/15 pb-2">
                    <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                      <Tag size={13} className="text-gold-dark" />
                      Cadastrar Categoria sem sair do produto
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCat(false)}
                      className="text-charcoal/40 hover:text-charcoal text-xs p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => handleInlineCategoryNameChange(e.target.value)}
                      placeholder="Nome da categoria (ex: Lembrancinhas Especiais)"
                      className="w-full px-3 py-2 bg-offwhite border border-pink-default/25 rounded-lg text-xs focus:outline-none focus:border-gold-default text-charcoal"
                      autoFocus
                    />
                    {newCatName.trim() && (
                      <span className="text-[10px] text-charcoal/50 block mt-1">
                        Slug: <code className="font-mono bg-pink-light/30 px-1 py-0.5 rounded">{generateSlug(newCatName)}</code>
                      </span>
                    )}
                  </div>

                  {newCatFeedback && (
                    <div
                      className={`p-2.5 rounded-lg text-xs flex flex-col gap-1.5 ${
                        newCatFeedback.type === "error"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : newCatFeedback.type === "warning"
                          ? "bg-amber-50 text-amber-900 border border-amber-200"
                          : "bg-green-50 text-green-800 border border-green-200"
                      }`}
                    >
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <span className="font-medium text-[11px]">{newCatFeedback.message}</span>
                      </div>

                      {newCatFeedback.similarCategory && (
                        <div className="flex items-center gap-2 pt-1 border-t border-current/10">
                          <button
                            type="button"
                            onClick={() => {
                              const sim = newCatFeedback.similarCategory;
                              if (sim) {
                                if (isUUID(sim.id)) {
                                  setCategoryId(sim.id);
                                } else {
                                  setCategoryId("");
                                }
                                setCategory(sim.slug || generateSlug(sim.name));
                              }
                              setIsAddingNewCat(false);
                              setNewCatFeedback(null);
                            }}
                            className="px-2.5 py-1 bg-white border rounded text-[10px] font-bold hover:bg-gray-50 transition-colors cursor-pointer text-charcoal"
                          >
                            Usar "{newCatFeedback.similarCategory.name}"
                          </button>
                          {newCatFeedback.type === "warning" && (
                            <button
                              type="button"
                              onClick={() => handleCreateInlineCategory(true)}
                              className="px-2.5 py-1 bg-amber-600 text-white rounded text-[10px] font-bold hover:bg-amber-700 transition-colors cursor-pointer"
                            >
                              Criar mesmo assim
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCreateInlineCategory(false)}
                      disabled={isSubmittingCat || !newCatName.trim()}
                      className="px-3.5 py-1.5 bg-gold-dark hover:bg-gold-default text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSubmittingCat ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Check size={13} />
                      )}
                      <span>Criar Categoria</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewCat(false);
                        setNewCatName("");
                        setNewCatFeedback(null);
                      }}
                      className="px-3 py-1.5 border border-pink-default/20 text-charcoal/70 rounded-lg text-xs hover:bg-offwhite transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">
                Descrição
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm h-28 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">
                Características
              </label>

              <textarea
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="Ex: Cerâmica artesanal, 200ml, Feito à mão"
                className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm h-20 resize-none"
              />

              <p className="text-[11px] text-charcoal/50 mt-1">
                Separe cada característica por vírgula.
              </p>
            </div>
          </div>

          {/* COLUNA 2 */}
          <div className="space-y-6">
            {/* IMAGEM PRINCIPAL */}
            <div className="bg-offwhite p-5 rounded-2xl border border-pink-default/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-charcoal">
                  Imagem Principal
                </h4>

                <span className="text-[10px] uppercase tracking-wider text-charcoal/50">
                  JPG / PNG / WebP · até 5 MB
                </span>
              </div>

              <input
                ref={mainImageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) =>
                  handleMainImageChange(e.target.files?.[0])
                }
              />

              {mainImagePreview ? (
                <div className="relative group">
                  <img
                    src={mainImagePreview}
                    alt="Preview da imagem principal"
                    className="w-full h-56 object-cover rounded-xl border border-pink-default/20 bg-white"
                  />

                  <button
                    type="button"
                    onClick={removeMainImage}
                    disabled={isSaving}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white text-red-500 shadow-md hover:bg-red-50 disabled:opacity-50"
                    title="Remover imagem"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => mainImageInputRef.current?.click()}
                  disabled={isSaving}
                  className="w-full h-56 rounded-xl border-2 border-dashed border-pink-default/30 bg-white hover:border-gold-default hover:bg-pink-light/20 transition-colors flex flex-col items-center justify-center gap-3 text-charcoal/50 disabled:opacity-50"
                >
                  <ImageIcon size={32} />
                  <span className="text-sm font-semibold">
                    Selecionar imagem principal
                  </span>
                  <span className="text-xs">
                    Clique para escolher um arquivo
                  </span>
                </button>
              )}

              {mainImagePreview && (
                <button
                  type="button"
                  onClick={() => mainImageInputRef.current?.click()}
                  disabled={isSaving}
                  className="mt-3 w-full px-4 py-2.5 rounded-xl border border-pink-default/30 bg-white text-sm font-semibold text-charcoal hover:bg-pink-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Upload size={16} />
                  Trocar imagem
                </button>
              )}
            </div>

            {/* GALERIA */}
            <div className="bg-offwhite p-5 rounded-2xl border border-pink-default/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-charcoal">
                  Galeria de Imagens
                </h4>

                <span className="text-xs text-charcoal/50">
                  Opcional
                </span>
              </div>

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleGalleryChange(e.target.files);
                  e.currentTarget.value = "";
                }}
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galleryUrls.map((url, index) => (
                  <div
                    key={`existing-${url}-${index}`}
                    className="relative group aspect-square"
                  >
                    <img
                      src={url}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl border border-pink-default/20 bg-white"
                    />

                    <button
                      type="button"
                      onClick={() => removeGalleryUrl(index)}
                      disabled={isSaving}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-red-500 shadow-md hover:bg-red-50 disabled:opacity-50"
                      title="Remover imagem"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                {galleryPreviews.map((url, index) => (
                  <div
                    key={`new-${url}`}
                    className="relative group aspect-square"
                  >
                    <img
                      src={url}
                      alt={`Nova imagem ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl border border-gold-default/40 bg-white"
                    />

                    <button
                      type="button"
                      onClick={() => removeGalleryFile(index)}
                      disabled={isSaving}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-red-500 shadow-md hover:bg-red-50 disabled:opacity-50"
                      title="Remover imagem"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isSaving}
                  className="aspect-square rounded-xl border-2 border-dashed border-pink-default/30 bg-white hover:border-gold-default hover:bg-pink-light/20 transition-colors flex flex-col items-center justify-center gap-2 text-charcoal/50 disabled:opacity-50"
                >
                  <Upload size={22} />
                  <span className="text-xs font-semibold">
                    Adicionar imagens
                  </span>
                </button>
              </div>
            </div>

            {/* PROMOÇÃO */}
            <div className="bg-offwhite p-5 rounded-2xl border border-pink-default/20 space-y-4">
              <h4 className="font-bold text-charcoal mb-2">
                Configurações de Promoção
              </h4>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPromo}
                  onChange={(e) => setIsPromo(e.target.checked)}
                  disabled={isSaving}
                  className="w-5 h-5 rounded border-pink-default text-gold-default focus:ring-gold-default"
                />

                <span className="text-sm font-medium text-charcoal">
                  Ativar Promoção
                </span>
              </label>

              {isPromo && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-sm font-bold text-charcoal mb-1">
                    Preço Promocional (R$)
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={promoPrice}
                    onChange={(e) =>
                      setPromoPrice(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                    className="w-full px-4 py-2.5 bg-white border border-pink-default/50 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm"
                    required={isPromo}
                    disabled={isSaving}
                  />
                </div>
              )}
            </div>

            {/* EXIBIÇÃO */}
            <div className="bg-offwhite p-5 rounded-2xl border border-pink-default/20 space-y-4">
              <h4 className="font-bold text-charcoal mb-2">
                Configurações de Exibição
              </h4>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  disabled={isSaving}
                  className="w-5 h-5 rounded border-pink-default text-gold-default focus:ring-gold-default"
                />

                <span className="text-sm font-medium text-charcoal">
                  Produto Ativo (Visível na loja)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  disabled={isSaving}
                  className="w-5 h-5 rounded border-pink-default text-gold-default focus:ring-gold-default"
                />

                <span className="text-sm font-medium text-charcoal">
                  Selo "Mais Vendido"
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customizable}
                  onChange={(e) => setCustomizable(e.target.checked)}
                  disabled={isSaving}
                  className="w-5 h-5 rounded border-pink-default text-gold-default focus:ring-gold-default"
                />

                <span className="text-sm font-medium text-charcoal">
                  Permitir Customização
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* BOTÕES */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-pink-default/20">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-charcoal hover:bg-offwhite transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gold-dark text-white hover:bg-gold-default transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}

            {isUploading
              ? "Enviando imagens..."
              : isSaving
              ? "Salvando..."
              : mode === "create"
              ? "Criar Produto"
              : "Salvar Produto"}
          </button>
        </div>
      </form>
    </div>
  );
}