import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Send, Heart, MessageCircle, ArrowRight, RefreshCw } from "lucide-react";

interface AIConsultantProps {
  isOpen: boolean;
  onClose: () => void;
  quizResults?: any;
}

export default function AIConsultant({ isOpen, onClose, quizResults }: AIConsultantProps) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "model"; content: string }>>([
    {
      role: "model",
      content: "Olá! Seja muito bem-vinda ao nosso cantinho. Nós somos a Victória e a Dani, as criadoras da Oficina do Sim. ♥\n\nEstamos aqui para ajudar você a escolher as lembranças e personalizados mais harmônicos e elegantes para o seu grande dia. Você pode nos perguntar sobre paletas de cores, quantidades recomendadas, ideias de frases para as tags ou sugestões de produtos!\n\nQual é o estilo do seu casamento ou sua maior dúvida hoje?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const presets = [
    "Qual lembrancinha combina com estilo Boho?",
    "Quantas lembrancinhas devo comprar para 150 convidados?",
    "Me dê ideias de frases elegantes para as tags.",
    "Quais as cores de fita de cetim mais recomendadas?"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // If quiz results exist, append a personalized intro message once
  useEffect(() => {
    if (quizResults?.style && messages.length === 1) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: `Vimos que você fez o nosso Quiz de Estilo e tirou **${quizResults.style}**! \n\nQue escolha maravilhosa. Para este estilo, adoramos sugerir o uso de caixas cartonadas rígidas na cor off-white, combinadas com o verde sálvia e toques sutis de dourado fosco. \n\nComo podemos te ajudar a compor os mimos perfeitos para o seu casamento?`
        }
      ]);
    }
  }, [quizResults]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content
          })),
          quizResults
        }),
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setMessages((prev) => [...prev, { role: "model", content: data.text }]);
      } else {
        throw new Error(data.error || "Erro na resposta.");
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Peço mil desculpas! Tivemos um pequeno ruído na nossa conexão do ateliê. Você poderia tentar me enviar a mensagem novamente ou nos chamar diretamente no WhatsApp?"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: "model",
        content: "Olá! Victória e Dani por aqui. Prontas para planejar os detalhes com você! Qual é a sua dúvida hoje?"
      }
    ]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white border border-gold-default/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] border-b-4 border-b-gold-default"
        >
          {/* Header of Chat */}
          <div className="bg-gradient-to-r from-pink-light to-gold-light/40 px-6 py-4 flex items-center justify-between border-b border-pink-default/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-gold-default/30 bg-white flex items-center justify-center text-gold-dark shadow-xs relative">
                <Sparkles size={18} className="animate-pulse" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
              </div>
              <div className="text-left">
                <h4 className="font-serif text-sm font-bold text-charcoal flex items-center gap-1.5">
                  <span>Ateliê Virtual da Oficina</span>
                </h4>
                <p className="text-[10px] text-gold-dark font-semibold uppercase tracking-widest leading-none mt-1">
                  Victória & Dani IA
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className="p-1.5 hover:bg-white/75 rounded-full text-charcoal/50 hover:text-charcoal transition-colors"
                title="Limpar Conversa"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/75 rounded-full text-charcoal/50 hover:text-charcoal transition-colors focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div
            ref={scrollRef}
            className="flex-1 p-6 overflow-y-auto space-y-4 bg-offwhite/50 text-left scrollbar-thin"
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-250`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-gold-default text-white rounded-tr-none shadow-xs"
                      : "bg-white border border-pink-default/20 text-charcoal rounded-tl-none shadow-xs whitespace-pre-wrap font-light"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-pink-default/15 rounded-2xl rounded-tl-none p-4 text-xs sm:text-sm text-charcoal/50 flex items-center gap-2 shadow-xs">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gold-default rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-gold-default rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-gold-default rounded-full animate-bounce"></span>
                  </div>
                  <span className="italic font-light">Victória está digitando...</span>
                </div>
              </div>
            )}
          </div>

          {/* Preset Recommendation Chips */}
          {messages.length === 1 && (
            <div className="px-6 py-2 bg-white/80 border-t border-pink-light/30 flex flex-wrap gap-2 text-left">
              <span className="text-[10px] text-gold-dark font-bold uppercase tracking-wider block w-full mb-1">
                Ideias de perguntas:
              </span>
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="text-[10.5px] text-charcoal/70 bg-pink-light/40 border border-pink-default/20 hover:border-gold-default hover:bg-gold-light/20 rounded-full px-3 py-1 transition-all text-left focus:outline-none"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Footer Input */}
          <div className="p-4 bg-white border-t border-pink-default/25 flex items-center gap-2">
            <input
              type="text"
              placeholder="Digite sua dúvida de noiva..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend(input);
              }}
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-full border border-pink-default/30 focus:outline-none focus:border-gold-default bg-offwhite text-charcoal"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-gold-default hover:bg-gold-dark text-white rounded-full transition-colors disabled:opacity-45 cursor-pointer shrink-0"
            >
              <Send size={16} />
            </button>
          </div>

          {/* Bottom Trust Seal */}
          <div className="bg-pink-light/25 py-2 px-4 border-t border-pink-default/10 text-center text-[10px] text-charcoal/45 flex items-center justify-center gap-1">
            <Heart size={10} className="text-pink-dark fill-current" />
            <span>Respostas inspiradas por Victória & Dani</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
