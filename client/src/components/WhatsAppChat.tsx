import { useEffect, useState } from "react";

interface Message {
  id: string;
  type: "sent" | "received";
  text: string;
  timestamp: string;
  delay: number;
}

const CHAT_MESSAGES: Message[] = [
  {
    id: "1",
    type: "sent",
    text: "hola",
    timestamp: "6:03 p. m.",
    delay: 500,
  },
  {
    id: "2",
    type: "received",
    text: "¡Bienvenido, stef! 👋\n\nBienvenido a Burgerlucho 🍔\n\nAquí está nuestro menú:\nhttps://expresiacol.vercel.app/m/burgerlucho?s=f90bea8c-fc90-4b04-b8a4-9617a2495e2a\n\nÁbrelo, arma tu pedido y envíanoslo desde la página. ¡Te esperamos!",
    timestamp: "6:03 p. m.",
    delay: 1500,
  },
  {
    id: "3",
    type: "received",
    text: "¡Recibí tu pedido! 🎉\n\n• 1x CIRO ($59.900)\n\nSubtotal: $59.900\n\n¿Tienes alguna observación? (ej: hamburguesa sin cebolla)\nEscríbela o selecciona una opción:",
    timestamp: "6:03 p. m.",
    delay: 3500,
  },
  {
    id: "4",
    type: "sent",
    text: "Sin observación",
    timestamp: "6:03 p. m.",
    delay: 5500,
  },
  {
    id: "5",
    type: "received",
    text: "¿A qué dirección te lo enviamos? Comparte tu 📍 ubicación o escríbela.",
    timestamp: "6:03 p. m.",
    delay: 6500,
  },
  {
    id: "6",
    type: "sent",
    text: "calle 1cz #2a - 111",
    timestamp: "6:03 p. m.",
    delay: 7500,
  },
  {
    id: "7",
    type: "received",
    text: "¿Es esta tu dirección de entrega?\n📍 Cra. 2A, Barranquilla, Atlántico, Colombia",
    timestamp: "6:03 p. m.",
    delay: 8500,
  },
  {
    id: "8",
    type: "sent",
    text: "Sí, es correcta",
    timestamp: "6:03 p. m.",
    delay: 9500,
  },
  {
    id: "9",
    type: "received",
    text: "Total: $ 65.400\nSubtotal: $ 59.900\n🚚 Envío: $ 5.500\n\n¿Cómo vas a pagar?",
    timestamp: "6:05 p. m.",
    delay: 10500,
  },
  {
    id: "10",
    type: "sent",
    text: "Efectivo",
    timestamp: "6:05 p. m.",
    delay: 11500,
  },
  {
    id: "11",
    type: "received",
    text: "¡Pedido confirmado! 🎉\n\nEstamos preparando tu orden. Pronto te notificaremos cuando esté lista. ¡Gracias por elegirnos!",
    timestamp: "6:05 p. m.",
    delay: 12500,
  },
];

export default function WhatsAppChat() {
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);
  const [isLooping, setIsLooping] = useState(true);

  useEffect(() => {
    if (!isLooping) return;

    const timeouts: NodeJS.Timeout[] = [];

    // Show messages with delays
    CHAT_MESSAGES.forEach((msg) => {
      const timeout = setTimeout(() => {
        setVisibleMessages((prev) => [...prev, msg.id]);
      }, msg.delay);
      timeouts.push(timeout);
    });

    // Reset after all messages are shown
    const lastDelay = Math.max(...CHAT_MESSAGES.map((m) => m.delay)) + 3000;
    const resetTimeout = setTimeout(() => {
      setVisibleMessages([]);
    }, lastDelay);
    timeouts.push(resetTimeout);

    return () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [isLooping]);

  return (
    <div className="relative w-full max-w-sm">
      {/* iPhone Frame */}
      <div className="relative bg-black rounded-3xl shadow-2xl overflow-hidden" style={{ aspectRatio: "9/19.5" }}>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-20" />

        {/* Screen */}
        <div className="absolute inset-0 bg-white rounded-3xl overflow-hidden" style={{ inset: "12px" }}>
          {/* Status Bar */}
          <div className="bg-gray-50 px-4 py-1.5 flex justify-between items-center text-xs font-semibold text-gray-900 border-b border-gray-200">
            <span>11:19</span>
            <div className="flex gap-1">
              <span>📶</span>
              <span>📡</span>
              <span>🔋</span>
            </div>
          </div>

          {/* Chat Header */}
          <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-200">
            <button className="text-gray-600 text-lg">←</button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Tiffanys Shop</h3>
              <p className="text-xs text-gray-500">online</p>
            </div>
            <button className="text-gray-600 text-lg">⋮</button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 space-y-3 h-[calc(100%-120px)]">
            {visibleMessages.map((msgId) => {
              const msg = CHAT_MESSAGES.find((m) => m.id === msgId);
              if (!msg) return null;

              return (
                <div
                  key={msgId}
                  className={`flex ${msg.type === "sent" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.type === "sent"
                        ? "bg-green-500 text-white rounded-br-none"
                        : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                    <div className={`text-xs mt-1 ${msg.type === "sent" ? "text-green-100" : "text-gray-500"}`}>
                      {msg.timestamp}
                      {msg.type === "sent" && " ✓✓"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Bar */}
          <div className="bg-white px-4 py-3 flex items-center gap-2 border-t border-gray-200">
            <button className="text-teal-600 text-xl">+</button>
            <input
              type="text"
              placeholder="Mensaje"
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
              disabled
            />
            <button className="text-teal-600 text-xl">📎</button>
            <button className="text-teal-600 text-xl">📷</button>
            <button className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white">
              🎤
            </button>
          </div>
        </div>

        {/* Side Bezels */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-black" />
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-black" />

        {/* Volume Buttons */}
        <div className="absolute -left-1 top-24 w-1 h-12 bg-gray-700 rounded-l" />
        <div className="absolute -left-1 top-40 w-1 h-12 bg-gray-700 rounded-l" />

        {/* Power Button */}
        <div className="absolute -right-1 top-32 w-1 h-16 bg-gray-600 rounded-r" />
      </div>
    </div>
  );
}
