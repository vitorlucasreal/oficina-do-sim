import { useState } from "react";
import { Search, Heart, ShoppingBag, Sparkles, Menu, X, HelpCircle } from "lucide-react";

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
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const menuItems = [
    { label: "Início", view: "home" },
    { label: "Loja", view: "shop" },
    { label: "Monte seu Kit", view: "kit-builder" },
    { label: "Estilo Quiz", view: "quiz" },
    { label: "Calculadora", view: "calculator" },
  ];

  const handleNavClick = (view: string) => {
    setView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Benefit Announcement Bar */}
      <div id="announcement-bar" className="bg-sage-default text-white py-2 px-4 text-xs tracking-wider text-center font-medium flex items-center justify-center gap-2">
        <Sparkles size={13} className="animate-pulse" />
        <span>Frete Grátis para todo o Brasil em compras acima de R$ 350 | Parcelamento em até 6x sem juros</span>
      </div>

      {/* Sticky Main Header */}
      <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-default/30 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo Brand Area */}
          <button
            id="brand-logo-btn"
            onClick={() => handleNavClick("home")}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            {/* Elegant Floral Wreath Logo */}
            <div className="w-11 h-11 rounded-full border border-gold-default/40 flex items-center justify-center bg-pink-light group-hover:border-gold-default transition-all">
              <svg
                className="w-8 h-8 text-gold-default"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" strokeDasharray="3 3" />
                <path d="M8 11.5c.5-.8 1.5-1.3 2.5-1s1.3 1.5 1 2.5l-.5 1.5" />
                <path d="M16 11.5c-.5-.8-1.5-1.3-2.5-1s-1.3 1.5-1 2.5l.5 1.5" />
                <path d="M9.5 16.5c1.2.8 2.8.8 4 0" />
                <circle cx="6" cy="9" r="1.5" fill="currentColor" opacity="0.3" />
                <circle cx="18" cy="9" r="1.5" fill="currentColor" opacity="0.3" />
                <circle cx="12" cy="5" r="1" fill="currentColor" />
              </svg>
            </div>
            <div>
              <span className="block font-serif text-xl tracking-widest text-charcoal font-semibold uppercase leading-none">
                Oficina do Sim
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-gold-dark font-semibold mt-0.5">
                Lembranças & Personalizados
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`text-sm tracking-widest uppercase font-medium transition-all duration-200 relative py-1 hover:text-gold-default focus:outline-none ${
                  currentView === item.view
                    ? "text-gold-default font-semibold"
                    : "text-charcoal/75"
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
          <div id="header-actions" className="flex items-center gap-2 sm:gap-4">
            
            {/* Search Input Bar (Expandable) */}
            <div className="relative flex items-center">
              {showSearchInput ? (
                <div className="flex items-center border border-pink-default/50 rounded-full bg-pink-light px-3 py-1.5 transition-all w-48 sm:w-60">
                  <input
                    type="text"
                    placeholder="Buscar lembranças..."
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
                      setShowSearchInput(false);
                      setSearchQuery("");
                    }}
                    className="text-charcoal/40 hover:text-charcoal transition-colors focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearchInput(true)}
                  className="p-2 text-charcoal/70 hover:text-gold-default hover:bg-gold-light/40 rounded-full transition-colors focus:outline-none"
                  title="Buscar produtos"
                >
                  <Search size={20} />
                </button>
              )}
            </div>

            {/* AI Assistant Button */}
            <button
              onClick={openAI}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold-default/30 bg-gold-light/40 text-gold-dark hover:bg-gold-light transition-colors text-xs font-semibold tracking-wider"
              title="Pergunte à Victória & Dani"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>Consultora IA</span>
            </button>

            {/* Favorites Icon */}
            <button
              onClick={openWishlist}
              className="p-2 text-charcoal/70 hover:text-red-500 hover:bg-pink-light/60 rounded-full transition-all relative focus:outline-none"
              title="Lista de desejos"
            >
              <Heart size={20} className={wishlistCount > 0 ? "fill-red-500 text-red-500" : ""} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold scale-90 border border-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={openCart}
              className="p-2.5 bg-gold-default/10 text-gold-dark hover:bg-gold-default hover:text-white rounded-full transition-all relative focus:outline-none"
              title="Sacola de Compras"
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold-dark text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border border-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Navigation Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-charcoal/70 hover:bg-pink-light/40 rounded-full focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-nav-panel" className="lg:hidden bg-white border-t border-pink-default/20 py-4 px-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
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
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAI();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-gold-light/60 text-gold-dark hover:bg-gold-light font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  <Sparkles size={14} />
                  <span>Consultora de Casamento IA</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
