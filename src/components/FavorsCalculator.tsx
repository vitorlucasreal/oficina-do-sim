import { useState } from "react";
import { Calculator, Sparkles, HelpCircle, ArrowRight, Heart } from "lucide-react";

export default function FavorsCalculator() {
  const [guestCount, setGuestCount] = useState<number>(150);
  const [favorType, setFavorType] = useState<string>("individual"); // 'individual' or 'couple'
  const [margin, setMargin] = useState<number>(10); // percentage: 5%, 10%, 15%

  // Calculations
  const calculatedBase = favorType === "individual" ? guestCount : Math.ceil(guestCount / 1.8);
  const extraItems = Math.ceil((calculatedBase * margin) / 100);
  const totalFavors = calculatedBase + extraItems;

  return (
    <section className="py-12 sm:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-16">
          <span className="text-[10px] uppercase tracking-widest text-gold-dark font-bold bg-gold-light/60 px-3.5 py-1 rounded-full">
            Ferramenta Inteligente
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-charcoal font-semibold mt-3 tracking-wide">
            Calculadora de Lembrancinhas
          </h2>
          <p className="text-charcoal/60 text-xs sm:text-sm mt-3">
            Evite desperdícios ou surpresas de última hora. Calcule a quantidade perfeita para a sua lista de convidados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Left panel: Inputs */}
          <div className="md:col-span-7 bg-offwhite p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-pink-default/20 flex flex-col justify-between text-left">
            <div className="space-y-6">
              
              {/* Sliders/Guest Count */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-charcoal">
                  <span>Quantidade de Convidados</span>
                  <span className="text-gold-dark text-md font-bold">{guestCount} pessoas</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="500"
                  step="5"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full accent-gold-default cursor-ew-resize h-1 bg-pink-default/30 rounded-lg appearance-none"
                />
              </div>

              {/* Favor Category logic */}
              <div className="space-y-3">
                <span className="text-xs sm:text-sm font-semibold text-charcoal block">
                  Como pretende distribuir?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setFavorType("individual")}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                      favorType === "individual"
                        ? "border-gold-default bg-gold-light/20 text-gold-dark font-bold"
                        : "border-pink-default/25 bg-white text-charcoal/60"
                    }`}
                  >
                    <span className="block text-xs uppercase tracking-wider font-semibold">Individual</span>
                    <span className="block text-[10px] mt-1 text-charcoal/50 leading-tight">1 por convidado (ex: bem-casado, vela, lágrimas)</span>
                  </button>
                  <button
                    onClick={() => setFavorType("couple")}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                      favorType === "couple"
                        ? "border-gold-default bg-gold-light/20 text-gold-dark font-bold"
                        : "border-pink-default/25 bg-white text-charcoal/60"
                    }`}
                  >
                    <span className="block text-xs uppercase tracking-wider font-semibold">Por Família/Casal</span>
                    <span className="block text-[10px] mt-1 text-charcoal/50 leading-tight">1 por família (ex: aromatizador premium, caixa padrinhos)</span>
                  </button>
                </div>
              </div>

              {/* Emergency Margin Selection */}
              <div className="space-y-3">
                <span className="text-xs sm:text-sm font-semibold text-charcoal block">
                  Margem de Segurança recomendada
                </span>
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  {[5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setMargin(pct)}
                      className={`flex-1 min-w-[70px] py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        margin === pct
                          ? "bg-sage-default text-white border-sage-default font-bold"
                          : "bg-white text-charcoal/70 border-pink-default/25 hover:bg-pink-light/35"
                      }`}
                    >
                      {pct}% {pct === 10 ? "(Recomendado)" : ""}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-pink-default/15 flex items-start gap-2.5 text-[10.5px] text-charcoal/55 leading-relaxed mt-6">
              <Calculator size={16} className="text-gold-default shrink-0 mt-0.5" />
              <span>
                Calculado com base em métricas reais do mercado de casamentos de São Paulo, considerando noivas Etsy e Casar.com.
              </span>
            </div>
          </div>

          {/* Right panel: Output Results */}
          <div className="md:col-span-5 bg-gradient-to-br from-pink-light to-gold-light/40 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-pink-default/25 flex flex-col justify-between text-left">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1 bg-white/60 px-3 py-1 rounded-full text-[10px] text-gold-dark font-bold uppercase tracking-wider border border-gold-default/10">
                <Sparkles size={11} />
                <span>Resultado do Planejamento</span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-charcoal/50 font-bold">Total Recomendado</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-serif text-5xl sm:text-6xl text-gold-dark font-bold">
                    {totalFavors}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-charcoal/70 uppercase">unidades</span>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-pink-default/20 text-xs sm:text-sm">
                <div className="flex justify-between text-charcoal/70">
                  <span className="font-light">Quantidade Base:</span>
                  <span className="font-semibold">{calculatedBase} un.</span>
                </div>
                <div className="flex justify-between text-charcoal/70">
                  <span className="font-light">Margem de segurança ({margin}%):</span>
                  <span className="font-semibold">{extraItems} un.</span>
                </div>
                <p className="text-[10.5px] text-charcoal/50 italic leading-snug mt-2">
                  *A margem garante lembranças extras para cerimonialistas, fotógrafos, convidados de última hora e para você guardar de recordação!
                </p>
              </div>
            </div>

            <div className="pt-8">
              <a
                href="https://wa.me/5514997383526?text=Ol%C3%A1!%20Gostaria%20de%20conhecer%20mais%20sobre%20a%20Oficina%20do%20Sim."
                target="_blank"
                rel="noreferrer"
                className="w-full bg-charcoal text-white hover:bg-gold-dark py-3.5 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>Orçar {totalFavors} Lembranças</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
