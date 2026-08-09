import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, HelpCircle, Inbox, GlassWater, Wine, FileText, Check, ArrowRight, ShoppingBag } from "lucide-react";
import { KIT_BUILDER_ITEMS } from "../data";
import { Product, Customizations } from "../types";

interface KitBuilderProps {
  onAddCustomKitToCart: (kitName: string, totalPrice: number, itemsSelected: string[], customizations: Customizations) => void;
  setView: (view: string) => void;
}

export default function KitBuilder({ onAddCustomKitToCart, setView }: KitBuilderProps) {
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(["caixa", "taca", "espumante"]);
  const [names, setNames] = useState("");
  const [date, setDate] = useState("");
  const [ribbonColor, setRibbonColor] = useState("Verde Sálvia");

  const colors = [
    { name: "Verde Sálvia", bg: "bg-sage-default" },
    { name: "Rosa Claro", bg: "bg-pink-dark" },
    { name: "Dourado", bg: "bg-gold-default" },
    { name: "Off-White", bg: "bg-offwhite" },
    { name: "Azul Serenity", bg: "bg-blue-300" }
  ];

  const handleToggleItem = (id: string) => {
    // Keep 'caixa' always selected as base packaging
    if (id === "caixa") return;

    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter((item) => item !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  const selectedItems = KIT_BUILDER_ITEMS.filter((item) =>
    selectedItemIds.includes(item.id)
  );

  const totalPrice = selectedItems.reduce((acc, curr) => acc + curr.price, 0);

  const handleAddToCart = () => {
    const kitName = `Kit de Padrinhos Personalizado (${selectedItems.length} Itens)`;
    const customizations = {
      name: names || "Noivos",
      date: date || "Data Especial",
      color: ribbonColor,
      message: "Gratidão eterna por estarem ao nosso lado."
    };
    onAddCustomKitToCart(kitName, totalPrice, selectedItems.map(i => i.name), customizations);
    
    // Smooth navigation to cart (usually opens cart drawer, we can trigger the state)
    setNames("");
    setDate("");
    setSelectedItemIds(["caixa", "taca", "espumante"]);
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-widest text-gold-dark font-bold bg-gold-light/60 px-3.5 py-1 rounded-full">
            Interativo & Autoral
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold mt-3 tracking-wide">
            Monte o Kit Perfeito
          </h2>
          <p className="text-charcoal/60 text-xs sm:text-sm mt-3">
            Escolha as lembranças ideais para seus padrinhos. Selecione os mimos avulsos e assista ao valor atualizar em tempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
          
          {/* Left panel: Catalog items list (7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            <h4 className="text-xs uppercase tracking-widest font-bold text-charcoal pb-2 border-b border-pink-default/25 flex justify-between items-center">
              <span>Selecione os Componentes do seu Kit</span>
              <span className="text-gold-dark text-[10px] lowercase font-light italic">*Caixa inclusa como base</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {KIT_BUILDER_ITEMS.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                const isRequired = item.id === "caixa";

                return (
                  <button
                    key={item.id}
                    onClick={() => handleToggleItem(item.id)}
                    disabled={isRequired}
                    className={`p-5 rounded-2xl border text-left transition-all relative flex items-center gap-4 focus:outline-none ${
                      isSelected
                        ? "border-gold-default bg-gold-light/10 shadow-xs"
                        : "border-pink-default/20 bg-white hover:border-pink-default"
                    } ${isRequired ? "opacity-80" : "cursor-pointer"}`}
                  >
                    {/* Tick checkbox badge */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 bg-gold-default text-white w-5 h-5 flex items-center justify-center rounded-full scale-90">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}

                    {/* Left Icon mapping */}
                    <div className="w-12 h-12 rounded-xl bg-pink-light flex items-center justify-center text-gold-dark shrink-0">
                      {item.id === "caixa" && <Inbox size={22} />}
                      {item.id === "taca" && <GlassWater size={22} />}
                      {item.id === "espumante" && <Wine size={22} />}
                      {item.id === "cartao" && <FileText size={22} />}
                      {!["caixa", "taca", "espumante", "cartao"].includes(item.id) && <Sparkles size={22} />}
                    </div>

                    <div className="min-w-0 pr-4">
                      <span className="block text-[10px] text-gold-dark font-semibold uppercase tracking-wider">
                        {item.category}
                      </span>
                      <h5 className="font-serif text-sm font-bold text-charcoal truncate mt-0.5">
                        {item.name}
                      </h5>
                      <span className="block text-xs font-bold text-charcoal mt-1">
                        + R$ {item.price.toFixed(2)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel: Live Box Preview and customizations (5 columns) */}
          <div className="lg:col-span-5 bg-offwhite p-6 sm:p-8 rounded-3xl border border-pink-default/20 shadow-sm space-y-6">
            
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-widest text-gold-dark font-bold bg-gold-light/60 px-3 py-1 rounded-full block w-fit">
                Sua Composição
              </span>
              <h4 className="font-serif text-xl font-bold text-charcoal">Resumo da Caixa Padrinho</h4>
              
              {/* Box composition list */}
              <div className="bg-white border border-pink-default/15 rounded-2xl p-4 max-h-48 overflow-y-auto space-y-2.5">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs text-charcoal/75">
                    <span className="font-light">{item.name}</span>
                    <span className="font-semibold text-charcoal">R$ {item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customization input fields */}
            <div className="space-y-4 pt-4 border-t border-pink-default/15 text-xs sm:text-sm">
              <span className="font-semibold text-charcoal block">Detalhes da Gravação:</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-bold">Nomes / Iniciais</label>
                  <input
                    type="text"
                    placeholder="M & J"
                    value={names}
                    onChange={(e) => setNames(e.target.value)}
                    maxLength={20}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-pink-default/20 focus:outline-none focus:border-gold-default rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-charcoal/50 font-bold">Data do Sim</label>
                  <input
                    type="text"
                    placeholder="25.10.2026"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    maxLength={15}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-pink-default/20 focus:outline-none focus:border-gold-default rounded-xl"
                  />
                </div>
              </div>

              {/* Ribbon color selection */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] uppercase tracking-wider text-charcoal/50 font-bold block">Cor da Fita de Linho</span>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setRibbonColor(c.name)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${c.bg} ${
                        ribbonColor === c.name ? "ring-2 ring-gold-default scale-110" : "opacity-75"
                      }`}
                      title={c.name}
                    >
                      {ribbonColor === c.name && <Check size={10} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price breakdown and order trigger */}
            <div className="pt-6 border-t border-pink-default/15 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-widest text-charcoal/50 font-bold">Valor do Kit</span>
                <span className="font-serif text-3xl sm:text-4xl text-gold-dark font-semibold">
                  R$ {totalPrice.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gold-default hover:bg-gold-dark text-white py-3.5 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShoppingBag size={14} />
                  <span>Adicionar Sacola</span>
                </button>
                <a
                  href={`https://wa.me/5514988156357?text=Ol%C3%A1!%20Acabei%20de%20montar%20um%20kit%20de%20padrinho%20no%20site%20Oficina%20do%20Sim.%20Pre%C3%A7o%3A%20R%24%20${totalPrice.toFixed(2)}.%20Gostaria%20de%20fazer%20o%20or%C3%A7amento%20para%20meu%20casamento.`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-charcoal text-white hover:bg-gold-dark py-3.5 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                >
                  <span>Orçar via WhatsApp</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
