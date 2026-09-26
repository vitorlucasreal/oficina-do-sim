import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Heart, Trash2, ArrowRight, MessageCircle, ShieldCheck, Sparkles, Truck, Loader2 } from "lucide-react";
import { CartItem, Product } from "../types";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { trackViewCart, trackBeginCheckout, trackOrderCreated } from "../lib/analytics";
import { useEffect } from "react";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  wishlist: Product[];
  onRemoveFromCart: (cartItemId: string) => void;
  onUpdateCartQuantity: (cartItemId: string, qty: number) => void;
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCartFromWishlist: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  activeTab: "cart" | "wishlist";
  setActiveTab: (tab: "cart" | "wishlist") => void;
  onOpenAuth: () => void;
  onClearCart: () => void;
  onRequestAddress: () => void;
  profile: any;
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
  onProductClick,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onClearCart,
  onRequestAddress,
  profile
}: CartProps) {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);


  const totalCartPrice = cart.reduce((acc, curr) => {
    const price = curr.product.isPromo ? (curr.product.promoPrice ?? curr.product.price) : curr.product.price;
    return acc + price * curr.quantity;
  }, 0);

  useEffect(() => {
    if (isOpen && activeTab === "cart" && cart.length > 0) {
      trackViewCart(cart, totalCartPrice);
    }
  }, [isOpen, activeTab, cart.length, totalCartPrice]);
  if (!isOpen) return null;

  const freeShippingLimit = 350;
  const progressToFreeShipping = Math.min(100, (totalCartPrice / freeShippingLimit) * 100);
  const remainingForFreeShipping = freeShippingLimit - totalCartPrice;

  const handleCheckout = async () => {
    if (!user) {
      onClose();
      onOpenAuth();
      return;
    }

    if (!profile?.street || !profile?.house_number || !profile?.neighborhood || !profile?.city || !profile?.state || !profile?.cep) {
      onRequestAddress();
      return;
    }

    trackBeginCheckout(cart, totalCartPrice);

    setIsProcessing(true);
    setCheckoutError(null);

    try {
      const idempotencyKey = crypto.randomUUID();
      const { data, error } = await supabase.rpc('checkout_cart_to_order', {
        p_idempotency_key: idempotencyKey
      });

      if (error) {
        throw error;
      }

      if (data && data.success) {
        const displayId = data.display_id;
        const total = data.total_amount;
        
        trackOrderCreated(data.order_id, total);

        let orderText = `Olá! Gostaria de finalizar meu pedido na Oficina do Sim.\n\n`;
        orderText += `Pedido: #${displayId}\n`;
        orderText += `Cliente: ${profile?.name || user.email}\n\n`;
        orderText += `Produtos:\n`;
        
        cart.forEach(item => {
          orderText += `• ${item.product.name} — ${item.quantity} ${item.quantity > 1 ? 'unidades' : 'unidade'}\n`;
          if (item.customizations) {
             orderText += `  Personalização: `;
             const custs = [];
             if (item.customizations.name) custs.push(item.customizations.name);
             if (item.customizations.date) custs.push(item.customizations.date);
             if (item.customizations.message) custs.push(`"${item.customizations.message}"`);
             if (item.customizations.color) custs.push(`Cor: ${item.customizations.color}`);
             if (item.customizations.observations) custs.push(`Obs: ${item.customizations.observations}`);
             orderText += custs.join(' | ') + `\n`;
          }
          const price = item.product.isPromo ? (item.product.promoPrice ?? item.product.price) : item.product.price;
          orderText += `  Valor unitário: R$ ${price.toFixed(2)}\n\n`;
        });
        
        orderText += `Total: R$ ${total.toFixed(2)}\n\n`;
        
        orderText += `Endereço de entrega:\n`;
        orderText += `Rua: ${profile.street}\n`;
        orderText += `Número: ${profile.house_number}\n`;
        if (profile.complement) orderText += `Complemento: ${profile.complement}\n`;
        orderText += `Bairro: ${profile.neighborhood}\n`;
        orderText += `Cidade: ${profile.city}\n`;
        orderText += `Estado: ${profile.state}\n`;
        orderText += `CEP: ${profile.cep}\n`;
        if (profile.reference) orderText += `Referência: ${profile.reference}\n\n`;
        
        orderText += `Gostaria de confirmar meu orçamento/pedido.`;

        const encodedText = encodeURIComponent(orderText);
        window.open(`https://wa.me/5514997383526?text=${encodedText}`, "_blank");
        
        onClearCart();
      } else {
        throw new Error("Resposta inválida da finalização do pedido.");
      }
    } catch (err: any) {
      console.error(err);
      setCheckoutError("Houve um erro ao processar seu pedido. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
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
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="w-screen max-w-md bg-white border-l border-pink-default/15 flex flex-col shadow-2xl relative"
          >
            
            {/* Header: Tabs for Cart and Wishlist */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-pink-default/15 flex justify-between items-center bg-offwhite">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("cart")}
                  className={`text-xs sm:text-sm tracking-widest uppercase font-bold relative pb-1 focus:outline-none cursor-pointer ${
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
                  className={`text-xs sm:text-sm tracking-widest uppercase font-bold relative pb-1 focus:outline-none cursor-pointer ${
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
                aria-label="Fechar sacola"
                className="p-2 hover:bg-pink-light rounded-full text-charcoal/75 hover:text-charcoal transition-colors focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Free Shipping conversion booster (Visible only on Cart tab) - TEMPORARILY DISABLED
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
            */}

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
                      <p className="text-xs text-charcoal/75  max-w-xs mx-auto mt-1">
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
                          <button
                            type="button"
                            onClick={() => onProductClick?.(item.product)}
                            className="w-16 h-16 rounded-xl overflow-hidden border border-pink-default/10 shrink-0 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-default/50 transition-transform duration-200 hover:opacity-95 hover:scale-[1.02]"
                            aria-label={`Ver detalhes de ${item.product.name}`}
                          >
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </button>
                          <div className="flex-1 min-w-0 text-xs">
                            <button
                              type="button"
                              onClick={() => onProductClick?.(item.product)}
                              className="font-serif text-sm font-bold text-charcoal pr-6 leading-snug break-words text-left hover:text-gold-dark transition-colors cursor-pointer focus:outline-none focus:underline"
                              aria-label={`Ver detalhes de ${item.product.name}`}
                            >
                              {item.product.name}
                            </button>
                            
                            {/* Customizable specs rendering if exists */}
                            {item.customizations && (
                              <div className="mt-1 text-[10px] text-charcoal/75 bg-white/80 p-1.5 rounded border border-pink-default/5 space-y-0.5">
                                {item.customizations.name && <p><strong>Iniciais:</strong> {item.customizations.name}</p>}
                                {item.customizations.date && <p><strong>Data:</strong> {item.customizations.date}</p>}
                                {item.customizations.color && <p><strong>Fita:</strong> {item.customizations.color}</p>}
                                {item.customizations.message && <p className="break-words"><strong>Tag:</strong> &ldquo;{item.customizations.message}&rdquo;</p>}
                              </div>
                            )}

                            <div className="flex justify-between items-center mt-3">
                              <div className="flex items-center border border-pink-default/15 rounded-lg bg-white overflow-hidden">
                                <button
                                  onClick={() => onUpdateCartQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-pink-light/35 text-charcoal/75"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-bold text-charcoal">{item.quantity}</span>
                                <button
                                  onClick={() => onUpdateCartQuantity(item.id, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-pink-light/35 text-charcoal/75"
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
                      <p className="text-xs text-charcoal/75  max-w-xs mx-auto mt-1">
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
                          <button
                            type="button"
                            onClick={() => onProductClick?.(prod)}
                            className="w-14 h-14 rounded-xl overflow-hidden border border-pink-default/10 shrink-0 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-default/50 transition-transform duration-200 hover:opacity-95 hover:scale-[1.02]"
                            aria-label={`Ver detalhes de ${prod.name}`}
                          >
                            <img
                              src={prod.image}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </button>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <button
                                type="button"
                                onClick={() => onProductClick?.(prod)}
                                className="font-serif text-sm font-bold text-charcoal pr-6 leading-snug break-words text-left hover:text-gold-dark transition-colors cursor-pointer focus:outline-none focus:underline"
                                aria-label={`Ver detalhes de ${prod.name}`}
                              >
                                {prod.name}
                              </button>
                              <span className="font-bold text-gold-dark text-xs block mt-1">
                                R$ {itemPrice.toFixed(2)}
                              </span>
                            </div>
                            <button
                              onClick={() => onAddToCartFromWishlist(prod)}
                              className="text-xs uppercase tracking-wider font-bold bg-gold-default hover:bg-gold-dark text-white px-3.5 py-1.5 rounded-lg transition-colors focus:outline-none mt-2 w-fit whitespace-nowrap cursor-pointer"
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
              <div className="p-4 sm:p-6 border-t border-pink-default/15 bg-offwhite space-y-3 sm:space-y-4">
                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex justify-between text-charcoal/75">
                    <span className="">Subtotal:</span>
                    <span className="font-semibold">R$ {totalCartPrice.toFixed(2)}</span>
                  </div>
                  {/* TEMPORARILY DISABLED
                  <div className="flex justify-between text-charcoal/75">
                    <span className="">Frete:</span>
                    <span className="font-semibold text-sage-dark uppercase text-xs font-bold">
                      {totalCartPrice >= freeShippingLimit ? "Grátis" : "A calcular"}
                    </span>
                  </div>
                  */}
                  <div className="flex justify-between text-charcoal pt-2.5 sm:pt-3 border-t border-pink-default/10">
                    <span className="font-bold text-sm sm:text-md">Total Estimado:</span>
                    <span className="font-serif text-lg sm:text-2xl font-bold text-gold-dark">
                      R$ {totalCartPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  {checkoutError && (
                    <div className="text-red-500 text-xs text-center font-semibold">
                      {checkoutError}
                    </div>
                  )}
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-gold-default hover:bg-gold-dark text-white py-3.5 sm:py-4 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Processando...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle size={16} />
                        <span>Orçar tudo no WhatsApp</span>
                      </>
                    )}
                  </button>
                  
                  {/* Small security seal row */}
                  <div className="flex justify-center items-center gap-3 sm:gap-4 text-[9.5px] sm:text-[10px] text-charcoal/50 pt-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={12} className="text-sage-default shrink-0" />
                      <span>Conexão Segura</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles size={12} className="text-gold-default shrink-0" />
                      <span>Atendimento Exclusivo</span>
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
