import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  serverTimestamp, 
  orderBy 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Package, 
  Search, 
  CheckCircle, 
  Clock, 
  Palette, 
  Lock, 
  Plus, 
  Trash2, 
  X, 
  LogOut,
  Printer,
  Scissors,
  Instagram,
  Facebook, 
  MessageCircle, 
  Phone,
  ShoppingBag,
  Calculator,
  UserCheck,
  Gift,
  Image as ImageIcon,
  Tag,
  DollarSign,
  LayoutGrid,
  List,
  ShoppingCart,
  BookOpen, 
  Coins,      
  Banknote,   
  Wallet,
  ExternalLink,
  Camera, 
  Send,   
  Pencil, 
  Save    
} from 'lucide-react';

// --- 1. CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyAz6J77rTbC_3E1Jx86lhuGR1Qc01b_D2A",
  authDomain: "inperu-producciones.firebaseapp.com",
  projectId: "inperu-producciones",
  storageBucket: "inperu-producciones.firebasestorage.app",
  messagingSenderId: "449560896456",
  appId: "1:449560896456:web:04df3b5f2a742b9360d6fd"
};

// --- Inicialización ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "inperu-web"; 

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  
  // ========================================================================
  // 🟢  DATOS DE INPERU PRODUCCIONES
  // ========================================================================
  
  const LOGO_URL = "https://i.ibb.co/99Fcyfcj/LOGO-INPERU-PRODUCCIONES.png"; 
  const APP_URL = window.location.origin; 

  // NUMEROS Y REDES
  const LINKS = {
    ceci: "5492804547014",
    dani: "5492974177629", 
    facebook: "https://www.facebook.com/share/p/17rqcQJWQT/",
    instagram: "https://www.instagram.com/inperuproducciones?igsh=MXZuaG5yaHQ0Y3Z6cQ=="
  };

  // Función para generar link de WhatsApp con mensaje
  const getWaLink = (phone, text) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

  // ========================================================================

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState('home'); 
  const [adminTab, setAdminTab] = useState('orders'); 
  
  // Datos
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Buscador y Estados UI
  const [searchQuery, setSearchQuery] = useState('');
  const [foundOrders, setFoundOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Formularios Pedido
  const [newOrderId, setNewOrderId] = useState('');
  const [newOrderName, setNewOrderName] = useState('');
  const [newOrderPhone, setNewOrderPhone] = useState('');
  const [newOrderSocial, setNewOrderSocial] = useState('');
  const [newOrderDeposit, setNewOrderDeposit] = useState(''); 
  
  // Formulario Producto (Creación y Edición)
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [editingProductId, setEditingProductId] = useState(null); 

  // Cotizador
  const [orderItems, setOrderItems] = useState([]); 
  const [selectedProduct, setSelectedProduct] = useState('custom');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [customDescription, setCustomDescription] = useState('');
  
  // Inteligencia Cliente
  const [customerHistory, setCustomerHistory] = useState({ count: 0, isVip: false });
  const [adminPass, setAdminPass] = useState('');

  // Autenticación
  useEffect(() => {
    const initAuth = async () => {
        try { await signInAnonymously(auth); } catch (e) { console.error(e); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Cargar Datos
  useEffect(() => {
    if (!user) return;
    const unsubOrders = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'orders')), (s) => {
      const list = s.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(list);
    });
    const unsubProducts = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'products')), (s) => {
      const list = s.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      setProducts(list);
    });
    return () => { unsubOrders(); unsubProducts(); };
  }, [user]);

  // Autogenerar ID
  useEffect(() => {
    if (view === 'admin_panel' && !newOrderId) {
      const maxId = orders.reduce((max, o) => {
        const num = parseInt(o.orderId); return !isNaN(num) && num > max ? num : max;
      }, 99); 
      setNewOrderId((maxId + 1).toString());
    }
  }, [orders, view, newOrderId]);

  // Detector Cliente
  useEffect(() => {
    if (newOrderPhone.length > 6) {
      const past = orders.filter(o => o.phone && o.phone.includes(newOrderPhone));
      const count = past.length;
      const nextPurchaseNumber = count + 1;
      const isVipMoment = nextPurchaseNumber > 0 && nextPurchaseNumber % 5 === 0;
      setCustomerHistory({ count, isVip: isVipMoment });
      if (count > 0 && !newOrderName) {
        setNewOrderName(past[0].clientName);
        setNewOrderSocial(past[0].social || '');
        showNotification(`¡Cliente frecuente! (${count} compras)`, 'success');
      }
    } else { setCustomerHistory({ count: 0, isVip: false }); }
  }, [newOrderPhone, orders]);

  useEffect(() => {
    if (selectedProduct === 'custom') { setUnitPrice(0); } else {
      const prod = products.find(p => p.id === selectedProduct);
      if (prod) setUnitPrice(prod.price);
    }
  }, [selectedProduct, products]);

  // Cálculos
  const financials = useMemo(() => {
    let totalRevenue = 0; let totalPending = 0; 
    orders.forEach(o => {
      const balance = Math.max(0, (o.totalPrice || 0) - (o.deposit || 0));
      totalRevenue += (o.deposit || 0);
      totalPending += balance;
    });
    return { totalRevenue, totalPending };
  }, [orders]);

  // Funciones Auxiliares
  const handleAddItem = () => {
    let prodName = 'Personalizado';
    if (selectedProduct !== 'custom') {
      const p = products.find(x => x.id === selectedProduct);
      if (p) prodName = p.name;
    }
    setOrderItems([...orderItems, { id: Date.now(), name: prodName, description: customDescription, quantity, unitPrice, subtotal: quantity * unitPrice }]);
    setCustomDescription(''); setQuantity(1);
    showNotification("Item agregado");
  };

  const handleRemoveItem = (id) => setOrderItems(orderItems.filter(i => i.id !== id));
  const calculateGrandTotal = () => orderItems.reduce((acc, i) => acc + i.subtotal, 0);
  const showNotification = (msg, type = 'success') => { setNotification({ msg, type }); setTimeout(() => setNotification(null), 3000); };

  // CRUD PRODUCTOS
  const handleSaveProduct = async () => {
    if (!prodName || !prodPrice) return showNotification("Faltan datos", "error");
    const imageToUse = prodImage || 'https://via.placeholder.com/150?text=Sin+Foto';
    try {
      if (editingProductId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', editingProductId), {
          name: prodName, price: parseFloat(prodPrice), imageUrl: imageToUse, updatedAt: serverTimestamp()
        });
        showNotification("Producto actualizado");
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), {
          name: prodName, price: parseFloat(prodPrice), imageUrl: imageToUse, category: 'Papelería', createdAt: serverTimestamp()
        });
        showNotification("Producto agregado");
      }
      setProdName(''); setProdPrice(''); setProdImage(''); setEditingProductId(null);
    } catch (err) { showNotification("Error al guardar", "error"); }
  };

  const handleEditProduct = (prod) => {
    setProdName(prod.name); setProdPrice(prod.price); setProdImage(prod.imageUrl); setEditingProductId(prod.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => { setProdName(''); setProdPrice(''); setProdImage(''); setEditingProductId(null); };
  const handleDeleteProduct = async (id) => { if(window.confirm("¿Borrar producto?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id)); };

  // CRUD PEDIDOS
  const handleCreateOrder = async () => {
    if (!newOrderName || !newOrderId || orderItems.length === 0) return showNotification("Faltan datos o items", "error");
    const total = calculateGrandTotal();
    const deposit = parseFloat(newOrderDeposit) || 0;
    if (deposit > total) return showNotification("Seña mayor al total", "error");

    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), {
      clientName: newOrderName, orderId: newOrderId,
      description: orderItems.map(i => `${i.quantity} x ${i.name} ${i.description ? `(${i.description})` : ''}`).join(' + '),
      items: orderItems, totalPrice: total, deposit: deposit,
      phone: newOrderPhone, social: newOrderSocial, status: 'received', finishedImage: '', 
      createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    setNewOrderId(''); setNewOrderName(''); setNewOrderPhone(''); setNewOrderSocial(''); setNewOrderDeposit(''); setOrderItems([]); setCustomDescription(''); setQuantity(1);
    showNotification("Pedido creado");
  };

  const updateStatus = async (id, status) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id), { status, updatedAt: serverTimestamp() }); };
  const markAsPaid = async (order) => { if(window.confirm("¿Marcar como pagado?")) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id), { deposit: order.totalPrice, updatedAt: serverTimestamp() }); };
  const deleteOrder = async (id) => { if(window.confirm("¿Seguro?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id)); };
  
  const addFinishedPhoto = async (order) => {
    const url = prompt("Pega aquí el link de la foto del producto terminado:");
    if (url) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id), { finishedImage: url }); showNotification("¡Foto agregada!"); }
  };

  const sendWhatsAppMessage = (order) => {
    if (!order.phone) return showNotification("El pedido no tiene teléfono", "error");
    const statusText = statusConfig[order.status]?.label || "Actualizado";
    const message = `Hola ${order.clientName}! 👋\n\nTe escribimos de Inperu Producciones.\n\nTu pedido #${order.orderId} ha cambiado de estado a: *${statusText}*.\n\nPuedes ver el detalle y fotos aquí: ${APP_URL}\n\n¡Muchas gracias!`;
    window.open(`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPass === 'Luisana1510++') { setIsAdmin(true); setView('admin_panel'); setAdminPass(''); showNotification("¡Bienvenida!"); } 
    else { showNotification("Clave incorrecta", "error"); }
  };

  const handleSearch = (e) => {
    e.preventDefault(); setLoading(true);
    setTimeout(() => {
      const res = orders.filter(o => (o.phone?.replace(/\D/g,'').includes(searchQuery.replace(/\D/g,''))) || o.orderId.toLowerCase() === searchQuery.toLowerCase() || o.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
      if (res.length > 0) { setFoundOrders(res); setView('search_result'); } else { showNotification("No encontrado", "error"); }
      setLoading(false);
    }, 600);
  };

  const statusConfig = {
    received: { label: 'Recibido', color: 'bg-slate-100 text-slate-600', icon: Clock, progress: 10 },
    designing: { label: 'En Diseño', color: 'bg-teal-100 text-teal-700', icon: Palette, progress: 35 },
    printing: { label: 'En Producción', color: 'bg-cyan-100 text-cyan-700', icon: Printer, progress: 60 },
    assembling: { label: 'Armado/Corte', color: 'bg-yellow-100 text-yellow-700', icon: Scissors, progress: 80 },
    ready: { label: 'Listo para Retirar', color: 'bg-green-100 text-green-700', icon: CheckCircle, progress: 100 },
    delivered: { label: 'Entregado', color: 'bg-slate-800 text-white', icon: Package, progress: 100 },
  };

  // --- RENDERIZADO ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-teal-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setView('home'); setFoundOrders([]); setSearchQuery('');}}>
            <img src={LOGO_URL} alt="Logo" className="w-8 h-8 object-contain" />
            <h1 className="font-bold text-xl text-teal-800 tracking-tight">INPERU <span className="text-teal-600 font-normal">PRODUCCIONES</span></h1>
          </div>
          <button onClick={() => isAdmin ? setView('home') : setView('admin_login')} className="text-slate-400 hover:text-teal-600 transition p-2">
            {isAdmin ? <LogOut size={16}/> : <Lock size={16}/>}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {notification && (
          <div className={`fixed top-20 right-4 px-4 py-3 rounded-lg shadow-lg border-l-4 z-50 ${notification.type === 'error' ? 'bg-white border-red-500 text-red-600' : 'bg-white border-teal-500 text-teal-700'}`}>
            <p className="font-medium text-sm">{notification.msg}</p>
          </div>
        )}

        {view === 'home' && (
          <div className="flex flex-col items-center justify-center py-8 animate-in fade-in zoom-in duration-500">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-teal-50/50 p-8 text-center border border-teal-50 relative overflow-hidden">
              <div className="mb-8 relative z-10">
                <div className="w-40 h-40 mx-auto bg-white rounded-full shadow-md p-1 flex items-center justify-center border-4 border-teal-50">
                   <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain rounded-full"/>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-teal-900">Seguimiento de Pedidos</h2>
              <p className="text-slate-500 mb-8 text-sm">Ingresa tu número de teléfono para ver el estado.</p>
              <form onSubmit={handleSearch} className="relative z-10">
                <input 
                  type="text" placeholder="Tu teléfono o número de pedido"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-700 shadow-sm"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <button type="submit" disabled={loading || !searchQuery} className="w-full mt-4 bg-teal-700 hover:bg-teal-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-teal-200">
                  {loading ? 'Buscando...' : 'Consultar Estado'}
                </button>
              </form>
              
              {/* FOOTER HOME */}
              <div className="mt-12 pt-6 border-t border-slate-100">
                 <h3 className="text-xs font-bold text-teal-800 uppercase mb-4">Comunicate y hace tu pedido a INPERU PRODUCCIONES =)</h3>
                 <div className="flex justify-center gap-3 mb-6">
                    <a href={LINKS.facebook} target="_blank" rel="noreferrer" className="text-blue-600 hover:scale-110 transition"><Facebook size={24}/></a>
                    <a href={LINKS.instagram} target="_blank" rel="noreferrer" className="text-pink-600 hover:scale-110 transition"><Instagram size={24}/></a>
                 </div>
                 <div className="flex flex-col gap-3">
                    <a href={getWaLink(LINKS.ceci, "Hola Ceci! 👋 Quiero hacer un pedido.")} target="_blank" className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition">
                        <MessageCircle size={20}/> Hablar con CECI
                    </a>
                    <a href={getWaLink(LINKS.dani, "Hola Dani! 👋 Quiero hacer un pedido.")} target="_blank" className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition">
                        <MessageCircle size={20}/> Hablar con DANI
                    </a>
                 </div>
              </div>
            </div>
          </div>
        )}

        {view === 'search_result' && foundOrders.length > 0 && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 pb-12">
            <button onClick={() => setView('home')} className="mb-6 text-slate-500 hover:text-teal-700 flex items-center gap-2 text-sm font-medium transition">← Volver</button>
            
            <h2 className="text-lg font-bold text-slate-800 mb-4 px-2 flex items-center gap-2">
               <span className="w-2 h-6 bg-teal-600 rounded-full"></span> Hola, {foundOrders[0].clientName} 👋
            </h2>

            {foundOrders.map((order) => {
                const balance = Math.max(0, (order.totalPrice || 0) - (order.deposit || 0));
                return (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100 mb-8">
                  <div className="bg-slate-800 p-6 text-white flex justify-between items-start">
                    <div>
                      <p className="text-teal-400 text-xs uppercase tracking-wider font-bold mb-1">Pedido #{order.orderId}</p>
                      <h2 className="text-xl font-bold">{order.clientName}</h2>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusConfig[order.status].color.split(' ')[0]} ${statusConfig[order.status].color.split(' ')[1]}`}>
                      {statusConfig[order.status].label}
                    </div>
                  </div>

                  <div className="p-6">
                    {order.finishedImage && (
                      <div className="mb-6 rounded-xl overflow-hidden border-2 border-teal-500 shadow-lg relative group">
                        <div className="absolute top-0 left-0 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10">¡Tu Pedido Listo! ✨</div>
                        <img src={order.finishedImage} alt="Producto Terminado" className="w-full h-64 object-cover transition transform group-hover:scale-105"/>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="bg-teal-50 p-3 rounded-lg"><ShoppingBag className="text-teal-600 w-6 h-6"/></div>
                      <div className="flex-1"><p className="text-sm text-slate-500 mb-1">Detalle</p><p className="text-slate-800 font-medium text-sm">{order.description || "Sin detalle"}</p></div>
                    </div>
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
                       <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-200">
                          <div><p className="text-xs text-slate-400 mb-1">Total</p><p className="font-bold text-slate-700">${(order.totalPrice||0).toLocaleString()}</p></div>
                          <div><p className="text-xs text-slate-400 mb-1">Abonado</p><p className="font-bold text-green-600">${(order.deposit||0).toLocaleString()}</p></div>
                          <div><p className="text-xs text-slate-400 mb-1">Resta</p><p className={`font-bold ${balance > 0 ? 'text-red-500' : 'text-slate-400'}`}>${balance.toLocaleString()}</p></div>
                       </div>
                    </div>
                    {order.status !== 'delivered' && (
                      <div className="mb-6">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-1000" style={{ width: `${statusConfig[order.status].progress}%` }}></div></div>
                      </div>
                    )}
                  </div>
                </div>
             )})}

             {/* SECCION PRODUCTOS DESTACADOS */}
             <div className="mt-12 mb-12">
                <div className="flex items-center gap-4 mb-6"><div className="h-px bg-slate-200 flex-1"></div><h3 className="text-lg font-bold text-teal-900">Nuestros Productos</h3><div className="h-px bg-slate-200 flex-1"></div></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map(prod => (
                    <div key={prod.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-center group hover:border-teal-200 transition">
                       <img src={prod.imageUrl} className="w-20 h-20 object-cover rounded-lg bg-slate-50" alt={prod.name}/>
                       <div className="flex-1 min-w-0">
                         <p className="font-bold text-slate-800 text-sm truncate">{prod.name}</p>
                         <p className="text-teal-600 font-bold text-lg mb-2">${prod.price.toLocaleString()}</p>
                         <a href={getWaLink(LINKS.dani, `Hola! 👋 Quisiera consultar por este producto: ${prod.name}`)} target="_blank" className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full font-bold hover:bg-green-100 transition">
                           <MessageCircle size={14}/> Consultar
                         </a>
                       </div>
                    </div>
                  ))}
                </div>
             </div>

             {/* FOOTER CONTACTO */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-50 text-center">
                 <h3 className="text-sm font-bold text-teal-800 uppercase mb-4">Comunicate y hace tu pedido a INPERU PRODUCCIONES =)</h3>
                 <div className="flex justify-center gap-4 mb-6">
                    <a href={LINKS.facebook} target="_blank" className="text-blue-600 bg-blue-50 p-2 rounded-full hover:scale-110 transition"><Facebook size={20}/></a>
                    <a href={LINKS.instagram} target="_blank" className="text-pink-600 bg-pink-50 p-2 rounded-full hover:scale-110 transition"><Instagram size={20}/></a>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href={getWaLink(LINKS.ceci, "Hola Ceci! 👋 Quiero hacer un pedido.")} target="_blank" className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-200">
                        <MessageCircle size={20}/> Hablar con CECI
                    </a>
                    <a href={getWaLink(LINKS.dani, "Hola Dani! 👋 Quiero hacer un pedido.")} target="_blank" className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-200">
                        <MessageCircle size={20}/> Hablar con DANI
                    </a>
                 </div>
             </div>
          </div>
        )}

        {/* LOGIN ADMIN */}
        {view === 'admin_login' && (
          <div className="max-w-sm mx-auto pt-12">
             <button onClick={() => setView('home')} className="mb-6 text-slate-400 flex items-center gap-1"><X size={14}/> Cancelar</button>
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
              <h3 className="font-bold text-lg text-teal-900 mb-6">Hola Inperu Producciones</h3>
              <form onSubmit={handleAdminLogin}>
                <input type="password" placeholder="Contraseña" className="w-full p-3 border bg-white border-slate-200 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500 outline-none text-gray-900" value={adminPass} onChange={(e) => setAdminPass(e.target.value)}/>
                <button className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg hover:bg-slate-900">Ingresar</button>
              </form>
            </div>
          </div>
        )}

        {/* PANEL ADMIN */}
        {view === 'admin_panel' && isAdmin && (
           <div className="animate-in fade-in duration-300">
             <div className="flex gap-4 mb-6 border-b border-slate-200 pb-1">
               <button onClick={() => setAdminTab('orders')} className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 transition ${adminTab === 'orders' ? 'text-teal-700 border-b-2 border-teal-600' : 'text-slate-400'}`}><List size={18}/> Pedidos ({orders.length})</button>
               <button onClick={() => setAdminTab('products')} className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 transition ${adminTab === 'products' ? 'text-teal-700 border-b-2 border-teal-600' : 'text-slate-400'}`}><LayoutGrid size={18}/> Productos</button>
             </div>

             {adminTab === 'products' && (
               <div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                   <h3 className="font-bold text-teal-800 mb-4 flex items-center gap-2">{editingProductId ? <><Pencil size={18}/> Editar Producto</> : <><Plus size={18}/> Agregar Producto</>}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <input placeholder="Nombre" className="p-3 bg-white border border-gray-300 rounded-lg w-full text-gray-900 placeholder-gray-400" value={prodName} onChange={(e)=>setProdName(e.target.value)}/>
                     <input type="number" placeholder="Precio" className="p-3 bg-white border border-gray-300 rounded-lg w-full text-gray-900 placeholder-gray-400" value={prodPrice} onChange={(e)=>setProdPrice(e.target.value)}/>
                     <input placeholder="URL Imagen (Opcional)" className="p-3 bg-white border border-gray-300 rounded-lg w-full col-span-2 text-gray-900 placeholder-gray-400" value={prodImage} onChange={(e)=>setProdImage(e.target.value)}/>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={handleSaveProduct} className="bg-teal-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Save size={18}/> {editingProductId ? 'Actualizar' : 'Guardar'}</button>
                      {editingProductId && <button onClick={handleCancelEdit} className="bg-slate-200 text-slate-600 px-6 py-2 rounded-lg font-bold">Cancelar</button>}
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   {products.map(p => (
                     <div key={p.id} className="bg-white p-3 rounded-xl border shadow-sm relative group">
                        <img src={p.imageUrl} className="w-full h-24 object-cover rounded-lg mb-2"/>
                        <p className="font-bold text-gray-900">{p.name}</p>
                        <p className="text-teal-600 font-bold">${p.price.toLocaleString()}</p>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                           <button onClick={() => handleEditProduct(p)} className="bg-white p-1 rounded-full shadow text-teal-600 hover:bg-teal-50"><Pencil size={14}/></button>
                           <button onClick={() => handleDeleteProduct(p.id)} className="bg-white p-1 rounded-full shadow text-red-500 hover:bg-red-50"><Trash2 size={14}/></button>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {adminTab === 'orders' && (
               <div>
                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-teal-700 p-4 rounded-xl text-white"><p className="text-xs opacity-70 uppercase">Cobrado</p><h3 className="text-2xl font-bold">${financials.totalRevenue.toLocaleString()}</h3></div>
                    <div className="bg-white border p-4 rounded-xl"><p className="text-xs text-slate-400 uppercase">Por Cobrar</p><h3 className="text-2xl font-bold text-red-500">${financials.totalPending.toLocaleString()}</h3></div>
                 </div>

                 <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-teal-100">
                    <h3 className="font-bold text-teal-700 mb-4">Nuevo Pedido</h3>
                    {customerHistory.count > 0 && <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm font-bold">¡Cliente Frecuente! {customerHistory.count} compras previas.</div>}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                       <input value={newOrderId} readOnly className="p-3 bg-gray-100 border border-gray-300 rounded-lg text-center font-bold text-gray-900"/>
                       <input placeholder="Teléfono" value={newOrderPhone} onChange={(e)=>setNewOrderPhone(e.target.value)} className="p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400"/>
                       <input placeholder="Nombre" value={newOrderName} onChange={(e)=>setNewOrderName(e.target.value)} className="p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400"/>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
                       <div className="flex gap-2 mb-2">
                          <select className="p-2 border bg-white rounded-lg flex-1 text-gray-900 border-gray-300" value={selectedProduct} onChange={(e)=>setSelectedProduct(e.target.value)}>
                             <option value="custom">Personalizado</option>
                             {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <input type="number" className="p-2 bg-white border border-gray-300 rounded-lg w-20 text-gray-900" value={quantity} onChange={(e)=>setQuantity(parseInt(e.target.value)||1)}/>
                          <input type="number" className="p-2 bg-white border border-gray-300 rounded-lg w-24 text-gray-900" value={unitPrice} onChange={(e)=>setUnitPrice(parseInt(e.target.value)||0)}/>
                          <button onClick={handleAddItem} className="bg-teal-600 text-white p-2 rounded-lg"><Plus size={20}/></button>
                       </div>
                       <input placeholder="Detalle..." className="w-full p-2 bg-white border border-gray-300 rounded-lg mb-2 text-gray-900 placeholder-gray-400" value={customDescription} onChange={(e)=>setCustomDescription(e.target.value)}/>
                       
                       {orderItems.map(i => (
                          <div key={i.id} className="flex justify-between text-sm border-b py-1 text-gray-800">
                             <span>{i.quantity} x {i.name}</span>
                             <div className="flex gap-4"><span>${i.subtotal}</span><button onClick={()=>handleRemoveItem(i.id)} className="text-red-500">x</button></div>
                          </div>
                       ))}
                       <div className="text-right font-bold mt-2 text-lg text-gray-900">Total: ${calculateGrandTotal()}</div>
                    </div>

                    <div className="flex justify-end items-center gap-4">
                       <div className="text-right"><span className="text-xs text-slate-400">Seña:</span><input type="number" className="ml-2 p-2 border bg-white border-gray-300 rounded w-24 font-bold text-green-600" value={newOrderDeposit} onChange={(e)=>setNewOrderDeposit(e.target.value)}/></div>
                       <button onClick={handleCreateOrder} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold">Crear Pedido</button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    {orders.map(o => (
                       <div key={o.id} className="bg-white p-4 rounded-xl border shadow-sm relative">
                          <div className="absolute top-4 right-4 text-xs font-bold text-slate-400">#{o.orderId}</div>
                          <h4 className="font-bold text-lg text-gray-900">{o.clientName}</h4>
                          <p className="text-sm text-slate-500 mb-2">{o.description}</p>
                          <div className="flex flex-wrap gap-2 items-center">
                             {Object.keys(statusConfig).map(k => k !== 'delivered' && (
                                <button key={k} onClick={()=>updateStatus(o.id, k)} className={`p-2 rounded-lg ${o.status===k ? 'bg-teal-600 text-white':'bg-slate-100 text-slate-400'}`}>{statusConfig[k].label}</button>
                             ))}
                             <button onClick={()=>updateStatus(o.id, 'delivered')} className={`p-2 rounded-lg ${o.status==='delivered'?'bg-slate-800 text-white':'bg-slate-100'}`}>Entregar</button>
                             <div className="w-px h-6 bg-slate-200 mx-1"></div>
                             <button onClick={()=>addFinishedPhoto(o)} className={`p-2 rounded-lg border ${o.finishedImage ? 'bg-teal-50 text-teal-600 border-teal-200' : 'bg-white text-slate-400 border-slate-200'}`}><Camera size={18}/></button>
                             <button onClick={()=>sendWhatsAppMessage(o)} className="bg-green-50 text-green-600 border border-green-200 p-2 rounded-lg hover:bg-green-100"><Send size={18}/></button>
                             {((o.totalPrice||0) - (o.deposit||0)) > 0 && <button onClick={()=>markAsPaid(o)} className="bg-yellow-50 text-yellow-600 border border-yellow-200 p-2 rounded-lg"><Banknote size={18}/></button>}
                             <button onClick={()=>deleteOrder(o.id)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                          </div>
                       </div>
                    ))}
                 </div>
               </div>
             )}
           </div>
        )}
      </main>
    </div>
  );
}