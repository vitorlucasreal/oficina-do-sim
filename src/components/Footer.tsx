import { useState, FormEvent } from "react";
import {
  Mail,
  Instagram,
  Facebook,
  MapPin,
  Sparkles,
  Send,
  ShieldCheck,
  Heart,
} from "lucide-react";

interface FooterProps {
  setView: (view: string) => void;
}

export default function Footer({ setView }: FooterProps) {
  const handleNav = (view: string) => {
    setView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#373737] text-white relative overflow-hidden pt-16 pb-8">
      {/* Decorative floral wreath watermark background */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Main Footer Grid Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 text-left pb-16 border-b border-white/10">

          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo_oficina_sim_1786290754245.jpeg"
                alt="Oficina do Sim Logo"
                className="h-14 w-auto object-contain rounded-lg bg-white p-1"
              />

              <div>
                <span className="font-serif text-xl tracking-widest text-gold-light uppercase font-bold block">
                  Oficina do Sim
                </span>

                <span className="text-[10px] uppercase tracking-widest text-gold-default font-semibold block mt-0.5">
                  Lembranças & Personalizados
                </span>
              </div>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed font-light">
              Fundada pelas apaixonadas Victória e Daniele, a Oficina do Sim
              nasceu para materializar o afeto em detalhes elegantes,
              rústicos-chic e contemporâneos. Transformamos momentos especiais
              em memórias inesquecíveis para todo o Brasil.
            </p>

            <div className="flex gap-3 items-center">

              {/* Instagram */}
              <a
                href="https://www.instagram.com/oficinadosim_/"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 hover:border-gold-default hover:text-gold-default flex items-center justify-center text-gray-300 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=61578311908977"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 hover:border-gold-default hover:text-gold-default flex items-center justify-center text-gray-300 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/5514988156357"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 hover:border-gold-default hover:text-gold-default flex items-center justify-center text-gray-300 transition-colors"
                aria-label="WhatsApp"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.198-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982 1-3.648-.235-.374a9.86 9.86 0 011.51-12.382 9.86 9.86 0 017.02-2.91c2.645 0 5.132 1.03 7.001 2.9a9.87 9.87 0 012.904 7.017 9.88 9.88 0 01-9.863 10.007m8.413-18.395A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.684 1.447h.005c6.555 0 11.89-5.335 11.893-11.893a11.8 11.8 0 00-3.479-8.41" />
                </svg>
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
                <button
                  onClick={() => handleNav("home")}
                  className="hover:text-gold-default text-left transition-colors focus:outline-none cursor-pointer"
                >
                  Início
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleNav("quem-somos")}
                  className="hover:text-gold-default text-left transition-colors focus:outline-none cursor-pointer"
                >
                  Quem Somos
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleNav("shop")}
                  className="hover:text-gold-default text-left transition-colors focus:outline-none cursor-pointer"
                >
                  Loja
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleNav("kit-builder")}
                  className="hover:text-gold-default text-left transition-colors focus:outline-none cursor-pointer"
                >
                  Monte seu Kit
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleNav("quiz")}
                  className="hover:text-gold-default text-left transition-colors focus:outline-none cursor-pointer"
                >
                  Estilo Quiz
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact and Address */}
          <div className="lg:col-span-4 space-y-8">

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-serif text-lg text-gold-light tracking-wide font-semibold">
                Contato
              </h4>

              <ul className="space-y-3.5 text-sm text-gray-300">

                {/* WhatsApp */}
                <li className="flex items-center gap-2.5">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="text-gold-default shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.198-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982 1-3.648-.235-.374a9.86 9.86 0 011.51-12.382 9.86 9.86 0 017.02-2.91c2.645 0 5.132 1.03 7.001 2.9a9.87 9.87 0 012.904 7.017 9.88 9.88 0 01-9.863 10.007m8.413-18.395A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.684 1.447h.005c6.555 0 11.89-5.335 11.893-11.893a11.8 11.8 0 00-3.479-8.41" />
                  </svg>

                  <a
                    href="https://wa.me/5514988156357"
                    target="_blank"
                    rel="noreferrer"
                    className="font-light hover:text-gold-default transition-colors"
                  >
                    +55 14 98815-6357
                  </a>
                </li>

                {/* Email */}
                <li className="flex items-center gap-2.5">
                  <Mail size={16} className="text-gold-default shrink-0" />

                  <a
                    href="mailto:atendimento.oficinadosim@gmail.com"
                    className="font-light hover:text-gold-default transition-colors"
                  >
                    atendimento.oficinadosim@gmail.com
                  </a>
                </li>

              </ul>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h4 className="font-serif text-lg text-gold-light tracking-wide font-semibold">
                Endereço
              </h4>

              <ul className="space-y-3.5 text-sm text-gray-300">
                <li className="flex items-start gap-2.5">
                  <MapPin
                    size={16}
                    className="text-gold-default shrink-0 mt-1"
                  />

                  <span className="font-light">
                    Pederneiras, SP
                  </span>
                </li>
              </ul>
            </div>

          </div>

          {/* Column 5: Policies & Trust */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-serif text-lg text-gold-light tracking-wide font-semibold">
              Institucional
            </h4>

            <ul className="space-y-2 text-sm text-gray-300 mb-6">
              <li>
                <a
                  href="#trocas"
                  className="hover:text-gold-default transition-colors"
                >
                  Trocas & Devoluções
                </a>
              </li>

              <li>
                <a
                  href="#termos"
                  className="hover:text-gold-default transition-colors"
                >
                  Termos de Serviço
                </a>
              </li>

              <li>
                <a
                  href="#privacidade"
                  className="hover:text-gold-default transition-colors"
                >
                  Política de Privacidade
                </a>
              </li>
            </ul>

            <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-2">
              <ShieldCheck
                size={20}
                className="text-sage-default shrink-0"
              />

              <div>
                <p className="text-[11px] font-semibold text-gray-200">
                  Compra Segura
                </p>

                <p className="text-[9px] text-gray-400">
                  Ambiente protegido SSL
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Designer Credit */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">

          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} Oficina do Sim Ltda. Todos os
            direitos reservados.
          </p>

          <p className="flex items-center gap-1">
            <span>Criado com</span>

            <Heart
              size={10}
              className="text-red-500 fill-current"
            />

            <span>para o dia mais especial da sua vida.</span>
          </p>

        </div>

      </div>
    </footer>
  );
}