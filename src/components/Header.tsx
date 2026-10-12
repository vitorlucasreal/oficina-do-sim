import { useState, useRef, useEffect } from "react";
import {
  Search,
  Heart,
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
  wishlistCount,
  openWishlist,
  searchQuery,
  setSearchQuery,
  user,
  profile,
  onOpenAuth,
  onLogout,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDesktopSearch, setShowDesktopSearch] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Close desktop user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when mobile search is opened
  useEffect(() => {
    if (showMobileSearch && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [showMobileSearch]);

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
      if (currentView === view) {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      
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
      setTimeout(checkAndScroll, 300);
    };

    if (view === "quem-somos") {
      triggerScroll("quem-somos");
    } else if (view === "shop") {
      triggerScroll("shop");
    }

    setView(view);
    setIsMobileMenuOpen(false);

    if (view !== "quem-somos" && view !== "shop") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div
        id="announcement-bar"
        className="bg-sage-dark text-white py-2 px-4 text-[11px] sm:text-xs tracking-wider text-center font-medium flex items-center justify-center gap-2"
      >
        <span>
          Atendimento Personalizado e Produção Artesanal Exclusiva
        </span>
      </div>

      {/* Sticky Main Header */}
      <header
        id="main-header"
        className="sticky top-0 z-40 bg-[#fdfbf7]/95 backdrop-blur-md border-b border-pink-default/30 transition-all duration-300 shadow-xs relative isolate overflow-visible"
      >
        {/* Background decorative artwork */}
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
            DESKTOP LAYOUT (lg+)
        ========================================================== */}
        <div className="hidden lg:flex flex-col items-center w-full max-w-7xl mx-auto px-8 pt-8 pb-6 relative z-20">
          {/* Brand Area */}
          <button
            id="brand-logo-btn"
            onClick={() => handleNavClick("home")}
            className="flex flex-col items-center group focus:outline-none relative z-20 cursor-pointer"
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
                  className={`text-[14px] tracking-[0.15em] uppercase transition-all duration-200 relative py-1 hover:text-gold-default focus:outline-none cursor-pointer ${
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

            {/* Desktop Action Icons */}
            <div className="ml-14 flex items-center gap-2 relative z-[100]">
              {/* Desktop Search Bar */}
              <div className="relative flex items-center">
                {showDesktopSearch ? (
                  <div className="flex items-center border border-pink-default/50 rounded-full bg-pink-light px-3 py-1.5 transition-all w-52 z-[500]">
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
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setShowDesktopSearch(false);
                        setSearchQuery("");
                      }}
                      className="text-charcoal/40 hover:text-charcoal transition-colors focus:outline-none ml-1 cursor-pointer"
                      aria-label="Limpar busca"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDesktopSearch(true)}
                    className="p-2 text-charcoal/80 hover:text-gold-default hover:bg-gold-light/40 rounded-full transition-colors focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                    title="Buscar produtos"
                    aria-label="Buscar produtos"
                  >
                    <Search size={22} />
                  </button>
                )}
              </div>

              {/* Desktop User Account / Auth */}
              {user ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`p-2 rounded-full transition-colors focus:outline-none flex items-center justify-center min-w-[36px] min-h-[36px] cursor-pointer ${
                      isUserMenuOpen
                        ? "text-gold-dark bg-gold-light/50"
                        : "text-charcoal/80 hover:text-gold-default hover:bg-gold-light/40"
                    }`}
                    title="Minha Conta"
                    aria-label="Minha Conta"
                    aria-expanded={isUserMenuOpen}
                  >
                    <UserIcon size={22} />
                  </button>

                  {/* Desktop Dropdown Menu on Click & Hover */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-pink-default/20 rounded-2xl shadow-xl py-2 z-[9999] animate-in fade-in duration-150">
                      <div className="px-4 py-2 border-b border-pink-default/10 mb-1">
                        <p className="text-[11px] font-semibold text-charcoal/50 uppercase tracking-wider">Conectado como</p>
                        <p className="text-xs font-bold text-charcoal truncate">
                          {profile?.full_name || user.email}
                        </p>
                      </div>

                      {profile && (profile.role === "admin" || profile.role === "owner") && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setView("admin");
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-semibold text-charcoal/85 hover:bg-pink-light/40 hover:text-gold-dark transition-colors flex items-center gap-2.5 cursor-pointer"
                        >
                          <Package size={16} />
                          Painel Admin
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setView("minha-conta");
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-charcoal/85 hover:bg-pink-light/40 hover:text-gold-dark transition-colors flex items-center gap-2.5 cursor-pointer"
                      >
                        <UserIcon size={16} />
                        Minha Conta
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5 cursor-pointer border-t border-pink-default/10 mt-1"
                      >
                        <LogOut size={16} />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="p-2 text-charcoal/80 hover:text-gold-default hover:bg-gold-light/40 rounded-full transition-colors focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                  title="Entrar ou Cadastrar"
                  aria-label="Entrar ou Cadastrar"
                >
                  <UserIcon size={22} />
                </button>
              )}

              {/* Desktop Favorites Icon */}
              <button
                onClick={openWishlist}
                className="p-2 text-charcoal/80 hover:text-red-500 hover:bg-pink-light/60 rounded-full transition-all relative focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                title="Lista de desejos"
                aria-label="Lista de desejos"
              >
                <Heart
                  size={22}
                  className={wishlistCount > 0 ? "fill-red-500 text-red-500" : ""}
                />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold border border-white">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
            MOBILE LAYOUT (Strict 3-zone structure)
            Left: Hamburger | Center: Logo | Right: Search
        ========================================================== */}
        <div className="lg:hidden flex flex-col items-center w-full px-2 sm:px-3 pt-2 pb-2 relative z-20">
          {showMobileSearch ? (
            /* Active Mobile Search Bar - smoothly replaces header content without overflow */
            <div className="flex items-center w-full gap-2 min-h-[44px]">
              <div className="flex-1 flex items-center bg-white border border-pink-default/30 rounded-full px-3 py-2 shadow-xs">
                <Search size={16} className="text-charcoal/40 shrink-0 mr-2" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  placeholder="Pesquisar lembrancinhas, kits..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (currentView !== "shop") {
                      setView("shop");
                    }
                  }}
                  className="w-full text-xs text-charcoal bg-transparent border-none outline-none placeholder-charcoal/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-charcoal/40 hover:text-charcoal p-1 cursor-pointer"
                    aria-label="Limpar texto"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setShowMobileSearch(false);
                }}
                className="px-3 py-2 text-xs font-semibold text-charcoal/70 hover:text-charcoal cursor-pointer min-h-[44px] flex items-center"
                aria-label="Fechar busca"
              >
                Cancelar
              </button>
            </div>
          ) : (
            /* Standard 3-Zone Header */
            <div className="flex items-center justify-between w-full min-h-[56px] sm:min-h-[64px]">
              {/* Zone 1: Menu / Hambúrguer à esquerda */}
              <div className="w-10 sm:w-11 flex items-center justify-start shrink-0">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                  className="w-10 h-10 sm:w-11 sm:h-11 text-charcoal/80 hover:bg-pink-light/40 rounded-full focus:outline-none flex items-center justify-center cursor-pointer transition-colors"
                >
                  {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>

              {/* Zone 2: Logo centralizado com presença visual ampliada */}
              <div className="flex-1 flex justify-center items-center px-1 sm:px-2 min-w-0">
                <button
                  onClick={() => handleNavClick("home")}
                  className="flex flex-col items-center justify-center focus:outline-none cursor-pointer max-w-full"
                  aria-label="Ir para a página inicial"
                >
                  <img
                    src="/images/logo_oficina_sim_1786290754245.jpeg"
                    alt="Oficina do Sim"
                    className="h-14 sm:h-16 max-h-16 w-auto max-w-[210px] min-[360px]:max-w-[245px] min-[390px]:max-w-[275px] min-[430px]:max-w-[310px] object-contain rounded-md transition-all"
                  />
                </button>
              </div>

              {/* Zone 3: Busca à direita */}
              <div className="w-10 sm:w-11 flex items-center justify-end shrink-0">
                <button
                  onClick={() => setShowMobileSearch(true)}
                  className="w-10 h-10 sm:w-11 sm:h-11 text-charcoal/80 hover:text-gold-default hover:bg-pink-light/40 rounded-full focus:outline-none flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Abrir pesquisa"
                  title="Pesquisar"
                >
                  <Search size={21} />
                </button>
              </div>
            </div>
          )}

          {/* Subtitle slogan */}
          {!showMobileSearch && (
            <div className="text-center w-full px-2 mt-1">
              <span className="text-[11px] text-gold-dark font-medium leading-tight block truncate">
                Tudo o que você precisa para seu grande dia
              </span>
            </div>
          )}
        </div>

        {/* =========================================================
            MOBILE DROPDOWN MENU
        ========================================================== */}
        {isMobileMenuOpen && (
          <div
            id="mobile-nav-panel"
            className="lg:hidden relative z-[1000] bg-white border-t border-pink-default/20 py-4 px-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200"
          >
            <div className="flex flex-col gap-2.5">
              {menuItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`text-left py-2 text-sm uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                    currentView === item.view
                      ? "text-gold-default font-bold"
                      : "text-charcoal/85 hover:text-gold-dark"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* Account quick link in mobile hamburger menu as well */}
              <div className="pt-3 border-t border-pink-default/15 flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="py-1">
                      <span className="text-[10px] uppercase tracking-wider text-charcoal/50 font-bold block">
                        Conectado como
                      </span>
                      <span className="text-xs font-semibold text-charcoal truncate block">
                        {profile?.full_name || user.email}
                      </span>
                    </div>

                    {profile && (profile.role === "admin" || profile.role === "owner") && (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setView("admin");
                        }}
                        className="text-left py-2 text-xs font-bold uppercase tracking-wider text-gold-dark hover:text-gold-default transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Package size={15} />
                        Painel Administrativo
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setView("minha-conta");
                      }}
                      className="text-left py-2 text-xs font-bold uppercase tracking-wider text-charcoal/80 hover:text-gold-default transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon size={15} />
                      Meus Dados & Pedidos
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="text-left py-2 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut size={15} />
                      Sair
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="text-left py-2 text-xs font-bold uppercase tracking-wider text-gold-dark hover:text-gold-default transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <UserIcon size={15} />
                    Entrar ou Cadastrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
