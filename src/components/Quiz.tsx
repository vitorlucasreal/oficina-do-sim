import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, Heart, RefreshCw, Star, Info, MessageCircle } from "lucide-react";
import { PRODUCTS } from "../data";
import { Product, QuizAnswers, QuizResult } from "../types";

interface QuizProps {
  onStyleCalculated: (result: QuizResult) => void;
  openAI: () => void;
  onAddToCart: (product: Product) => void;
}

export default function Quiz({ onStyleCalculated, openAI, onAddToCart }: QuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    venue: "",
    palette: "",
    vibe: "",
    details: "",
    guests: 150
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const stepsData = [
    {
      key: "venue",
      title: "Onde será celebrado o seu grande dia?",
      subtitle: "O cenário dita a alma e o ritmo estético do casamento.",
      options: [
        { label: "Jardim ou Campo Verde", desc: "Ar livre, gramado, rústico elegante", icon: "🌳" },
        { label: "Praia ou Pé na Areia", desc: "Leveza do mar, vento, tons naturais", icon: "🌊" },
        { label: "Salão de Festas Clássico", desc: "Elegância tradicional, lustres, luxo", icon: "🏰" },
        { label: "Espaço Boho ou Galpão Industrial", desc: "Tijolos à vista, moderno, despojado", icon: "🧱" }
      ]
    },
    {
      key: "palette",
      title: "Qual paleta de cores faz seu coração bater mais forte?",
      subtitle: "As cores traduzem o tom emocional da decoração.",
      options: [
        { label: "Verde Sálvia & Off-White", desc: "Orgânico, fresco, atemporal", icon: "🌿" },
        { label: "Rosa Claro, Marsala & Ouro", desc: "Romântico, clássico, sofisticado", icon: "🌸" },
        { label: "Tons Terrosos, Juta & Creme", desc: "Rústico-chic, boho, acolhedor", icon: "🍂" },
        { label: "Branco Puro, Preto & Prata", desc: "Ultra moderno, elegante, minimalista", icon: "💍" }
      ]
    },
    {
      key: "vibe",
      title: "Como você sonha com a atmosfera do evento?",
      subtitle: "A sensação principal que você quer deixar nos convidados.",
      options: [
        { label: "Acolhedora e Intimista", desc: "Mini wedding, proximidade, afeto", icon: "🏡" },
        { label: "Deslumbrante e Sofisticada", desc: "Suntuosidade, brilho, banquete fino", icon: "✨" },
        { label: "Descontraída e Festiva", desc: "Festa animada, drinks, pé descalço", icon: "🍹" },
        { label: "Romântica e Poética", desc: "Velas, flores delicadas, música de harpa", icon: "🎻" }
      ]
    },
    {
      key: "details",
      title: "Qual desses detalhes artesanais te atrai mais?",
      subtitle: "O toque de textura que faz os olhos brilharem.",
      options: [
        { label: "Lacre de Cera Real & Papel Linho", desc: "Elegância medieval moderna", icon: "✉️" },
        { label: "Velas Aromáticas e Flores Secas", desc: "Calor, aconchego olfativo", icon: "🕯️" },
        { label: "Taças de Cristal com Gravação Fosca", desc: "Sofisticação, brindes memoráveis", icon: "🥂" },
        { label: "Laços de Linho Desfiados à Mão", desc: "Manufatura orgânica primorosa", icon: "🎀" }
      ]
    }
  ];

  const handleSelect = (optionLabel: string) => {
    const currentKey = stepsData[step].key as keyof QuizAnswers;
    setAnswers((prev) => ({ ...prev, [currentKey]: optionLabel }));
    
    if (step < stepsData.length - 1) {
      setStep(step + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = async () => {
    setLoading(true);
    setStep(stepsData.length); // results step representation

    try {
      const response = await fetch("/api/quiz-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();
      if (response.ok && data.style) {
        setResult(data);
        onStyleCalculated(data);
      } else {
        throw new Error("Erro na API de recomendação.");
      }
    } catch (err) {
      console.error(err);
      // Client-side fallback matching
      const mockResult: QuizResult = {
        style: answers.venue.includes("Jardim") ? "Romântico Orgânico & Boho" : "Clássico Sofisticado Minimalista",
        description: `Um conceito que combina perfeitamente a elegância do estilo ${answers.palette} com a vibração ${answers.vibe}. Prioriza texturas naturais e mimos perfumados.`,
        tips: [
          "Utilize nossas Velas Aromáticas com tampa de madeira e iniciais gravadas a laser.",
          "Para as embalagens, combine caixas cartonadas off-white com fitas de linho verde sálvia.",
          "Distribua Lágrimas de Alegria Boho em papel translúcido para a cerimônia."
        ],
        recommendedProductIds: ["1", "2", "6", "7"]
      };
      setResult(mockResult);
      onStyleCalculated(mockResult);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers({
      venue: "",
      palette: "",
      vibe: "",
      details: "",
      guests: 150
    });
    setResult(null);
  };

  const recommendedProducts = PRODUCTS.filter((p) =>
    result?.recommendedProductIds.includes(p.id)
  );

  return (
    <section className="py-24 bg-pink-light/35 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {step < stepsData.length ? (
          // Active Quiz Steps
          <div className="bg-white rounded-3xl border border-pink-default/20 p-8 sm:p-12 shadow-md text-left space-y-8">
            
            {/* Header progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs uppercase tracking-widest text-gold-dark font-bold">
                <span>Passo {step + 1} de {stepsData.length}</span>
                <span>{Math.round(((step + 1) / stepsData.length) * 100)}%</span>
              </div>
              <div className="w-full bg-pink-light h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gold-default h-full transition-all duration-300"
                  style={{ width: `${((step + 1) / stepsData.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Question */}
            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-charcoal font-semibold tracking-wide leading-tight">
                {stepsData[step].title}
              </h2>
              <p className="text-charcoal/50 text-xs sm:text-sm font-light">
                {stepsData[step].subtitle}
              </p>
            </div>

            {/* Options Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stepsData[step].options.map((opt, idx) => (
                <button
                  key={opt.label}
                  onClick={() => handleSelect(opt.label)}
                  className="p-5 rounded-2xl border border-pink-default/25 hover:border-gold-default bg-offwhite hover:bg-gold-light/10 text-left transition-all duration-200 group flex items-start gap-4 focus:outline-none"
                >
                  <div className="text-3xl group-hover:scale-110 transition-transform select-none">
                    {opt.icon}
                  </div>
                  <div>
                    <h4 className="font-serif text-sm sm:text-md font-semibold text-charcoal group-hover:text-gold-dark">
                      {opt.label}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-charcoal/50 mt-1 font-light">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Back button */}
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="text-xs text-charcoal/40 hover:text-charcoal transition-colors underline focus:outline-none"
              >
                Voltar para a etapa anterior
              </button>
            )}

          </div>
        ) : (
          // Quiz Calculation & Results Screen
          <div className="bg-white rounded-3xl border border-pink-default/20 p-8 sm:p-12 shadow-md text-left">
            {loading ? (
              // Loading screen with charming quotes
              <div className="py-16 text-center space-y-6">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 border-4 border-pink-light rounded-full" />
                  <div className="absolute inset-0 border-4 border-gold-default rounded-full border-t-transparent animate-spin" />
                  <Heart className="absolute inset-0 m-auto text-pink-dark animate-pulse" size={18} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl text-charcoal font-semibold">Tecendo seu Estilo...</h3>
                  <p className="text-xs text-charcoal/50 italic max-w-sm mx-auto leading-relaxed">
                    &ldquo;Victória e Daniele estão escolhendo a dedo as fragrâncias, papéis e texturas ideais para seu casamento.&rdquo;
                  </p>
                </div>
              </div>
            ) : (
              // Results Presentation Panel
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-pink-default/15">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-gold-dark bg-gold-light/60 px-3 py-1 rounded-full font-bold">
                      Seu Estilo de Casamento é:
                    </span>
                    <h3 className="font-serif text-3xl sm:text-4xl text-gold-dark font-semibold tracking-wide">
                      {result?.style}
                    </h3>
                  </div>
                  <button
                    onClick={resetQuiz}
                    className="flex items-center gap-1.5 px-4 py-2 border border-pink-default/20 hover:border-gold-default rounded-full text-xs font-semibold text-charcoal/70 transition-colors focus:outline-none shrink-0"
                  >
                    <RefreshCw size={12} />
                    <span>Refazer Quiz</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Poetic description & Tips */}
                  <div className="md:col-span-7 space-y-6">
                    <p className="text-charcoal/80 text-xs sm:text-sm leading-relaxed font-light whitespace-pre-wrap">
                      {result?.description}
                    </p>
                    
                    <div className="space-y-3.5 bg-pink-light/30 p-5 rounded-2xl border border-pink-default/15">
                      <h4 className="text-xs uppercase tracking-widest font-bold text-gold-dark flex items-center gap-1.5">
                        <Info size={14} />
                        <span>Recomendações das Donas:</span>
                      </h4>
                      <ul className="space-y-3">
                        {result?.tips.map((tip, i) => (
                          <li key={i} className="flex gap-2.5 text-xs sm:text-sm text-charcoal/75 leading-relaxed font-light">
                            <span className="text-gold-default font-bold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-sage-light/30 p-4 rounded-xl border border-sage-default/15 flex items-center gap-3">
                      <Sparkles size={18} className="text-sage-default animate-pulse shrink-0" />
                      <p className="text-[11px] sm:text-xs text-charcoal/70">
                        O estilo acima já foi salvo em nosso sistema! Chame nossa <strong>Consultora IA</strong> no painel flutuante para aprofundar mais ideias.
                      </p>
                    </div>
                  </div>

                  {/* recommended products widgets */}
                  <div className="md:col-span-5 space-y-4">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-charcoal">
                      Mimos Recomendados ({recommendedProducts.length})
                    </h4>
                    
                    <div className="space-y-3">
                      {recommendedProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-offwhite border border-pink-default/15 rounded-xl p-3 flex gap-3 items-center group hover:border-gold-default/35 transition-all"
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 object-cover rounded-lg border border-pink-default/10 shrink-0"
                          />
                          <div className="flex-1 text-left min-w-0">
                            <h5 className="font-serif text-xs sm:text-sm font-semibold text-charcoal truncate group-hover:text-gold-dark">
                              {prod.name}
                            </h5>
                            <span className="text-xs font-bold text-gold-dark mt-0.5 block">
                              R$ {prod.price.toFixed(2)}
                            </span>
                          </div>
                          <button
                            onClick={() => onAddToCart(prod)}
                            className="text-[10px] uppercase tracking-wider font-bold bg-gold-default hover:bg-gold-dark text-white px-3 py-1.5 rounded-lg transition-colors focus:outline-none shrink-0"
                          >
                            Comprar
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={openAI}
                      className="w-full bg-charcoal text-white hover:bg-gold-dark py-3.5 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <MessageCircle size={14} />
                      <span>Falar sobre meu estilo</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
