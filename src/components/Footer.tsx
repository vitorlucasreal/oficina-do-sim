import { useState, FormEvent } from "react";
import { Mail, Instagram, Phone, MapPin, Sparkles, Send, ShieldCheck, Heart } from "lucide-react";

interface FooterProps {
  setView: (view: string) => void;
}

export default function Footer({ setView }: FooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const handleNav = (view: string) => {
    setView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="main-footer" className="bg-charcoal text-white pt-20 pb-8 mt-24 relative overflow-hidden">
      {/* Decorative floral wreath watermark background */}
      <div className="absolute right-0 bottom-0 opacity-5 w-96 h-96 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full text-gold-default">
          <circle cx="50" cy="50" r="40" strokeDasharray="2 4" strokeWidth="0.5" />
          <path d="M50 10 C 60 20, 80 40, 50 90 C 20 40, 40 20, 50 10 Z" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Newsletter & Freebie capture block */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 mb-16 max-w-4xl mx-auto backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-3 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-default/20 text-gold-default text-xs font-semibold rounded-full tracking-wider uppercase">
                <Sparkles size={12} />
                <span>Presente de Noiva</span>
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-gold-light tracking-wide font-semibold">
                Inscreva-se e ganhe um Planejador Grátis!
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Receba nosso **Guia Completo de Organização e Quantidades para Lembrancinhas** e dicas exclusivas de Victoria & Dani diretamente no seu e-mail.
              </p>
            </div>
            <div className="md:col-span-5 w-full">
              {subscribed ? (
                <div className="bg-sage-default/20 border border-sage-default text-sage-light text-center py-4 px-6 rounded-2xl animate-fade-in">
                  <p className="text-sm font-semibold">✓ Inscrição confirmada!</p>
                  <p className="text-xs mt-1 text-gray-300">Enviamos o checklist em PDF para o seu e-mail.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    required
                    placeholder="Seu e-mail de noiva..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 text-white placeholder-gray-400 text-sm px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-gold-default w-full transition-all"
                  />
                  <button
                    type="submit"
                    className="bg-gold-default text-charcoal hover:bg-gold-light text-sm font-bold tracking-wider uppercase px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
                  >
                    <span>Receber</span>
                    <Send size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Main Footer Grid Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 text-left pb-16 border-b border-white/10">
          
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <span className="font-serif text-2xl tracking-widest text-gold-light uppercase font-bold block">
                Oficina do Sim
              </span>
              <span className="text-xs uppercase tracking-widest text-gold-default font-semibold mt-1 block">
                Lembranças & Personalizados
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed font-light">
              Fundada pelas apaixonadas Victória e Dani, a Oficina do Sim nasceu para materializar o afeto em detalhes elegantes, rústicos-chic e contemporâneos. Transformamos momentos especiais em memórias inesquecíveis para todo o Brasil.
            </p>
            <div className="flex gap-4 items-center">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 hover:border-gold-default hover:text-gold-default flex items-center justify-center text-gray-300 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 hover:border-gold-default hover:text-gold-default flex items-center justify-center text-gray-300 transition-colors"
                aria-label="WhatsApp"
              >
                <Phone size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-serif text-lg text-gold-light tracking-wide font-semibold">
              Navegação
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <button onClick={() => handleNav("home")} className="hover:text-gold-default text-left transition-colors focus:outline-none">
                  Início
                </button>
              </li>
              <li>
                <button onClick={() => handleNav("shop")} className="hover:text-gold-default text-left transition-colors focus:outline-none">
                  Loja E-commerce
                </button>
              </li>
              <li>
                <button onClick={() => handleNav("kit-builder")} className="hover:text-gold-default text-left transition-colors focus:outline-none">
                  Monte seu Kit
                </button>
              </li>
              <li>
                <button onClick={() => handleNav("quiz")} className="hover:text-gold-default text-left transition-colors focus:outline-none">
                  Estilo Quiz
                </button>
              </li>
              <li>
                <button onClick={() => handleNav("calculator")} className="hover:text-gold-default text-left transition-colors focus:outline-none">
                  Calculadora de Mimos
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Ateliê */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-serif text-lg text-gold-light tracking-wide font-semibold">
              Contato & Ateliê
            </h4>
            <ul className="space-y-3.5 text-sm text-gray-300">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-gold-default shrink-0 mt-1" />
                <span className="font-light">
                  Rua das Amendoeiras, 450 - Ateliê Jardim, São Paulo - SP
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-gold-default shrink-0" />
                <span className="font-light">(11) 99999-9999</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-gold-default shrink-0" />
                <span className="font-light">ola@oficinadosim.com.br</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Policies & Trust */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-serif text-lg text-gold-light tracking-wide font-semibold">
              Institucional
            </h4>
            <ul className="space-y-2 text-sm text-gray-300 mb-6">
              <li>
                <a href="#trocas" className="hover:text-gold-default transition-colors">
                  Trocas & Devoluções
                </a>
              </li>
              <li>
                <a href="#termos" className="hover:text-gold-default transition-colors">
                  Termos de Serviço
                </a>
              </li>
              <li>
                <a href="#privacidade" className="hover:text-gold-default transition-colors">
                  Política de Privacidade
                </a>
              </li>
            </ul>
            <div className="bg-white/5 border border-white/5 p-3.5 rounded-xl flex items-center gap-2.5">
              <ShieldCheck size={24} className="text-sage-default" />
              <div>
                <p className="text-xs font-semibold text-gray-200">Compra 100% Segura</p>
                <p className="text-[10px] text-gray-400">Ambiente seguro com criptografia SSL</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Designer Credit */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} Oficina do Sim Ltda. Todos os direitos reservados. CNPJ: 12.345.678/0001-90.
          </p>
          <p className="flex items-center gap-1">
            <span>Criado com</span>
            <Heart size={10} className="text-red-500 fill-current" />
            <span>para o dia mais especial da sua vida.</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
