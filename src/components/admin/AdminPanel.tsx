import { useState } from "react";
import { Package, Plus, LogOut, ArrowLeft, Users, Tags } from "lucide-react";
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";
import UserList from "./UserList";
import CategoryManager from "./CategoryManager";
import { AdminProduct } from "./types";
import { useAuth } from "../../hooks/useAuth";

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"list" | "create" | "edit" | "categories" | "users">("list");
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const { profile } = useAuth();

  const handleEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setActiveTab("edit");
  };

  return (
    <div className="min-h-screen bg-offwhite flex flex-col md:flex-row text-charcoal font-sans">
      {/* Sidebar - Desktop & Topbar Mobile */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-pink-default/20 flex flex-col shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        {/* Top Header with Balanced Layout */}
        <div className="p-4 sm:p-5 border-b border-pink-default/20 flex items-center justify-between gap-3 shrink-0 bg-white">
          <div className="min-w-0 flex-1">
            <h2 className="font-serif font-bold text-lg sm:text-xl text-charcoal leading-tight truncate">
              Painel Admin
            </h2>
            <span className="text-[10px] uppercase tracking-widest text-charcoal/50 font-bold block mt-0.5">
              OFICINA DO SIM
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-charcoal/75 hover:text-red-600 bg-pink-light/30 hover:bg-red-50 border border-pink-default/20 hover:border-red-200 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Sair do Painel"
            aria-label="Sair do Painel"
          >
            <LogOut size={14} />
            <span className="whitespace-nowrap">Sair do Painel</span>
          </button>
        </div>
        
        <nav className="p-3 sm:p-4 flex-1 flex md:flex-col gap-1.5 sm:gap-2 overflow-x-auto md:overflow-visible no-scrollbar">
          <button
            onClick={() => { setActiveTab("list"); setEditingProduct(null); }}
            className={`flex-shrink-0 md:w-full flex items-center justify-center md:justify-start gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-colors whitespace-nowrap text-xs sm:text-sm cursor-pointer ${
              activeTab === "list" ? "bg-pink-light text-charcoal font-bold" : "text-charcoal/70 hover:bg-offwhite"
            }`}
          >
            <Package size={16} className="sm:w-[18px] sm:h-[18px]" /> <span>Produtos</span>
          </button>
          <button
            onClick={() => { setActiveTab("create"); setEditingProduct(null); }}
            className={`flex-shrink-0 md:w-full flex items-center justify-center md:justify-start gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-colors whitespace-nowrap text-xs sm:text-sm cursor-pointer ${
              activeTab === "create" ? "bg-pink-light text-charcoal font-bold" : "text-charcoal/70 hover:bg-offwhite"
            }`}
          >
            <Plus size={16} className="sm:w-[18px] sm:h-[18px]" /> <span>Novo Produto</span>
          </button>
          
          <button
            onClick={() => { setActiveTab("categories"); setEditingProduct(null); }}
            className={`flex-shrink-0 md:w-full flex items-center justify-center md:justify-start gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-colors whitespace-nowrap text-xs sm:text-sm cursor-pointer ${
              activeTab === "categories" ? "bg-pink-light text-charcoal font-bold" : "text-charcoal/70 hover:bg-offwhite"
            }`}
          >
            <Tags size={16} className="sm:w-[18px] sm:h-[18px]" /> <span>Categorias</span>
          </button>

          {(profile?.role === 'admin' || profile?.role === 'owner') && (
            <button
              onClick={() => { setActiveTab("users"); setEditingProduct(null); }}
              className={`flex-shrink-0 md:w-full flex items-center justify-center md:justify-start gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-colors whitespace-nowrap text-xs sm:text-sm cursor-pointer ${
                activeTab === "users" ? "bg-pink-light text-charcoal font-bold" : "text-charcoal/70 hover:bg-offwhite"
              }`}
            >
              <Users size={16} className="sm:w-[18px] sm:h-[18px]" /> <span>Usuários</span>
            </button>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto">
          {activeTab === "list" && <ProductList onEdit={handleEdit} />}
          {activeTab === "create" && <ProductForm mode="create" onCancel={() => setActiveTab("list")} />}
          {activeTab === "edit" && editingProduct && (
            <ProductForm mode="edit" product={editingProduct} onCancel={() => setActiveTab("list")} />
          )}
          {activeTab === "categories" && <CategoryManager />}
          {activeTab === "users" && <UserList />}
        </div>
      </main>
    </div>
  );
}
