import { useEffect, useRef, useState } from "react";
import { Plus, Paperclip, Camera, Mic } from "lucide-react";

interface Message {
  id: string;
  type: "sent" | "received";
  text: string;
  timestamp: string;
}

const CHAT_FLOW: Message[] = [
  { id: "1", type: "sent", text: "¡Hola! Me gustaría cotizar una piñata para el cumpleaños de mi hijo.", timestamp: "11:15 a.m." },
  {
    id: "2",
    type: "received",
    text: "¡Hola! 🥳 Qué alegría. Claro que sí, en Rompe y Ríe tú la imaginas y yo la hago realidad. ¿Qué diseño o personaje tienes en mente?",
    timestamp: "11:16 a.m.",
  },
  {
    id: "3",
    type: "sent",
    text: "Le encanta Toy Story, me gustaría una con forma del dinosaurio Rex. 🦖",
    timestamp: "11:16 a.m.",
  },
  {
    id: "4",
    type: "received",
    text: "¡Me encanta esa idea! 😍 Podemos hacer un brontosaurio o T-Rex personalizado espectacular. ¿De qué tamaño te gustaría? Tenemos Pequeña (~60cm), Mediana (~80cm) y Grande (~100cm).",
    timestamp: "11:17 a.m.",
  },
  { id: "5", type: "sent", text: "Mediana está bien. ¿Cuál sería el valor estimado?", timestamp: "11:17 a.m." },
  {
    id: "6",
    type: "received",
    text: "Una piñata mediana de personaje en relieve 3D tiene un valor estimado de $64.000 CLP. \n\nPara agendar y asegurar tu cupo, solicitamos un abono inicial del 50% ($32.000) por Mercado Pago. ¡El saldo restante lo pagas al retirar! 🎨🎈",
    timestamp: "11:18 a.m.",
  },
  { id: "7", type: "sent", text: "Buenísimo, ¿cómo hago el abono?", timestamp: "11:18 a.m." },
  {
    id: "8",
    type: "received",
    text: "¡Súper! Puedes completar la cotización en esta misma web, calcular el precio y pagar el abono seguro con Mercado Pago. \n\nAl confirmar, te llegará un recibo y me pondré en contacto contigo para los detalles de personalización. ¡Hagamos juntos una piñata inolvidable! 💝✨",
    timestamp: "11:19 a.m.",
  },
];

export default function DynamicWhatsAppChat() {
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);
  const [isLooping, setIsLooping] = useState(true);
  const [loopTrigger, setLoopTrigger] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [visibleMessages]);

  // Animación del chat
  useEffect(() => {
    if (!isLooping) return;

    const timeouts: NodeJS.Timeout[] = [];

    // Mostrar cada mensaje con delay progresivo
    CHAT_FLOW.forEach((msg, index) => {
      const timeout = setTimeout(() => {
        setVisibleMessages((prev) => [...prev, msg.id]);
      }, index * 2000); // 2000ms entre mensajes para lectura cómoda
      timeouts.push(timeout);
    });

    // Resetear después de que todos los mensajes se muestren
    const resetTimeout = setTimeout(() => {
      setVisibleMessages([]);
      setLoopTrigger((prev) => prev + 1);
    }, CHAT_FLOW.length * 2000 + 4000); // 4 segundos de pausa antes de reiniciar
    timeouts.push(resetTimeout);

    return () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [isLooping, loopTrigger]);

  // Asegurar que el loop esté siempre activo
  useEffect(() => {
    setIsLooping(true);
  }, []);

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* iPhone Frame */}
      <div
        className="relative bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-gray-800"
        style={{
          aspectRatio: "9/19.5",
          boxShadow: "0 15px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
          transform: "translate3d(0, 0, 0)",
          isolation: "isolate",
        }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl z-20" />

        {/* Screen Container */}
        <div
          className="absolute inset-0 bg-[#e5ddd5] rounded-[2rem] overflow-hidden flex flex-col"
          style={{ 
            inset: "8px",
            transform: "translate3d(0, 0, 0)"
          }}
        >
          {/* Status Bar - WhatsApp style */}
          <div className="bg-[#075E54] px-4 py-1.5 flex justify-between items-center text-[10px] font-semibold text-white/95 flex-shrink-0">
            <span>11:19</span>
            <div className="flex gap-1 items-center">
              <span>📶</span>
              <span>🔋 95%</span>
            </div>
          </div>

          {/* Chat Header - WhatsApp style */}
          <div className="bg-[#075E54] px-3 py-2 flex items-center gap-2 border-b border-[#054c44] flex-shrink-0">
            <span className="text-white text-sm font-bold cursor-pointer">←</span>
            
            {/* Logo de Rompe y Ríe */}
            <div className="w-8 h-8 rounded-full bg-white overflow-hidden border border-white/20 flex-shrink-0">
              <img 
                src="/images/logo.png" 
                alt="Rompe y Ríe" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0 text-left">
              <h3 className="font-bold text-white text-xs leading-none">Rompe y Ríe 🎈</h3>
              <span className="text-[10px] text-white/80 mt-0.5 block leading-none">En línea</span>
            </div>
            <span className="text-white text-xs cursor-pointer">⋮</span>
          </div>

          {/* Chat Messages Area with Scroll - WhatsApp style */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto bg-[#efeae2] px-2.5 py-3 space-y-2 scroll-smooth no-scrollbar"
            style={{
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
            }}
          >
            {visibleMessages.map((msgId) => {
              const msg = CHAT_FLOW.find((m) => m.id === msgId);
              if (!msg) return null;

              const isReceived = msg.type === "received";

              return (
                <div
                  key={msgId}
                  className={`flex ${isReceived ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-1 duration-300`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-1.5 rounded-lg text-xs leading-relaxed break-words shadow-sm ${
                      isReceived
                        ? "bg-white text-gray-900 rounded-tl-none text-left"
                        : "bg-[#d9fdd3] text-[#111b21] rounded-tr-none text-left"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div
                      className="text-[9px] mt-1 flex items-center gap-0.5 justify-end text-gray-400"
                    >
                      <span>{msg.timestamp}</span>
                      {!isReceived && <span className="text-sky-500 font-bold">✓✓</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Bar - WhatsApp style */}
          <div className="bg-[#f0f2f5] px-3 py-2 flex items-center gap-1.5 border-t border-gray-200 flex-shrink-0">
            <Plus className="w-4 h-4 text-gray-500 cursor-pointer" />
            <input
              type="text"
              placeholder="Mensaje"
              className="flex-1 min-w-0 bg-white rounded-full px-3 py-1 text-[11px] outline-none border border-gray-100"
              disabled
            />
            <Paperclip className="w-4 h-4 text-gray-500 cursor-pointer" />
            <Camera className="w-4 h-4 text-gray-500 cursor-pointer" />
            <div className="w-7 h-7 bg-[#00a884] rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <Mic className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Side Bezels */}
        <div className="absolute left-0 top-10 bottom-10 w-0.5 bg-gray-800" />
        <div className="absolute right-0 top-10 bottom-10 w-0.5 bg-gray-800" />
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
