import { Product, Category, Testimonial, BlogPost, KitItem } from "./types";

export const CATEGORIES: Category[] = [
  {
    id: "kits-padrinhos",
    name: "Kits para padrinhos",
    description: "Conjuntos completos e sofisticados para convidar ou agradecer seus padrinhos de forma inesquecível.",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=600",
    iconName: "Gift"
  },
  {
    id: "itens-montagem",
    name: "Itens para montagem",
    description: "Produtos avulsos de alta qualidade para você compor sua caixa de forma livre e criativa.",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=600",
    iconName: "Grid"
  },
  {
    id: "lembrancinhas",
    name: "Lembrancinhas",
    description: "Mimos delicados para encantar seus convidados e eternizar a memória do seu grande dia.",
    image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600",
    iconName: "Heart"
  },
  {
    id: "tacas-copos",
    name: "Taças e Copos",
    description: "Cristais e vidros personalizados com gravação permanente para brindar em alto estilo.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600",
    iconName: "GlassWater"
  },
  {
    id: "acessorios-noiva",
    name: "Acessórios da Noiva",
    description: "Cabides gravados, robes de cetim, caixas de alianças e mimos exclusivos para o seu dia de noiva.",
    image: "https://images.unsplash.com/photo-1591555200577-03518c6cd481?auto=format&fit=crop&q=80&w=600",
    iconName: "Sparkles"
  },
  {
    id: "topos-bolo",
    name: "Topos de Bolo",
    description: "Esculturas minimalistas e personalizadas que dão o toque final de elegância ao seu bolo.",
    image: "https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&q=80&w=600",
    iconName: "Cake"
  },
  {
    id: "velas-aromaticas",
    name: "Velas Aromáticas",
    description: "Velas artesanais feitas com cera de coco e essências premium em potes de vidro decorados.",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600",
    iconName: "Flame"
  },
  {
    id: "embalagens",
    name: "Embalagens",
    description: "Sacos de linho, caixas cartonadas, fitas de cetim e tags personalizadas para um acabamento impecável.",
    image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&q=80&w=600",
    iconName: "PackageOpen"
  },
  {
    id: "convites",
    name: "Convites",
    description: "Papelaria fina, menus, lágrimas de alegria e convites impressos em papéis nobres com acabamento artesanal.",
    image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&q=80&w=600",
    iconName: "MailOpen"
  },
  {
    id: "caixas-personalizadas",
    name: "Caixas Personalizadas",
    description: "Caixas em MDF laqueado, madeira pinus ou cartonagem rígida com gravação a laser ou hot stamping.",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=600",
    iconName: "Inbox"
  }
];

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Kit Padrinho Elegance",
    description: "O convite perfeito para seus padrinhos. Caixa cartonada rígida em off-white com fechamento em fita de cetim verde sálvia. Contém 1 taça de champagne de cristal personalizada com gravação permanente fosca, 1 gravata semi-prime e 1 mini espumante brut com rótulo personalizado.",
    price: 189.90,
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=600",
    rating: 5.0,
    category: "kits-padrinhos",
    customizable: true,
    isBestSeller: true,
    features: ["Caixa cartonada premium 22x18x8cm", "Gravação em dourado ou prata", "Laço artesanal em cetim ou linho desfiado", "Acompanha berço de cetim e tag personalizada"],
    galleryImages: [
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "2",
    name: "Vela Aromática Premium Rosas e Jasmim",
    description: "Delicada vela aromática artesanal produzida com blend de cera de coco, palma e damasco. Aromas sofisticados de rosas brancas e jasmim. Envasada em pote de vidro âmbar ou fosco, decorada com flores secas naturais e tampa de madeira de reflorestamento com gravação das iniciais a laser.",
    price: 32.50,
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    category: "velas-aromaticas",
    customizable: true,
    isBestSeller: true,
    isPromo: true,
    promoPrice: 28.90,
    features: ["Pote de vidro de 100g", "Queima limpa de aproximadamente 20 horas", "Essências importadas premium", "Rótulo em papel linho texturizado"],
    galleryImages: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "3",
    name: "Taça de Champagne de Cristal Gravação Permanente",
    description: "Taça clássica de champagne em cristal ecológico, ideal para o brinde dos noivos e padrinhos. Personalização com gravação permanente a laser de alta definição (não sai com a lavagem).",
    price: 38.00,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    category: "tacas-copos",
    customizable: true,
    isBestSeller: true,
    features: ["Capacidade: 220ml", "Cristal de alta transparência", "Gravação de nomes, monogramas ou datas", "Embalagem individual de proteção inclusa"],
    galleryImages: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "4",
    name: "Caixa de Madeira Pinus com Tampa Deslizante",
    description: "Caixa rústica e sofisticada em madeira pinus selecionada e lixada. Tampa deslizante com gravação a laser personalizada do brasão ou logotipo do casamento. Perfeita para abrigar vinhos, espumantes ou doces finos.",
    price: 45.00,
    image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&q=80&w=600",
    rating: 5.0,
    category: "caixas-personalizadas",
    customizable: true,
    features: ["Dimensões: 35x10x10cm (tamanho vinho)", "Madeira de reflorestamento ecologicamente correta", "Fechamento suave e seguro", "Pode ser pintada, envernizada ou mantida natural"],
    galleryImages: [
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "5",
    name: "Mini Aromatizador de Ambientes Capim-Limão",
    description: "Lembrancinha clássica que encanta pelo aroma fresco e relaxante de capim-limão. Frasco de vidro de 40ml com tampa dourada difusora, 3 varetas de madeira e rótulo personalizado em papel texturizado.",
    price: 14.90,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    category: "lembrancinhas",
    customizable: true,
    features: ["Frasco de vidro resistente", "Líquido aromatizado de fixação prolongada", "Varetas que propagam suavemente o perfume", "Acompanha saquinho de organza ou kraft individual"],
    galleryImages: [
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "6",
    name: "Convite de Casamento Linho e Lacre de Cera",
    description: "Convite extremamente elegante impresso em papel linho italiano off-white 240g. Envelope feito em papel translúcido vegetal de alta gramatura, selado com lacre de cera real em tom dourado antigo ou verde sálvia.",
    price: 18.50,
    image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&q=80&w=600",
    rating: 5.0,
    category: "convites",
    customizable: true,
    isBestSeller: true,
    features: ["Formato: 15x21cm", "Papel texturizado premium", "Lacre de cera flexível de alta qualidade", "Incluso tag de convidados personalizada em caligrafia digital"],
    galleryImages: [
      "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "7",
    name: "Lágrimas de Alegria Boho Chic",
    description: "Lencinhos de papel macio de folha dupla em embalagem envelope translúcida, decorados com raminho de flores secas e cordão de rami. Um mimo essencial para a cerimônia emocionante.",
    price: 4.20,
    image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    category: "convites",
    customizable: true,
    isPromo: true,
    promoPrice: 3.50,
    features: ["Papel lenço de alta absorção", "Raminhos florais secos reais", "Tag impressa com frase personalizada de agradecimento"],
    galleryImages: [
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "8",
    name: "Topo de Bolo Silhueta Minimalista",
    description: "Topo de bolo moderno recortado a laser com precisão cirúrgica em acrílico espelhado dourado, prata, ou madeira de pinus delicada. Silhueta estilizada ou iniciais dos noivos em design minimalista contemporâneo.",
    price: 98.00,
    image: "https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    category: "topos-bolo",
    customizable: true,
    isBestSeller: false,
    features: ["Disponível em acrílico dourado espelhado, preto brilhante ou MDF amadeirado", "Haste de fixação transparente de 8cm", "Design exclusivo desenhado por Victória e Dani", "Fácil higienização"],
    galleryImages: [
      "https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&q=80&w=600"
    ]
  }
];

export const KIT_BUILDER_ITEMS: KitItem[] = [
  { id: "caixa", name: "Caixa Cartonada Rígida Off-White", price: 35.00, icon: "Inbox", category: "Embalagem" },
  { id: "taca", name: "Taça de Cristal Champagne Gravada", price: 32.00, icon: "GlassWater", category: "Taça" },
  { id: "espumante", name: "Mini Espumante Brut 187ml", price: 28.00, icon: "Wine", category: "Bebida" },
  { id: "gravata", name: "Gravata Semi-Prime Slim", price: 25.00, icon: "Scissors", category: "Acessório" },
  { id: "cartao", name: "Cartão de Mensagem papel Linho", price: 8.00, icon: "FileText", category: "Papelaria" },
  { id: "laco", name: "Laço de Linho Desfiado à Mão", price: 6.00, icon: "Sparkles", category: "Acabamento" },
  { id: "doces", name: "Trio de Bem-Casados Gourmet", price: 15.00, icon: "Cookie", category: "Doce" },
  { id: "aromatizador", name: "Mini Vela Aromática Vidro", price: 12.00, icon: "Flame", category: "Aroma" }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Mariana Silva",
    role: "Noiva de Outubro",
    city: "São Paulo - SP",
    rating: 5,
    comment: "A Victória e a Dani foram anjos na organização! As caixas de padrinhos ficaram perfeitas, o cheirinho das velas é divino e todos os convidados comentaram sobre o capricho. Recomendo de olhos fechados!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "2",
    name: "Beatriz Mello",
    role: "Noiva de Janeiro",
    city: "Belo Horizonte - MG",
    rating: 5,
    comment: "Simplesmente apaixonada pela papelaria e pelos convites com lacre de cera! Um capricho impecável, embalagem cheirosa e entrega no prazo. Fez toda a diferença no meu casamento boho.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "3",
    name: "Carolina Vasconcellos",
    role: "Noiva de Maio",
    city: "Rio de Janeiro - RJ",
    rating: 5,
    comment: "A Oficina do Sim superou todas as expectativas. O 'Monte seu Kit' facilitou muito a escolha e o brinde das taças com nossos padrinhos foi o ponto alto! Atendimento humanizado incrível.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "b1",
    title: "Como planejar as lembrancinhas de casamento perfeitas",
    excerpt: "Descubra como calcular as quantidades, escolher fragrâncias inesquecíveis e personalizar detalhes sem estresse.",
    content: "Planejar um casamento é recheado de pequenos detalhes apaixonantes. Dentre eles, as lembrancinhas representam o agradecimento físico pela presença de quem amamos. Para calcular a quantidade ideal, uma regra de ouro é somar 10% de margem de segurança ao número de famílias ou casais convidados. Velas aromáticas e aromatizadores artesanais são opções atemporais que tocam a memória olfativa e prolongam a magia do seu dia de noiva.",
    image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600",
    date: "12 de Julho, 2026",
    author: "Dani & Victória"
  },
  {
    id: "b2",
    title: "Velas Aromáticas: O segredo da memória olfativa no seu grande dia",
    excerpt: "Por que as velas com cera de coco e essências premium se tornaram as favoritas das noivas minimalistas.",
    content: "Nosso cérebro guarda memórias olfativas de forma extremamente potente. Ao acender uma vela aromática durante os preparativos do dia de noiva e, posteriormente, presentear os convidados com a mesma fragrância, você ancora a sensação de aconchego, paz e amor do dia. Nossas velas com cera de coco oferecem queima limpa, e os raminhos florais trazem uma estética contemporânea impecável inspirada na Westwing e Zara Home.",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600",
    date: "28 de Junho, 2026",
    author: "Victória"
  }
];

export const FAQS = [
  {
    question: "Vocês fazem personalização completa?",
    answer: "Sim! Todos os nossos produtos podem ser personalizados com nomes, brasão do casal, monogramas, datas e paletas de cores específicas. Após a confirmação do pedido, nossa equipe (Victória ou Dani) entrará em contato para definir todos os layouts digitais de aprovação."
  },
  {
    question: "Qual é o prazo de produção?",
    answer: "O prazo padrão de produção varia de 15 a 30 dias úteis, a depender da complexidade do produto e quantidade de itens. Recomendamos efetuar o pedido com pelo menos 2 a 3 meses de antecedência ao casamento para garantir tranquilidade máxima."
  },
  {
    question: "Vocês enviam para todo o Brasil?",
    answer: "Sim! Entregamos com total segurança para todo o território nacional. Nossos produtos são embalados cuidadosamente com plástico-bolha, divisórias acolchoadas e caixas resistentes para garantir que cheguem impecáveis em suas mãos."
  },
  {
    question: "Existe um pedido mínimo para compras?",
    answer: "Para itens avulsos de montagem (taças, velas em quantidade, lágrimas de alegria), possuímos um pedido mínimo especificado na página de cada produto (geralmente entre 10 a 20 unidades). No entanto, oferecemos itens pontuais (como topos de bolo ou cabides avulsos) sem pedido mínimo!"
  },
  {
    question: "Como funciona a solicitação de orçamento personalizado?",
    answer: "É simples e acolhedor! Você pode navegar pelo site, montar seu kit de padrinhos ideal ou selecionar os produtos de interesse. Ao finalizar, clique em 'Solicitar Orçamento' ou 'Falar no WhatsApp'. Você será direcionado para uma conversa humanizada diretamente conosco!"
  },
  {
    question: "Posso comprar apenas um produto avulso?",
    answer: "Com certeza! Itens como Topo de Bolo, Cabide da Noiva ou Caixa de Alianças podem ser adquiridos em unidades individuais para compor seu grande dia com o mesmo toque premium."
  }
];

export const GALLERY_IMAGES = [
  { url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600", title: "O Brinde dos Noivos", size: "tall" },
  { url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600", title: "Lembrancinhas Delicadas", size: "short" },
  { url: "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=600", title: "Mesas de Casamento Elegant", size: "tall" },
  { url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600", title: "Nossas Velas Especiais", size: "short" },
  { url: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=600", title: "Caixas de Padrinhos Decoradas", size: "tall" },
  { url: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&q=80&w=600", title: "Papelaria Fina em Foco", size: "short" }
];
