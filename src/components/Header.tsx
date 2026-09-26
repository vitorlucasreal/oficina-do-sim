import { useState } from "react";
import {
  Search,
  Heart,
  ShoppingBag,
  Sparkles,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Package,
} from "lucide-react";
import { User } from "@supabase/supabase-js";

interface HeaderProps {
  currentView: string;
  setView: (view: string) => void;
  cartCount: number;
  wishlistCount: number;
  openCart: () => void;
  openWishlist: () => void;
  openAI: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  user: User | null;
  profile?: any;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Header({
  currentView,
  setView,
  cartCount,
  wishlistCount,
  openCart,
  openWishlist,
  openAI,
  searchQuery,
  setSearchQuery,
  user,
  profile,
  onOpenAuth,
  onLogout,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const menuItems = [
    { label: "Início", view: "home" },
    { label: "Loja", view: "shop" },
    { label: "Quem Somos", view: "quem-somos" },
    { label: "Contato", view: "contato" },
  ];

  const handleNavClick = (view: string) => {
    if (view === "contato") {
      setIsMobileMenuOpen(false);
      const footer = document.getElementById("contato");
      if (footer) {
        footer.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }
      return;
    }

    const triggerScroll = (id: string) => {
      // If we are already on the view, just scroll immediately
      if (currentView === view) {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      
      // If we are changing views, wait for AnimatePresence transition
      let attempts = 0;
      const checkAndScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (attempts < 15) {
          attempts++;
          setTimeout(checkAndScroll, 100);
        }
      };
      // Start checking after a delay to allow the old view to exit (0.2s - 0.3s)
      setTimeout(checkAndScroll, 300);
    };

    if (view === "quem-somos") {
      triggerScroll("quem-somos");
    } else if (view === "shop") {
      triggerScroll("shop");
    }

    setView(view);
    setIsMobileMenuOpen(false);

    // Only scroll to top instantly if not using the smooth anchor scroll
    if (view !== "quem-somos" && view !== "shop") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const actionIcons = (
    <>
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        {showSearchInput ? (
          <div className="flex items-center border border-pink-default/50 rounded-full bg-pink-light px-3 py-1.5 transition-all w-40 sm:w-60 z-[500]">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);

                if (currentView !== "shop") {
                  setView("shop");
                }
              }}
              className="text-xs text-charcoal bg-transparent border-none outline-none w-full placeholder-charcoal/50"
            />

            <button
              onClick={() => {
                setShowSearchInput(false);
                setSearchQuery("");
              }}
              className="text-charcoal/40 hover:text-charcoal transition-colors focus:outline-none ml-1"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSearchInput(true)}
            className="p-1.5 sm:p-2 text-charcoal/80 hover:text-gold-default hover:bg-gold-light/40 rounded-full transition-colors focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
            title="Buscar produtos"
            aria-label="Buscar produtos"
          >
            <Search size={20} className="sm:w-[22px] sm:h-[22px]" />
          </button>
        )}
      </div>

      {/* User Account / Auth */}
      {user ? (
        <div className="relative group z-[500]">
          <button
            className="p-1.5 sm:p-2 text-charcoal/80 hover:text-gold-default hover:bg-gold-light/40 rounded-full transition-colors focus:outline-none flex items-center justify-center min-w-[36px] min-h-[36px] cursor-pointer"
            title="Minha Conta"
            aria-label="Minha Conta"
          >
            <UserIcon size={20} className="sm:w-[22px] sm:h-[22px]" />
          </button>

          <div className="absolute right-0 top-full mt-2 w-56 bg-white border-2 border-pink-default/20 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999]">
            <div className="px-4 py-2 border-b border-pink-default/10 mb-1">
              <p className="text-xs font-medium text-charcoal truncate">
                {user.email}
              </p>
            </div>

            {profile &&
              (profile.role === "admin" || profile.role === "owner") && (
                <button
                  onClick={() => setView("admin")}
                  className="w-full text-left px-4 py-2 text-sm text-charcoal/80 hover:bg-pink-light/40 hover:text-gold-dark transition-colors flex items-center gap-2"
                >
                  <Package size={16} />
                  Painel Admin
                </button>
              )}

            <button
              onClick={() => setView("minha-conta")}
              className="w-full text-left px-4 py-2 text-sm text-charcoal/80 hover:bg-pink-light/40 hover:text-gold-dark transition-colors flex items-center gap-2"
            >
              <UserIcon size={16} />
              Minha Conta
            </button>

            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-sm text-charcoal/80 hover:bg-pink-light/40 hover:text-gold-dark transition-colors flex items-center gap-2"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onOpenAuth}
          className="p-1.5 sm:p-2 text-charcoal/80 hover:text-gold-default hover:bg-gold-light/40 rounded-full transition-colors focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
          title="Entrar ou Cadastrar"
          aria-label="Entrar ou Cadastrar"
        >
          <UserIcon size={20} className="sm:w-[22px] sm:h-[22px]" />
        </button>
      )}

      {/* Favorites Icon */}
      <button
        onClick={openWishlist}
        className="p-1.5 sm:p-2 text-charcoal/80 hover:text-red-500 hover:bg-pink-light/60 rounded-full transition-all relative focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
        title="Lista de desejos"
        aria-label="Lista de desejos"
      >
        <Heart
          size={20}
          className={`sm:w-[22px] sm:h-[22px] ${wishlistCount > 0 ? "fill-red-500 text-red-500" : ""}`}
        />

        {wishlistCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] sm:text-[10px] w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full font-bold border border-white">
            {wishlistCount}
          </span>
        )}
      </button>
    </>
  );

  return (
    <>
      {/* Announcement Bar */}
      <div
        id="announcement-bar"
        className="bg-sage-dark text-white py-2 px-4 text-[11px] sm:text-xs tracking-wider text-center font-medium flex items-center justify-center gap-2"
      >
        <Sparkles
          size={13}
          className="animate-pulse text-gold-light hidden sm:block"
        />

        <span>
          Atendimento Personalizado e Produção Artesanal Exclusiva
        </span>
      </div>

      {/* Sticky Main Header */}
      <header
        id="main-header"
        className="sticky top-0 z-40 bg-[#fdfbf7]/95 backdrop-blur-md border-b border-pink-default/30 transition-all duration-300 shadow-sm relative isolate overflow-visible"
      >
        {/* =========================================================
            FUNDO DECORATIVO DO HEADER

            imagem_final.png é uma arte horizontal completa.
            O object-cover preserva a proporção original da imagem,
            evitando qualquer deformação das flores e pétalas.
        ========================================================== */}

        <div
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
<img
  src="/images/imagem_final.png"
  alt=""
  className="absolute left-1/2 top-0 -translate-x-1/2 w-full h-auto"
/>
        </div>

        {/* =========================================================
            DESKTOP LAYOUT
        ========================================================== */}
        <div className="hidden lg:flex flex-col items-center w-full max-w-7xl mx-auto px-8 pt-8 pb-6 relative z-20">
          {/* Brand Area */}
          <button
            id="brand-logo-btn"
            onClick={() => handleNavClick("home")}
            className="flex flex-col items-center group focus:outline-none relative z-20"
          >
            <img
              src="/images/logo_oficina_sim_1786290754245.jpeg"
              alt="Oficina do Sim Logo"
              className="h-[210px] w-auto object-contain rounded-lg shadow-sm group-hover:scale-[1.02] transition-transform duration-500"
            />

            <span className="text-[15px] text-gold-dark font-medium leading-snug mt-2">
              Tudo o que você precisa para seu grande dia
            </span>
          </button>

          {/* Decorative Divider */}
          <div className="w-64 flex items-center justify-center gap-4 mt-3 mb-5 opacity-100 relative z-20">
            <div className="h-[2px] flex-1 bg-gold-default/80"></div>

            <div className="w-2.5 h-2.5 rotate-45 bg-gold-dark"></div>

            <div className="h-[2px] flex-1 bg-gold-default/80"></div>
          </div>

          {/* Navigation & Icons Row */}
          <div className="w-full flex items-center justify-center relative z-30">
            {/* Desktop Navigation */}
            <nav
              id="desktop-nav"
              className="flex items-center justify-center gap-12 relative z-30"
            >
              {menuItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`text-[14px] tracking-[0.15em] uppercase transition-all duration-200 relative py-1 hover:text-gold-default focus:outline-none ${
                    currentView === item.view
                      ? "text-gold-default font-semibold"
                      : "text-charcoal/75 font-medium"
                  }`}
                >
                  {item.label}

                  {currentView === item.view && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gold-default rounded-full" />
                  )}
                </button>
              ))}
            </nav>

            {/* Action Icons */}
            <div className="ml-14 flex items-center gap-2 relative z-[100]">
              {actionIcons}
            </div>
          </div>
        </div>

        {/* =========================================================
            MOBILE LAYOUT
        ========================================================== */}
        <div className="lg:hidden flex flex-col items-center w-full px-3 sm:px-4 pt-3 pb-3 relative z-20">
          <div className="flex items-center justify-between w-full relative min-h-[56px] gap-1">
            {/* Hamburger button */}
            <div className="flex items-center shrink-0 z-30">
              <button
                onClick={() =>
                  setIsMobileMenuOpen(!isMobileMenuOpen)
                }
                aria-label={isMobileMenuOpen ? "Fechar menu principal" : "Abrir menu principal"}
                className="p-2 text-charcoal/80 hover:bg-pink-light/40 rounded-full focus:outline-none min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
              >
                {isMobileMenuOpen ? (
                  <X size={22} />
                ) : (
                  <Menu size={22} />
                )}
              </button>
            </div>

            {/* Centered Logo with proportional height */}
            <div className="flex-1 flex justify-center items-center px-1 min-w-0">
              <button
                onClick={() => handleNavClick("home")}
                className="flex flex-col items-center focus:outline-none cursor-pointer"
                aria-label="Ir para a página inicial"
              >
                <img
                  src="/images/logo_oficina_sim_1786290754245.jpeg"
                  alt="Oficina do Sim Logo"
                  className="h-14 sm:h-18 max-w-[150px] sm:max-w-[200px] w-auto object-contain rounded-lg shadow-2xs"
                />
              </button>
            </div>

            {/* Action icons */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 z-30">
              {actionIcons}
            </div>
          </div>

          <div className="mt-1.5 text-center w-full px-2 relative z-20">
            <span className="text-[11px] sm:text-xs text-gold-dark font-medium leading-tight block truncate">
              Tudo o que você precisa para seu grande dia
            </span>
          </div>
        </div>

        {/* =========================================================
            MOBILE DROPDOWN MENU
        ========================================================== */}
        {isMobileMenuOpen && (
          <div
            id="mobile-nav-panel"
            className="lg:hidden relative z-[1000] bg-white border-t border-pink-default/20 py-4 px-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
          >
            <div className="flex flex-col gap-3">
              {menuItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`text-left py-2 text-sm uppercase tracking-wider font-semibold transition-all ${
                    currentView === item.view
                      ? "text-gold-default"
                      : "text-charcoal/85"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="pt-2 border-t border-pink-default/10 flex flex-col gap-2">
                {/* AI Mobile - TEMPORARILY DISABLED */}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}