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
  onAuthStateChanged, 
  signInWithCustomToken 
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
  QrCode, 
  BookOpen, 
  Waves,
  Coins,      
  Banknote,   
  Wallet      
} from 'lucide-react';

// --- Configuración de Firebase (TUS DATOS REALES) ---
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

// --- Componente Principal ---
export default function App() {
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

  // Formulario Nuevo Pedido
  const [newOrderId, setNewOrderId] = useState('');
  const [newOrderName, setNewOrderName] = useState('');
  const [newOrderPhone, setNewOrderPhone] = useState('');
  const [newOrderSocial, setNewOrderSocial] = useState('');
  const [newOrderDeposit, setNewOrderDeposit] = useState(''); 
  
  // Formulario Nuevo Producto
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodCategory, setProdCategory] = useState('Papelería');

  // --- COTIZADOR / CARRITO ---
  const [orderItems, setOrderItems] = useState([]); 
  const [selectedProduct, setSelectedProduct] = useState('custom');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [customDescription, setCustomDescription] = useState('');
  
  // Inteligencia Cliente
  const [customerHistory, setCustomerHistory] = useState({ count: 0, isVip: false });
  const [adminPass, setAdminPass] = useState('');

  // --- 1. Autenticación ---
  useEffect(() => {
    const initAuth = async () => {
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error("Error de autenticación:", error);
        }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // --- 2. Cargar Datos ---
  useEffect(() => {
    if (!user) return;

    const qOrders = query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(list);
    }, (error) => console.error("Error loading orders:", error));

    const qProducts = query(collection(db, 'artifacts', appId, 'public', 'data', 'products'));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      setProducts(list);
    }, (error) => console.error("Error loading products:", error));

    return () => { unsubOrders(); unsubProducts(); };
  }, [user]);

  // --- 3. Lógica de Negocio ---

  // Autogenerar ID 
  useEffect(() => {
    if (view === 'admin_panel' && !newOrderId) {
      const maxId = orders.reduce((max, o) => {
        const num = parseInt(o.orderId);
        return !isNaN(num) && num > max ? num : max;
      }, 99); 
      setNewOrderId((maxId + 1).toString());
    }
  }, [orders, view, newOrderId]);

  // Detector Cliente
  useEffect(() => {
    if (newOrderPhone.length > 6) {
      const pastOrders = orders.filter(o => o.phone && o.phone.includes(newOrderPhone));
      const count = pastOrders.length;
      const nextPurchaseNumber = count + 1;
      const isVipMoment = nextPurchaseNumber > 0 && nextPurchaseNumber % 5 === 0;
      
      setCustomerHistory({ count, lastOrder: pastOrders[0], isVip: isVipMoment, nextPurchaseNumber });
      
      if (count > 0 && !newOrderName && pastOrders[0].clientName) {
        setNewOrderName(pastOrders[0].clientName);
        setNewOrderSocial(pastOrders[0].social || '');
        showNotification(`¡Hola de nuevo a ${pastOrders[0].clientName}!`, 'success');
      }
    } else {
      setCustomerHistory({ count: 0, isVip: false });
    }
  }, [newOrderPhone, orders]);

  useEffect(() => {
    if (selectedProduct === 'custom') {
      setUnitPrice(0);
    } else {
      const prod = products.find(p => p.id === selectedProduct);
      if (prod) setUnitPrice(prod.price);
    }
  }, [selectedProduct, products]);

  // Cálculos Financieros
  const financials = useMemo(() => {
    let totalRevenue = 0; 
    let totalPending = 0; 
    
    orders.forEach(o => {
      const total = o.totalPrice || 0;
      const deposit = o.deposit || 0;
      const balance = Math.max(0, total - deposit);
      
      totalRevenue += deposit;
      totalPending += balance;
    });

    return { totalRevenue, totalPending };
  }, [orders]);

  // --- FUNCIONES ---

  const handleAddItem = () => {
    let prodName = 'Personalizado';
    if (selectedProduct !== 'custom') {
      const p = products.find(x => x.id === selectedProduct);
      if (p) prodName = p.name;
    }

    const newItem = {
      id: Date.now(),
      name: prodName,
      description: customDescription,
      quantity: quantity,
      unitPrice: unitPrice,
      subtotal: quantity * unitPrice
    };

    setOrderItems([...orderItems, newItem]);
    setCustomDescription('');
    setQuantity(1);
    showNotification("Item agregado");
  };

  const handleRemoveItem = (itemId) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  const calculateGrandTotal = () => {
    return orderItems.reduce((acc, item) => acc + item.subtotal, 0);
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!prodName || !prodPrice) {
      showNotification("Faltan datos", "error");
      return;
    }
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), {
        name: prodName,
        price: parseFloat(prodPrice),
        imageUrl: prodImage || 'https://images.unsplash.com/photo-1530669244764-0907e99a7450?auto=format&fit=crop&q=80&w=200',
        category: prodCategory,
        createdAt: serverTimestamp()
      });
      setProdName('');
      setProdPrice('');
      setProdImage('');
      showNotification("Producto agregado");
    } catch (err) { showNotification("Error", "error"); }
  };

  const handleDeleteProduct = async (id) => {
    if(!window.confirm("¿Borrar?")) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id));
      showNotification("Eliminado");
    } catch(err) { showNotification("Error", "error"); }
  }

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newOrderName || !newOrderId) {
      showNotification("Falta Nombre o Número", "error");
      return;
    }
    
    if (orderItems.length === 0) {
      showNotification("¡Agrega al menos un producto!", "error");
      return;
    }
    
    const finalDescription = orderItems.map(item => 
      `${item.quantity} x ${item.name} ${item.description ? `(${item.description})` : ''}`
    ).join(' + '); 

    const total = calculateGrandTotal();
    const deposit = parseFloat(newOrderDeposit) || 0;

    if (deposit > total) {
        showNotification("La seña no puede ser mayor al total", "error");
        return;
    }

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), {
        clientName: newOrderName,
        orderId: newOrderId,
        description: finalDescription,
        items: orderItems,
        totalPrice: total,
        deposit: deposit, 
        phone: newOrderPhone,
        social: newOrderSocial,
        status: 'received',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setNewOrderId(''); 
      setNewOrderName('');
      setNewOrderPhone('');
      setNewOrderSocial('');
      setNewOrderDeposit(''); 
      setOrderItems([]); 
      setCustomDescription('');
      setQuantity(1);
      setCustomerHistory({ count: 0, isVip: false });
      showNotification("Pedido cargado exitosamente");
    } catch (err) {
      showNotification("Error al guardar", "error");
    }
  };

  const updateStatus = async (docId, newStatus) => {
    try {
      const ref = doc(db, 'artifacts', appId, 'public', 'data', 'orders', docId);
      await updateDoc(ref, { status: newStatus, updatedAt: serverTimestamp() });
      showNotification("Estado actualizado");
    } catch (err) { showNotification("Error", "error"); }
  };

  const markAsPaid = async (order) => {
    if(!window.confirm(`¿Marcar como pagado?`)) return;
    try {
       const ref = doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id);
       await updateDoc(ref, { 
           deposit: order.totalPrice, 
           updatedAt: serverTimestamp() 
       });
       showNotification("¡Pedido Saldado!");
    } catch (err) { showNotification("Error al actualizar pago", "error"); }
  };

  const deleteOrder = async (docId) => {
    if (!window.confirm("¿Seguro?")) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', docId));
      showNotification("Eliminado");
    } catch (err) { showNotification("Error", "error"); }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    // --- CAMBIO DE CLAVE AQUI 👇 ---
    if (adminPass === 'Luisana1510++') {
      setIsAdmin(true);
      setView('admin_panel');
      setAdminPass('');
      showNotification("¡Hola Dani!");
    } else {
      showNotification("Contraseña incorrecta", "error");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const results = orders.filter(o => 
        (o.phone && o.phone.replace(/\D/g,'').includes(searchQuery.replace(/\D/g,''))) || 
        o.orderId.toLowerCase() === searchQuery.toLowerCase() || 
        o.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (results.length > 0) {
        setFoundOrders(results); 
        setView('search_result');
      } else {
        showNotification("No encontrado.", "error");
      }
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-teal-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setView('home'); setFoundOrders([]); setSearchQuery('');}}>
            <div className="bg-teal-700 p-1.5 rounded-lg text-white">
               <BookOpen size={20} />
            </div>
            <h1 className="font-bold text-xl text-teal-800 tracking-tight">INPERU <span className="text-teal-600 font-normal">PRODUCCIONES</span></h1>
          </div>
          <div>
            {isAdmin ? (
              <button onClick={() => {setIsAdmin(false); setView('home');}} className="text-xs flex items-center gap-1 text-red-500 font-medium hover:bg-red-50 p-2 rounded transition">
                <LogOut size={14}/> Salir
              </button>
            ) : (
              <button onClick={() => setView('admin_login')} className="text-slate-400 hover:text-teal-600 transition p-2">
                <Lock size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {notification && (
          <div className={`fixed top-20 right-4 px-4 py-3 rounded-lg shadow-lg border-l-4 z-50 animate-in fade-in slide-in-from-right-5 duration-300 ${notification.type === 'error' ? 'bg-white border-red-500 text-red-600' : 'bg-white border-teal-500 text-teal-700'}`}>
            <p className="font-medium text-sm">{notification.msg}</p>
          </div>
        )}

        {view === 'home' && (
          <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in duration-500">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-teal-50/50 p-8 text-center border border-teal-50">
              
              {/* LOGO */}
              <div className="inline-flex flex-col items-center justify-center w-24 h-24 bg-teal-700 rounded-full mb-6 shadow-lg relative overflow-hidden">
                <div className="flex items-center gap-1 text-white mb-1 z-10">
                   <BookOpen size={28} strokeWidth={2.5}/>
                   <QrCode size={24} strokeWidth={2.5}/>
                </div>
                <Waves className="text-white/30 absolute -bottom-2 w-full h-12" strokeWidth={3}/>
                <Waves className="text-white absolute bottom-1 w-full h-12" strokeWidth={3}/>
              </div>

              <h2 className="text-2xl font-bold mb-2 text-teal-900">Seguimiento de Pedidos</h2>
              <p className="text-slate-500 mb-8 text-sm">Ingresa tu número de teléfono para ver el estado de tus productos.</p>
              
              <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text" 
                  placeholder="Tu teléfono o número de pedido"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-slate-700 placeholder-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <button 
                  type="submit" 
                  disabled={loading || !searchQuery}
                  className="w-full mt-4 bg-teal-700 hover:bg-teal-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-teal-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Buscando...' : 'Consultar Estado'}
                </button>
              </form>
            </div>
          </div>
        )}

        {view === 'search_result' && foundOrders.length > 0 && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 pb-12">
            <button onClick={() => setView('home')} className="mb-6 text-slate-500 hover:text-teal-700 flex items-center gap-2 text-sm font-medium transition">
              ← Volver a buscar
            </button>
            
            <h2 className="text-lg font-bold text-slate-800 mb-4 px-2 flex items-center gap-2">
               <span className="w-2 h-6 bg-teal-600 rounded-full"></span>
               Hola, {foundOrders[0].clientName} 👋
               <span className="block text-xs text-slate-400 font-normal ml-auto">Historial: {foundOrders.length} pedidos</span>
            </h2>

            {foundOrders.map((foundOrder) => {
                const total = foundOrder.totalPrice || 0;
                const paid = foundOrder.deposit || 0;
                const balance = Math.max(0, total - paid);
                
                return (
                <div key={foundOrder.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100 mb-8">
                  <div className="bg-slate-800 p-6 text-white flex justify-between items-start relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="z-10">
                      <p className="text-teal-400 text-xs uppercase tracking-wider font-bold mb-1">Pedido #{foundOrder.orderId}</p>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        {foundOrder.clientName}
                      </h2>
                      {foundOrder.social && (
                          <div className="mt-1 inline-flex items-center gap-1 text-xs text-teal-200 bg-white/10 px-2 py-0.5 rounded-full">
                            <Instagram size={10}/> {foundOrder.social}
                          </div>
                        )}
                    </div>
                    <div className={`z-10 px-3 py-1 rounded-full text-xs font-bold uppercase ${statusConfig[foundOrder.status].color.split(' ')[0]} ${statusConfig[foundOrder.status].color.split(' ')[1]}`}>
                      {statusConfig[foundOrder.status].label}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="bg-teal-50 p-3 rounded-lg">
                        <ShoppingBag className="text-teal-600 w-6 h-6"/>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 mb-1">Detalle del trabajo</p>
                        <p className="text-slate-800 font-medium text-sm leading-relaxed">
                          {foundOrder.description ? foundOrder.description.split(' + ').map((line, i) => (
                            <span key={i} className="block border-b last:border-0 border-slate-100 py-1">{line}</span>
                          )) : "Sin detalle"}
                        </p>
                      </div>
                    </div>

                    {/* --- ESTADO DE CUENTA PARA EL CLIENTE --- */}
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
                       <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Coins size={14}/> Estado de Cuenta</h4>
                       <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-200">
                          <div>
                             <p className="text-xs text-slate-400 mb-1">Total</p>
                             <p className="font-bold text-slate-700">${total.toLocaleString()}</p>
                          </div>
                          <div>
                             <p className="text-xs text-slate-400 mb-1">Abonado</p>
                             <p className="font-bold text-green-600">${paid.toLocaleString()}</p>
                          </div>
                          <div>
                             <p className="text-xs text-slate-400 mb-1">Resta</p>
                             <p className={`font-bold ${balance > 0 ? 'text-red-500' : 'text-slate-400'}`}>${balance.toLocaleString()}</p>
                          </div>
                       </div>
                       {balance > 0 && (
                         <div className="mt-3 text-center">
                           <span className="inline-block bg-red-50 text-red-600 text-xs px-2 py-1 rounded-md font-medium border border-red-100">Saldo pendiente de pago</span>
                         </div>
                       )}
                    </div>

                    {foundOrder.status !== 'delivered' && (
                      <div className="mb-8">
                        <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                          <span>Recibido</span>
                          <span>Producción</span>
                          <span>Listo</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-1000 ease-out rounded-full"
                            style={{ width: `${statusConfig[foundOrder.status].progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-teal-50/50 rounded-lg border border-teal-100/50">
                       {React.createElement(statusConfig[foundOrder.status].icon, { className: "text-teal-600", size: 20 })}
                       <div>
                         <p className="font-bold text-sm text-teal-900">{statusConfig[foundOrder.status].label}</p>
                         <p className="text-xs text-teal-600/70">Estado actual del pedido</p>
                       </div>
                    </div>
                  </div>
                </div>
             )})}

            <div className="text-center mt-12">
              <h3 className="text-xl font-bold text-teal-900 mb-2">Otros productos que realizamos</h3>
              <div className="w-12 h-1 bg-teal-500 mx-auto rounded-full mb-6"></div>
              
              <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                {products.slice(0, 4).map(prod => (
                  <div key={prod.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 hover:border-teal-300 transition group">
                    <div className="h-24 bg-slate-100 rounded-lg mb-3 overflow-hidden relative">
                      <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    </div>
                    <p className="font-bold text-sm text-slate-700 leading-tight mb-1">{prod.name}</p>
                    <p className="text-xs font-bold text-teal-600">${prod.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-teal-200 hover:scale-105 transition transform">
                <Instagram size={20} /> Ver más en Instagram
              </a>
            </div>
          </div>
        )}

        {view === 'admin_login' && (
          <div className="max-w-sm mx-auto pt-12">
             <button onClick={() => setView('home')} className="mb-6 text-slate-400 flex items-center gap-1"><X size={14}/> Cancelar</button>
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
              <h3 className="font-bold text-lg text-teal-900 text-center mb-6">Hola Inperu Producciones, ingresa tu clave</h3>
              <form onSubmit={handleAdminLogin}>
                <input type="password" placeholder="Contraseña" className="w-full p-3 border border-slate-200 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500 outline-none" value={adminPass} onChange={(e) => setAdminPass(e.target.value)}/>
                <button className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg hover:bg-slate-900">Ingresar</button>
              </form>
            </div>
          </div>
        )}

        {view === 'admin_panel' && isAdmin && (
          <div className="animate-in fade-in duration-300">
            
            <div className="flex gap-4 mb-6 border-b border-slate-200 pb-1">
              <button 
                onClick={() => setAdminTab('orders')} 
                className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 transition ${adminTab === 'orders' ? 'text-teal-700 border-b-2 border-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={18}/> Pedidos ({orders.length})
              </button>
              <button 
                onClick={() => setAdminTab('products')} 
                className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 transition ${adminTab === 'products' ? 'text-teal-700 border-b-2 border-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={18}/> Mis Productos ({products.length})
              </button>
            </div>

            {adminTab === 'products' && (
              <div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                  <h3 className="font-bold text-teal-800 mb-4 flex items-center gap-2"><Plus size={18} className="text-teal-500"/> Agregar Nuevo Producto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input 
                      placeholder="Nombre del producto (ej: Tarjetas Personales)" 
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-400"
                      value={prodName} onChange={(e) => setProdName(e.target.value)}
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                      <input 
                        type="number" placeholder="Precio Unitario" 
                        className="w-full pl-6 p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-400"
                        value={prodPrice} onChange={(e) => setProdPrice(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 relative">
                      <ImageIcon className="absolute left-3 top-3 text-slate-400 w-4 h-4"/>
                      <input 
                        placeholder="URL de la imagen (Copia link de imagen de Google/Insta)" 
                        className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-400 text-sm"
                        value={prodImage} onChange={(e) => setProdImage(e.target.value)}
                      />
                      <p className="text-[10px] text-slate-400 mt-1 ml-1">Tip: Haz click derecho en una foto tuya en web, selecciona "Copiar dirección de imagen" y pégalo aquí.</p>
                    </div>
                  </div>
                  <button onClick={handleCreateProduct} className="bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-teal-800 transition">Guardar Producto</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map(prod => (
                    <div key={prod.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-4 items-center hover:border-teal-200 transition">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                         <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover"/>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800">{prod.name}</h4>
                        <p className="text-sm text-teal-600 font-bold">${prod.price.toLocaleString()}</p>
                      </div>
                      <button onClick={() => handleDeleteProduct(prod.id)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                    </div>
                  ))}
                  {products.length === 0 && <p className="text-slate-400 text-center col-span-2 py-8">Aún no has cargado productos.</p>}
                </div>
              </div>
            )}

            {adminTab === 'orders' && (
              <div>
                 {/* --- DASHBOARD FINANCIERO --- */}
                 <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-4 rounded-xl text-white shadow-md flex items-center justify-between">
                      <div>
                        <p className="text-teal-200 text-xs font-bold uppercase mb-1">Cobrado (Caja)</p>
                        <h3 className="text-2xl font-bold">${financials.totalRevenue.toLocaleString()}</h3>
                      </div>
                      <div className="bg-white/20 p-2 rounded-lg"><Wallet size={24}/></div>
                   </div>
                   <div className="bg-white border border-red-100 p-4 rounded-xl shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">Por Cobrar (Calle)</p>
                        <h3 className="text-2xl font-bold text-red-500">${financials.totalPending.toLocaleString()}</h3>
                      </div>
                      <div className="bg-red-50 p-2 rounded-lg text-red-500"><Banknote size={24}/></div>
                   </div>
                 </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-teal-100 mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Nuevo Ingreso</div>
                  
                  {/* Formulario Clientes... */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nº</label>
                      <input className="w-full p-3 bg-slate-100 border-none rounded-lg font-bold text-slate-700 text-center" value={newOrderId} readOnly/>
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                      <input placeholder="Buscar..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-400" value={newOrderPhone} onChange={(e) => setNewOrderPhone(e.target.value)}/>
                    </div>
                    <div className="md:col-span-6">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                      <input placeholder="Cliente" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-400" value={newOrderName} onChange={(e) => setNewOrderName(e.target.value)}/>
                    </div>
                  </div>

                  {/* --- CARRITO DE COMPRAS --- */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                      <ShoppingCart size={14}/> Armar Pedido
                    </label>
                    
                    {/* Inputs de Producto */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pb-4 border-b border-slate-200">
                      <div className="md:col-span-4">
                        <label className="text-xs text-slate-400 mb-1 block">Producto</label>
                        <select 
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-teal-400 text-sm"
                          value={selectedProduct}
                          onChange={(e) => setSelectedProduct(e.target.value)}
                        >
                          <option value="custom">Personalizado / Otro</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="text-xs text-slate-400 mb-1 block">Cant.</label>
                        <input type="number" min="1" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-center text-sm" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}/>
                      </div>

                      <div className="md:col-span-3">
                        <label className="text-xs text-slate-400 mb-1 block">Precio Unit.</label>
                        <div className="relative">
                            <span className="absolute left-2 top-2.5 text-slate-400 text-xs">$</span>
                            <input type="number" className="w-full pl-6 p-2.5 bg-white border border-slate-200 rounded-lg text-sm" value={unitPrice} onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)}/>
                        </div>
                      </div>

                      <div className="md:col-span-3 flex items-center gap-2">
                         <button onClick={handleAddItem} className="w-full p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition flex items-center justify-center gap-1 text-xs shadow-sm">
                           <Plus size={14}/> Agregar
                         </button>
                      </div>
                      
                      <div className="md:col-span-12">
                         <input placeholder="Detalle (ej: color rojo, papel mate...)" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-teal-400 text-xs" value={customDescription} onChange={(e) => setCustomDescription(e.target.value)}/>
                      </div>
                    </div>

                    {/* Lista de Items */}
                    <div className="mt-4 space-y-2">
                       {orderItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 text-sm">
                              <div className="flex-1">
                                <span className="font-bold text-slate-700">{item.quantity} x {item.name}</span>
                                <span className="text-xs text-slate-500 ml-2">{item.description}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-medium text-slate-600">${item.subtotal.toLocaleString()}</span>
                                <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                              </div>
                            </div>
                        ))}
                    </div>

                    {/* --- INPUT DE SEÑA Y TOTALES --- */}
                    <div className="mt-4 pt-4 border-t border-slate-300 flex items-end justify-end gap-4">
                       <div className="text-right">
                         <label className="block text-xs font-bold text-slate-500 mb-1">Seña / Adelanto</label>
                         <div className="relative w-32 ml-auto">
                           <span className="absolute left-2 top-2 text-slate-400 text-sm">$</span>
                           <input 
                              type="number" 
                              className="w-full pl-5 p-2 bg-white border border-slate-300 rounded-lg text-right font-bold text-green-600 focus:border-green-500 outline-none"
                              placeholder="0"
                              value={newOrderDeposit}
                              onChange={(e) => setNewOrderDeposit(e.target.value)}
                           />
                         </div>
                       </div>
                       
                       <div className="text-right">
                          <p className="text-xs text-slate-500 mb-1">Total Pedido</p>
                          <p className="text-xl font-bold text-teal-800">${calculateGrandTotal().toLocaleString()}</p>
                       </div>
                    </div>
                    
                    <div className="text-right mt-1">
                       <p className="text-xs font-bold text-slate-400">
                          Resta pagar: <span className="text-red-500">${(calculateGrandTotal() - (parseFloat(newOrderDeposit)||0)).toLocaleString()}</span>
                       </p>
                    </div>

                  </div>

                  <div className="flex justify-end">
                    <button onClick={handleCreateOrder} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition shadow-lg flex items-center gap-2">
                      <CheckCircle size={18}/> Confirmar Pedido
                    </button>
                  </div>
                </div>

                {/* LISTA PEDIDOS */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-600 text-sm uppercase tracking-wide">Pedidos Activos ({orders.length})</h3>
                  {orders.map(order => {
                      const total = order.totalPrice || 0;
                      const paid = order.deposit || 0;
                      const balance = Math.max(0, total - paid);

                      return (
                      <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-4 justify-between group hover:border-teal-200 transition relative">
                        {/* BADGE DE SALDO */}
                        <div className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-bold border ${balance > 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                          {balance > 0 ? `Debe: $${balance.toLocaleString()}` : 'Pagado'}
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pr-24">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded">#{order.orderId}</span>
                              <span className="font-bold text-slate-800 text-lg">{order.clientName}</span>
                              {order.social && <span className="text-xs text-teal-600 flex items-center gap-0.5"><Instagram size={10}/>{order.social}</span>}
                            </div>
                            <div className="text-sm text-slate-500">
                                {order.description && order.description.split(' + ').map((line, i) => (
                                  <div key={i}>{line}</div>
                                ))}
                            </div>
                            {order.phone && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Phone size={10}/> {order.phone}</p>}
                          </div>
                        </div>
                        
                        {/* Botonera de Estado + SALDAR */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 border-t border-slate-50">
                          {balance > 0 && (
                             <button 
                               onClick={() => markAsPaid(order)} 
                               title="Saldar Deuda (Marcar todo pagado)"
                               className="bg-green-50 text-green-600 hover:bg-green-100 p-2 rounded-lg mr-2 border border-green-200"
                             >
                               <Banknote size={16}/>
                             </button>
                          )}

                          {Object.keys(statusConfig).map(key => {
                            if (key === 'delivered') return null;
                            return (
                              <button key={key} onClick={() => updateStatus(order.id, key)} title={statusConfig[key].label} className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1 min-w-[40px] md:min-w-[80px] ${order.status === key ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                                {React.createElement(statusConfig[key].icon, { size: 12 })}
                              </button>
                            )
                          })}
                          <button onClick={() => updateStatus(order.id, 'delivered')} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 min-w-[80px] justify-center ${order.status === 'delivered' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Entregar</button>
                          
                          <div className="w-px h-6 bg-slate-200 mx-1"></div>
                          <button onClick={() => deleteOrder(order.id)} className="text-slate-300 hover:text-red-500 p-2 transition"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    )})}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}