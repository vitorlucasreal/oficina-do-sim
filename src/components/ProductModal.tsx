import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, Star, Sparkles, Check, ShoppingBag, HelpCircle } from "lucide-react";
import { Product, Customizations } from "../types";
import { trackViewItem } from "../lib/analytics";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart?: (product: Product, quantity: number, customizations?: Customizations) => void;
  isWishlisted?: boolean;
  toggleWishlist?: (product: Product) => void;
}

export default function ProductModal({
  product,
  onClose,
  onAddToCart,
  isWishlisted = false,
  toggleWishlist
}: ProductModalProps) {
  // Hooks declarados incondicionalmente no topo (conforme Rules of Hooks)
  const [quantity, setQuantity] = useState(1);
  const [custName, setCustName] = useState("");
  const [custDate, setCustDate] = useState("");
  const [custMsg, setCustMsg] = useState("");
  const [custColor, setCustColor] = useState("Dourado");
  const [custObs, setCustObs] = useState("");
  const [activeImage, setActiveImage] = useState(product?.image || "");

  const engraveColors = ["Dourado", "Prata Fosco", "Verde Sálvia", "Rosa Chá", "Preto Clássico"];

  // Sincroniza a imagem ativa, rastreamento e campos quando o produto muda
  useEffect(() => {
    if (product) {
      trackViewItem(product);
      setActiveImage(product.image);
      setQuantity(1);
      setCustName("");
      setCustDate("");
      setCustMsg("");
      setCustColor("Dourado");
      setCustObs("");
    }
  }, [product?.id, product?.image]);

  const handleAddToCart = () => {
    if (!product) return;
    const customizations = product.customizable
      ? {
          name: custName,
          date: custDate,
          message: custMsg,
          color: custColor,
          observations: custObs
        }
      : undefined;

    if (onAddToCart) {
      onAddToCart(product, quantity, customizations);
    }
    onClose();
  };

  // Retorno condicional estritamente após todos os Hooks
  if (!product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs"
        />

        {/* Modal Main Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto modal-scrollbar shadow-2xl relative z-10 border border-pink-default/10 text-left grid grid-cols-1 md:grid-cols-2 my-auto"
        >
          {/* Close button top-right */}
          <button
            onClick={onClose}
            aria-label="Fechar detalhes do produto"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full shadow-sm text-charcoal/75 hover:text-charcoal transition-colors z-20 focus:outline-none flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Left panel: Product visual galleries & Live customization preview */}
          <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 bg-offwhite border-b md:border-b-0 md:border-r border-pink-default/15">
            {/* Gallery images */}
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-pink-default/10 bg-white">
              
              {/* Product customized live mock overlay representation */}
              <img
                src={activeImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />

              {/* Dynamic Engravement visual mock text on image */}
              {product.customizable && (custName || custDate) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-12 select-none">
                  <div className="bg-white/80 backdrop-blur-xs border border-gold-default/30 py-3.5 px-6 rounded-xl shadow-lg mt-24">
                    <p className="font-serif text-gold-dark font-semibold tracking-widest text-sm uppercase">
                      {custName || "Nome / Iniciais"}
                    </p>
                    {custDate && (
                      <p className="font-sans text-[10px] uppercase tracking-wider text-charcoal/75 mt-1">
                        {custDate}
                      </p>
                    )}
                    {custMsg && (
                      <p className="font-serif text-[10px] italic text-charcoal/75 mt-1 max-w-[120px] truncate">
                        &ldquo;{custMsg}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Gallery thumbnails */}
            {product.galleryImages && product.galleryImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
                {product.galleryImages.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border shrink-0 transition-all focus:outline-none ${
                      activeImage === img ? "border-gold-default ring-2 ring-gold-light/40" : "border-pink-default/20"
                    }`}
                  >
                    <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quality Seals */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] text-charcoal/75">
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-pink-default/10">
                <Sparkles size={14} className="text-gold-default" />
                <span>Personalização Única</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-pink-default/10">
                <Check size={14} className="text-sage-default" />
                <span>Produção Artesanal</span>
              </div>
            </div>
          </div>

          {/* Right panel: Customizations and addToCart action triggers */}
          <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-4 sm:space-y-6">
            <div className="space-y-3.5 sm:space-y-4">
              
              <div className="flex justify-between items-start gap-3 md:pr-12">
                <div>
                  <span className="text-[9px] font-bold text-gold-dark uppercase tracking-widest block bg-gold-light/60 px-2.5 py-0.5 rounded-full w-fit">
                    {product.categoryRef?.name || (product.category ? product.category.replace("-", " ") : "Mimo Especial")}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-charcoal mt-1.5 leading-snug">
                    {product.name}
                  </h3>
                </div>
                
                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist?.(product)}
                  aria-label={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  className={`p-2 sm:p-2.5 rounded-full border transition-colors shrink-0 focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer ${
                    isWishlisted ? "border-red-100 bg-red-50 text-red-500" : "border-pink-default/20 hover:bg-pink-light/30 text-charcoal/75"
                  }`}
                >
                  <Heart size={16} className={isWishlisted ? "fill-current" : ""} />
                </button>
              </div>

              {/* Rating stars */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex text-gold-default">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} className="fill-current" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-charcoal/80">
                  {product.rating.toFixed(1)} &bull; 100% de avaliações positivas
                </span>
              </div>

              {/* Pricing section */}
              <div className="flex items-baseline gap-2 pb-3 border-b border-pink-default/15">
                <span className="font-serif text-xl sm:text-2xl font-bold text-gold-dark">
                  R$ {product.price.toFixed(2)}
                </span>
              </div>

              <p className="text-charcoal/80 text-xs sm:text-sm md:text-base leading-relaxed">
                {product.description}
              </p>

              {/* Customization panels if applicable */}
              {product.customizable && (
                <div className="space-y-3 pt-3 border-t border-pink-default/15 text-sm sm:text-base">
                  <span className="font-semibold text-charcoal flex items-center gap-1 text-xs sm:text-sm">
                    <Sparkles size={14} className="text-gold-default animate-pulse shrink-0" />
                    <span>Personalize Seus Mimos:</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] sm:text-xs uppercase tracking-wider text-charcoal/75 font-bold block">Iniciais ou Nome do Casal</label>
                      <input
                        type="text"
                        placeholder="Victória & Daniele"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        maxLength={24}
                        className="w-full text-xs px-3.5 py-2 bg-white border border-pink-default/20 focus:outline-none focus:border-gold-default rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] sm:text-xs uppercase tracking-wider text-charcoal/75 font-bold block">Data Especial</label>
                      <input
                        type="text"
                        placeholder="25 de Outubro de 2026"
                        value={custDate}
                        onChange={(e) => setCustDate(e.target.value)}
                        maxLength={20}
                        className="w-full text-xs px-3.5 py-2 bg-white border border-pink-default/20 focus:outline-none focus:border-gold-default rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] sm:text-xs uppercase tracking-wider text-charcoal/75 font-bold block">Mensagem da Tag (Agradecimento)</label>
                    <input
                      type="text"
                      placeholder="Obrigado por celebrar nosso amor!"
                      value={custMsg}
                      onChange={(e) => setCustMsg(e.target.value)}
                      maxLength={60}
                      className="w-full text-xs px-3.5 py-2 bg-white border border-pink-default/20 focus:outline-none focus:border-gold-default rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Gravure color swatches */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] sm:text-xs uppercase tracking-wider text-charcoal/75 font-bold block">Tom da Gravação</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {engraveColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setCustColor(color)}
                            className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all focus:outline-none cursor-pointer ${
                              custColor === color
                                ? "bg-gold-default text-white border-gold-default font-bold"
                                : "bg-white text-charcoal/75 border-pink-default/20 hover:bg-pink-light/30"
                            }`}
                          >
                            {color.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] sm:text-xs uppercase tracking-wider text-charcoal/75 font-bold block">Observações Extras para Daniele & Victória</label>
                    <textarea
                      placeholder="Gostaria da fita em linho marsala ao invés de verde sálvia..."
                      value={custObs}
                      onChange={(e) => setCustObs(e.target.value)}
                      maxLength={150}
                      className="w-full text-xs px-3.5 py-2 bg-white border border-pink-default/20 focus:outline-none focus:border-gold-default rounded-xl h-14 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector and trigger buttons */}
            <div className="space-y-3 pt-3 border-t border-pink-default/15">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest text-charcoal/75 font-bold">Quantidade</span>
                <div className="flex items-center border border-pink-default/20 rounded-xl bg-offwhite p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Diminuir quantidade"
                    className="w-8 h-8 flex items-center justify-center text-charcoal/75 hover:text-charcoal font-bold text-sm focus:outline-none cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-charcoal">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Aumentar quantidade"
                    className="w-8 h-8 flex items-center justify-center text-charcoal/75 hover:text-charcoal font-bold text-sm focus:outline-none cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full bg-gold-default hover:bg-gold-dark text-white py-3.5 px-6 rounded-2xl text-xs sm:text-sm uppercase tracking-wider font-bold flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg cursor-pointer text-center min-h-[44px]"
                >
                  <ShoppingBag size={18} className="shrink-0" />
                  <span>Adicionar à Sacola</span>
                </button>
                <p className="text-[10px] sm:text-[11px] text-charcoal/60 text-center mt-2 leading-tight">
                  Dúvidas sobre personalização? Finalize sua sacola e você poderá alinhar os detalhes no WhatsApp.
                </p>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
