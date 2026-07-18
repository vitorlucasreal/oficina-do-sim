import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Heart,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Star,
  ChevronUp,
  Award,
  Truck,
  BookOpen,
  ShoppingBag,
  Info
} from "lucide-react";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import AIConsultant from "./components/AIConsultant";
import FavorsCalculator from "./components/FavorsCalculator";
import Quiz from "./components/Quiz";
import KitBuilder from "./components/KitBuilder";
import ProductModal from "./components/ProductModal";
import Cart from "./components/Cart";
import ProductsSection from "./components/ProductsSection";

// InteractiveSections
import {
  HowItWorks,
  WhyUs,
  PinterestGallery,
  Testimonials,
  InstagramFeed,
  FAQ,
  FinalCTA
} from "./components/InteractiveSections";

// Data
import { PRODUCTS, CATEGORIES, BLOG_POSTS } from "./data";
import { Product, CartItem, QuizResult } from "./types";

export default function App() {
  const [currentView, setView] = useState<string>("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
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

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1, customizations?: any) => {
    const isPromo = product.isPromo;
    const finalPrice = isPromo ? (product.promoPrice ?? product.price) : product.price;

    const cartItemId = customizations
      ? `${product.id}-${Date.now()}` // Unique ID if customized
      : product.id;

    const existingItemIdx = cart.findIndex(
      (item) => item.product.id === product.id && JSON.stringify(item.customizations) === JSON.stringify(customizations)
    );

    if (existingItemIdx > -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIdx].quantity += quantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, { id: cartItemId, product, quantity, customizations }]);
    }

    triggerToast(`✓ ${product.name} adicionado à sacola!`);
  };

  const handleAddCustomKitToCart = (kitName: string, totalPrice: number, itemsSelected: string[], customizations: any) => {
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

    setCart([...cart, { id: mockKitProduct.id, product: mockKitProduct, quantity: 1, customizations }]);
    triggerToast("✓ Seu Kit de Padrinho foi personalizado e adicionado à sacola!");
    setIsCartOpen(true);
    setCartActiveTab("cart");
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart(cart.filter((item) => item.id !== cartItemId));
  };

  const handleUpdateCartQuantity = (cartItemId: string, qty: number) => {
    setCart(
      cart.map((item) => (item.id === cartItemId ? { ...item, quantity: qty } : item))
    );
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
  const featuredProducts = PRODUCTS.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-offwhite text-charcoal font-sans selection:bg-gold-light selection:text-gold-dark overflow-x-hidden">
      
      {/* Toast Notification Box */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-charcoal text-white text-xs sm:text-sm font-semibold py-3.5 px-6 rounded-full shadow-2xl flex items-center gap-2 border border-white/10"
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
              <section id="hero-banner" className="relative h-[85vh] sm:h-[80vh] flex items-center justify-center overflow-hidden bg-pink-light">
                {/* Background Image with elegant overlay */}
                <div className="absolute inset-0">
                  <img
                    src="https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=1920"
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
                      <span className="text-[10.5px] uppercase tracking-widest text-charcoal font-bold bg-white/80 px-3 py-1 rounded-full border border-gold-default/15 shadow-2xs">
                        ★★★★★ Mais de 500 casamentos realizados em todo o Brasil
                      </span>
                    </div>

                    <div className="space-y-4">
                      <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-charcoal font-bold tracking-wide leading-tight">
                        Transformando momentos especiais em <span className="text-gold-dark italic font-serif">lembranças eternas.</span>
                      </h1>
                      <p className="text-charcoal/80 text-sm sm:text-md leading-relaxed font-light">
                        No Ateliê Oficina do Sim, Victória e Dani produzem mimos de luxo, caixas de padrinhos, velas aromáticas artesanais e convites finos pensados exclusivamente para o dia do seu sim.
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
                      <button
                        onClick={() => setIsAIOpen(true)}
                        className="w-full sm:w-auto bg-white hover:bg-gold-light/40 text-charcoal font-bold py-4 px-8 rounded-full text-xs uppercase tracking-widest border border-gold-default/30 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Sparkles size={14} className="text-gold-default animate-pulse" />
                        <span>Fazer Style Quiz</span>
                      </button>
                    </div>

                  </div>
                </div>
              </section>

              {/* Conversion Benefits Bar */}
              <section id="benefits-bar" className="bg-white border-y border-pink-default/15 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs">
                    <div className="flex items-center justify-center gap-3">
                      <Sparkles size={18} className="text-gold-default shrink-0" />
                      <div className="text-left">
                        <p className="font-bold text-charcoal">Personalização Total</p>
                        <p className="text-[10px] text-charcoal/50">Sua arte, iniciais e cores</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <Award size={18} className="text-gold-default shrink-0" />
                      <div className="text-left">
                        <p className="font-bold text-charcoal">Manufatura Premium</p>
                        <p className="text-[10px] text-charcoal/50">Rigores de alta qualidade</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <Truck size={18} className="text-gold-default shrink-0" />
                      <div className="text-left">
                        <p className="font-bold text-charcoal">Envio Seguro</p>
                        <p className="text-[10px] text-charcoal/50">Embalagens protegidas</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <ShieldCheck size={18} className="text-gold-default shrink-0" />
                      <div className="text-left">
                        <p className="font-bold text-charcoal">Compra Protegida</p>
                        <p className="text-[10px] text-charcoal/50">Criptografia de ponta a ponta</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Large Categories cards grid */}
              <section id="categories-grid" className="py-24 bg-offwhite">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  
                  <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-[10px] uppercase tracking-widest text-gold-dark font-bold bg-gold-light/60 px-3.5 py-1 rounded-full">
                      Mimos Exclusivos
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold mt-3 tracking-wide">
                      Navegar pelas Coleções
                    </h2>
                    <p className="text-charcoal/60 text-xs sm:text-sm mt-3">
                      Criamos uma variedade primorosa de mimos e embalagens. Escolha o seu tema predileto para começar a personalizar.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {CATEGORIES.slice(0, 6).map((cat, idx) => (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setView("shop");
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        className="bg-white rounded-3xl border border-pink-default/20 overflow-hidden group cursor-pointer hover:border-gold-default/40 transition-all duration-300 relative shadow-xs"
                      >
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-40" />
                        </div>
                        <div className="p-6 text-left">
                          <h4 className="font-serif text-md sm:text-lg font-bold text-charcoal group-hover:text-gold-dark flex items-center justify-between">
                            <span>{cat.name}</span>
                            <ArrowRight size={16} className="text-gold-default group-hover:translate-x-1 transition-transform" />
                          </h4>
                          <p className="text-xs sm:text-sm text-charcoal/60 mt-2 font-light leading-relaxed">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-12">
                    <button
                      onClick={() => setView("shop")}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-gold-dark hover:text-gold-default transition-colors focus:outline-none"
                    >
                      <span>Ver todas as 10 categorias</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                </div>
              </section>

              {/* Products em Destaque (Featured/Top sellers) */}
              <section id="featured-products" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-baseline gap-4 mb-16 border-b border-pink-default/15 pb-6">
                    <div className="text-left space-y-2">
                      <span className="text-[10px] uppercase tracking-widest text-gold-dark font-bold bg-gold-light/60 px-3.5 py-1 rounded-full">
                        Os Queridinhos
                      </span>
                      <h2 className="font-serif text-3xl text-charcoal font-semibold tracking-wide">
                        Produtos em Destaque
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuredProducts.map((p) => {
                      const isWish = wishlist.some((item) => item.id === p.id);
                      return (
                        <div
                          key={p.id}
                          className="bg-white rounded-3xl border border-pink-default/20 overflow-hidden relative group hover:border-gold-default/40 transition-all duration-300 shadow-xs flex flex-col justify-between"
                        >
                          {/* Heart toggle */}
                          <button
                            onClick={() => handleToggleWishlist(p)}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full text-charcoal/50 hover:text-red-500 transition-colors shadow-sm focus:outline-none"
                          >
                            <Heart size={14} className={isWish ? "fill-red-500 text-red-500" : ""} />
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
                                className="px-5 py-2.5 bg-white text-charcoal font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-gold-default hover:text-white transition-colors"
                              >
                                Ver Detalhes
                              </button>
                            </div>
                          </div>

                          <div className="p-5 text-left flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                              <span className="text-[9.5px] uppercase tracking-widest text-gold-dark font-semibold">
                                {p.category.replace("-", " ")}
                              </span>
                              <h4
                                onClick={() => setSelectedProduct(p)}
                                className="font-serif text-sm sm:text-md font-bold text-charcoal hover:text-gold-default cursor-pointer truncate"
                              >
                                {p.name}
                              </h4>
                              <div className="flex items-center gap-1 text-gold-default">
                                <Star size={11} className="fill-current" />
                                <span className="text-[11px] font-semibold text-charcoal/60">{p.rating.toFixed(1)}</span>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-pink-default/10 mt-4 flex items-center justify-between">
                              <span className="font-serif text-md sm:text-lg font-bold text-gold-dark">
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
                                className="px-3.5 py-2 bg-charcoal hover:bg-gold-default text-white font-bold text-[10.5px] uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                              >
                                Comprar
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </section>

              {/* Monte seu Kit visual promotion callout banner */}
              <section id="kit-callout" className="py-24 bg-gradient-to-br from-pink-light to-gold-light/20 border-y border-pink-default/15 text-left">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-6 space-y-6">
                    <span className="text-[10px] uppercase tracking-widest text-gold-dark font-bold bg-white/80 px-3.5 py-1 rounded-full border border-gold-default/10">
                      Monte o Kit Perfeito
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold tracking-wide leading-tight">
                      Crie caixas de padrinhos exclusivas de forma totalmente interativa!
                    </h2>
                    <p className="text-charcoal/70 text-xs sm:text-sm font-light leading-relaxed">
                      Nossa ferramenta de montagem permite que você selecione a caixa, taça gravada permanente, mini espumante, doces, gravatas e aromatizadores avulsos, obtendo preços em tempo real com facilidade!
                    </p>
                    <button
                      onClick={() => {
                        setView("kit-builder");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="bg-charcoal hover:bg-gold-dark text-white px-8 py-3.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <span>Começar Montagem</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-pink-default/20 shadow-xl flex gap-6 items-center">
                    <img
                      src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=400"
                      alt="Kit Padrinho"
                      referrerPolicy="no-referrer"
                      className="w-1/3 aspect-square object-cover rounded-2xl border border-pink-default/10 shrink-0"
                    />
                    <div className="space-y-3">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-gold-dark bg-gold-light/40 px-2 py-0.5 rounded">Recomendado</span>
                      <h4 className="font-serif text-sm sm:text-md font-bold text-charcoal">Kit Clássico Minimalista</h4>
                      <p className="text-[11px] sm:text-xs text-charcoal/60 leading-relaxed font-light">
                        A escolha de 85% dos casais do nosso ateliê, unindo a doçura dos aromatizadores e a nobreza das taças gravadas.
                      </p>
                      <span className="block text-xs font-bold text-gold-dark">A partir de R$ 98,00</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Subcomponents Sections */}
              <HowItWorks />
              <WhyUs />
              <PinterestGallery />
              <Testimonials />

              {/* Blog posts tips section */}
              <section id="blog-tips" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  
                  <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-[10px] uppercase tracking-widest text-gold-dark font-bold bg-gold-light/60 px-3.5 py-1 rounded-full">
                      Dicas de Casamento
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold mt-3 tracking-wide">
                      Diário da Noiva
                    </h2>
                    <p className="text-charcoal/60 text-xs sm:text-sm mt-3">
                      Sugestões e inspirações escritas por Victória e Dani para te auxiliar nos preparativos do seu sim.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {BLOG_POSTS.map((post) => (
                      <div
                        key={post.id}
                        className="bg-offwhite rounded-3xl overflow-hidden border border-pink-default/20 text-left flex flex-col justify-between"
                      >
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-6 space-y-4">
                          <div className="flex justify-between items-center text-[10px] text-charcoal/40 font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1">
                              <BookOpen size={11} /> {post.author}
                            </span>
                            <span>{post.date}</span>
                          </div>
                          <h4 className="font-serif text-lg font-bold text-charcoal leading-snug">
                            {post.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed font-light">
                            {post.excerpt}
                          </p>
                          <button
                            onClick={() => {
                              triggerToast(`Dica: ${post.title} - Para ler o post completo, assine nossa newsletter grátis no rodapé!`);
                            }}
                            className="text-xs font-bold text-gold-dark hover:text-gold-default flex items-center gap-1.5 focus:outline-none"
                          >
                            <span>Ler Artigo</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </section>

              <InstagramFeed />
              <FAQ />
              <FinalCTA openAI={() => setIsAIOpen(true)} setView={setView} />
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
        </AnimatePresence>
      </main>

      {/* Floating Interactive Widget Triggers */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-end">
        
        {/* Back to top floating indicator */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="p-3 bg-white hover:bg-gold-light/40 border border-pink-default/20 text-charcoal/60 hover:text-gold-dark rounded-full shadow-lg transition-all focus:outline-none cursor-pointer"
            title="Voltar ao Topo"
          >
            <ChevronUp size={16} />
          </button>
        )}

        {/* WhatsApp direct chat bubble */}
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noreferrer"
          className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl transition-all cursor-pointer flex items-center justify-center border-4 border-white"
          title="Fale com Victoria e Dani"
        >
          <MessageCircle size={22} className="fill-current" />
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
        activeTab={cartActiveTab}
        setActiveTab={setCartActiveTab}
      />

      {/* AI Assistant Chat popup panel */}
      <AIConsultant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        quizResults={quizResults}
      />

    </div>
  );
}
