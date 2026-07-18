import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Lazy-initialize Gemini API
let ai: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in environment variables. AI features will run in mock mode.");
      return null;
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// 1. API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 2. API: Assistant Chat
app.post("/api/chat", async (req, res) => {
  const { messages, quizResults } = req.body;
  const client = getGeminiClient();

  if (!client) {
    // Fallback Mock Response in case API key is missing
    return res.json({
      text: "Olá! Sou a Victória, assistente virtual da Oficina do Sim. (Nota: Chave de API não configurada, rodando em modo simulação). Seria um prazer enorme ajudar você a planejar as lembranças e mimos perfeitos para o seu grande dia! Qual é a sua principal dúvida hoje?",
    });
  }

  try {
    const systemInstruction = `
      Você é a Victória e a Dani, as fundadoras e mentes criativas por trás da "Oficina do Sim", um ateliê de produtos personalizados para casamentos sofisticados, minimalistas e acolhedores.
      Seu tom é extremamente carinhoso, empático, refinado, inspirador e profissional. Você compreende os anseios das noivas e noivos e deseja transformar o dia deles em algo eterno.
      Use português do Brasil elegante e acolhedor. Nunca pareça excessivamente formal ou fria, mas mantenha uma postura premium (como Zara Home, Etsy, Westwing).
      Você conhece o catálogo da Oficina do Sim, que inclui:
      - Kits de Padrinhos (Caixas personalizadas com laço, taças personalizadas, gravatas, mini espumantes).
      - Lembrancinhas Finas (Velas aromáticas em potes de vidro com flores secas, mini aromatizadores de ambiente, kits de escalda-pés).
      - Papelaria e Identidade (Convites em papel linho com lacre de cera, menus de mesa, lágrimas de alegria).
      - Detalhes do Dia (Taças de espumante gravadas, cabides gravados, caixa de alianças, topos de bolo minimalistas).
      
      Se o usuário preencheu o Quiz de Estilo (${JSON.stringify(quizResults || {})}), use essa informação para personalizar a conversa!
      Ajude o usuário com sugestões de paleta de cores (Verde sálvia, Off-white, Rosa claro e toques de Dourado são nossas especialidades), ideias de frases para as tags, e quantidades ideais de mimos.
      Mantenha as respostas concisas e esteticamente agradáveis (com formatação limpa em markdown e listas amigáveis).
    `;

    // Map client messages to Gemini content format
    const formattedContents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Erro ao processar sua solicitação com a inteligência artificial da Oficina do Sim.", details: error.message });
  }
});

// 3. API: Quiz Style analysis & Product suggestions
app.post("/api/quiz-recommendation", async (req, res) => {
  const { answers } = req.body;
  const client = getGeminiClient();

  if (!client) {
    return res.json({
      style: "Romântico Minimalista",
      description: "Um estilo que une a leveza do amor clássico com a simplicidade contemporânea. Tons neutros, texturas naturais, verde sálvia e detalhes em dourado fosco são perfeitos para criar uma atmosfera acolhedora e atemporal.",
      tips: [
        "Prefira caixas em madeira clara ou cartonagem off-white com laços de linho desfiado.",
        "Para as lembrancinhas, nossas Velas Aromáticas com tampa de madeira e flores secas combinam perfeitamente.",
        "As taças de champagne com gravação fosca trarão o toque de sofisticação ideal para o brinde dos padrinhos."
      ],
      recommendedProductIds: ["1", "4", "7", "8"]
    });
  }

  try {
    const prompt = `
      Com base nas seguintes respostas de um quiz de casamento:
      - Estilo do local: ${answers.venue}
      - Paleta de cores favorita: ${answers.palette}
      - Vibe/Atmosfera desejada: ${answers.vibe}
      - Detalhes prediletos: ${answers.details}
      - Quantidade estimada de convidados: ${answers.guests}

      Identifique um "Estilo de Casamento Oficina do Sim" personalizado para este casal (ex: Romântico Boho, Clássico Sofisticado, Minimalista Contemporâneo, Rústico Chic).
      Forneça:
      1. O nome do estilo.
      2. Uma descrição romântica, acolhedora e inspiradora do estilo (máximo 3 frases).
      3. Três dicas personalizadas de decoração e lembrancinhas para esse estilo.
      4. IDs de produtos sugeridos (selecione 3 a 4 IDs de: "1" (Kit Padrinho Elegance), "2" (Vela Aromática Premium), "3" (Taça de Champagne Personalizada), "4" (Caixa de Madeira Floral), "5" (Aromatizador de Ambientes Delicate), "6" (Convite em Papel Linho), "7" (Lágrimas de Alegria Clássica), "8" (Topo de Bolo Minimalista)).

      Retorne em formato JSON estrito com as seguintes chaves:
      "style": string,
      "description": string,
      "tips": string[],
      "recommendedProductIds": string[]
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Quiz recommendation API error:", error);
    res.status(500).json({ error: "Erro ao calcular recomendações." });
  }
});

// Vite middleware setup for Development
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Oficina do Sim running on port ${PORT}`);
  });
}

setupServer();
