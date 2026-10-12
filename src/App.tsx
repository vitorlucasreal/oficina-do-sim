import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Heart,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Star,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Award,
  Truck,
  BookOpen,
  ShoppingBag,
  Info
} from "lucide-react";

import { supabase } from "./lib/supabase";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AIConsultant from "./components/AIConsultant";
import FavorsCalculator from "./components/FavorsCalculator";
import Quiz from "./components/Quiz";
import KitBuilder from "./components/KitBuilder";
import ProductModal from "./components/ProductModal";
import Cart from "./components/Cart";
import ProductsSection from "./components/ProductsSection";
import ProductCarousel from "./components/ProductCarousel";
import AuthModal from "./components/AuthModal";
import AdminPanel from "./components/admin/AdminPanel";
import MyAccount from "./pages/MyAccount";
import MobileBottomNav from "./components/MobileBottomNav";

// Hooks
import { useAuth } from "./hooks/useAuth";
import { useCartSync } from "./hooks/useCartSync";
import { useCategories } from "./hooks/useCategories";

// InteractiveSections
import {
  HowItWorks,
  WhyUs,
  FoundersSection,
  PinterestGallery,
  Testimonials,
  InstagramFeed,
  FAQ,
  FinalCTA
} from "./components/InteractiveSections";

// Data
import { CATEGORIES, BLOG_POSTS } from "./data";
import { useProducts } from "./hooks/useProducts";
import { Product, CartItem, QuizResult, Customizations } from "./types";
import { initGA, trackPageView } from "./lib/analytics";

export default function App() {
  const { session, user, profile, signOut } = useAuth();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { activeCategories, featuredHomeCategories } = useCategories();
  const [currentView, setView] = useState<string>("home");
  const [selectedShopCategory, setSelectedShopCategory] = useState<string>("all");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "signup" | "recovery" | "update_password">("login");
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCartSync(user);
  const collectionsScrollRef = useRef<HTMLDivElement>(null);

  const handleCollectionsScroll = (direction: "left" | "right") => {
    if (!collectionsScrollRef.current) return;
    const scrollAmount = collectionsScrollRef.current.clientWidth >= 640 ? 440 : 200;
    collectionsScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    // Initialize GA4
    if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
      initGA(import.meta.env.VITE_GA_MEASUREMENT_ID);
    }
  }, []);

  useEffect(() => {
    // Track page views on route changes
    trackPageView(`/${currentView === 'home' ? '' : currentView}`);
  }, [currentView]);

  useEffect(() => {
    // 1. Listen for auth events, specifically PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setAuthView("update_password");
        setIsAuthOpen(true);
      }
    });

    // 2. Handle URL errors from Supabase callbacks gracefully
    const hash = window.location.hash;
    const search = window.location.search;
    
    if (
      hash.includes("error=access_denied") || 
      search.includes("error=access_denied") || 
      hash.includes("error_code=otp_expired") || 
      search.includes("error_code=otp_expired") ||
      hash.includes("error_description=") ||
      search.includes("error_description=")
    ) {
      window.history.replaceState(null, "", window.location.pathname);
      setToastMessage("Link inválido ou expirado. Por favor, solicite um novo link.");
      setAuthView("recovery");
      setIsAuthOpen(true);
    } else {
      // Legacy fallback
      const isRecovery = hash.includes("type=recovery") || search.includes("type=recovery");
      if (isRecovery) {
        setAuthView("update_password");
        setIsAuthOpen(true);
      }
    }

    return () => subscription.unsubscribe();
  }, []);

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("oficina_sim_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("oficina_sim_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.warn("Erro ao salvar favoritos no localStorage", e);
    }
  }, [wishlist]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartActiveTab, setCartActiveTab] = useState<"cart" | "wishlist">("cart");
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);

  // Floating back-to-top visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Custom visual toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Protect Admin route
  useEffect(() => {
    if (currentView === "admin") {
      if (!profile || (profile.role !== "admin" && profile.role !== "owner")) {
        setView("home");
      }
    }
  }, [currentView, profile]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1, customizations?: Customizations) => {
    addToCart(product, quantity, customizations);
    triggerToast(`✓ ${product.name} adicionado à sacola!`);
  };

  const handleAddCustomKitToCart = (kitName: string, totalPrice: number, itemsSelected: string[], customizations: Customizations) => {
    // Generate a mock product representant for custom kit
    const mockKitProduct: Product = {
      id: `custom-kit-${Date.now()}`,
      name: kitName,
      description: `Composto por: ${itemsSelected.join(", ")}.`,
      price: totalPrice,
      image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=600",
      rating: 5.0,
      category: "kits-padrinhos",
      customizable: true,
      features: itemsSelected,
      galleryImages: ["https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=600"]
    };

    addToCart(mockKitProduct, 1, customizations);
    triggerToast("✓ Seu Kit de Padrinho foi personalizado e adicionado à sacola!");
    setIsCartOpen(true);
    setCartActiveTab("cart");
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    removeFromCart(cartItemId);
  };

  const handleUpdateCartQuantity = (cartItemId: string, qty: number) => {
    updateQuantity(cartItemId, qty);
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter((item) => item.id !== product.id));
      triggerToast("Removido dos seus favoritos.");
    } else {
      setWishlist([...wishlist, product]);
      triggerToast("❤️ Adicionado aos seus favoritos!");
    }
  };

  const handleRemoveFromWishlist = (product: Product) => {
    setWishlist(wishlist.filter((item) => item.id !== product.id));
  };

  const handleAddToCartFromWishlist = (product: Product) => {
    handleAddToCart(product);
    handleRemoveFromWishlist(product);
  };

  const openCartTab = (tab: "cart" | "wishlist") => {
    setCartActiveTab(tab);
    setIsCartOpen(true);
  };

  // Featured products filter (top sellers)
  const featuredProducts = products.slice(0, 4);

  if (currentView === "admin" && profile && (profile.role === "admin" || profile.role === "owner")) {
    return <AdminPanel onClose={() => setView("home")} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-offwhite text-charcoal font-sans selection:bg-gold-light selection:text-gold-dark overflow-x-hidden pb-16 lg:pb-0">
      
      {/* Toast Notification Box */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-charcoal text-white text-sm sm:text-base font-semibold py-3.5 px-6 rounded-full shadow-2xl flex items-center gap-2 border border-white/10"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header element */}
      <Header
        currentView={currentView}
        setView={setView}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        wishlistCount={wishlist.length}
        openCart={() => openCartTab("cart")}
        openWishlist={() => openCartTab("wishlist")}
        openAI={() => setIsAIOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        profile={profile}
        onOpenAuth={() => {
          setAuthView("login");
          setIsAuthOpen(true);
        }}
        onLogout={signOut}
      />

      {/* Main Views Panel */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Banner Section */}
              {false && ( /* HERO ANTIGO OCULTO */
              <section id="hero-banner" className="relative h-[85vh] sm:h-[80vh] flex items-center justify-center overflow-hidden bg-pink-light">
                {/* Background Image with elegant overlay */}
                <div className="absolute inset-0">
                  <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1920"
                    alt="Casamento Elegante Oficina do Sim"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-charcoal/45 via-charcoal/15 to-transparent" />
                  <div className="absolute inset-0 bg-white/20" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-6 sm:space-y-8 max-w-2xl bg-white/50 backdrop-blur-xs p-6 sm:p-10 rounded-3xl border border-white/40">
                    
                    {/* Trust stars seal */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex text-gold-default">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className="fill-current" />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-charcoal font-bold tracking-wide leading-tight">
                        Transformando momentos especiais em <span className="text-gold-dark italic font-serif">lembranças eternas.</span>
                      </h1>
                      <p className="text-charcoal/80 text-sm sm:text-md leading-relaxed ">
                        Na Oficina do Sim, Victória e Daniele produzem mimos de luxo, caixas de padrinhos, velas aromáticas artesanais e convites finos pensados exclusivamente para o dia do seu sim.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4.5">
                      <button
                        onClick={() => {
                          setView("shop");
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        className="w-full sm:w-auto bg-gold-default hover:bg-gold-dark text-white font-bold py-4 px-8 rounded-full text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag size={14} />
                        <span>Ver Nossos Produtos</span>
                      </button>
                      {/* TEMPORARILY DISABLED
                      <button
                        onClick={() => setIsAIOpen(true)}
                        className="w-full sm:w-auto bg-white hover:bg-gold-light/40 text-charcoal font-bold py-4 px-8 rounded-full text-xs uppercase tracking-widest border border-gold-default/30 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Sparkles size={14} className="text-gold-default animate-pulse" />
                        <span>Fazer Style Quiz</span>
                      </button>
                      */}
                    </div>

                  </div>
                </div>
              </section>
              )}

              {/* Novo Carrossel Automático (Nossos Mimos) */}
              {!productsLoading && !productsError && featuredProducts.length > 0 && (
                <ProductCarousel
                  products={products}
                  onProductClick={setSelectedProduct}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                  onNavigateToShop={() => {
                    setView("shop");
                    let attempts = 0;
                    const checkAndScroll = () => {
                      const el = document.getElementById("shop");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                      } else if (attempts < 15) {
                        attempts++;
                        setTimeout(checkAndScroll, 100);
                      }
                    };
                    setTimeout(checkAndScroll, 300);
                  }}
                />
              )}

              {/* Compact Categories / Collections Carousel */}
              <section id="categories-grid" className="py-10 sm:py-16 bg-offwhite overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  
                  <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
                    <span className="text-[11px] sm:text-xs uppercase tracking-widest text-gold-dark font-bold bg-gold-light/60 px-3.5 py-1 rounded-full">
                      Mimos Exclusivos
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-charcoal font-semibold mt-3 tracking-wide">
                      Navegar pelas Coleções
                    </h2>
                    <p className="text-charcoal/75 text-xs sm:text-sm md:text-base mt-2.5">
                      Criamos uma variedade primorosa de mimos e embalagens. Escolha o seu tema predileto para começar a personalizar.
                    </p>
                  </div>

                  {featuredHomeCategories.length > 0 ? (
                    <div className="relative group/collections">
                      {/* Setas de navegação desktop */}
                      <button
                        type="button"
                        onClick={() => handleCollectionsScroll("left")}
                        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 lg:-translate-x-5 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-charcoal/80 hover:text-gold-dark border border-pink-default/30 hover:border-gold-default/50 shadow-sm hover:shadow-md items-center justify-center transition-all opacity-70 group-hover/collections:opacity-100 hover:scale-105 cursor-pointer focus:outline-none"
                        aria-label="Coleções anteriores"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCollectionsScroll("right")}
                        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 lg:translate-x-5 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-charcoal/80 hover:text-gold-dark border border-pink-default/30 hover:border-gold-default/50 shadow-sm hover:shadow-md items-center justify-center transition-all opacity-70 group-hover/collections:opacity-100 hover:scale-105 cursor-pointer focus:outline-none"
                        aria-label="Próximas coleções"
                      >
                        <ChevronRight size={18} />
                      </button>

                      {/* Carrossel Horizontal Compacto */}
                      <div
                        ref={collectionsScrollRef}
                        className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 pt-1 px-4 sm:px-2 -mx-4 sm:mx-0 snap-x snap-mandatory no-scrollbar scrollbar-none justify-start md:justify-center"
                        style={{
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                          WebkitOverflowScrolling: "touch",
                        }}
                      >
                        {featuredHomeCategories.map((cat, idx) => (
                          <div
                            key={cat.id || idx}
                            onClick={() => {
                              setSelectedShopCategory(cat.id);
                              setView("shop");
                              window.scrollTo({ top: 300, behavior: "smooth" });
                            }}
                            className="shrink-0 w-[170px] sm:w-[195px] md:w-[210px] lg:w-[225px] bg-white rounded-2xl border border-pink-default/20 overflow-hidden group cursor-pointer hover:border-gold-default/40 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between snap-start select-none"
                          >
                            {/* Imagem proporcional quadrada idêntica aos produtos */}
                            <div className="aspect-square overflow-hidden bg-pink-light/30 relative shrink-0">
                              <img
                                src={cat.image_url || cat.image}
                                alt={cat.name}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                              />
                              <div className="absolute inset-0 bg-charcoal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            {/* Conteúdo com footprint visual idêntico aos produtos */}
                            <div className="p-3 sm:p-3.5 text-left flex flex-col flex-1 justify-between gap-1.5 bg-gradient-to-b from-white to-offwhite/50">
                              <div>
                                <h4 className="font-sans text-[13px] sm:text-[14px] font-semibold text-charcoal group-hover:text-gold-dark transition-colors line-clamp-1 leading-snug flex items-center justify-between gap-1">
                                  <span className="truncate">{cat.name}</span>
                                  <ArrowRight size={13} className="text-gold-dark group-hover:text-gold-default group-hover:translate-x-0.5 transition-all shrink-0" />
                                </h4>
                                {cat.description && (
                                  <p className="text-[11px] sm:text-[11.5px] text-charcoal/65 mt-0.5 leading-tight line-clamp-2">
                                    {cat.description}
                                  </p>
                                )}
                              </div>

                              <div className="pt-1.5 border-t border-pink-default/15 flex items-center justify-between mt-auto">
                                <span className="text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-wider text-gold-dark group-hover:text-gold-default border-b border-transparent group-hover:border-gold-default pb-0.5 transition-all font-sans whitespace-nowrap">
                                  Ver Coleção
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="text-center mt-8 sm:mt-10">
                    <button
                      onClick={() => {
                        setSelectedShopCategory("all");
                        setView("shop");
                      }}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-gold-dark hover:text-gold-default transition-colors focus:outline-none cursor-pointer py-2 px-3"
                    >
                      <span>
                        Ver todas as {activeCategories.length > 0 ? activeCategories.length : 10} categorias
                      </span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                </div>
              </section>

              {/* Products em Destaque (Featured/Top sellers) */}
              <section id="featured-products" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-baseline gap-4 mb-16 border-b border-pink-default/15 pb-6">
                    <div className="text-left space-y-3">
                      <h2 className="font-serif text-3xl text-charcoal font-semibold tracking-wide flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex text-gold-default">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} size={18} className="fill-current" />
                          ))}
                        </div>
                        <span>Produtos Mais Vendidos</span>
                      </h2>
                    </div>
                    <button
                      onClick={() => setView("shop")}
                      className="text-xs font-bold text-gold-dark hover:text-gold-default uppercase tracking-widest flex items-center gap-1 focus:outline-none"
                    >
                      <span>Navegar pela Loja</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                    {productsLoading ? (
                      Array(4).fill(0).map((_, idx) => (
                        <div key={idx} className="bg-white rounded-2xl sm:rounded-3xl border border-pink-default/20 overflow-hidden shadow-xs animate-pulse flex flex-col h-[320px] sm:h-[380px]">
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
                    ) : productsError ? (
                      <div className="col-span-full py-12 text-center text-red-500 bg-red-50 rounded-3xl border border-red-100">
                        <p>{productsError}</p>
                      </div>
                    ) : (
                      featuredProducts.map((p) => {
                        const isWish = wishlist.some((item) => item.id === p.id);
                        return (
                          <div
                            key={p.id}
                            className="bg-white rounded-2xl sm:rounded-3xl border border-pink-default/20 overflow-hidden relative group hover:border-gold-default/40 transition-all duration-300 shadow-xs flex flex-col justify-between"
                          >
                            {/* Heart toggle */}
                            <button
                              onClick={() => handleToggleWishlist(p)}
                              className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 bg-white/90 hover:bg-white rounded-full text-charcoal/75 hover:text-red-500 transition-colors shadow-sm focus:outline-none"
                              aria-label="Adicionar aos favoritos"
                            >
                              <Heart size={13} className={isWish ? "fill-red-500 text-red-500" : ""} />
                            </button>

                            <div className="aspect-square overflow-hidden bg-pink-light relative">
                              <img
                                src={p.image}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {/* Overlay details */}
                              <div className="absolute inset-0 bg-charcoal/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <button
                                  onClick={() => setSelectedProduct(p)}
                                  className="px-3 sm:px-5 py-2 sm:py-2.5 bg-white text-charcoal font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl shadow-lg hover:bg-gold-default hover:text-white transition-colors cursor-pointer"
                                >
                                  Ver Detalhes
                                </button>
                              </div>
                            </div>

                            <div className="p-3 sm:p-5 text-left flex-1 flex flex-col justify-between">
                              <div className="space-y-1 sm:space-y-2">
                                <span className="text-[8.5px] sm:text-[9.5px] uppercase tracking-wider text-gold-dark font-semibold block truncate">
                                  {p.category.replace("-", " ")}
                                </span>
                                <h4
                                  onClick={() => setSelectedProduct(p)}
                                  className="font-serif text-xs sm:text-sm md:text-base font-bold text-charcoal hover:text-gold-default cursor-pointer truncate"
                                >
                                  {p.name}
                                </h4>
                                <div className="flex items-center gap-1 text-gold-default">
                                  <Star size={11} className="fill-current" />
                                  <span className="text-[10px] sm:text-[11px] font-semibold text-charcoal/75">{p.rating.toFixed(1)}</span>
                                </div>
                              </div>

                              <div className="pt-2.5 sm:pt-4 border-t border-pink-default/10 mt-2.5 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className="font-serif text-sm sm:text-base md:text-lg font-bold text-gold-dark">
                                  R$ {p.price.toFixed(2)}
                                </span>
                                <button
                                  onClick={() => {
                                    if (p.customizable) {
                                      setSelectedProduct(p);
                                    } else {
                                      handleAddToCart(p);
                                    }
                                  }}
                                  className="w-full sm:w-auto px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-charcoal hover:bg-gold-default text-white font-bold text-[9.5px] sm:text-[10.5px] uppercase tracking-wider rounded-lg sm:rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                                >
                                  Comprar
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              </section>

              {/* Callout Banner do Kit Ocultado */}
              {/* Subcomponents Sections */}
              <HowItWorks />

              <InstagramFeed />
              <FAQ />

              {/* Conversion Benefits Bar */}
              <section id="benefits-bar" className="bg-white border-t border-pink-default/15 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs">
                    <div className="flex items-center justify-center gap-3">
                      <Sparkles size={18} className="text-gold-default shrink-0" />
                      <div className="text-left">
                        <p className="font-bold text-charcoal">Personalização Total</p>
                        <p className="text-[10px] text-charcoal/75">Sua arte, iniciais e cores</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <Award size={18} className="text-gold-default shrink-0" />
                      <div className="text-left">
                        <p className="font-bold text-charcoal">Manufatura Premium</p>
                        <p className="text-[10px] text-charcoal/75">Rigores de alta qualidade</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <Truck size={18} className="text-gold-default shrink-0" />
                      <div className="text-left">
                        <p className="font-bold text-charcoal">Envio Seguro</p>
                        <p className="text-[10px] text-charcoal/75">Embalagens protegidas</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <ShieldCheck size={18} className="text-gold-default shrink-0" />
                      <div className="text-left">
                        <p className="font-bold text-charcoal">Compra Protegida</p>
                        <p className="text-[10px] text-charcoal/75">Criptografia de ponta a ponta</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {currentView === "quem-somos" && (
            <motion.div
              key="quem-somos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FoundersSection />
              <WhyUs />
            </motion.div>
          )}

          {currentView === "shop" && (
            <motion.div
              key="shop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ProductsSection
                onProductClick={(p) => setSelectedProduct(p)}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                wishlist={wishlist}
                toggleWishlist={handleToggleWishlist}
                initialSearchQuery={searchQuery}
                initialCategory={selectedShopCategory}
                onCategoryChange={setSelectedShopCategory}
              />
            </motion.div>
          )}

          {currentView === "kit-builder" && (
            <motion.div
              key="kit-builder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <KitBuilder onAddCustomKitToCart={handleAddCustomKitToCart} setView={setView} />
            </motion.div>
          )}

          {/* TEMPORARILY DISABLED
          {currentView === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Quiz
                onStyleCalculated={(res) => setQuizResults(res)}
                openAI={() => setIsAIOpen(true)}
                onAddToCart={(p) => handleAddToCart(p, 1)}
              />
            </motion.div>
          )}
          */}

          {currentView === "calculator" && (
            <motion.div
              key="calculator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FavorsCalculator />
            </motion.div>
          )}

          {currentView === "minha-conta" && (
            <motion.div
              key="minha-conta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MyAccount onBack={() => setView("home")} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Interactive Widget Triggers */}
      <div className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-30 flex flex-col gap-2.5 sm:gap-3 items-end">
        
        {/* Back to top floating indicator */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="p-2.5 sm:p-3 bg-white hover:bg-gold-light/40 border border-pink-default/20 text-charcoal/75 hover:text-gold-dark rounded-full shadow-md sm:shadow-lg transition-all focus:outline-none cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
            title="Voltar ao Topo"
            aria-label="Voltar ao Topo"
          >
            <ChevronUp size={16} />
          </button>
        )}
        
        {/* Floating Cart Button (Desktop only, mobile has bottom bar) */}
        <button
          onClick={() => openCartTab("cart")}
          className="hidden sm:flex p-3 sm:p-4 bg-charcoal hover:bg-gold-dark text-white rounded-full shadow-xl sm:shadow-2xl transition-all cursor-pointer items-center justify-center border-2 sm:border-4 border-white relative focus:outline-none min-w-[46px] min-h-[46px]"
          title="Sacola de Compras"
          aria-label="Sacola de Compras"
        >
          <ShoppingBag size={20} className="sm:w-6 sm:h-6" />
          {cart.reduce((sum, i) => sum + i.quantity, 0) > 0 && (
            <span className="absolute -top-1 -right-1 bg-gold-default text-white text-[10px] sm:text-xs w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full font-bold border-2 border-white">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          )}
        </button>

        {/* WhatsApp direct chat bubble (positioned cleanly above bottom nav on mobile) */}
        <a
          href="https://wa.me/5514997383526?text=Ol%C3%A1!%20Gostaria%20de%20conhecer%20mais%20sobre%20a%20Oficina%20do%20Sim."
          target="_blank"
          rel="noreferrer"
          className="p-3 sm:p-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-xl sm:shadow-2xl transition-all cursor-pointer flex items-center justify-center border-2 sm:border-4 border-white min-w-[46px] min-h-[46px]"
          title="Fale com Victória e Daniele"
          aria-label="Fale conosco pelo WhatsApp"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            className="sm:w-6 sm:h-6"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.198-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982 1-3.648-.235-.374a9.86 9.86 0 011.51-12.382 9.86 9.86 0 017.02-2.91c2.645 0 5.132 1.03 7.001 2.9a9.87 9.87 0 012.904 7.017 9.88 9.88 0 01-9.863 10.007m8.413-18.395A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.684 1.447h.005c6.555 0 11.89-5.335 11.893-11.893a11.8 11.8 0 00-3.479-8.41" />
          </svg>
        </a>
      </div>

      {/* Footer element */}
      <Footer setView={setView} />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          isWishlisted={wishlist.some((item) => item.id === selectedProduct.id)}
          toggleWishlist={handleToggleWishlist}
        />
      )}

      {/* Sliding Cart Drawer Panel */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        wishlist={wishlist}
        onRemoveFromCart={handleRemoveFromCart}
        onUpdateCartQuantity={handleUpdateCartQuantity}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onAddToCartFromWishlist={handleAddToCartFromWishlist}
        onProductClick={(product) => setSelectedProduct(product)}
        activeTab={cartActiveTab}
        setActiveTab={setCartActiveTab}
        onRequestAddress={() => { setIsCartOpen(false); setView("my-account"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        profile={profile}
        onOpenAuth={() => {
          setAuthView("login");
          setIsAuthOpen(true);
        }}
        onClearCart={clearCart}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultView={authView}
      />

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav
        currentView={currentView}
        setView={setView}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        wishlistCount={wishlist.length}
        openCart={() => openCartTab("cart")}
        openWishlist={() => openCartTab("wishlist")}
        user={user}
        profile={profile}
        onOpenAuth={() => {
          setAuthView("login");
          setIsAuthOpen(true);
        }}
        onLogout={signOut}
      />

    </div>
  );
}
