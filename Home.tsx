import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Check,
  Sparkles,
  Star,
  Palette,
  DollarSign,
  Calendar,
  Maximize2,
  FileText,
  CheckCircle,
  HelpCircle,
  Heart,
  Info,
  ShieldCheck,
  ArrowRight,
  Upload,
  Phone,
  MapPin,
  Loader2,
  Menu,
  X,
  Gift,
  Plus,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import DynamicWhatsAppChat from "@/components/DynamicWhatsAppChat";

// Definición de las piñatas reales provistas en la sesión
const PINATAS_GALLERY = [
  {
    id: 1,
    title: "Vaca con Lazo Rosa",
    category: "tiernas",
    description: "Piñata adorable de vaquita hecha a mano con detalles brillantes y un hermoso lazo fucsia.",
    image: "/images/cow.jpg",
    priceEstimate: "$35.000 - $45.000 CLP"
  },
  {
    id: 2,
    title: "Dinosaurio Brontosaurio",
    category: "divertidas",
    description: "Tierno y alegre dinosaurio verde, perfecto para los amantes del jurásico y las aventuras.",
    image: "/images/dino.jpg",
    priceEstimate: "$40.000 - $50.000 CLP"
  },
  {
    id: 3,
    title: "Excavadora CAT",
    category: "originales",
    description: "Diseño único y detallado de maquinaria de construcción con ruedas y cabina realista.",
    image: "/images/excavator.jpg",
    priceEstimate: "$45.000 - $55.000 CLP"
  },
  {
    id: 4,
    title: "Número 1 Rosa Glitter",
    category: "cada-ocasion",
    description: "Piñata clásica de primer cumpleaños con detalles de purpurina plateada y gran moño fucsia.",
    image: "/images/pink-one.png",
    priceEstimate: "$30.000 - $40.000 CLP"
  },
  {
    id: 5,
    title: "Número 2 La Granja",
    category: "cada-ocasion",
    description: "Temática de La Granja de Zenón con Bartolito, la Vaca Lola, un caballo y vallas campestres.",
    image: "/images/farm-two.jpg",
    priceEstimate: "$35.000 - $45.000 CLP"
  },
  {
    id: 6,
    title: "Snoopy de Cumpleaños",
    category: "divertidas",
    description: "Snoopy con gorro festivo de rayas y sosteniendo un delicioso pastel de cumpleaños con vela.",
    image: "/images/snoopy.jpg",
    priceEstimate: "$40.000 - $50.000 CLP"
  }
];

const CATEGORIES = [
  { id: "all", label: "Todas" },
  { id: "tiernas", label: "Tiernas" },
  { id: "divertidas", label: "Divertidas" },
  { id: "originales", label: "Originales" },
  { id: "cada-ocasion", label: "Para cada ocasión" }
];

// Componente decorativo de banderines (Bunting)
function Bunting() {
  const colors = ["bg-pink-500", "bg-yellow-400", "bg-teal-400", "bg-purple-500", "bg-orange-400", "bg-lime-400"];
  return (
    <div className="absolute top-0 left-0 w-full overflow-hidden h-6 flex justify-between z-10 pointer-events-none">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className={`w-6 h-6 transform rotate-45 -translate-y-3 ${colors[i % colors.length]}`}
          style={{ borderRadius: "0 0 4px 0" }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Estados de cotización
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [style, setStyle] = useState("tiernas");
  const [size, setSize] = useState("mediana");
  const [details, setDetails] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [referenceFile, setReferenceFile] = useState<string | null>(null);

  // Estados del modal de Mercado Pago
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"form" | "loading" | "success">("form");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [createdOrderCode, setCreatedOrderCode] = useState("");

  const createOrderMutation = trpc.orders.create.useMutation();

  // Precios base
  const stylePrices: Record<string, number> = {
    tiernas: 35000,
    divertidas: 40000,
    originales: 45000,
    "cada-ocasion": 30000
  };

  const sizeMultipliers: Record<string, number> = {
    pequena: 1.0,
    mediana: 1.4,
    grande: 1.8
  };

  const addonPrices: Record<string, number> = {
    glitter: 5000,
    relieve: 8000,
    flecos: 4000
  };

  const calculateEstimate = () => {
    const base = stylePrices[style] || 35000;
    const mult = sizeMultipliers[size] || 1.4;
    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + (addonPrices[addon] || 0), 0);
    const total = Math.round(base * mult + addonsTotal);
    const deposit = Math.round(total * 0.5);
    return { total, deposit };
  };

  const { total: estimateTotal, deposit: estimateDeposit } = calculateEstimate();

  const handleAddonChange = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReferenceFile(e.target.files[0].name);
    }
  };

  // Enviar cotización y abrir Mercado Pago
  const handleOpenCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !eventDate) {
      alert("Por favor rellena los datos de contacto y la fecha de tu evento.");
      return;
    }

    setCheckoutModalOpen(true);
    setPaymentStep("form");
  };

  const handleProcessPayment = async () => {
    setPaymentStep("loading");

    // Enviar orden a través de tRPC
    try {
      const order = await createOrderMutation.mutateAsync({
        clientName,
        clientPhone,
        clientEmail: clientEmail || null,
        eventDate,
        style,
        size,
        details: details || null,
        referenceImage: referenceFile || null,
        estimatedPrice: estimateTotal,
        depositAmount: estimateDeposit,
        paymentStatus: "paid", // Simulado exitoso
        paymentId: `MP-${Math.floor(Math.random() * 9000000) + 1000000}`
      });

      if (order.success) {
        setCreatedOrderCode(order.orderCode || `RR-${order.id}`);
        setTimeout(() => {
          setPaymentStep("success");
        }, 2000);
      }
    } catch (error) {
      console.error("Error al registrar el abono:", error);
      alert("Ocurrió un error al procesar el abono. Por favor inténtalo de nuevo.");
      setPaymentStep("form");
    }
  };

  const handleDownloadReceipt = () => {
    const receiptContent = `
=============================================
         RECIBO DE ABONO - ROMPE Y RÍE
=============================================
Código de Pedido: ${createdOrderCode}
Fecha del Abono: ${new Date().toLocaleDateString("es-CL")}
Cliente: ${clientName}
Teléfono: ${clientPhone}
Fecha del Evento: ${eventDate}
---------------------------------------------
Piñata: Personalizada (Estilo ${style.toUpperCase()})
Tamaño: ${size.toUpperCase()}
Abonado (50%): $${estimateDeposit.toLocaleString("es-CL")} CLP
Pendiente (50%): $${estimateDeposit.toLocaleString("es-CL")} CLP
Costo Total Estimado: $${estimateTotal.toLocaleString("es-CL")} CLP
---------------------------------------------
Estado del Abono: CONFIRMADO (Mercado Pago)
¡Gracias por confiar en Rompe y Ríe!
=============================================
    `;

    const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Recibo_${createdOrderCode}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredPiñatas = selectedCategory === "all"
    ? PINATAS_GALLERY
    : PINATAS_GALLERY.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FFFDF6] text-[#3F2E2C] selection:bg-[#EC4899] selection:text-white relative overflow-hidden">
      {/* Globos de decoración de fondo animativos */}
      <div className="absolute top-20 left-10 pointer-events-none opacity-20 hidden lg:block animate-float">
        <div className="w-16 h-20 bg-pink-400 rounded-full relative" style={{ borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%" }}>
          <div className="w-0.5 h-16 bg-pink-300 absolute top-full left-1/2 -translate-x-1/2" />
        </div>
      </div>
      <div className="absolute top-40 right-10 pointer-events-none opacity-20 hidden lg:block animate-float">
        <div className="w-20 h-24 bg-purple-400 rounded-full relative" style={{ borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%" }}>
          <div className="w-0.5 h-20 bg-purple-300 absolute top-full left-1/2 -translate-x-1/2" />
        </div>
      </div>

      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-[#FFFDF6]/95 backdrop-blur-md border-b border-[#EDDED4] shadow-sm relative">
        <Bunting />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-3">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-full overflow-hidden border-2 border-purple-500 shadow-md flex items-center justify-center hover:scale-105 transition-transform">
                <img src="/images/logo.png" alt="Rompe y Ríe" className="w-full h-full object-cover scale-110" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-2xl tracking-tight text-purple-600 leading-none">Rompe y Ríe</span>
                <span className="text-[10px] font-bold text-pink-500 tracking-widest uppercase">Piñatería</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#gallery" className="font-semibold text-gray-700 hover:text-purple-600 transition-colors">Galería</a>
              <a href="#about" className="font-semibold text-gray-700 hover:text-purple-600 transition-colors">Quiénes Somos</a>
              <a href="#process" className="font-semibold text-gray-700 hover:text-purple-600 transition-colors">¿Cómo Pedir?</a>
              <a href="#quote" className="font-semibold text-gray-700 hover:text-purple-600 transition-colors">Cotizar</a>
              <a href="#hosting-info" className="font-semibold text-gray-700 hover:text-purple-600 transition-colors">Hosting y Web</a>
            </nav>

            <div className="hidden md:block">
              <Button asChild className="bg-pink-500 hover:bg-pink-600 hover-lift text-white font-bold px-6 py-5 rounded-full text-base shadow-md">
                <a href="#quote">¡Quiero mi Piñata!</a>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-pink-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-7 h-7 text-pink-500" /> : <Menu className="w-7 h-7 text-purple-600" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 pt-2 space-y-3 border-t border-[#EDDED4] mt-2">
              <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-600">Galería</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-600">Quiénes Somos</a>
              <a href="#process" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-600">¿Cómo Pedir?</a>
              <a href="#quote" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-600">Cotizar</a>
              <a href="#hosting-info" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-600">Hosting y Web</a>
              <Button asChild className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full py-5 text-base">
                <a href="#quote" onClick={() => setMobileMenuOpen(false)}>¡Cotizar Ahora!</a>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#FFFDF6] via-[#FAF5F0] to-[#FFFDF6] py-16 lg:py-24 border-b border-[#EDDED4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side text */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-pink-100 border border-pink-200 px-4 py-2 rounded-full text-pink-600 font-bold text-sm">
                <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: "3s" }} />
                <span>¡Diseños 100% Personalizados!</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-purple-600 leading-tight">
                ¡Tú imaginas,<br />
                <span className="text-pink-500 text-5xl sm:text-6xl lg:text-7xl">yo la hago realidad!</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#6B5A57] max-w-xl mx-auto lg:mx-0 font-medium">
                Piñatas únicas hechas a mano con amor, dedicación y materiales de primera calidad para que tu fiesta sea inolvidable.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button asChild size="lg" className="bg-[#6B21A8] hover:bg-purple-700 text-white font-extrabold px-8 py-7 rounded-full text-lg shadow-lg hover-lift">
                  <a href="#quote">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Cotizar Mi Piñata
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-emerald-500 hover:bg-emerald-50 text-emerald-600 font-extrabold px-8 py-7 rounded-full text-lg hover-lift">
                  <a href="https://wa.me/56994732212?text=Hola%20Rompe%20y%20Rie!%20Me%20gustar%C3%ADa%20consultar%20por%20una%20pi%C3%B1ata%20personalizada." target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-6 h-6 mr-2 fill-emerald-500 stroke-white" />
                    Escríbeme por WhatsApp
                  </a>
                </Button>
              </div>

              {/* Banderitas flotantes / Highlights */}
              <div className="grid grid-cols-3 gap-3 pt-6 max-w-md mx-auto lg:mx-0">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-[#EDDED4] text-center hover:scale-105 transition-transform duration-300">
                  <span className="block text-2xl">💝</span>
                  <span className="text-xs font-extrabold text-gray-600">Hechas a mano</span>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-[#EDDED4] text-center hover:scale-105 transition-transform duration-300">
                  <span className="block text-2xl">⭐</span>
                  <span className="text-xs font-extrabold text-gray-600">Calidad Premium</span>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-[#EDDED4] text-center hover:scale-105 transition-transform duration-300">
                  <span className="block text-2xl">🎨</span>
                  <span className="text-xs font-extrabold text-gray-600">100% a tu gusto</span>
                </div>
              </div>
            </div>

            {/* Right side flyer / visual banner */}
            <div className="relative flex justify-center">
              {/* Círculo de fondo decorativo */}
              <div className="absolute -inset-4 bg-yellow-200/50 rounded-full blur-2xl -z-10" />
              
              {/* Cuadro contenedor del flyer */}
              <div className="relative bg-white p-4 rounded-3xl shadow-xl border-4 border-white max-w-sm sm:max-w-md transform rotate-1 hover:rotate-0 transition-transform duration-500 overflow-hidden">
                <Bunting />
                <div className="rounded-2xl overflow-hidden aspect-[3/4.5] shadow-inner bg-[#FAF5F0]">
                  <img src="/images/flyer.jpg" alt="Flyer Piñatas Rompe y Ríe" className="w-full h-full object-cover" />
                </div>
                {/* Badge promocional del flyer */}
                <div className="absolute bottom-6 right-6 bg-teal-500 text-white rounded-full p-4 shadow-lg text-center transform rotate-6 border-2 border-white hover:scale-110 transition-transform duration-300">
                  <span className="block font-bold text-[10px] uppercase tracking-wider">Diseños</span>
                  <span className="block font-black text-base">Únicos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 relative bg-white border-b border-[#EDDED4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-purple-600">Nuestros Trabajos Realizados</h2>
            <p className="text-gray-600 text-base font-medium">
              Explora nuestra galería de piñatas reales fabricadas a mano con amor y cuidado especial. ¡Haz clic en las categorías para filtrarlas!
            </p>

            {/* Category filter tabs */}
            <div className="flex flex-wrap gap-2 justify-center pt-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2 rounded-full font-bold transition-all text-sm sm:text-base border shadow-sm ${
                    selectedCategory === cat.id
                      ? "bg-[#6B21A8] border-purple-600 text-white"
                      : "bg-[#FFFDF6] border-[#EDDED4] hover:bg-purple-50 text-gray-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de imágenes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredPiñatas.map(pinata => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={pinata.id}
                  className="bg-[#FFFDF6] rounded-3xl border border-[#EDDED4] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col hover:-translate-y-1"
                >
                  <div className="aspect-square w-full overflow-hidden bg-[#FAF5F0] relative">
                    <img
                      src={pinata.image}
                      alt={pinata.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full px-3 py-1 text-[10px] font-extrabold text-pink-500 uppercase tracking-widest">
                      {pinata.category === "tiernas" && "Tiernas"}
                      {pinata.category === "divertidas" && "Divertidas"}
                      {pinata.category === "originales" && "Originales"}
                      {pinata.category === "cada-ocasion" && "Cada Ocasión"}
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900">{pinata.title}</h3>
                      <p className="text-[#6B5A57] text-sm leading-relaxed">{pinata.description}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#EDDED4] flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Presupuesto Aprox.</span>
                      <span className="text-[#6B21A8] font-black text-base">{pinata.priceEstimate}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* About Us (Quiénes Somos) Section */}
      <section id="about" className="py-20 relative bg-gradient-to-b from-white to-[#FFFDF6] border-b border-[#EDDED4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side details */}
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-purple-600">Quiénes Somos - Rompe y Ríe</h2>
              <h3 className="text-xl font-bold text-pink-500">¿Cómo nace nuestra piñatería?</h3>
              <p className="text-[#6B5A57] text-base lg:text-lg leading-relaxed font-medium">
                Nacimos con la misión de llevar magia, risas y colores a cada celebración. Creemos que la piñata no es solo un adorno en una fiesta, sino el momento cúspide de diversión y felicidad compartida.
              </p>
              <p className="text-[#6B5A57] text-base lg:text-lg leading-relaxed font-medium">
                Por eso, nos especializamos en confeccionar piñatas que son verdaderas obras de arte: completamente a mano, con atención minuciosa en los detalles y con materiales súper resistentes para que duren exactamente lo necesario en tu evento.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <Card className="border border-[#EDDED4] shadow-sm bg-white rounded-2xl hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 text-pink-500">
                      <Heart className="w-5 h-5 fill-current" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900 text-sm">Pasión Artesanal</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Diseños decorados papel a papel por nosotros.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-[#EDDED4] shadow-sm bg-white rounded-2xl hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 text-yellow-600">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900 text-sm">Seguras y Robustas</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Estructuras firmes y materiales de gran calidad.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right side collage */}
            <div className="bg-[#FAF5F0] border-2 border-[#EDDED4] rounded-3xl p-6 relative flex justify-center items-center shadow-lg overflow-hidden">
              <Bunting />
              <div className="grid grid-cols-2 gap-4 z-10">
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-md border-4 border-white hover:scale-105 transition-transform duration-300">
                    <img src="/images/cow.jpg" alt="Vaca" className="w-full object-cover" />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-md border-4 border-white hover:scale-105 transition-transform duration-300">
                    <img src="/images/dino.jpg" alt="Dino" className="w-full object-cover" />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl overflow-hidden shadow-md border-4 border-white hover:scale-105 transition-transform duration-300">
                    <img src="/images/excavator.jpg" alt="Excavator" className="w-full object-cover" />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-md border-4 border-white hover:scale-105 transition-transform duration-300">
                    <img src="/images/pink-one.png" alt="Número 1" className="w-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Flow Section */}
      <section id="process" className="py-20 relative bg-white border-b border-[#EDDED4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-purple-600">¿Cómo encargar tu piñata?</h2>
            <p className="text-gray-600 text-base font-medium">
              El proceso es muy simple y transparente. Aseguramos tu cupo con un abono inicial y te mantenemos al tanto de cada avance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4 bg-[#FFFDF6] p-6 rounded-3xl border border-[#EDDED4] shadow-sm relative group hover:shadow-md transition-shadow">
              <div className="absolute -top-5 left-6 bg-pink-500 text-white font-extrabold text-lg w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                1
              </div>
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-lg text-gray-900">Cotización</h3>
              <p className="text-xs text-[#6B5A57] leading-relaxed">Completa el formulario abajo para estimar el precio y configurar las medidas.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4 bg-[#FFFDF6] p-6 rounded-3xl border border-[#EDDED4] shadow-sm relative group hover:shadow-md transition-shadow">
              <div className="absolute -top-5 left-6 bg-purple-500 text-white font-extrabold text-lg w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                2
              </div>
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-lg text-gray-900">Abono del 50%</h3>
              <p className="text-xs text-[#6B5A57] leading-relaxed">Reserva tu fecha abonando el 50% de manera rápida y segura por Mercado Pago.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4 bg-[#FFFDF6] p-6 rounded-3xl border border-[#EDDED4] shadow-sm relative group hover:shadow-md transition-shadow">
              <div className="absolute -top-5 left-6 bg-yellow-500 text-white font-extrabold text-lg w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                3
              </div>
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                <Palette className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-lg text-gray-900">Confección</h3>
              <p className="text-xs text-[#6B5A57] leading-relaxed">Confeccionamos tu piñata a mano en 5 a 7 días hábiles con detalles hermosos.</p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center space-y-4 bg-[#FFFDF6] p-6 rounded-3xl border border-[#EDDED4] shadow-sm relative group hover:shadow-md transition-shadow">
              <div className="absolute -top-5 left-6 bg-teal-500 text-white font-extrabold text-lg w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                4
              </div>
              <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                <Gift className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-lg text-gray-900">Entrega o Envío</h3>
              <p className="text-xs text-[#6B5A57] leading-relaxed">¡Retira tu piñata o coordina el despacho para romperla y sonreír en tu fiesta!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Form Section */}
      <section id="quote" className="py-20 relative bg-gradient-to-b from-[#FFFDF6] to-[#FAF5F0] border-b border-[#EDDED4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2 text-left">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-purple-600">Cotizador y Reserva Online</h2>
                <p className="text-gray-600 text-sm font-medium">
                  Selecciona el tamaño, estilo y detalles de tu piñata ideal. Obtendrás un presupuesto estimado automático y podrás abonar el 50% vía Mercado Pago.
                </p>
              </div>

              <form onSubmit={handleOpenCheckout} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EDDED4] shadow-md space-y-6">
                <h3 className="font-bold text-xl text-gray-900 border-b border-[#EDDED4] pb-2 text-left">1. Tus Datos de Contacto</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">Tu Nombre *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      placeholder="Ej. María González"
                      className="w-full px-4 py-3 rounded-xl border border-[#EDDED4] focus:outline-none focus:ring-2 focus:ring-[#6B21A8] bg-[#FFFDF6] text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">Tu Celular/WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder="Ej. +56994732212"
                      className="w-full px-4 py-3 rounded-xl border border-[#EDDED4] focus:outline-none focus:ring-2 focus:ring-[#6B21A8] bg-[#FFFDF6] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">Tu Correo (Opcional)</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={e => setClientEmail(e.target.value)}
                      placeholder="Ej. maria@ejemplo.com"
                      className="w-full px-4 py-3 rounded-xl border border-[#EDDED4] focus:outline-none focus:ring-2 focus:ring-[#6B21A8] bg-[#FFFDF6] text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">Fecha de tu Evento *</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={e => setEventDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#EDDED4] focus:outline-none focus:ring-2 focus:ring-[#6B21A8] bg-[#FFFDF6] text-sm"
                    />
                  </div>
                </div>

                <h3 className="font-bold text-xl text-gray-900 border-b border-[#EDDED4] pb-2 pt-4 text-left">2. Configura tu Piñata</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">Categoría / Estilo</label>
                    <select
                      value={style}
                      onChange={e => setStyle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#EDDED4] focus:outline-none focus:ring-2 focus:ring-[#6B21A8] bg-[#FFFDF6] text-sm"
                    >
                      <option value="cada-ocasion">Para cada ocasión (Nºs y siluetas) - Base $30.000</option>
                      <option value="tiernas">Tiernas (Animalitos dulces) - Base $35.000</option>
                      <option value="divertidas">Divertidas (Personajes animados) - Base $40.000</option>
                      <option value="originales">Originales (Maquinaria/Estructuras 3D) - Base $45.000</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">Tamaño Aproximado</label>
                    <select
                      value={size}
                      onChange={e => setSize(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#EDDED4] focus:outline-none focus:ring-2 focus:ring-[#6B21A8] bg-[#FFFDF6] text-sm"
                    >
                      <option value="pequena">Pequeña (~60cm) - Multiplicador x1.0</option>
                      <option value="mediana">Mediana (~80cm) - Multiplicador x1.4</option>
                      <option value="grande">Grande (~100cm) - Multiplicador x1.8</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-gray-700">Detalles Adicionales y Adornos</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedAddons.includes("glitter") ? "bg-pink-50 border-pink-200 text-pink-700" : "bg-white border-gray-200"}`}>
                      <input
                        type="checkbox"
                        checked={selectedAddons.includes("glitter")}
                        onChange={() => handleAddonChange("glitter")}
                        className="hidden"
                      />
                      <Sparkles className="w-4 h-4 text-pink-500" />
                      <div className="text-left">
                        <span className="block font-bold text-xs leading-none">Glitter / Brillo</span>
                        <span className="text-[10px] text-gray-500 font-medium">+$5.000 CLP</span>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedAddons.includes("relieve") ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white border-gray-200"}`}>
                      <input
                        type="checkbox"
                        checked={selectedAddons.includes("relieve")}
                        onChange={() => handleAddonChange("relieve")}
                        className="hidden"
                      />
                      <Maximize2 className="w-4 h-4 text-purple-500" />
                      <div className="text-left">
                        <span className="block font-bold text-xs leading-none">Relieve 3D / Capas</span>
                        <span className="text-[10px] text-gray-500 font-medium">+$8.000 CLP</span>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedAddons.includes("flecos") ? "bg-yellow-50 border-yellow-200 text-yellow-700" : "bg-white border-gray-200"}`}>
                      <input
                        type="checkbox"
                        checked={selectedAddons.includes("flecos")}
                        onChange={() => handleAddonChange("flecos")}
                        className="hidden"
                      />
                      <Palette className="w-4 h-4 text-yellow-500" />
                      <div className="text-left">
                        <span className="block font-bold text-xs leading-none">Flecos Dobles</span>
                        <span className="text-[10px] text-gray-500 font-medium">+$4.000 CLP</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-gray-700">Imagen de Referencia (Opcional)</label>
                  <div className="border-2 border-dashed border-[#EDDED4] rounded-2xl p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-7 h-7 text-gray-400 mx-auto mb-2" />
                    {referenceFile ? (
                      <span className="font-semibold text-sm text-purple-600 block">{referenceFile}</span>
                    ) : (
                      <>
                        <span className="font-semibold text-xs text-gray-500 block">Sube un dibujo o foto de referencia</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">Archivos JPG, PNG de hasta 5MB</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-gray-700">Cuéntanos tu idea o detalles especiales *</label>
                  <textarea
                    required
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    rows={3}
                    placeholder="Ej. Quiero que tenga el nombre 'Santi' escrito en el frente con letras de colores y que la cola sea muy larga con flecos fucsias."
                    className="w-full px-4 py-3 rounded-xl border border-[#EDDED4] focus:outline-none focus:ring-2 focus:ring-[#6B21A8] bg-[#FFFDF6] text-sm"
                  />
                </div>

                <Button type="submit" className="w-full bg-[#EC4899] hover:bg-pink-600 hover-lift text-white font-extrabold py-5 rounded-full text-base shadow-md">
                  Reservar con Mercado Pago (Abono del 50%)
                </Button>
              </form>
            </div>

            {/* Price Box */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
              <Card className="border-4 border-[#6B21A8] bg-white shadow-lg rounded-3xl overflow-hidden relative">
                <Bunting />
                <CardContent className="p-6 sm:p-8 space-y-6 pt-12 text-left">
                  <div className="text-center space-y-1">
                    <span className="text-xs font-bold text-pink-500 uppercase tracking-widest block">Resumen y Presupuesto</span>
                    <h3 className="text-2xl font-black text-gray-900">Cotización Estimada</h3>
                  </div>

                  <div className="space-y-3 divide-y divide-[#EDDED4]">
                    <div className="flex justify-between items-center py-2 pt-0">
                      <span className="text-gray-600 text-sm">Estilo Base ({style})</span>
                      <span className="font-bold text-gray-900">${stylePrices[style]?.toLocaleString("es-CL")} CLP</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 text-sm">Escala de Tamaño ({size})</span>
                      <span className="font-bold text-gray-900">x{sizeMultipliers[size]}</span>
                    </div>
                    {selectedAddons.length > 0 && (
                      <div className="flex justify-between items-start py-2">
                        <span className="text-gray-600 text-sm">Adicionales</span>
                        <div className="text-right space-y-0.5">
                          {selectedAddons.map(addon => (
                            <span key={addon} className="block font-bold text-xs text-gray-700">
                              {addon === "glitter" && "Glitter (+$5.000)"}
                              {addon === "relieve" && "Relieve 3D (+$8.000)"}
                              {addon === "flecos" && "Flecos (+$4.000)"}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-4">
                      <span className="text-gray-900 font-extrabold text-base">Costo Total Estimado</span>
                      <span className="text-purple-600 font-black text-xl">${estimateTotal.toLocaleString("es-CL")} CLP</span>
                    </div>
                  </div>

                  <div className="bg-pink-50/75 p-5 rounded-2xl border border-pink-100 text-center space-y-2 relative overflow-hidden">
                    <span className="text-xs font-bold text-pink-500 uppercase tracking-wider block">Abono Inicial Requerido (50%)</span>
                    <span className="text-pink-500 font-black text-2xl block">${estimateDeposit.toLocaleString("es-CL")} CLP</span>
                    <span className="text-[10px] text-gray-500 block leading-tight">El saldo restante del 50% se abona al momento de la entrega de la piñata.</span>
                  </div>

                  <div className="space-y-2 text-center text-xs text-gray-500">
                    <div className="flex items-center gap-1.5 justify-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Pago en línea 100% seguro y encriptado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informative Help Card */}
              <Card className="border border-[#EDDED4] bg-white shadow-sm rounded-3xl text-left">
                <CardContent className="p-6 space-y-4">
                  <h4 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                    <Info className="w-5 h-5 text-purple-600" />
                    Información Importante
                  </h4>
                  <ul className="space-y-2 text-xs text-[#6B5A57] list-disc list-inside">
                    <li>Los pedidos requieren un mínimo de **5 a 7 días** de anticipación para su fabricación.</li>
                    <li>Si necesitas una entrega urgente (menos de 4 días), comunícate por WhatsApp directamente.</li>
                    <li>Hacemos despachos a domicilio con costo adicional en Santiago, o puedes retirar gratis en nuestro taller.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Hosting & Domain Assist Section - COMENTADO */}
      {/* 
      <section id="hosting-info" className="py-20 relative bg-white border-b border-[#EDDED4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-3xl p-8 lg:p-12 text-white relative shadow-xl overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-1.5 bg-purple-500/50 border border-purple-400 px-3 py-1 rounded-full text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Soporte de Configuración</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold">Configuración Inicial del Dominio y Hosting</h2>
                <p className="text-purple-100 text-sm lg:text-base max-w-2xl leading-relaxed font-medium">
                  ¿Quieres lanzar tu propia tienda de piñatas u otro proyecto en internet pero no sabes cómo comprar el dominio o instalar tu hosting?
                  ¡Te asesoramos en todo el proceso! Te ayudamos a elegir el mejor registrador para dominios `.cl` o `.com` y a configurar el servidor ideal de manera rápida y sin complicaciones.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <div className="flex items-center gap-1.5 bg-purple-900/35 border border-purple-500/40 rounded-xl px-3 py-1.5 text-xs">
                    <span className="text-emerald-400 font-bold">✔</span> Compra de dominio `.cl` (NIC Chile)
                  </div>
                  <div className="flex items-center gap-1.5 bg-purple-900/35 border border-purple-500/40 rounded-xl px-3 py-1.5 text-xs">
                    <span className="text-emerald-400 font-bold">✔</span> Servidores hosting de alta velocidad
                  </div>
                  <div className="flex items-center gap-1.5 bg-purple-900/35 border border-purple-500/40 rounded-xl px-3 py-1.5 text-xs">
                    <span className="text-emerald-400 font-bold">✔</span> Cuentas de correos corporativas
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-purple-950 font-black px-8 py-7 rounded-full text-base shadow-lg hover-lift">
                  <a href="https://wa.me/56994732212?text=Hola!%20Me%20interesa%20asistencia%20en%20hosting%20y%20dominio%20para%20mi%20sitio." target="_blank" rel="noopener noreferrer">
                    Asesoría Gratuita
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Floating simulated Mercado Pago modal overlay */}
      <AnimatePresence>
        {checkoutModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden"
            >
              {/* Mercado Pago Header */}
              <div className="bg-[#009EE3] p-5 text-white flex justify-between items-center relative">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl italic tracking-tighter">mercado pago</span>
                </div>
                <button
                  onClick={() => setCheckoutModalOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/90 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Step: Form */}
              {paymentStep === "form" && (
                <div className="p-6 space-y-6">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-left">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Detalle del Pago</span>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800 text-sm">Reserva Piñata (50% Abono)</span>
                      <span className="font-black text-lg text-gray-900">${estimateDeposit.toLocaleString("es-CL")} CLP</span>
                    </div>
                  </div>

                  {/* Payment method selector */}
                  <div className="grid grid-cols-2 gap-2 border-b border-gray-100 pb-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`py-2 px-3 rounded-xl font-bold text-sm border transition-colors ${paymentMethod === "card" ? "bg-sky-50 border-[#009EE3] text-[#009EE3]" : "bg-white border-gray-200 text-gray-500"}`}
                    >
                      Tarjeta Crédito/Débito
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transfer")}
                      className={`py-2 px-3 rounded-xl font-bold text-sm border transition-colors ${paymentMethod === "transfer" ? "bg-sky-50 border-[#009EE3] text-[#009EE3]" : "bg-white border-gray-200 text-gray-500"}`}
                    >
                      Transferencia
                    </button>
                  </div>

                  {paymentMethod === "card" ? (
                    <div className="space-y-4">
                      {/* Tarjeta Visual de Referencia */}
                      <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-5 rounded-2xl text-white shadow-md relative overflow-hidden h-36 flex flex-col justify-between text-left">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-4 -translate-y-4" />
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold tracking-widest">VISA / MASTERCARD</span>
                          <span className="text-xs font-black italic">mercado pago</span>
                        </div>
                        <div className="text-center font-bold tracking-widest text-lg py-2">
                          {cardNumber ? cardNumber.replace(/(\d{4})/g, "$1 ").trim() : "•••• •••• •••• ••••"}
                        </div>
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                          <div>
                            <span className="block text-[8px] text-sky-100 leading-none">Nombre</span>
                            <span>{cardName || "Tu Nombre Aquí"}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-sky-100 leading-none">Expira</span>
                            <span>{cardExpiry || "MM/AA"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Input fields */}
                      <div className="space-y-3 text-left">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Número de la Tarjeta</label>
                          <input
                            type="text"
                            maxLength={16}
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value.replace(/\D/g, ""))}
                            placeholder="4557 0000 0000 0000"
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009EE3] text-sm bg-gray-50"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Nombre del Titular</label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={e => setCardName(e.target.value)}
                            placeholder="Ej. María González"
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009EE3] text-sm bg-gray-50"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">Vencimiento (MM/AA)</label>
                            <input
                              type="text"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={e => {
                                let val = e.target.value.replace(/\D/g, "");
                                if (val.length > 2) {
                                  val = val.slice(0, 2) + "/" + val.slice(2, 4);
                                }
                                setCardExpiry(val);
                              }}
                              placeholder="08/29"
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009EE3] text-sm bg-gray-50"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">Código CVV</label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cardCVV}
                              onChange={e => setCardCVV(e.target.value.replace(/\D/g, ""))}
                              placeholder="123"
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009EE3] text-sm bg-gray-50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 space-y-4 text-center">
                      <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 mx-auto text-lg font-bold">
                        $
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-sm text-gray-800">Transferencia Bancaria Directa</h4>
                        <p className="text-xs text-gray-500 px-4 leading-relaxed">
                          Al presionar confirmar obtendrás los datos bancarios de Rompe y Ríe para realizar la transferencia de tu reserva.
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleProcessPayment}
                    className="w-full bg-[#009EE3] hover:bg-[#008CD0] text-white font-extrabold py-5 rounded-full text-base shadow-md"
                  >
                    Pagar Abono ${estimateDeposit.toLocaleString("es-CL")} CLP
                  </Button>
                </div>
              )}

              {/* Step: Loading */}
              {paymentStep === "loading" && (
                <div className="p-12 text-center space-y-6 flex flex-col items-center justify-center">
                  <Loader2 className="w-12 h-12 text-[#009EE3] animate-spin" />
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-lg text-gray-800">Procesando pago...</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">Estamos verificando la transacción con Mercado Pago y registrando tu reserva.</p>
                  </div>
                </div>
              )}

              {/* Step: Success */}
              {paymentStep === "success" && (
                <div className="p-6 text-center space-y-6 flex flex-col items-center">
                  {/* Animación Check éxito */}
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 shadow-md">
                    <Check className="w-10 h-10 stroke-[3px]" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-black text-xl text-emerald-600">¡Pago del Abono Confirmado!</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">El pago del 50% de tu piñata ha sido procesado exitosamente por Mercado Pago.</p>
                  </div>

                  {/* Detalle del pedido */}
                  <div className="w-full bg-[#FFFDF6] border border-[#EDDED4] p-4 rounded-2xl text-left text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-500">Código de Pedido:</span>
                      <span className="font-extrabold text-purple-600 text-sm">{createdOrderCode}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-500">Monto Abonado (50%):</span>
                      <span className="font-bold text-gray-900">${estimateDeposit.toLocaleString("es-CL")} CLP</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-500">Saldo Pendiente (50%):</span>
                      <span className="font-bold text-[#EC4899]">${estimateDeposit.toLocaleString("es-CL")} CLP</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-500">Entrega Estimada:</span>
                      <span className="font-bold text-gray-900">{eventDate}</span>
                    </div>
                  </div>

                  <div className="space-y-2 w-full">
                    <Button
                      onClick={handleDownloadReceipt}
                      variant="outline"
                      className="w-full border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-full text-xs shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      Descargar Recibo en TXT
                    </Button>

                    <Button
                      asChild
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-5 rounded-full text-sm shadow-md flex items-center justify-center gap-1.5 hover-lift"
                    >
                      <a
                        href={`https://wa.me/56994732212?text=Hola%20Rompe%20y%20Rie!%20Acabo%20de%20realizar%20el%20abono%20de%20mi%20pedido%20con%20c%C3%B3digo%20${createdOrderCode}.%20Mi%20nombre%20es%20${encodeURIComponent(clientName)}%20y%20mi%20pi%C3%B1ata%20es%20estilo%20${encodeURIComponent(style)}%20de%20tama%C3%B1o%20${encodeURIComponent(size)}%20para%20el%20${eventDate}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="w-5 h-5 fill-emerald-500 stroke-white" />
                        Enviar Confirmación al WhatsApp
                      </a>
                    </Button>
                  </div>

                  <p className="text-[10px] text-gray-400 leading-tight">
                    Por favor envía la confirmación de WhatsApp para coordinar los últimos detalles y el retiro.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-[#3F2E2C] text-[#FAF5F0] py-12 relative overflow-hidden text-left">
        <Bunting />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Brand */}
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-12 h-12 bg-white rounded-full overflow-hidden border-2 border-pink-500 flex items-center justify-center">
                  <img src="/images/logo.png" alt="Rompe y Ríe" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-xl text-pink-400 leading-none">Rompe y Ríe</span>
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Piñatería</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                La mejor piñatería artesanal de Santiago. Diseños 100% personalizados y construidos a mano con amor.
              </p>
            </div>

            {/* Menu Links */}
            <div className="text-center md:text-left">
              <h4 className="font-bold text-sm text-pink-400 mb-4 uppercase tracking-widest">Secciones</h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li><a href="#gallery" className="hover:text-pink-400 transition-colors">Galería de Trabajos</a></li>
                <li><a href="#about" className="hover:text-pink-400 transition-colors">Quiénes Somos</a></li>
                <li><a href="#process" className="hover:text-pink-400 transition-colors">¿Cómo funciona?</a></li>
                <li><a href="#quote" className="hover:text-pink-400 transition-colors">Cotizar en línea</a></li>
              </ul>
            </div>

            {/* Contact details */}
            <div className="text-center md:text-left">
              <h4 className="font-bold text-sm text-pink-400 mb-4 uppercase tracking-widest">Contacto</h4>
              <ul className="space-y-2 text-xs text-gray-300 font-semibold">
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-pink-400" />
                  <span>+56994732212</span>
                </li>
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-pink-400" />
                  <span>Santiago, Chile (Retiros en Taller)</span>
                </li>
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-pink-400 text-xs">⏰</span>
                  <span>Lun a Sáb: 09:00 - 19:00 hrs</span>
                </li>
              </ul>
            </div>

            {/* Support section */}
            <div className="text-center md:text-left">
              <h4 className="font-bold text-sm text-pink-400 mb-4 uppercase tracking-widest">Asistencia Web</h4>
              <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                ¿Necesitas ayuda con hosting o configuración de dominios? Ofrecemos asesoría gratuita.
              </p>
              <a href="#hosting-info" className="inline-block text-xs font-bold text-yellow-400 hover:text-yellow-350 underline">
                Saber más sobre Hosting y Dominios
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} Rompe y Ríe Piñatería. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Widget */}
      {/* <DynamicWhatsAppChat /> */}
    </div>
  );
}
