import { useState } from "react";
import { Home, Heart, ShoppingBag, User as UserIcon, LogOut, Package, X, ChevronRight } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface MobileBottomNavProps {
  currentView: string;
  setView: (view: string) => void;
  cartCount: number;
  wishlistCount: number;
  openCart: () => void;
  openWishlist: () => void;
  user: User | null;
  profile?: any;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function MobileBottomNav({
  currentView,
  setView,
  cartCount,
  wishlistCount,
  openCart,
  openWishlist,
  user,
  profile,
  onOpenAuth,
  onLogout,
}: MobileBottomNavProps) {
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

  const handleHomeClick = () => {
    setView("home");
    setIsAccountDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAccountClick = () => {
    if (!user) {
      onOpenAuth();
    } else {
      setIsAccountDrawerOpen(!isAccountDrawerOpen);
    }
  };

  const isHomeActive = currentView === "home" && !isAccountDrawerOpen;
  const isAccountActive = currentView === "minha-conta" || isAccountDrawerOpen;

  return (
    <>
      {/* Pinned Bottom Navigation Bar for Mobile */}
      <nav
        aria-label="Navegação inferior mobile"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-pink-default/20 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-2">
          {/* 1. Início */}
          <button
            onClick={handleHomeClick}
            className={`flex flex-col items-center justify-center h-full py-1 transition-colors min-h-[44px] cursor-pointer ${
              isHomeActive
                ? "text-gold-dark font-bold"
                : "text-charcoal/65 hover:text-charcoal font-medium"
            }`}
            aria-label="Ir para o Início"
          >
            <div className="relative">
              <Home size={20} className={isHomeActive ? "stroke-[2.5]" : "stroke-2"} />
            </div>
            <span className="text-[10px] tracking-tight mt-1">Início</span>
          </button>

          {/* 2. Favoritos */}
          <button
            onClick={() => {
              setIsAccountDrawerOpen(false);
              openWishlist();
            }}
            className="flex flex-col items-center justify-center h-full py-1 text-charcoal/65 hover:text-charcoal transition-colors min-h-[44px] cursor-pointer relative"
            aria-label={`Ver Favoritos (${wishlistCount} itens)`}
          >
            <div className="relative">
              <Heart
                size={20}
                className={wishlistCount > 0 ? "fill-red-500 text-red-500 stroke-2" : "stroke-2"}
              />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 font-medium">Favoritos</span>
          </button>

          {/* 3. Carrinho */}
          <button
            onClick={() => {
              setIsAccountDrawerOpen(false);
              openCart();
            }}
            className="flex flex-col items-center justify-center h-full py-1 text-charcoal/65 hover:text-charcoal transition-colors min-h-[44px] cursor-pointer relative"
            aria-label={`Ver Carrinho (${cartCount} itens)`}
          >
            <div className="relative">
              <ShoppingBag size={20} className="stroke-2" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-gold-default text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 font-medium">Carrinho</span>
          </button>

          {/* 4. Conta */}
          <button
            onClick={handleAccountClick}
            className={`flex flex-col items-center justify-center h-full py-1 transition-colors min-h-[44px] cursor-pointer ${
              isAccountActive
                ? "text-gold-dark font-bold"
                : "text-charcoal/65 hover:text-charcoal font-medium"
            }`}
            aria-label={user ? "Abrir menu da conta" : "Fazer login ou cadastrar"}
          >
            <div className="relative">
              <UserIcon size={20} className={isAccountActive ? "stroke-[2.5]" : "stroke-2"} />
              {user && (
                <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 truncate max-w-[68px]">
              {user ? "Conta" : "Entrar"}
            </span>
          </button>
        </div>
      </nav>

      {/* Account Bottom Sheet Drawer for Logged In User */}
      {isAccountDrawerOpen && user && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setIsAccountDrawerOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl border-t border-pink-default/20 p-5 shadow-2xl animate-in slide-in-from-bottom duration-200"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="w-10 h-1 bg-charcoal/20 rounded-full mx-auto mb-4" />

            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-pink-default/15 mb-3">
              <div className="min-w-0 pr-3">
                <p className="text-xs text-charcoal/60 uppercase tracking-wider font-semibold">
                  Conectado como
                </p>
                <p className="text-sm font-bold text-charcoal truncate">
                  {profile?.full_name || user.email}
                </p>
                {profile?.full_name && (
                  <p className="text-xs text-charcoal/60 truncate">{user.email}</p>
                )}
              </div>
              <button
                onClick={() => setIsAccountDrawerOpen(false)}
                className="p-2 text-charcoal/50 hover:text-charcoal rounded-full bg-offwhite min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                aria-label="Fechar menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Options list */}
            <div className="space-y-1.5">
              {profile && (profile.role === "admin" || profile.role === "owner") && (
                <button
                  onClick={() => {
                    setIsAccountDrawerOpen(false);
                    setView("admin");
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-pink-light/40 transition-colors text-charcoal cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gold-light/60 flex items-center justify-center text-gold-dark">
                      <Package size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">Painel Administrativo</span>
                      <span className="text-[11px] text-charcoal/60">Gerenciar produtos e pedidos</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-charcoal/40" />
                </button>
              )}

              <button
                onClick={() => {
                  setIsAccountDrawerOpen(false);
                  setView("minha-conta");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-pink-light/40 transition-colors text-charcoal cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-pink-light/80 flex items-center justify-center text-charcoal">
                    <UserIcon size={18} />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">Meus Dados & Pedidos</span>
                    <span className="text-[11px] text-charcoal/60">Endereço e histórico</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-charcoal/40" />
              </button>

              <button
                onClick={() => {
                  setIsAccountDrawerOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-100/60 flex items-center justify-center text-red-600">
                    <LogOut size={18} />
                  </div>
                  <span className="text-sm font-bold">Sair da Conta</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
