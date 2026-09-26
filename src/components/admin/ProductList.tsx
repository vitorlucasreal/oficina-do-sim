import { useAdminProducts } from "../../hooks/useAdminProducts";
import { AdminProduct } from "./types";
import { Edit, Eye, EyeOff, Search, Power } from "lucide-react";
import { useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { useCategories } from "../../hooks/useCategories";
import { isUUID } from "../../utils/categoryUtils";
import ProductModal from "../ProductModal";
import { Product } from "../../types";

export default function ProductList({ onEdit }: { onEdit: (p: AdminProduct) => void }) {
  const { products, loading, error, refetch } = useAdminProducts();
  const { categories } = useCategories();
  const [search, setSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => {
      if (cat.id) map.set(cat.id.toLowerCase(), cat.name);
      if (cat.slug) map.set(cat.slug.toLowerCase(), cat.name);
      if (cat.name) map.set(cat.name.toLowerCase(), cat.name);
    });
    return map;
  }, [categories]);

  const handleToggleActive = async (product: AdminProduct) => {
    if (isUpdating) return;
    
    setIsUpdating(product.id);
    try {
      const { error } = await supabase
        .from("products")
        .update({ active: !product.active })
        .eq("id", product.id);
        
      if (error) throw error;
      await refetch();
    } catch (err) {
      console.error("Erro ao alternar status do produto:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-gold-default border-t-transparent rounded-full animate-spin"></div>
        <p className="text-charcoal/50 font-semibold uppercase tracking-widest text-xs">Carregando catálogo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-red-500 bg-white rounded-3xl border border-red-100 p-8 shadow-sm">
        <span className="font-bold text-lg mb-2 block">Ops, algo deu errado.</span>
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-[1187px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="font-serif text-2xl font-bold text-charcoal">Gerenciar Produtos</h3>
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default/50 text-sm shadow-sm transition-colors"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-pink-default/20 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-offwhite text-charcoal/60 uppercase tracking-widest text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4 rounded-tl-3xl">Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 rounded-tr-3xl text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-default/10">
              {filteredProducts.map((p) => (
                <tr key={p.id} className={`hover:bg-pink-light/20 transition-colors ${!p.active ? 'opacity-60 bg-gray-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(p)}
                        aria-label={`Visualizar produto ${p.name}`}
                        title="Visualizar produto"
                        className="group relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-pink-default/20 bg-pink-light/50 shadow-sm transition-all duration-200 hover:opacity-90 hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gold-default focus:ring-offset-1 cursor-pointer"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <Eye size={16} className="text-white drop-shadow" />
                        </div>
                      </button>
                      <div className="flex flex-col">
                        <span className="font-bold text-charcoal max-w-xs sm:max-w-md break-words leading-tight">{p.name}</span>
                        {p.isBestSeller && <span className="text-[9px] text-gold-dark uppercase tracking-widest mt-0.5 font-bold">Mais Vendido</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-charcoal/80 font-medium whitespace-nowrap">
                    {(p.categoryId && categoryMap.get(p.categoryId.toLowerCase())) ||
                      categoryMap.get(p.category.toLowerCase()) ||
                      p.categoryRef?.name ||
                      p.category.replace(/-/g, " ")}
                  </td>
                  <td className="px-6 py-4 text-charcoal font-semibold">
                    R$ {p.price.toFixed(2)}
                    {p.isPromo && p.promoPrice && (
                      <span className="ml-2 text-xs text-red-500 line-through font-normal">
                        R$ {p.promoPrice.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {p.active ? <Eye size={12}/> : <EyeOff size={12}/>}
                      {p.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button 
                      onClick={() => handleToggleActive(p)}
                      disabled={isUpdating === p.id}
                      aria-label={p.active ? "Desativar Produto" : "Ativar Produto"}
                      className={`p-2 inline-flex min-w-[36px] min-h-[36px] items-center justify-center transition-colors bg-white rounded-lg shadow-sm border border-transparent mr-2 cursor-pointer ${p.active ? 'text-charcoal/50 hover:text-red-500 hover:bg-red-50 hover:border-red-100' : 'text-charcoal/50 hover:text-green-600 hover:bg-green-50 hover:border-green-100'} ${isUpdating === p.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={p.active ? "Desativar Produto" : "Ativar Produto"}
                    >
                      {p.active ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button 
                      onClick={() => onEdit(p)} 
                      disabled={isUpdating === p.id}
                      aria-label="Editar Produto"
                      className="p-2 inline-flex min-w-[36px] min-h-[36px] items-center justify-center text-charcoal/50 hover:text-gold-default transition-colors bg-white hover:bg-pink-light rounded-lg shadow-sm border border-transparent hover:border-pink-default/20 disabled:opacity-50 cursor-pointer"
                      title="Editar Produto"
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-charcoal/50 font-medium">Nenhum produto encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Detail Modal para visualização pelo Admin/Owner */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={() => setSelectedProduct(null)}
          isWishlisted={false}
          toggleWishlist={() => {}}
        />
      )}
    </div>
  );
}
