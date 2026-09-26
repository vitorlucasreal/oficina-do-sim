import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Heart,
  Hammer,
  Truck,
  CheckCircle,
  Instagram,
  Facebook,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  FileText,
  Clock,
  ArrowRight
} from "lucide-react";
import { TESTIMONIALS, FAQS, GALLERY_IMAGES } from "../data";

// 1. HOW IT WORKS
export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Escolha os Produtos",
      desc: "Navegue pelas nossas categorias ou monte seu kit de padrinhos de forma totalmente interativa.",
      icon: <Sparkles className="text-gold-default w-6 h-6" />
    },
    {
      num: "02",
      title: "Nós Personalizamos",
      desc: "Victória e Daniele desenham seu brasão, monograma ou caligrafia digital até ficar do jeito que você sonhou.",
      icon: <Heart className="text-pink-dark w-6 h-6" />
    },
    {
      num: "03",
      title: "Produção Artesanal",
      desc: "Cuidamos da gravação a laser, derretimento de cera e laços manuais com rigoroso controle de qualidade.",
      icon: <Hammer className="text-sage-default w-6 h-6" />
    },
    {
      num: "04",
      title: "Envio Seguro",
      desc: "Embalamos seus mimos em caixas reforçadas e enviamos com rastreamento para todo o Brasil.",
      icon: <Truck className="text-gold-default w-6 h-6" />
    }
  ];

  return (
    <section className="py-12 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="text-xs uppercase tracking-widest text-gold-dark font-bold bg-gold-light/60 px-3.5 py-1 rounded-full">
            
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-charcoal font-semibold mt-3 tracking-wide">
            Como Funciona Nossa Produção
          </h2>
          <p className="text-charcoal/75 text-sm sm:text-base mt-3">
            Criamos uma jornada leve, segura e apaixonante do clique inicial até o unboxing perfumado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="relative p-6 rounded-2xl bg-offwhite border border-pink-default/20 text-left group hover:border-gold-default/40 transition-all shadow-sm"
            >
              <div className="absolute top-4 right-6 font-serif text-4xl text-gold-default/15 group-hover:text-gold-default/30 font-bold transition-colors">
                {step.num}
              </div>
              <div className="w-12 h-12 rounded-xl bg-white border border-pink-default/10 flex items-center justify-center mb-6 shadow-sm">
                {step.icon}
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal mb-2">
                {step.title}
              </h3>
              <p className="text-sm sm:text-base text-charcoal/65 leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 2. WHY CHOOSE US (DIFFERENCIAIS)
export function WhyUs() {
  const advantages = [
    { title: "Personalização Completa", desc: "Adaptamos cores, iniciais, fontes e fitas de acordo com a identidade visual do seu casamento.", icon: <Sparkles size={20} /> },
    { title: "Atendimento Humanizado", desc: "Você fala diretamente com as donas (Victória ou Daniele). Sem robôs frios.", icon: <Heart size={20} /> },
    { title: "Produção Artesanal", desc: "Velas vertidas à mão, laços de linho costurados à mão e gravação a laser precisa.", icon: <Hammer size={20} /> },
    { title: "Materiais de Qualidade", desc: "Cristais finos, papéis texturizados de linho e essências importadas hipoalergênicas.", icon: <CheckCircle size={20} /> },
    { title: "Entrega Segura", desc: "Garantia anti-quebras com embalagens extremamente protegidas para todo o país.", icon: <Truck size={20} /> },
    { title: "Produtos Exclusivos", desc: "Designs autorais criados sob medida para casamentos sofisticados e modernos.", icon: <CheckCircle size={20} /> }
  ];

  return (
    <section className="py-24 bg-pink-light/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-sage-dark font-bold bg-sage-light px-3.5 py-1 rounded-full">
            Nossos Valores
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold mt-3 tracking-wide">
            Por que escolher a Oficina do Sim?
          </h2>
          <p className="text-charcoal/75 text-sm sm:text-base mt-3">
            O diferencial que une o carinho da manufatura com a perfeição estética que seu dia merece.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((adv, idx) => (
            <motion.div
              key={adv.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="bg-white p-7 rounded-2xl border border-pink-default/25 text-left flex gap-4 shadow-xs"
            >
              <div className="w-10 h-10 rounded-full bg-pink-default/40 flex items-center justify-center text-gold-dark shrink-0">
                {adv.icon}
              </div>
              <div>
                <h3 className="font-serif text-md font-semibold text-charcoal mb-1.5">
                  {adv.title}
                </h3>
                <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed ">
                  {adv.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// QUEM SOMOS SECTION (FOUNDERS & PURPOSE)
export function FoundersSection() {
  const [showLogo, setShowLogo] = useState(false);

  return (
    <section id="quem-somos" className="py-24 bg-white relative scroll-mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-gold-dark font-bold bg-gold-light/60 px-4 py-1.5 rounded-full border border-gold-default/20">
            Nossa História & Propósito
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-charcoal font-bold mt-4 tracking-wide">
            Quem Somos
          </h2>
          <div className="w-16 h-0.5 bg-gold-default/60 mx-auto mt-4 rounded-full" />
        </div>

        {/* Narrative Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-offwhite rounded-3xl p-8 sm:p-12 border-2 border-[#D49A7A] shadow-[0_8px_30px_rgba(212,154,122,0.15)] space-y-6 text-charcoal/80 text-sm sm:text-base leading-relaxed  text-justify sm:text-center"
        >
          <p>
            A Oficina do Sim nasceu da amizade entre duas amigas e de um propósito que acreditamos ter sido colocado por Deus em nossos corações.
          </p>
          <p>
            Sempre fomos apaixonadas pelo universo dos casamentos e por tudo o que ele representa: amor, união, sonhos e novos começos. Com o tempo, percebemos que poderíamos transformar essa paixão em algo maior, criando um espaço onde os noivos encontrassem os detalhes que tornam esse momento ainda mais especial.
          </p>
          <p>
            Foi dessa união de amizade, fé e propósito que surgiu a Oficina do Sim. Nosso desejo é reunir em um só lugar produtos cuidadosamente selecionados para ajudar a compor cada etapa do grande dia, desde os kits para padrinhos até as lembrancinhas e todos os detalhes que fazem a diferença.
          </p>
          <p>
            Mais do que vender produtos, queremos fazer parte de histórias. Acreditamos que cada casamento é único e que os pequenos detalhes carregam grandes significados. Por isso, trabalhamos com carinho, dedicação e amor em tudo o que fazemos.
          </p>
          <p>
            Para nós, a Oficina do Sim não é apenas uma empresa. É a realização de um sonho, uma oportunidade de servir pessoas e um propósito que Deus confiou às nossas vidas.
          </p>
          <p className="font-serif font-bold text-gold-dark text-lg sm:text-xl pt-2 text-center italic">
            &ldquo;Seja bem-vindo à Oficina do Sim. Será uma alegria fazer parte do seu grande dia.&rdquo;
          </p>
        </motion.div>

        {/* Images Section Below: Daniele on Left, Logo in Center, Victória on Right */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-16 pt-8 border-t border-pink-default/20"
        >
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-widest text-charcoal/75 font-semibold">
              Victória & Daniele &bull; Oficina do Sim
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-4xl mx-auto">
            
            {/* Daniele (Left) */}
            <div className="flex flex-col items-center text-center space-y-3 group">
              <div className="w-48 h-60 sm:w-52 sm:h-64 rounded-3xl overflow-hidden border-2 border-gold-default/30 shadow-md relative bg-pink-light">
                <img
                  src="/images/dani_founder_1786290769600.jpeg"
                  alt="Daniele - Proprietária da Oficina do Sim"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal">
                  Daniele
                </h3>
                <p className="text-xs text-sage-dark font-medium">
                  Proprietária & Atendimento
                </p>
              </div>
            </div>

            {/* Logo (Center) */}
            <div className="flex flex-col items-center text-center space-y-3 py-4 md:py-0">
              <button
                type="button"
                onClick={() => setShowLogo(true)}
                aria-label="Ampliar logo da Oficina do Sim"
                className="w-48 h-48 sm:w-52 sm:h-52 rounded-full border-2 border-gold-default/40 p-3 bg-white shadow-lg flex items-center justify-center hover:border-gold-default transition-all cursor-pointer"
              >
                <img
                  src="/images/logo_oficina_sim_1786290754245.jpeg"
                  alt="Oficina do Sim Logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </button>
            </div>

            {/* Victória (Right) */}
            <div className="flex flex-col items-center text-center space-y-3 group">
              <div className="w-48 h-60 sm:w-52 sm:h-64 rounded-3xl overflow-hidden border-2 border-gold-default/30 shadow-md relative bg-pink-light">
                <img
                  src="/images/victoria_founder_1786290784372.jpeg"
                  alt="Victória - Proprietária da Oficina do Sim"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal">
                  Victória
                </h3>
                <p className="text-xs text-sage-dark font-medium">
                  Proprietária & Atendimento
                </p>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Logo modal */}
        <AnimatePresence>
          {showLogo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-6 cursor-pointer"
              onClick={() => setShowLogo(false)}
              role="dialog"
              aria-modal="true"
              aria-label="Logo ampliado"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="relative max-w-3xl max-h-[90vh]"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setShowLogo(false)}
                  aria-label="Fechar logo ampliado"
                  className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-white text-charcoal text-2xl leading-none shadow-lg flex items-center justify-center hover:bg-gold-light transition-colors cursor-pointer"
                >
                  &times;
                </button>

                <img
                  src="/images/logo_oficina_sim_1786290754245.jpeg"
                  alt="Oficina do Sim Logo ampliado"
                  className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl bg-white"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}

// 3. PINTEREST GALLERY
export function PinterestGallery() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-gold-dark font-bold bg-gold-light/60 px-3.5 py-1 rounded-full">
            Área Inspirações
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold mt-3 tracking-wide">
            Casamentos Reais Oficina do Sim
          </h2>
          <p className="text-charcoal/75 text-sm sm:text-base mt-3">
            Veja detalhes apaixonantes de casamentos sofisticados decorados com nossas lembranças personalizadas.
          </p>
        </div>

        {/* Pinterest style Masonry columns */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {GALLERY_IMAGES.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="break-inside-avoid bg-pink-light rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm border border-pink-default/10"
            >
              <img
                src={img.url}
                alt={img.title}
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div>
                  <span className="text-[9px] text-gold-light tracking-widest uppercase font-bold">
                    Inspiracional
                  </span>
                  <h4 className="font-serif text-white text-md font-semibold mt-1">
                    {img.title}
                  </h4>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 4. TESTIMONIALS
export function Testimonials() {
  return (
    <section className="py-24 bg-pink-light/30 border-y border-pink-default/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-gold-dark font-bold bg-gold-light/60 px-3.5 py-1 rounded-full">
            Noivas Felizes
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold mt-3 tracking-wide">
            O que as Noivas dizem
          </h2>
          <p className="text-charcoal/75 text-sm sm:text-base mt-3">
            O carinho que recebemos de volta é o nosso maior prêmio. Conheça as histórias vividas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="bg-white p-8 rounded-2xl border border-pink-default/20 flex flex-col justify-between text-left shadow-xs relative"
            >
              {/* Decorative Quote Icon */}
              <div className="absolute top-4 right-6 font-serif text-6xl text-gold-default/10 select-none">
                “
              </div>

              <div>
                <div className="flex gap-1 text-gold-default mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={15} className="fill-current" />
                  ))}
                </div>
                <p className="text-charcoal/80 text-sm sm:text-base italic leading-relaxed mb-6 ">
                  &ldquo;{t.comment}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-pink-default/10">
                <img
                  src={t.avatar}
                  alt={t.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-gold-default/20"
                />
                <div>
                  <h4 className="font-serif text-sm font-bold text-charcoal">{t.name}</h4>
                  <p className="text-[10px] text-gold-dark font-medium uppercase tracking-wider mt-0.5">
                    {t.role} &bull; {t.city}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 5. INSTAGRAM & FACEBOOK INTEGRATION (PUBLICAÇÕES REAIS META)
export interface SocialPublication {
  id: string;
  platform: "facebook" | "instagram";
  type: "post" | "page";
  url: string;
  title: string;
  badge?: string;
  caption?: string;
}

/**
 * Lista de publicações oficiais reais para fácil manutenção futura.
 * Para adicionar ou remover posts, basta alterar esta lista.
 */
export const OFFICIAL_SOCIAL_PUBLICATIONS: SocialPublication[] = [
  {
    id: "ig-lancamentos-noivas",
    platform: "instagram",
    type: "page",
    url: "https://www.instagram.com/oficinadosim_/",
    title: "Lançamentos e Noivas no Instagram",
    badge: "Instagram Oficial",
    caption: "Inspirações diárias de lembranças, convites e terços no perfil @oficinadosim_."
  },
  {
    id: "ig-bastidores-atelie",
    platform: "instagram",
    type: "page",
    url: "https://www.instagram.com/oficinadosim_/",
    title: "Bastidores Oficina do Sim",
    badge: "Instagram Oficial",
    caption: "Acompanhe a produção artesanal de Victória e Daniele no Instagram."
  },
  {
    id: "fb-terco-noiva",
    platform: "facebook",
    type: "post",
    url: "https://www.facebook.com/61578311908977/posts/122202794306943730/",
    title: "Terço da Noiva em Pérolas",
    badge: "Fé & Proteção",
    caption: "Um terço para carregar a fé junto ao coração no dia do seu sim. Mais do que um acessório, uma bênção."
  },
  {
    id: "fb-porta-alianca-3d",
    platform: "facebook",
    type: "post",
    url: "https://www.facebook.com/61578311908977/posts/122198905964943730/",
    title: "Porta-Alianças 3D Alta Qualidade",
    badge: "Lançamento 3D",
    caption: "Portas-alianças em 3D de alta qualidade para eternizar ainda mais o seu grande dia."
  }
];

function getMetaEmbedUrl(pub: SocialPublication): string {
  if (pub.platform === "facebook") {
    if (pub.type === "page") {
      return `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(pub.url)}&tabs=timeline&width=350&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`;
    }
    return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(pub.url)}&width=350&show_text=true`;
  }
  const cleanUrl = pub.url.replace(/\/+$/, "");
  return `${cleanUrl}/embed/`;
}

export function InstagramFeed() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.clientWidth * 0.8;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
    setTimeout(checkScroll, 350);
  };

  return (
    <section className="py-12 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="flex justify-center items-center gap-3 mb-3 text-gold-default">
            <Instagram size={22} />
            <Facebook size={22} />
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl text-charcoal font-semibold tracking-wide">
            Siga nosso perfil no Instagram e nossa página no Facebook
          </h2>
          <p className="text-charcoal/75 text-sm sm:text-base mt-3">
            Acompanhe os bastidores da produção com Victória e Daniele e inspire-se diariamente.
          </p>
        </div>

        {/* Carousel controls bar for mobile/tablet or when scrolling is active */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <span className="text-xs font-medium text-charcoal/60">
            Deslize para ver todas as publicações
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              className="w-9 h-9 sm:w-8 sm:h-8 min-w-[36px] min-h-[36px] rounded-full border border-pink-default/30 flex items-center justify-center text-charcoal disabled:opacity-30 disabled:cursor-not-allowed hover:bg-pink-default/10 transition-colors cursor-pointer"
              aria-label="Publicação anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              className="w-9 h-9 sm:w-8 sm:h-8 min-w-[36px] min-h-[36px] rounded-full border border-pink-default/30 flex items-center justify-center text-charcoal disabled:opacity-30 disabled:cursor-not-allowed hover:bg-pink-default/10 transition-colors cursor-pointer"
              aria-label="Próxima publicação"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Responsive Feed / Carousel: 4 columns on desktop, 2 on tablet, 1 on mobile */}
        <div
          ref={carouselRef}
          onScroll={checkScroll}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 pt-1 px-1 -mx-2 sm:mx-0"
        >
          {OFFICIAL_SOCIAL_PUBLICATIONS.map((pub) => {
            const embedSrc = getMetaEmbedUrl(pub);
            const isFb = pub.platform === "facebook";

            return (
              <div
                key={pub.id}
                className="w-[85vw] max-w-[340px] sm:w-[calc(50%-10px)] sm:max-w-none lg:w-[calc(25%-15px)] shrink-0 snap-center flex flex-col bg-white rounded-2xl border border-pink-default/20 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden h-[540px]"
              >
                {/* Card Header */}
                <div className="px-4 py-3 bg-offwhite/90 border-b border-pink-default/15 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isFb ? (
                      <div className="w-6 h-6 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center shrink-0">
                        <Facebook size={14} className="fill-current" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shrink-0">
                        <Instagram size={13} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-charcoal truncate leading-tight">
                        {isFb ? "Oficina do Sim" : "@oficinadosim_"}
                      </h4>
                      <span className="text-[10px] text-charcoal/60 block truncate leading-tight mt-0.5">
                        {pub.badge || (isFb ? "Facebook Oficial" : "Instagram Oficial")}
                      </span>
                    </div>
                  </div>

                  <a
                    href={pub.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Abrir publicação original: ${pub.title}`}
                    className="text-charcoal/40 hover:text-gold-dark transition-colors p-1 rounded-md hover:bg-pink-default/10 shrink-0 cursor-pointer"
                    title="Abrir no app/site oficial"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>

                {/* Card Body - Meta Official Iframe */}
                <div className="flex-1 relative w-full bg-white overflow-hidden">
                  <iframe
                    src={embedSrc}
                    title={pub.title}
                    className="w-full h-full border-0"
                    loading="lazy"
                    scrolling="no"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>

                {/* Card Footer */}
                <div className="px-4 py-2.5 bg-offwhite/50 border-t border-pink-default/15 flex items-center justify-between gap-2 shrink-0">
                  <span className="text-[11px] font-medium text-charcoal/80 truncate">
                    {pub.title}
                  </span>
                  <a
                    href={pub.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10.5px] font-bold text-gold-dark hover:text-charcoal uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <span>Ver no {isFb ? "Facebook" : "Instagram"}</span>
                    <ArrowRight size={11} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Official Account Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <a
            href="https://www.instagram.com/oficinadosim_/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-charcoal text-white hover:bg-gold-dark hover:text-white px-7 py-3.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all shadow-sm cursor-pointer"
          >
            <Instagram size={16} />
            <span>Seguir no Instagram</span>
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61578311908977"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-charcoal text-white hover:bg-gold-dark hover:text-white px-7 py-3.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all shadow-sm cursor-pointer"
          >
            <Facebook size={16} />
            <span>Página no Facebook</span>
          </a>
        </div>
      </div>
    </section>
  );
}

// 6. ACCORDION FAQ
export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-24 bg-offwhite relative border-t border-pink-default/15">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-semibold tracking-wide">
            Dúvidas Frequentes
          </h2>
        </div>
        <div className="space-y-4 text-left">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-pink-default/20 overflow-hidden shadow-xs transition-all duration-300"
            >
              <button
                onClick={() => toggleAccordion(idx)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none focus:bg-pink-light/20 cursor-pointer hover:bg-offwhite transition-colors"
              >
                <span className="font-serif text-md font-semibold text-charcoal pr-4 leading-snug">
                  {faq.question}
                </span>
                <span className="text-gold-default">
                  {openIndex === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="p-5 sm:p-6 pt-0 border-t border-pink-light text-sm sm:text-base text-charcoal/80 leading-relaxed ">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 7. FINAL CTA
interface FinalCTAProps {
  openAI: () => void;
  setView: (view: string) => void;
}

export function FinalCTA({ openAI, setView }: FinalCTAProps) {
  return (
    <section className="py-24 bg-sage-default text-white relative overflow-hidden">
      {/* Background glowing soft gradient */}
      <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-8">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/15 text-white text-xs font-bold rounded-full tracking-wider uppercase">
          <Heart size={12} className="fill-current text-pink-default" />
          <span>Oficina do Sim</span>
        </div>

        <h2 className="font-serif text-4xl sm:text-5xl text-white font-semibold tracking-wide leading-tight">
          Vamos criar algo infinitamente especial juntos?
        </h2>

        <p className="text-white/80 text-sm sm:text-md max-w-2xl mx-auto leading-relaxed ">
          Quer planejar os detalhes com a gente? Escolha os itens de seu interesse, customize-os online ou fale diretamente com a Victória e a Daniele no WhatsApp.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => {
              setView("shop");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full sm:w-auto bg-white text-sage-default hover:bg-gold-light hover:text-charcoal px-8 py-3.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all shadow-md cursor-pointer"
          >
            Navegar pela Loja
          </button>
          
          <button
            onClick={openAI}
            className="w-full sm:w-auto bg-gold-default text-charcoal hover:bg-gold-light hover:text-charcoal px-8 py-3.5 rounded-full text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>Consultar IA</span>
          </button>

          <a
            href="https://wa.me/5514997383526?text=Ol%C3%A1%20Vict%C3%B3ria%20e%20Daniele!%20Gostaria%20de%20um%20or%C3%A7amento%20para%20as%20lembran%C3%A7as%20do%20meu%20casamento."
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto border border-white text-white hover:bg-white/10 px-8 py-3.5 rounded-full text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageCircle size={14} />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
