import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Heart, Trash2, ArrowRight, MessageCircle, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { CartItem, Product } from "../types";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  wishlist: Product[];
  onRemoveFromCart: (cartItemId: string) => void;
  onUpdateCartQuantity: (cartItemId: string, qty: number) => void;
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCartFromWishlist: (product: Product) => void;
  activeTab: "cart" | "wishlist";
  setActiveTab: (tab: "cart" | "wishlist") => void;
}

export default function Cart({
  isOpen,
  onClose,
  cart,
  wishlist,
  onRemoveFromCart,
  onUpdateCartQuantity,
  onRemoveFromWishlist,
  onAddToCartFromWishlist,
  activeTab,
  setActiveTab
}: CartProps) {
  if (!isOpen) return null;

  const totalCartPrice = cart.reduce((acc, curr) => {
    const price = curr.product.isPromo ? (curr.product.promoPrice ?? curr.product.price) : curr.product.price;
    return acc + price * curr.quantity;
  }, 0);

  const freeShippingLimit = 350;
  const progressToFreeShipping = Math.min(100, (totalCartPrice / freeShippingLimit) * 100);
  const remainingForFreeShipping = freeShippingLimit - totalCartPrice;

  // Build the WhatsApp direct ordering text string
  const handleCheckout = () => {
    let orderText = `Olá Victória e Dani! Gostaria de formalizar um orçamento para o meu casamento a partir das escolhas feitas no site Oficina do Sim:\n\n`;
    
    cart.forEach((item, idx) => {
      const price = item.product.isPromo ? (item.product.promoPrice ?? item.product.price) : item.product.price;
      orderText += `${idx + 1}. *${item.product.name}* (Qtd: ${item.quantity}x) - R$ ${(price * item.quantity).toFixed(2)}\n`;
      if (item.customizations) {
        if (item.customizations.name) orderText += `   - Nome/Iniciais: ${item.customizations.name}\n`;
        if (item.customizations.date) orderText += `   - Data: ${item.customizations.date}\n`;
        if (item.customizations.color) orderText += `   - Cor do laço: ${item.customizations.color}\n`;
        if (item.customizations.message) orderText += `   - Mensagem: ${item.customizations.message}\n`;
        if (item.customizations.observations) orderText += `   - Obs: ${item.customizations.observations}\n`;
      }
      orderText += `\n`;
    });

    orderText += `*Valor Total Estimado:* R$ ${totalCartPrice.toFixed(2)}\n\n`;
    orderText += `Fico no aguardo do contato para definirmos a papelaria digital e acertarmos os detalhes!`;

    const encodedText = encodeURIComponent(orderText);
    window.open(`https://wa.me/5511999999999?text=${encodedText}`, "_blank");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden text-left">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-charcoal/40 backdrop-blur-xs"
        />

        {/* Sliding Tray Drawer */}
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="w-screen max-w-md bg-white border-l border-pink-default/15 flex flex-col shadow-2xl relative"
          >
            
            {/* Header: Tabs for Cart and Wishlist */}
            <div className="px-6 py-5 border-b border-pink-default/15 flex justify-between items-center bg-offwhite">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("cart")}
                  className={`text-sm tracking-widest uppercase font-bold relative pb-1 focus:outline-none ${
                    activeTab === "cart" ? "text-gold-dark font-extrabold" : "text-charcoal/40"
                  }`}
                >
                  Sacola ({cart.length})
                  {activeTab === "cart" && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gold-dark rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`text-sm tracking-widest uppercase font-bold relative pb-1 focus:outline-none ${
                    activeTab === "wishlist" ? "text-gold-dark font-extrabold" : "text-charcoal/40"
                  }`}
                >
                  Favoritos ({wishlist.length})
                  {activeTab === "wishlist" && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gold-dark rounded-full" />
                  )}
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-pink-light rounded-full text-charcoal/50 hover:text-charcoal transition-colors focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>

            {/* Free Shipping conversion booster (Visible only on Cart tab) */}
            {activeTab === "cart" && cart.length > 0 && (
              <div className="bg-sage-light/25 px-6 py-4 border-b border-pink-default/10 text-left space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-charcoal">
                  <div className="flex items-center gap-1.5 text-sage-dark">
                    <Truck size={14} />
                    {remainingForFreeShipping > 0 ? (
                      <span>Falta apenas <strong>R$ {remainingForFreeShipping.toFixed(2)}</strong> para ganhar <strong>Frete Grátis</strong></span>
                    ) : (
                      <span className="text-sage-dark">🎉 Parabéns! Você ganhou <strong>Frete Grátis</strong>!</span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-pink-light h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-sage-default h-full transition-all duration-300"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>
            )}

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {activeTab === "cart" ? (
                // CART LISTING
                cart.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-pink-light/60 flex items-center justify-center text-gold-dark mx-auto">
                      <ShoppingBag size={24} />
                    </div>
                    <div>
                      <h4 className="font-serif text-md font-bold text-charcoal">Sua sacola está vazia</h4>
                      <p className="text-xs text-charcoal/50 font-light max-w-xs mx-auto mt-1">
                        Selecione as lembranças ideais ou use o "Monte seu Kit" para preencher seu grande dia de afeto.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => {
                      const itemPrice = item.product.isPromo ? (item.product.promoPrice ?? item.product.price) : item.product.price;
                      return (
                        <div
                          key={item.id}
                          className="bg-offwhite border border-pink-default/15 rounded-2xl p-4 flex gap-4 text-left relative group hover:border-gold-default/30 transition-all"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 object-cover rounded-xl border border-pink-default/10 shrink-0 bg-white"
                          />
                          <div className="flex-1 min-w-0 text-xs">
                            <h5 className="font-serif text-sm font-bold text-charcoal truncate pr-6">
                              {item.product.name}
                            </h5>
                            
                            {/* Customizable specs rendering if exists */}
                            {item.customizations && (
                              <div className="mt-1 text-[10px] text-charcoal/50 bg-white/80 p-1.5 rounded border border-pink-default/5 space-y-0.5">
                                {item.customizations.name && <p><strong>Iniciais:</strong> {item.customizations.name}</p>}
                                {item.customizations.date && <p><strong>Data:</strong> {item.customizations.date}</p>}
                                {item.customizations.color && <p><strong>Fita:</strong> {item.customizations.color}</p>}
                                {item.customizations.message && <p className="truncate"><strong>Tag:</strong> &ldquo;{item.customizations.message}&rdquo;</p>}
                              </div>
                            )}

                            <div className="flex justify-between items-center mt-3">
                              <div className="flex items-center border border-pink-default/15 rounded-lg bg-white overflow-hidden">
                                <button
                                  onClick={() => onUpdateCartQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-pink-light/35 text-charcoal/60"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-bold text-charcoal">{item.quantity}</span>
                                <button
                                  onClick={() => onUpdateCartQuantity(item.id, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-pink-light/35 text-charcoal/60"
                                >
                                  +
                                </button>
                              </div>
                              <span className="font-bold text-gold-dark text-sm shrink-0">
                                R$ {(itemPrice * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Delete Item Button */}
                          <button
                            onClick={() => onRemoveFromCart(item.id)}
                            className="absolute top-4 right-4 text-charcoal/30 hover:text-red-500 transition-colors cursor-pointer"
                            title="Remover item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                // WISHLIST LISTING
                wishlist.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-pink-light/60 flex items-center justify-center text-red-400 mx-auto">
                      <Heart size={24} />
                    </div>
                    <div>
                      <h4 className="font-serif text-md font-bold text-charcoal">Nenhum favorito ainda</h4>
                      <p className="text-xs text-charcoal/50 font-light max-w-xs mx-auto mt-1">
                        Favorite os itens do seu interesse enquanto navega pela loja e monte seu baú de inspirações.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wishlist.map((prod) => {
                      const itemPrice = prod.isPromo ? (prod.promoPrice ?? prod.price) : prod.price;
                      return (
                        <div
                          key={prod.id}
                          className="bg-offwhite border border-pink-default/15 rounded-2xl p-4 flex gap-4 text-left relative group"
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 object-cover rounded-xl border border-pink-default/10 shrink-0 bg-white"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h5 className="font-serif text-sm font-bold text-charcoal truncate pr-6">
                                {prod.name}
                              </h5>
                              <span className="font-bold text-gold-dark text-xs block mt-1">
                                R$ {itemPrice.toFixed(2)}
                              </span>
                            </div>
                            <button
                              onClick={() => onAddToCartFromWishlist(prod)}
                              className="text-[10px] uppercase tracking-wider font-bold bg-gold-default hover:bg-gold-dark text-white px-3 py-1.5 rounded-lg transition-colors focus:outline-none mt-2 w-fit"
                            >
                              Adicionar à Sacola
                            </button>
                          </div>
                          
                          <button
                            onClick={() => onRemoveFromWishlist(prod)}
                            className="absolute top-4 right-4 text-charcoal/30 hover:text-red-500 transition-colors cursor-pointer"
                            title="Remover favorito"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

            </div>

            {/* Footer Summary Pricing & Conversion Hooks */}
            {activeTab === "cart" && cart.length > 0 && (
              <div className="p-6 border-t border-pink-default/15 bg-offwhite space-y-4">
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between text-charcoal/60">
                    <span className="font-light">Subtotal:</span>
                    <span className="font-semibold">R$ {totalCartPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-charcoal/60">
                    <span className="font-light">Frete:</span>
                    <span className="font-semibold text-sage-dark uppercase text-xs font-bold">
                      {totalCartPrice >= freeShippingLimit ? "Grátis" : "A calcular"}
                    </span>
                  </div>
                  <div className="flex justify-between text-charcoal pt-3 border-t border-pink-default/10">
                    <span className="font-bold text-md">Total Estimado:</span>
                    <span className="font-serif text-xl sm:text-2xl font-bold text-gold-dark">
                      R$ {totalCartPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gold-default hover:bg-gold-dark text-white py-4 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <MessageCircle size={15} />
                    <span>Orçar tudo no WhatsApp</span>
                  </button>
                  
                  {/* Small security seal row */}
                  <div className="flex justify-center items-center gap-4 text-[9.5px] text-charcoal/45 pt-1">
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={12} className="text-sage-default" />
                      <span>Compra 100% Segura</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles size={12} className="text-gold-default" />
                      <span>Acompanhamento Humanizado</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
