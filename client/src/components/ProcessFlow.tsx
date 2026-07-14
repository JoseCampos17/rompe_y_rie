import React, { useState, useEffect } from 'react';
import { MessageCircle, Zap, ShoppingBag, Truck, Check } from 'lucide-react';

interface ProcessStep {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
  bullets: string[];
}

const ProcessFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps: ProcessStep[] = [
    {
      id: 1,
      title: 'Cliente',
      subtitle: 'Envía mensaje',
      icon: <MessageCircle className="w-6 h-6" />,
      color: 'from-blue-400 to-blue-600',
      borderColor: '#3b82f6',
      bgColor: 'bg-blue-50',
      bullets: ['Atiende clientes 24/7', 'Responde preguntas automáticamente'],
    },
    {
      id: 2,
      title: 'Express IA',
      subtitle: 'Procesa automáticamente',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-emerald-400 to-emerald-600',
      borderColor: '#10b981',
      bgColor: 'bg-emerald-50',
      bullets: ['Recibe el pedido', 'Gestiona los domicilios'],
    },
    {
      id: 3,
      title: 'Negocio',
      subtitle: 'Recibe información',
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'from-cyan-400 to-cyan-600',
      borderColor: '#06b6d4',
      bgColor: 'bg-cyan-50',
      bullets: ['Coordina colaboradores', 'Mantiene informado al cliente'],
    },
    {
      id: 4,
      title: 'Domicilio',
      subtitle: 'Se asigna automáticamente',
      icon: <Truck className="w-6 h-6" />,
      color: 'from-red-400 to-red-600',
      borderColor: '#ef4444',
      bgColor: 'bg-red-50',
      bullets: ['Control inventario', 'Organiza la operación del negocio'],
    },
  ];

  // Cambiar el paso activo cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 md:py-20 bg-white" style={{backgroundColor: '#fafafa', paddingBottom: '50px', paddingTop: '50px'}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título y descripción */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Qué es Express IA?
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Conoce a tu nuevo empleado digital, una plataforma de inteligencia artificial diseñada para restaurantes, comercios y empresas de domicilios que quieren automatizar su atención y operación.
          </p>
        </div>

        {/* Process Flow Container - Diseño más fluido y creativo */}
        <div className="relative">
          {/* Contenedor con 4 cuadritos - Responsive */}
          <div className="relative flex items-center justify-center gap-0 mb-16 flex-wrap md:flex-nowrap">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div 
                  className="relative flex-1 md:flex-none flex flex-col items-center min-w-0 w-full transition-all duration-300"
                  style={{
                    maxWidth: activeStep === index ? '240px' : '180px',
                    width: '100%',
                  }}
                >
                  {/* Card del paso - Diseño mejorado y fluido */}
                  <div
                    className={`transition-all duration-500 ${step.bgColor} border-2 rounded-2xl flex flex-col items-center justify-center relative overflow-visible w-full`}
                    style={{
                      borderColor: activeStep === index ? step.borderColor : '#e5e7eb',
                      padding: '24px 16px',
                      minHeight: activeStep === index ? '210px' : '150px',
                      width: '100%',
                      maxWidth: '100%',
                      margin: '0 auto',
                      transform: activeStep === index ? 'scaleX(1.01) scaleY(1.04) translateY(-2px)' : 'scale(1)',
                      boxShadow:
                        activeStep === index
                          ? `0 16px 32px ${step.borderColor}35, inset 0 1px 0 ${step.borderColor}15`
                          : '0 2px 8px rgba(0,0,0,0.06)',
                      zIndex: activeStep === index ? 10 : 1,
                    }}
                  >
                    {/* Efecto de ola expansiva - Ripple effect */}
                    {activeStep === index && (
                      <div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          border: `2px solid ${step.borderColor}`,
                          animation: `wave-ripple 2s ease-out infinite`,
                          opacity: 0.6,
                        }}
                      />
                    )}

                    {/* Efecto de fondo degradado sutil - Solo cuando está activo */}
                    {activeStep === index && (
                      <div
                        className="absolute inset-0 opacity-0 transition-opacity duration-500 rounded-2xl"
                        style={{
                          background: `radial-gradient(circle at top right, ${step.borderColor}08, transparent)`,
                          opacity: 1,
                        }}
                      />
                    )}

                    {/* Icono con animación fluida */}
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white transition-all duration-500 flex-shrink-0 mb-1.5 relative z-10`}
                      style={{
                        transform: activeStep === index ? 'scale(1.15) rotate(0deg)' : 'scale(1) rotate(-5deg)',
                        filter: activeStep === index ? 'drop-shadow(0 6px 12px rgba(0,0,0,0.15))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))',
                      }}
                    >
                      {step.icon}
                    </div>

                    {/* Título - Tipografía mejorada */}
                    <h3 className="text-xs font-bold text-center text-gray-900 leading-tight relative z-10 px-1 transition-all duration-300" style={{
                      fontSize: activeStep === index ? '0.875rem' : '0.75rem',
                    }}>
                      {step.title}
                    </h3>

                    {/* Subtítulo - Siempre visible */}
                    <p className="text-xs text-center text-gray-600 leading-tight mt-0.5 relative z-10 px-1 transition-all duration-300" style={{
                      opacity: activeStep === index ? 1 : 0.7,
                      fontSize: activeStep === index ? '0.75rem' : '0.7rem',
                    }}>
                      {step.subtitle}
                    </p>

                    {/* Viñetas - SOLO cuando está activo, con animación suave */}
                    {activeStep === index && (
                      <div className="space-y-1 mt-2.5 w-full relative z-10 px-1" style={{
                        animation: 'slide-in-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}>
                        {step.bullets.map((bullet, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-left" style={{
                            animation: `fade-in 0.4s ease-out ${i * 0.1}s both`,
                          }}>
                            <div className="flex-shrink-0 mt-0.5">
                              <svg
                                className="w-3.5 h-3.5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <p className="text-xs text-gray-700 leading-tight line-clamp-2">
                              {bullet}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Check verde con fondo - Encima del cuadro tapando la punta */}
                    {index < activeStep && (
                      <div 
                        className="absolute z-[9999]"
                        style={{
                          top: '-10px',
                          right: '-10px',
                          pointerEvents: 'none',
                          animation: 'scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      >
                        <div className="bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white" style={{
                          boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4), 0 0 0 3px rgba(16, 185, 129, 0.15)',
                          width: '32px',
                          height: '32px',
                          position: 'relative',
                          zIndex: 9999,
                        }}>
                          <Check className="w-4 h-4 text-white stroke-[3.5]" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:flex items-center justify-center flex-1 min-w-[20px] max-w-[60px] mx-1">
                    <div className="relative w-full h-[2px]" style={{ backgroundColor: activeStep > index ? '#10b981' : '#e5e7eb' }}>
                      <div 
                        className="absolute top-1/2 left-1/2 rounded-full border-2 border-white transition-all duration-500"
                        style={{
                          width: '14px',
                          height: '14px',
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: activeStep > index ? '#10b981' : '#e5e7eb',
                          animation: activeStep - 1 === index ? 'pulse-dot 2s infinite ease-in-out' : 'none',
                          boxShadow: activeStep > index ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none',
                        }}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Progress Bar at the bottom of the section */}
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-12 mb-4 max-w-5xl mx-auto">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500 ease-out"
              style={{
                width: `${((activeStep + 1) / steps.length) * 100}%`
              }}
            />
          </div>


        </div>
      </div>

      <style>{`
        @keyframes wave-ripple {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(59, 130, 246, 0);
            transform: scale(1.05);
          }
          100% {
            box-shadow: 0 0 0 12px rgba(59, 130, 246, 0);
            transform: scale(1);
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes slide-in-up {
          from {
            transform: translateY(8px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse-dot {
          0% {
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          50% {
            transform: translate(-50% , -50%) scale(1.4);
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
      `}</style>
    </section>
  );
};

export default ProcessFlow;
