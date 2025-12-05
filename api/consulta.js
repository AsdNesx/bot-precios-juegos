import OpenAI from "openai";

// =========================
// CONFIGURACIÓN OPENAI
// =========================

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TASA_POR_DEFECTO = 450;

// =========================
// TABLAS (USD)
// =========================

// COD Mobile
const preciosCod = [
  { descripcion: "80 🪙", precio_usd: 1.50 },
  { descripcion: "420 🪙", precio_usd: 6.00 },
  { descripcion: "880 🪙", precio_usd: 12.00 },
  { descripcion: "2400 🪙", precio_usd: 28.00 },
  { descripcion: "5000 🪙", precio_usd: 55.00 },
  { descripcion: "10800 🪙", precio_usd: 110.00 }
];

// Free Fire
const preciosFreeFire = [
  { descripcion: "100 + 10 💎", precio_usd: 1.00 },
  { descripcion: "310 + 31 💎", precio_usd: 3.00 },
  { descripcion: "520 + 52 💎", precio_usd: 5.00 },
  { descripcion: "1060 + 106 💎", precio_usd: 10.00 },
  { descripcion: "2160 + 216 💎", precio_usd: 20.00 },
  { descripcion: "5600 + 560 💎", precio_usd: 50.00 }
];

const tarjetasFreeFire = [
  { descripcion: "Tarjeta Semanal 🎫", precio_usd: 3.00 },
  { descripcion: "Tarjeta Mensual 🎫", precio_usd: 11.50 }
];

// Roblox
const preciosRoblox = [
  { descripcion: "80 🤖", precio_usd: 1.50 },
  { descripcion: "400 + 100 🤖", precio_usd: 6.00 },
  { descripcion: "800 + 200 🤖", precio_usd: 12.00 },
  { descripcion: "1700 + 300 🤖", precio_usd: 22.90 },
  { descripcion: "4500 + 750 🤖", precio_usd: 55.00 },
  { descripcion: "10000 + 1000 🤖", precio_usd: 110.00 }
];

const premiumRoblox = [
  { descripcion: "Roblox Premium 🎫", precio_usd: 13.00 }
];

// Brawl Stars
const preciosBrawl = [
  { descripcion: "30 + 3 ⭐", precio_usd: 3.10 },
  { descripcion: "80 + 8 ⭐", precio_usd: 6.50 },
  { descripcion: "170 + 17 ⭐", precio_usd: 12.40 },
  { descripcion: "360 + 36 ⭐", precio_usd: 23.00 },
  { descripcion: "950 + 95 ⭐", precio_usd: 55.00 },
  { descripcion: "2000 + 200 ⭐", precio_usd: 110.00 }
];

const pasesBrawl = [
  { descripcion: "Brawl Pass 🎫", precio_usd: 9.50 },
  { descripcion: "Brawl Pass+ 🎫", precio_usd: 12.50 }
];

// =========================
// PROMPT
// =========================

function generarPrompt(tasaBs) {
  const lista = (items) =>
    items.map(i => `• ${i.descripcion} ⇒ ${i.precio_usd.toFixed(2)} USD`).join("\n");

  return `
Eres un asistente de recargas en bolívares.
Tasa: ${tasaBs} Bs/USD.

COD Mobile:
${lista(preciosCod)}

Free Fire:
${lista(preciosFreeFire)}

Tarjetas FF:
${lista(tarjetasFreeFire)}

Roblox:
${lista(preciosRoblox)}

Roblox Premium:
${lista(premiumRoblox)}

Brawl Stars:
${lista(preciosBrawl)}

Brawl Passes:
${lista(pasesBrawl)}

Reglas:
- Convierte USD → Bs multiplicando por la tasa.
- Mantén emojis y formato.
`;
}

// =========================
// API HANDLER PARA VERCEL
// =========================

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Solo POST permitido" });
    }

    // Leer el body manualmente
    let body = "";
    for await (const chunk of req) body += chunk;

    const data = JSON.parse(body || "{}");

    const mensaje = data.mensaje;
    const tasa = data.tasa || TASA_POR_DEFECTO;

    if (!mensaje) {
      return res.status(400).json({ error: "Falta el campo mensaje" });
    }

    const systemPrompt = generarPrompt(tasa);

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: mensaje }
      ]
    });

    res.status(200).json({
      ok: true,
      tasa_usada: tasa,
      respuesta: response.choices[0].message.content
    });

  } catch (err) {
    console.error("Error en API:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

