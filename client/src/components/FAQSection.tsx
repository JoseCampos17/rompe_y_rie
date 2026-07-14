import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const faqItems: FAQItem[] = [
  {
    q: "¿Cómo funciona Express IA?",
    a: "Express IA se integra con tu WhatsApp Business y utiliza inteligencia artificial para responder automáticamente a tus clientes, procesar pedidos y gestionar tu operación 24/7."
  },
  {
    q: "¿Necesito conocimientos técnicos?",
    a: "No, Express IA es fácil de configurar. Nuestro equipo te acompaña en todo el proceso de implementación."
  },
  {
    q: "¿Puedo integrar mi ERP?",
    a: "Sí, Express IA se integra con la mayoría de sistemas ERP y plataformas de e-commerce."
  },
  {
    q: "¿Qué pasa con mis datos?",
    a: "Todos tus datos están encriptados y almacenados de forma segura. Cumplimos con todas las regulaciones de protección de datos."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-12 md:py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Preguntas Frecuentes
          </h2>
          <p className="text-gray-600">
            Resuelve tus dudas sobre Express IA
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-emerald-300 hover:shadow-md animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <h3 className="text-base md:text-lg font-semibold text-gray-900 text-left">
                  {item.q}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-emerald-500 flex-shrink-0 ml-4 transition-transform duration-300 ${
                    openIndex === index ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {/* Answer */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-gray-200">
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            ¿No encontraste tu respuesta?
          </h3>
          <p className="text-gray-600 mb-4">
            Nuestro equipo de soporte está disponible 24/7 para ayudarte
          </p>
          <button className="inline-block px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors duration-200">
            Contactar Soporte
          </button>
        </div>
      </div>
    </section>
  );
}
