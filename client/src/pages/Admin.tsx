import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, 
  Search, 
  ExternalLink, 
  MessageCircle, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Lock,
  ArrowRight,
  LogOut,
  Calendar,
  DollarSign,
  Tag
} from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  eventDate: string;
  style: string;
  size: string;
  addons: string | null;
  details: string | null;
  budget: string | null;
  mpOperationId: string | null;
  comprobanteUrl: string | null;
  comprobanteName: string | null;
  status: "pending_quote" | "quoted" | "pending" | "verified" | "rejected" | "completed";
  adminNotes: string | null;
  estimatedPrice: string | null;
  depositAmount: string | null;
  createdAt: string;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [depositInput, setDepositInput] = useState("");

  useEffect(() => {
    if (selectedOrder) {
      setAdminNotes(selectedOrder.adminNotes || "");
      setPriceInput(selectedOrder.estimatedPrice || "");
      setDepositInput(selectedOrder.depositAmount || "");
    } else {
      setAdminNotes("");
      setPriceInput("");
      setDepositInput("");
    }
  }, [selectedOrder]);

  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (savedToken) {
      setIsAuthenticated(true);
      fetchOrders(savedToken);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        localStorage.setItem("admin_token", data.token);
        setIsAuthenticated(true);
        fetchOrders(data.token);
      } else {
        setError(data.error || "Contraseña incorrecta");
      }
    } catch (err) {
      setError("Error al conectar con el servidor.");
    }
  };

  const fetchOrders = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error("Error al cargar órdenes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async (
    orderId: number,
    status: string,
    extraFields: { estimatedPrice?: string; depositAmount?: string; adminNotes?: string } = {}
  ) => {
    const token = localStorage.getItem("admin_token") || "";
    try {
      const notesToSend = extraFields.adminNotes !== undefined ? extraFields.adminNotes : adminNotes;
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: orderId,
          status,
          adminNotes: notesToSend,
          ...extraFields,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev =>
          prev.map(o =>
            o.id === orderId
              ? {
                  ...o,
                  status: status as any,
                  adminNotes: notesToSend || null,
                  estimatedPrice: extraFields.estimatedPrice !== undefined ? (extraFields.estimatedPrice || null) : o.estimatedPrice,
                  depositAmount: extraFields.depositAmount !== undefined ? (extraFields.depositAmount || null) : o.depositAmount,
                }
              : o
          )
        );
        setSelectedOrder(prev =>
          prev && prev.id === orderId
            ? {
                ...prev,
                status: status as any,
                adminNotes: notesToSend || null,
                estimatedPrice: extraFields.estimatedPrice !== undefined ? (extraFields.estimatedPrice || null) : prev.estimatedPrice,
                depositAmount: extraFields.depositAmount !== undefined ? (extraFields.depositAmount || null) : prev.depositAmount,
              }
            : prev
        );
        toast.success(`Pedido actualizado exitosamente.`);
      } else {
        toast.error("Error al actualizar el pedido.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión.");
    }
  };

  const handlePriceInputChange = (val: string) => {
    setPriceInput(val);
    const num = parseInt(val.replace(/\D/g, ""), 10);
    if (!isNaN(num)) {
      setDepositInput(Math.round(num * 0.5).toString());
    } else {
      setDepositInput("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    setOrders([]);
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch = 
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientPhone.includes(searchTerm) ||
      (order.mpOperationId && order.mpOperationId.includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFFDF6] flex items-center justify-center p-4 font-sans">
        <Card className="max-w-md w-full border-4 border-[#6B21A8] bg-white rounded-3xl shadow-xl overflow-hidden relative p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-[#6B21A8] shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900">Panel de Administración</h1>
            <p className="text-xs text-gray-500">Ingresa la contraseña de administrador para ver los comprobantes y pedidos.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6B21A8] text-sm text-center font-bold"
            />
            {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
            <Button type="submit" className="w-full bg-[#6B21A8] hover:bg-purple-700 text-white font-extrabold py-4 rounded-full text-sm hover-lift">
              Acceder al Panel
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF6] font-sans pb-12">
      {/* Admin Header */}
      <header className="bg-white border-b border-[#EDDED4] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-extrabold border-2 border-purple-500">
              🔑
            </div>
            <div>
              <h1 className="font-black text-xl text-gray-900 leading-tight">Admin Rompe y Ríe</h1>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Gestión de Piñatas y Pagos</span>
            </div>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold gap-1.5 rounded-full px-4 text-xs">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Order List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-[#EDDED4]">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente o N° Op..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6B21A8] bg-[#FFFDF6]"
              />
            </div>
            <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
              {[
                { st: "all", label: "Todas" },
                { st: "pending_quote", label: "Por Cotizar" },
                { st: "quoted", label: "Cotizados" },
                { st: "pending", label: "Por Verificar" },
                { st: "verified", label: "En Proceso" },
                { st: "rejected", label: "Rechazados" },
                { st: "completed", label: "Completados" }
              ].map(({ st, label }) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex-1 sm:flex-none ${
                    filterStatus === st 
                      ? "bg-[#6B21A8] text-white shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-center text-sm text-gray-400 py-12 font-bold">Cargando cotizaciones...</p>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-3xl space-y-2">
              <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="font-extrabold text-gray-500 text-sm">No se encontraron órdenes</p>
              <p className="text-xs text-gray-400">Aún no hay cotizaciones que coincidan con los filtros.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <Card 
                  key={order.id} 
                  onClick={() => {
                    setSelectedOrder(order);
                    setAdminNotes(order.adminNotes || "");
                  }}
                  className={`border transition-all cursor-pointer rounded-2xl hover:shadow-md ${
                    selectedOrder?.id === order.id ? "border-[#6B21A8] ring-2 ring-purple-100 bg-purple-50/15" : "border-[#EDDED4] bg-white"
                  }`}
                >
                  <CardContent className="p-5 flex justify-between items-start text-left">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900">{order.clientName}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">• ID #{order.id}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 font-semibold">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {order.eventDate}</span>
                        <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-gray-400" /> {order.style} ({order.size})</span>
                      </div>
                      {order.mpOperationId && (
                        <p className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-lg inline-block">
                          N° Op: {order.mpOperationId}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        order.status === "verified" ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                        order.status === "rejected" ? "bg-rose-50 border-rose-200 text-rose-600" :
                        order.status === "pending_quote" ? "bg-purple-50 border-purple-200 text-purple-600" :
                        order.status === "quoted" ? "bg-blue-50 border-blue-200 text-blue-600" :
                        order.status === "completed" ? "bg-gray-100 border-gray-300 text-gray-600" :
                        "bg-yellow-50 border-yellow-200 text-yellow-600" // pending
                      }`}>
                        {order.status === "verified" && "En Proceso"}
                        {order.status === "rejected" && "Rechazado"}
                        {order.status === "pending_quote" && "Por Cotizar"}
                        {order.status === "quoted" && "Cotizado"}
                        {order.status === "completed" && "Completado"}
                        {order.status === "pending" && "Por Verificar"}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Order Detail */}
        <div className="lg:col-span-5">
          {selectedOrder ? (
            <Card className="border border-[#EDDED4] bg-white rounded-3xl shadow-sm text-left sticky top-24 overflow-hidden">
              <div className="bg-[#6B21A8] text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg">Detalles del Pedido</h3>
                  <span className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">Orden #{selectedOrder.id}</span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20 text-white`}>
                  {selectedOrder.status === "verified" && "En Proceso"}
                  {selectedOrder.status === "rejected" && "Rechazado"}
                  {selectedOrder.status === "pending_quote" && "Por Cotizar"}
                  {selectedOrder.status === "quoted" && "Cotizado"}
                  {selectedOrder.status === "completed" && "Completado"}
                  {selectedOrder.status === "pending" && "Por Verificar"}
                </span>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Contact options */}
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl py-3 shadow-none">
                    <a href={`https://wa.me/${selectedOrder.clientPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-4 h-4 mr-1.5" />
                      Chat WhatsApp
                    </a>
                  </Button>
                  {selectedOrder.clientEmail ? (
                    <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl py-3 shadow-none">
                      <a href={`mailto:${selectedOrder.clientEmail}?subject=Tu%20pedido%20en%20Rompe%20y%20R%C3%ADe%20%23${selectedOrder.id}&body=Hola%20${encodeURIComponent(selectedOrder.clientName)}!%20Nos%20comunicamos%20de%20Rompe%20y%20R%C3%ADe%20para...`}>
                        <Mail className="w-4 h-4 mr-1.5" />
                        Enviar Correo
                      </a>
                    </Button>
                  ) : (
                    <Button disabled className="bg-gray-100 text-gray-400 text-xs font-bold rounded-xl py-3 shadow-none">
                      <Mail className="w-4 h-4 mr-1.5" />
                      Sin Correo
                    </Button>
                  )}
                </div>

                {/* Info List */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-y-3 text-xs border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-gray-400 font-bold block">Cliente</span>
                      <span className="font-extrabold text-gray-900">{selectedOrder.clientName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block">Teléfono</span>
                      <span className="font-extrabold text-gray-900">{selectedOrder.clientPhone}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block">Estilo/Categoría</span>
                      <span className="font-extrabold text-gray-900 capitalize">{selectedOrder.style}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block">Tamaño</span>
                      <span className="font-extrabold text-gray-900 capitalize">{selectedOrder.size}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block">Fecha del Evento</span>
                      <span className="font-extrabold text-gray-900">{selectedOrder.eventDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block">Presupuesto Cliente</span>
                      <span className="font-extrabold text-pink-500">{selectedOrder.budget || "No definido"}</span>
                    </div>
                    {selectedOrder.estimatedPrice && (
                      <div>
                        <span className="text-gray-400 font-bold block">Precio Cotizado</span>
                        <span className="font-extrabold text-emerald-600">
                          ${parseInt(selectedOrder.estimatedPrice, 10).toLocaleString("es-CL")} CLP
                        </span>
                      </div>
                    )}
                    {selectedOrder.depositAmount && (
                      <div>
                        <span className="text-gray-400 font-bold block">Abono Requerido</span>
                        <span className="font-extrabold text-purple-600">
                          ${parseInt(selectedOrder.depositAmount, 10).toLocaleString("es-CL")} CLP
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedOrder.addons && (
                    <div className="text-xs border-b border-gray-100 pb-4">
                      <span className="text-gray-400 font-bold block mb-1">Adicionales</span>
                      <p className="font-extrabold text-gray-900">{selectedOrder.addons}</p>
                    </div>
                  )}

                  <div className="text-xs border-b border-gray-100 pb-4">
                    <span className="text-gray-400 font-bold block mb-1">Ideas o Detalles</span>
                    <p className="text-gray-700 leading-relaxed font-semibold">{selectedOrder.details || "Sin descripción adicional"}</p>
                  </div>

                  {/* MP Operation Id */}
                  {selectedOrder.mpOperationId && (
                    <div className="bg-yellow-50/75 border border-yellow-200 rounded-xl p-3 text-xs space-y-1">
                      <span className="font-bold text-yellow-700 block">N° de Operación Mercado Pago</span>
                      <span className="font-extrabold text-gray-900 text-sm select-all">{selectedOrder.mpOperationId}</span>
                    </div>
                  )}

                  {/* Comprobante Image Upload Preview */}
                  {selectedOrder.comprobanteUrl && (
                    <div className="space-y-2 border-b border-gray-100 pb-4">
                      <span className="text-xs text-gray-400 font-bold block">Comprobante de Pago</span>
                      <div className="w-full h-40 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden relative group">
                        <img 
                          src={selectedOrder.comprobanteUrl} 
                          alt="Comprobante" 
                          className="w-full h-full object-contain"
                        />
                        <a 
                          href={selectedOrder.comprobanteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Ver pantalla completa
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Formulario de Pricing si está Por Cotizar */}
                {selectedOrder.status === "pending_quote" && (
                  <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 space-y-3 text-left">
                    <span className="font-bold text-xs text-purple-700 uppercase tracking-wider block">Calcular Cotización</span>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-gray-700">Precio Estimado (CLP) *</label>
                        <input
                          type="text"
                          placeholder="Ej: 40000"
                          value={priceInput}
                          onChange={e => handlePriceInputChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-gray-700">Abono (50%) *</label>
                        <input
                          type="text"
                          placeholder="Ej: 20000"
                          value={depositInput}
                          onChange={e => setDepositInput(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes and action buttons */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">Notas del Administrador</label>
                  <textarea
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Ej. Pago verificado en MP. Entregar con base reforzada."
                    rows={2}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6B21A8] bg-[#FFFDF6] font-semibold"
                  />
                </div>

                {/* Action buttons */}
                <div className="pt-2">
                  {selectedOrder.status === "pending_quote" && (
                    <Button 
                      onClick={() => handleUpdateOrder(selectedOrder.id, "quoted", { estimatedPrice: priceInput, depositAmount: depositInput, adminNotes })}
                      disabled={!priceInput || !depositInput}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full py-4 text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Enviar Cotización
                    </Button>
                  )}

                  {selectedOrder.status === "pending" && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={() => handleUpdateOrder(selectedOrder.id, "rejected", { adminNotes })}
                        variant="outline" 
                        className="border-rose-200 hover:bg-rose-50 text-rose-600 font-bold rounded-full py-4 text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        Rechazar Pago
                      </Button>
                      <Button 
                        onClick={() => handleUpdateOrder(selectedOrder.id, "verified", { adminNotes })}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full py-4 text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Verificar Pago
                      </Button>
                    </div>
                  )}

                  {selectedOrder.status === "verified" && (
                    <Button 
                      onClick={() => handleUpdateOrder(selectedOrder.id, "completed", { adminNotes })}
                      className="w-full bg-[#6B21A8] hover:bg-purple-700 text-white font-bold rounded-full py-4 text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Marcar como Completado
                    </Button>
                  )}

                  {selectedOrder.status === "quoted" && (
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 text-center font-bold">
                        Cotización enviada. Esperando abono del cliente.
                      </div>
                      <Button 
                        onClick={() => handleUpdateOrder(selectedOrder.id, "quoted", { estimatedPrice: priceInput, depositAmount: depositInput, adminNotes })}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full py-4 text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Guardar Notas / Cambios
                      </Button>
                    </div>
                  )}

                  {selectedOrder.status === "rejected" && (
                    <div className="space-y-3">
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-700 text-center font-bold">
                        Abono rechazado. Esperando nuevo comprobante del cliente.
                      </div>
                      <Button 
                        onClick={() => handleUpdateOrder(selectedOrder.id, "rejected", { adminNotes })}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full py-4 text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Guardar Notas
                      </Button>
                    </div>
                  )}

                  {selectedOrder.status === "completed" && (
                    <div className="space-y-3">
                      <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 text-xs text-gray-700 text-center font-bold">
                        Pedido terminado y entregado.
                      </div>
                      <Button 
                        onClick={() => handleUpdateOrder(selectedOrder.id, "completed", { adminNotes })}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full py-4 text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Guardar Notas
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center h-[450px] bg-white border border-[#EDDED4] rounded-3xl text-center p-8 space-y-3">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-[#6B21A8]">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-sm">Selecciona una orden</h4>
                <p className="text-xs text-gray-400">Haz clic sobre cualquier pedido de la lista para ver sus detalles completos y comprobar el pago.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
