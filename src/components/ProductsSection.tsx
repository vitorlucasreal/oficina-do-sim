import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, Heart, Sparkles, Star, ShoppingBag, Eye, Check } from "lucide-react";
import { CATEGORIES } from "../data";
import { Product } from "../types";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { generateSlug } from "../utils/categoryUtils";

interface ProductsSectionProps {
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  initialSearchQuery?: string;
  initialCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

export default function ProductsSection({
  onProductClick,
  onAddToCart,
  wishlist,
  toggleWishlist,
  initialSearchQuery = "",
  initialCategory = "all",
  onCategoryChange,
}: ProductsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "all");
  const [search, setSearch] = useState(initialSearchQuery);
  const [onlyCustomizable, setOnlyCustomizable] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [showFilters, setShowFilters] = useState(false);
  const { products, loading, error } = useProducts();
  const { activeCategories } = useCategories();

  useEffect(() => {
    setSelectedCategory(initialCategory || "all");
  }, [initialCategory]);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    onCategoryChange?.(catId);
  };

  const categoriesWithAll = useMemo(() => {
    const list = activeCategories.length > 0 ? activeCategories : CATEGORIES;
    return [
      { id: "all", name: "Todos os Itens", slug: "all", active: true, description: "", image: "", iconName: "" },
      ...list,
    ];
  }, [activeCategories]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "all") {
      result = result.filter((p) => {
        if (p.categoryId === selectedCategory) return true;
        const catSlug = generateSlug(p.category);
        const selectedCat = categoriesWithAll.find(
          (c) => c.id === selectedCategory || c.slug === selectedCategory
        );
        if (selectedCat) {
          return (
            p.categoryId === selectedCat.id ||
            p.category === selectedCat.slug ||
            p.category.toLowerCase() === selectedCat.name.toLowerCase() ||
            catSlug === selectedCat.slug
          );
        }
        return p.category === selectedCategory || catSlug === selectedCategory;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    if (onlyCustomizable) {
      result = result.filter((p) => p.customizable);
    }

    // Filter by price
    result = result.filter((p) => {
      const price = p.isPromo ? (p.promoPrice ?? p.price) : p.price;
      return price <= maxPrice;
    });

    // Sorting options
    if (sortBy === "price-asc") {
      result.sort((a, b) => {
        const pA = a.isPromo ? (a.promoPrice ?? a.price) : a.price;
        const pB = b.isPromo ? (b.promoPrice ?? b.price) : b.price;
        return pA - pB;
      });
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => {
        const pA = a.isPromo ? (a.promoPrice ?? a.price) : a.price;
        const pB = b.isPromo ? (b.promoPrice ?? b.price) : b.price;
        return pB - pA;
      });
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, selectedCategory, search, onlyCustomizable, maxPrice, sortBy, categoriesWithAll]);

  return (
    <section id="shop" className="py-10 sm:py-16 bg-white min-h-[80vh] text-left scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Visual Category quick selection slider */}
        <div className="space-y-4">
          <span className="text-xs uppercase tracking-widest text-gold-dark font-bold bg-gold-light/60 px-3.5 py-1 rounded-full block w-fit">
            Navegar Catálogo
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal font-semibold tracking-wide">
            Nossos Mimos e Detalhes
          </h2>
          
          <div 
            className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categoriesWithAll.map((cat) => {
              const isActive =
                selectedCategory === cat.id ||
                (cat.slug !== "all" && selectedCategory === cat.slug);
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    handleSelectCategory(cat.id);
                    window.scrollTo({ top: 300, behavior: "smooth" });
                  }}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-wider uppercase shrink-0 border transition-all duration-200 focus:outline-none cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-gold-default text-white border-gold-default shadow-xs"
                      : "bg-offwhite text-charcoal/80 border-pink-default/20 hover:border-pink-default"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action filter bars */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-offwhite p-4 rounded-2xl border border-pink-default/15 shadow-2xs">
          
          {/* Quick search input */}
          <div className="flex-1 relative flex items-center">
            <Search size={16} className="absolute left-4 text-charcoal/40" />
            <input
              type="text"
              placeholder="Pesquisar por velinhas, taças, kits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white text-sm sm:text-base pl-11 pr-4 py-2.5 rounded-xl border border-pink-default/20 focus:outline-none focus:border-gold-default text-charcoal"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Toggle filter drawer button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all focus:outline-none ${
                showFilters || onlyCustomizable || maxPrice < 200
                  ? "border-gold-default bg-gold-light/20 text-gold-dark font-bold"
                  : "border-pink-default/20 bg-white text-charcoal/80"
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>Filtros</span>
            </button>

            {/* Sort order dropdown selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-pink-default/20 bg-white text-xs font-semibold text-charcoal/75 focus:outline-none"
            >
              <option value="recommended">Recomendados</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="rating">Melhor Avaliados</option>
              <option value="name-asc">Nome (A - Z)</option>
            </select>
          </div>

        </div>

        {/* Collapsible advanced filters drawer block */}
        {showFilters && (
          <div className="bg-pink-light/25 p-6 rounded-2xl border border-pink-default/15 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs animate-in fade-in duration-200">
            {/* Price slider */}
            <div className="space-y-2.5 text-left">
              <div className="flex justify-between font-semibold text-charcoal">
                <span>Preço Máximo</span>
                <span className="text-gold-dark font-bold">Até R$ {maxPrice.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-gold-default cursor-pointer h-1.5 bg-pink-default/30 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-charcoal/40 font-semibold">
                <span>R$ 10,00</span>
                <span>R$ 250,00</span>
              </div>
            </div>

            {/* Checkbox customization options */}
            <div className="space-y-3 text-left flex flex-col justify-center">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={onlyCustomizable}
                  onChange={(e) => setOnlyCustomizable(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-pink-default text-gold-default focus:ring-gold-default"
                />
                <div>
                  <span className="font-semibold text-charcoal block group-hover:text-gold-dark">Apenas Itens Personalizáveis</span>
                  <span className="text-[10px] text-charcoal/75">Permitem gravar nomes, monogramas e datas</span>
                </div>
              </label>
            </div>

            {/* Quick reset button */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => {
                  setOnlyCustomizable(false);
                  setMaxPrice(200);
                  setSearch("");
                  handleSelectCategory("all");
                }}
                className="px-5 py-2.5 border border-pink-default/20 hover:border-charcoal hover:bg-white text-charcoal/80 rounded-xl transition-all font-semibold"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          </div>
        )}

        {/* E-shop grid card list */}
        {filteredProducts.length === 0 && !loading && !error ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-pink-light/60 flex items-center justify-center text-gold-dark mx-auto">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-charcoal">Nenhum mimo encontrado</h4>
              <p className="text-xs text-charcoal/75 max-w-sm mx-auto mt-1  leading-relaxed">
                Nossos produtos são limitados. Experimente ajustar os filtros ou digitar um termo diferente na busca.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {loading ? (
              Array(8).fill(0).map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl sm:rounded-3xl border border-pink-default/20 overflow-hidden shadow-xs animate-pulse flex flex-col h-[320px] sm:h-[400px]">
                  <div className="aspect-square bg-pink-light/40 w-full" />
                  <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="h-2 w-1/3 bg-gray-200 rounded" />
                      <div className="h-3 sm:h-4 w-3/4 bg-gray-200 rounded" />
                    </div>
                    <div className="pt-3 border-t border-pink-default/10 mt-3 flex justify-between">
                      <div className="h-3 w-1/3 bg-gray-200 rounded" />
                      <div className="h-6 sm:h-8 w-1/3 bg-gray-200 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full py-16 text-center text-red-500 bg-red-50 rounded-3xl border border-red-100 flex flex-col items-center justify-center">
                <span className="font-semibold text-lg mb-2">Ops, algo deu errado.</span>
                <p className="max-w-md mx-auto text-sm">{error}</p>
              </div>
            ) : (
              filteredProducts.map((p) => {
              const isWish = wishlist.some((item) => item.id === p.id);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-pink-default/20 overflow-hidden relative group hover:border-gold-default/45 transition-all duration-300 shadow-xs flex flex-col justify-between"
                >
                  {/* Heart Wishlist Trigger */}
                  <button
                    onClick={() => toggleWishlist(p)}
                    className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 bg-white/90 hover:bg-white rounded-full text-charcoal/75 hover:text-red-500 transition-colors shadow-sm focus:outline-none"
                    aria-label="Adicionar aos favoritos"
                  >
                    <Heart size={13} className={isWish ? "fill-red-500 text-red-500" : ""} />
                  </button>

                  {/* Best Seller Badges */}
                  <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-10 flex flex-col gap-1">
                    {p.isBestSeller && (
                      <span className="bg-gold-default text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-sm">
                        Mais Vendido
                      </span>
                    )}
                  </div>

                  {/* Card Visual Header with Hover actions */}
                  <div className="relative aspect-square overflow-hidden bg-pink-light border-b border-pink-default/5">
                    <img
                      src={p.image}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Dark gradient visual action triggers overlay */}
                    <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button
                        onClick={() => onProductClick(p)}
                        className="p-2.5 sm:p-3 bg-white text-charcoal hover:bg-gold-default hover:text-white rounded-full transition-colors shadow-lg focus:outline-none cursor-pointer"
                        title="Ver Detalhes do Mimo"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Content details and Buy footer triggers */}
                  <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1 sm:space-y-2 text-left">
                      <div className="flex items-center gap-1 text-[8.5px] sm:text-[9.5px] text-charcoal/75 font-bold uppercase tracking-wider">
                        <span className="truncate">{p.category.replace("-", " ")}</span>
                        {p.customizable && (
                          <span className="inline-flex items-center gap-0.5 text-gold-dark font-extrabold bg-gold-light/40 px-1 py-0.5 rounded shrink-0">
                            <Sparkles size={8} /> Personalizável
                          </span>
                        )}
                      </div>
                      
                      <h4
                        onClick={() => onProductClick(p)}
                        className="font-serif text-xs sm:text-sm md:text-base font-bold text-charcoal hover:text-gold-default cursor-pointer transition-colors leading-snug line-clamp-2"
                      >
                        {p.name}
                      </h4>

                      <div className="flex items-center gap-1 text-gold-default">
                        <Star size={11} className="fill-current" />
                        <span className="text-[10px] sm:text-[11px] font-semibold text-charcoal/75">{p.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="pt-2.5 sm:pt-4 border-t border-pink-default/10 mt-2.5 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      {/* Pricing */}
                      <div className="text-left">
                        <span className="block font-serif text-sm sm:text-base md:text-lg font-bold text-gold-dark leading-none">
                          R$ {p.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Buy action */}
                      <button
                        onClick={() => {
                          if (p.customizable) {
                            onProductClick(p);
                          } else {
                            onAddToCart(p);
                          }
                        }}
                        className="w-full sm:w-auto px-2.5 sm:px-4 py-1.5 sm:py-2 bg-charcoal hover:bg-gold-default text-white text-[9.5px] sm:text-[10.5px] uppercase tracking-wider sm:tracking-widest font-bold rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                      >
                        <ShoppingBag size={12} />
                        <span>Comprar</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
            )}
          </div>
        )}

      </div>
    </section>
  );
}
