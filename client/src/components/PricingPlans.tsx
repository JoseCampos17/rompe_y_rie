import { useState } from "react";
import { CheckCircle2, UtensilsCrossed, Truck, Store, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

type BusinessType = "restaurantes" | "domicilios" | "comercio";

interface Plan {
  name: string;
  createAppPrice: string;
  monthlyPrice: string;
  features: string[];
  isPremium: boolean;
}

const plansData: Record<BusinessType, Plan[]> = {
  restaurantes: [
    {
      name: "Estándar",
      createAppPrice: "$450K",
      monthlyPrice: "$350K",
      features: [
        "Convertir menú",
        "Preguntar sobre productos",
        "Realizar pedidos",
        "Confirmaciones automáticas",
        "Notificación a cocina",
        "Seguimiento de entregas",
        "Hasta 1,000 conversaciones/mes",
      ],
      isPremium: false,
    },
    {
      name: "Premium",
      createAppPrice: "$690K",
      monthlyPrice: "$590K",
      features: [
        "Todo del plan Estándar",
        "Solicitud de domicilios por WhatsApp",
        "Cálculo automático de tarifas",
        "Notificación a domiciliarios",
        "Aceptación de pedidos",
        "Actualización de estados en tiempo real",
        "Hasta 5,000 conversaciones/mes",
      ],
      isPremium: true,
    },
  ],
  domicilios: [
    {
      name: "Domicilios",
      createAppPrice: "$450K",
      monthlyPrice: "$350K",
      features: [
        "Solicitud de domicilios por WhatsApp",
        "Cálculo de tarifas",
        "Notificación a domiciliarios disponibles",
        "Aceptación de servicios",
        "Actualización de estados",
        "Seguimiento del pedido",
        "Cliente, domiciliario y negocio conectados en un solo flujo",
      ],
      isPremium: false,
    },
  ],
  comercio: [
    {
      name: "Estándar",
      createAppPrice: "$450K",
      monthlyPrice: "$350K",
      features: [
        "Administrar catálogo",
        "Gestionar productos",
        "Control de inventario",
        "Disponibilidad de productos",
        "Gestión de pedidos",
        "Atención automática",
        "Hasta 1,000 conversaciones/mes",
      ],
      isPremium: false,
    },
    {
      name: "Premium",
      createAppPrice: "$690K",
      monthlyPrice: "$590K",
      features: [
        "Todo del plan Estándar",
        "Marketplace personalizado",
        "Vitrina digital personalizada",
        "Solicitud de domicilios por WhatsApp",
        "Cálculo automático de tarifas",
        "Notificación a domiciliarios",
        "Hasta 5,000 conversaciones/mes",
      ],
      isPremium: true,
    },
  ],
};

export default function PricingPlans() {
  const [selectedType, setSelectedType] = useState<BusinessType>("restaurantes");

  const plans = plansData[selectedType];

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Planes adaptados a tu negocio
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            Elige el plan que se ajuste a tus necesidades y presupuesto
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setSelectedType("restaurantes")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
              selectedType === "restaurantes"
                ? "bg-gray-900 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            Restaurantes
          </button>
          <button
            onClick={() => setSelectedType("domicilios")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
              selectedType === "domicilios"
                ? "bg-gray-900 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Truck className="w-4 h-4" />
            Domicilios
          </button>
          <button
            onClick={() => setSelectedType("comercio")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
              selectedType === "comercio"
                ? "bg-gray-900 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Store className="w-4 h-4" />
            Comercio
          </button>
        </div>

        {/* Plans Grid */}
        <div
          className={`grid gap-6 ${
            plans.length === 1 ? "max-w-2xl mx-auto" : "md:grid-cols-2 max-w-4xl mx-auto"
          }`}
        >
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl p-6 transition-all duration-300 flex flex-col animate-fade-in-up hover:shadow-2xl hover:-translate-y-2 ${
                plan.isPremium
                  ? "bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 text-white shadow-2xl"
                  : "bg-white border-2 border-gray-200 text-gray-900 shadow-lg hover:shadow-xl"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Plan Name */}
              <div className="flex items-center gap-2 mb-6">
                <div
                  className={`w-8 h-8 rounded flex items-center justify-center text-lg ${
                    plan.isPremium ? "bg-white/20" : "bg-gray-100"
                  }`}
                >
                  {plan.isPremium ? "👑" : <Palette className="w-5 h-5" />}
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
              </div>

              {/* Pricing */}
              <div className="mb-6 pb-6 border-b border-opacity-20" style={{borderColor: plan.isPremium ? "white" : "#e5e7eb"}}>
                <div className="mb-4">
                  <p className={`text-xs font-medium mb-1 ${plan.isPremium ? "text-white/90" : "text-gray-600"}`}>
                    Create app:
                  </p>
                  <p className="text-2xl font-bold" style={{fontSize: '20px'}}>{plan.createAppPrice}</p>
                </div>
                <div>
                  <p className={`text-xs font-medium mb-1 ${plan.isPremium ? "text-white/90" : "text-gray-600"}`}>
                    Mensual:
                  </p>
                  <p className="text-2xl font-bold" style={{fontSize: '20px'}}>{plan.monthlyPrice}</p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        plan.isPremium ? "text-white" : "text-emerald-500"
                      }`}
                    />
                    <span className={`text-xs leading-relaxed ${plan.isPremium ? "text-white" : "text-gray-700"}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                className={`w-full py-2 font-bold rounded-lg transition-all duration-300 text-sm mt-auto ${
                  plan.isPremium
                    ? "bg-white text-purple-600 hover:bg-gray-100"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
              >
                Elegir plan
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
