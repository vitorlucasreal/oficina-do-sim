import { useState, useRef, useEffect } from "react";
import { Product } from "../types";
import { Heart, Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCarouselProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
  onNavigateToShop?: () => void;
}

export default function ProductCarousel({
  products,
  onProductClick,
  wishlist,
  onToggleWishlist,
  onNavigateToShop,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  
  const [isHovered, setIsHovered] = useState(false);
  const [isInteraction, setIsInteraction] = useState(false);
  
  // Filter products for the carousel: prioritize best sellers, then highly rated
  const carouselProducts = [...products].sort((a, b) => {
    if (a.isBestSeller && !b.isBestSeller) return -1;
    if (!a.isBestSeller && b.isBestSeller) return 1;
    return b.rating - a.rating;
  }).slice(0, 8); // Take top 8

  // Auto-scroll continuous logic
  useEffect(() => {
    const container = scrollRef.current;
    const setElement = setRef.current;
    
    if (!container || !setElement) return;
    
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let speed = 0.038; // pixels per ms. Smooth and elegant pace.

    const scroll = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      // Only auto-scroll if user is not interacting
      if (!isHovered && !isInteraction) {
        container.scrollLeft += speed * delta;
        
        // Gap is 24px (gap-6 in Tailwind)
        const jumpWidth = setElement.offsetWidth + 24;
        
        // If we've scrolled past the first set, jump back seamlessly
        if (container.scrollLeft >= jumpWidth) {
          container.scrollLeft -= jumpWidth;
        }
      }

      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, isInteraction]);

  // Handle wheel events to temporarily pause auto-scroll during trackpad use
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let timeoutId: number;
    const handleWheel = () => {
      setIsInteraction(true);
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsInteraction(false);
      }, 500);
    };

    container.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      container.removeEventListener("wheel", handleWheel);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    const setElement = setRef.current;
    if (!container || !setElement) return;

    const cardStep = container.clientWidth >= 1024 ? 264 : 230;
    const jumpWidth = setElement.offsetWidth + 24;

    if (direction === "left") {
      if (container.scrollLeft < cardStep) {
        container.scrollLeft += jumpWidth;
      }
      container.scrollBy({ left: -cardStep, behavior: "smooth" });
    } else {
      if (container.scrollLeft >= jumpWidth * 2) {
        container.scrollLeft -= jumpWidth;
      }
      container.scrollBy({ left: cardStep, behavior: "smooth" });
    }
  };

  if (carouselProducts.length === 0) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const renderCard = (p: Product, idx: number, keyPrefix: string) => {
    const isWish = wishlist.some((item) => item.id === p.id);
    return (
      <div
        key={`${p.id}-${keyPrefix}-${idx}`}
        className="shrink-0 w-[72vw] max-w-[270px] sm:w-[220px] md:w-[230px] lg:w-[240px] xl:w-[250px] bg-white rounded-2xl border border-pink-default/20 overflow-hidden relative group hover:border-gold-default/40 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between cursor-pointer"
        onClick={() => onProductClick(p)}
      >
        {/* Wishlist toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(p);
          }}
          className="absolute top-3.5 right-3.5 z-10 p-2 sm:p-2.5 bg-white/90 hover:bg-white rounded-full text-charcoal/75 hover:text-red-500 transition-transform hover:scale-105 shadow-xs focus:outline-none backdrop-blur-md"
          aria-label="Adicionar aos favoritos"
        >
          <Heart size={14} className={isWish ? "fill-red-500 text-red-500" : ""} />
        </button>

        {/* Badges */}
        <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5">
          {p.isBestSeller && (
            <span className="bg-gold-default/95 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs border border-gold-dark/20 whitespace-nowrap">
              Mais Vendido
            </span>
          )}
          {p.customizable && (
            <span className="bg-white/95 backdrop-blur-md text-charcoal text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs border border-pink-default/30 whitespace-nowrap">
              Personalizável
            </span>
          )}
        </div>

        {/* Image */}
        <div className="aspect-[4/5] overflow-hidden bg-pink-light/30 relative">
          <img
            src={p.image}
            alt={p.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-charcoal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 text-left flex flex-col flex-1 gap-4 bg-gradient-to-b from-white to-offwhite/50">
          <div className="space-y-2">
            <h4 className="font-sans text-[15px] sm:text-[17px] font-semibold text-charcoal group-hover:text-gold-dark transition-colors line-clamp-2 leading-tight">
              {p.name}
            </h4>
            
            {p.rating > 0 && (
              <div className="flex items-center gap-1.5 text-gold-default">
                <Star size={12} className="fill-current" />
                <span className="text-[12px] sm:text-[13px] font-medium text-charcoal/80 font-sans">{p.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="pt-3.5 border-t border-pink-default/15 flex items-end justify-between mt-auto">
            <div className="flex flex-col">
              {p.isPromo && p.promoPrice ? (
                <>
                  <span className="text-[11px] sm:text-xs text-charcoal/50 line-through decoration-red-400/50 mb-0.5 font-sans">
                    {formatPrice(p.price)}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-charcoal font-sans">
                    {formatPrice(p.promoPrice)}
                  </span>
                </>
              ) : (
                <span className="text-base sm:text-lg font-bold text-charcoal font-sans">
                  {formatPrice(p.price)}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gold-dark group-hover:text-gold-default border-b border-transparent group-hover:border-gold-default pb-0.5 transition-all font-sans whitespace-nowrap">
              Ver Detalhes
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="pt-8 sm:pt-10 lg:pt-12 pb-12 sm:pb-16 bg-white relative overflow-hidden">
      {/* Premium Minimal Title Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10 text-center">
        <span className="text-[11px] uppercase tracking-widest text-gold-dark font-bold bg-gold-light/50 px-3.5 py-1 rounded-full mx-auto w-fit flex items-center justify-center gap-1.5 mb-3">
          <SparklesIcon size={12} className="text-gold-dark" /> 
          Nossos Mimos
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-charcoal font-semibold tracking-wide max-w-2xl mx-auto leading-snug">
          Detalhes pensados para tornar seu grande dia ainda mais especial.
        </h2>
      </div>

      {/* Infinite Continuous Carousel */}
      <div 
        className="w-full relative group/carousel"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsInteraction(true)}
        onTouchEnd={() => setTimeout(() => setIsInteraction(false), 1000)}
      >
        {/* Seta Lateral Esquerda */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleScroll("left");
          }}
          className="absolute left-1.5 sm:left-3 md:left-5 top-[42%] -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-charcoal/80 hover:text-gold-dark border border-pink-default/30 hover:border-gold-default/50 shadow-sm hover:shadow-md flex items-center justify-center transition-all duration-300 opacity-70 sm:opacity-20 group-hover/carousel:opacity-100 hover:scale-105 backdrop-blur-xs cursor-pointer focus:outline-none min-w-[36px] min-h-[36px]"
          aria-label="Produtos anteriores"
        >
          <ChevronLeft size={18} className="sm:w-5 sm:h-5 -ml-0.5" />
        </button>

        {/* Seta Lateral Direita */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleScroll("right");
          }}
          className="absolute right-1.5 sm:right-3 md:right-5 top-[42%] -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-charcoal/80 hover:text-gold-dark border border-pink-default/30 hover:border-gold-default/50 shadow-sm hover:shadow-md flex items-center justify-center transition-all duration-300 opacity-70 sm:opacity-20 group-hover/carousel:opacity-100 hover:scale-105 backdrop-blur-xs cursor-pointer focus:outline-none min-w-[36px] min-h-[36px]"
          aria-label="Próximos produtos"
        >
          <ChevronRight size={18} className="sm:w-5 sm:h-5 -mr-0.5" />
        </button>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto px-4 sm:px-6 md:px-8 pb-4 cursor-grab active:cursor-grabbing"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch' 
          }}
        >
          {/* We render exactly 4 sets to ensure there's enough content to scroll seamlessly even on ultrawide screens */}
          
          <div ref={setRef} className="flex gap-6 shrink-0">
            {carouselProducts.map((p, idx) => renderCard(p, idx, 's1'))}
          </div>
          
          <div className="flex gap-6 shrink-0">
            {carouselProducts.map((p, idx) => renderCard(p, idx, 's2'))}
          </div>
          
          <div className="flex gap-6 shrink-0">
            {carouselProducts.map((p, idx) => renderCard(p, idx, 's3'))}
          </div>

          <div className="flex gap-6 shrink-0">
            {carouselProducts.map((p, idx) => renderCard(p, idx, 's4'))}
          </div>
        </div>
      </div>

      {/* Botão "Nossa Loja" */}
      {onNavigateToShop && (
        <div className="mt-8 sm:mt-10 text-center relative z-20">
          <button
            onClick={onNavigateToShop}
            className="bg-gold-default hover:bg-gold-dark text-white font-bold py-3.5 px-8 sm:px-10 rounded-full text-xs uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-md inline-flex items-center justify-center gap-2 cursor-pointer focus:outline-none hover:-translate-y-0.5 active:translate-y-0"
            aria-label="Conhecer a nossa loja"
          >
            <span>Nossa Loja</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        /* Hide scrollbar for Chrome, Safari and Opera */
        .w-full > div::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </section>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size || 24} 
      height={props.size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className}
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
