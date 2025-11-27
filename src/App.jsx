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
  serverTimestamp 
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
  Gift,
  Image as ImageIcon,
  DollarSign,
  LayoutGrid,
  List,
  ShoppingCart,
  BookOpen, 
  Banknote,   
  Camera, 
  Send,   
  Pencil, 
  Save,
  Images,
  Minus,
  Settings2,
  ArrowRight,
  Eye // Nuevo icono para ver detalles
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "inperu-web"; 

// --- COMPONENTES AUXILIARES ---

// Modal de Detalle de Producto (Ficha Técnica)
const ProductDetailModal = ({ prod, onClose, onAddToCart }) => {
  const [currentImg, setCurrentImg] = useState(prod.imageUrl);
  const images = prod.imageUrls && prod.imageUrls.length > 0 ? prod.imageUrls : [prod.imageUrl];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-20 bg-white/80 p-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-red-500 transition shadow-sm"
        >
          <X size={24}/>
        </button>

        {/* Columna Izquierda: Galería */}
        <div className="w-full md:w-1/2 bg-slate-50 p-4 flex flex-col justify-center relative">
           <div className="aspect-square w-full rounded-xl overflow-hidden bg-white shadow-sm mb-4 relative group">
              <img src={currentImg} alt={prod.name} className="w-full h-full object-contain mix-blend-multiply"/>
           </div>
           {/* Miniaturas */}
           {images.length > 1 && (
             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar justify-center">
               {images.map((img, idx) => (
                 <button 
                   key={idx} 
                   onClick={() => setCurrentImg(img)} 
                   className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${currentImg === img ? 'border-teal-500 ring-2 ring-teal-100' : 'border-slate-200 hover:border-teal-300'}`}
                 >
                   <img src={img} className="w-full h-full object-cover"/>
                 </button>
               ))}
             </div>
           )}
        </div>

        {/* Columna Derecha: Info */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto bg-white">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 leading-tight">{prod.name}</h2>
              <p className="text-3xl font-bold text-teal-600 mb-6">${prod.price.toLocaleString()}</p>
              
              <div className="prose prose-slate text-slate-600 mb-8 text-sm md:text-base leading-relaxed">
                <h4 className="font-bold text-slate-800 mb-2 uppercase text-xs tracking-wider">Descripción del producto</h4>
                <p className="whitespace-pre-line">{prod.description || "Sin descripción detallada disponible para este producto."}</p>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100">
              <button 
                onClick={() => onAddToCart(prod)}
                className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-teal-200 hover:bg-teal-700 transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
              >
                <Plus size={24}/> Agregar al Pedido
              </button>
              <p className="text-center text-xs text-slate-400 mt-3">
                Personaliza los detalles en el siguiente paso
              </p>
            </div>
        </div>
      </div>
    </div>
  );
};

// Tarjeta de Producto Pública (Catálogo)
const ProductCardPublic = ({ prod, onAddToCart, onViewDetails }) => {
  const [currentImg, setCurrentImg] = useState(prod.imageUrl);

  useEffect(() => { setCurrentImg(prod.imageUrl); }, [prod]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition flex flex-col h-full relative">
      
      {/* Área de Imagen Clickable para ver detalles */}
      <div className="p-3 pb-0 relative cursor-pointer" onClick={() => onViewDetails(prod)}>
         <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50">
            <img src={currentImg} alt={prod.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-105"/>
            {/* Overlay Ver Detalles */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
               <div className="bg-white/90 text-slate-800 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm backdrop-blur-sm">
                 <Eye size={14}/> Ver Detalle
               </div>
            </div>
         </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
         <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 cursor-pointer hover:text-teal-600 transition" onClick={() => onViewDetails(prod)}>
            {prod.name}
         </h4>
         {prod.description && ( 
           <p className="text-xs text-slate-500 mb-3 line-clamp-2 flex-1">{prod.description}</p> 
         )}
         <div className="flex items-center justify-between mt-auto pt-2">
            <span className="text-lg font-bold text-teal-600">${prod.price.toLocaleString()}</span>
            {/* Botón rápido de agregar (opcional, o puedes hacer que abra el detalle también) */}
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Para que no abra el detalle si tocan el botón directo
                onAddToCart(prod);
              }} 
              className="bg-teal-50 text-teal-700 p-2 rounded-lg hover:bg-teal-600 hover:text-white transition border border-teal-100"
              title="Agregar rápido"
            >
              <Plus size={20}/>
            </button>
         </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  
  // CONSTANTES
  const LOGO_URL = "https://i.ibb.co/99Fcyfcj/LOGO-INPERU-PRODUCCIONES.png"; 
  const APP_URL = typeof window !== 'undefined' ? window.location.origin : ''; 

  const LINKS = {
    ceci: "5492804547014",
    dani: "5492974177629", 
    facebook: "https://www.facebook.com/share/p/17rqcQJWQT/",
    instagram: "https://www.instagram.com/inperuproducciones?igsh=MXZuaG5yaHQ0Y3Z6cQ=="
  };

  const getWaLink = (phone, text) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

  // ESTADOS
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState('home'); 
  const [adminTab, setAdminTab] = useState('orders'); 
  
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [foundOrders, setFoundOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Estado para el producto que se está viendo en detalle
  const [viewingProduct, setViewingProduct] = useState(null);

  // Carrito & Wizard
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [clientNameForCart, setClientNameForCart] = useState('');
  const [wizardState, setWizardState] = useState(null);

  // Admin Forms
  const [newOrderId, setNewOrderId] = useState('');
  const [newOrderName, setNewOrderName] = useState('');
  const [newOrderPhone, setNewOrderPhone] = useState('');
  const [newOrderSocial, setNewOrderSocial] = useState('');
  const [newOrderDeposit, setNewOrderDeposit] = useState(''); 
  
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImages, setProdImages] = useState(''); 
  const [prodDescription, setProdDescription] = useState('');
  const [prodCustomOptions, setProdCustomOptions] = useState('');
  const [editingProductId, setEditingProductId] = useState(null); 

  // Admin Cotizador
  const [orderItems, setOrderItems] = useState([]); 
  const [selectedProduct, setSelectedProduct] = useState('custom');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [customDescription, setCustomDescription] = useState('');
  
  const [customerHistory, setCustomerHistory] = useState({ count: 0, isVip: false });
  const [adminPass, setAdminPass] = useState('');

  // --- EFECTOS ---
  useEffect(() => {
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (e) { console.error(e); } };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

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

  useEffect(() => {
    if (view === 'admin_panel' && !newOrderId) {
      const maxId = orders.reduce((max, o) => { const num = parseInt(o.orderId); return !isNaN(num) && num > max ? num : max; }, 99); 
      setNewOrderId((maxId + 1).toString());
    }
  }, [orders, view, newOrderId]);

  useEffect(() => {
    if (newOrderPhone.length > 6) {
      const past = orders.filter(o => o.phone && o.phone.includes(newOrderPhone));
      const count = past.length;
      const isVipMoment = (count + 1) % 5 === 0 && (count + 1) > 0;
      setCustomerHistory({ count, isVip: isVipMoment });
      if (count > 0 && !newOrderName) { setNewOrderName(past[0].clientName); setNewOrderSocial(past[0].social || ''); showNotification(`¡Cliente frecuente! (${count} compras)`, 'success'); }
    } else { setCustomerHistory({ count: 0, isVip: false }); }
  }, [newOrderPhone, orders]);

  useEffect(() => {
    if (selectedProduct === 'custom') { setUnitPrice(0); } else {
      const prod = products.find(p => p.id === selectedProduct);
      if (prod) setUnitPrice(prod.price);
    }
  }, [selectedProduct, products]);

  const financials = useMemo(() => {
    let totalRevenue = 0; let totalPending = 0; 
    orders.forEach(o => {
      const balance = Math.max(0, (o.totalPrice || 0) - (o.deposit || 0));
      totalRevenue += (o.deposit || 0); totalPending += balance;
    });
    return { totalRevenue, totalPending };
  }, [orders]);

  // --- UTILIDADES ---
  const showNotification = (msg, type = 'success') => { setNotification({ msg, type }); setTimeout(() => setNotification(null), 3000); };
  
  const calculateGrandTotal = () => orderItems.reduce((acc, i) => acc + i.subtotal, 0);

  const parseWizardSteps = (text) => {
    if (!text) return [];
    const blocks = text.split(/\n\s*\n/); 
    return blocks.map(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length === 0) return null;
      const header = lines[0];
      const priceMatch = header.match(/\(\+(\d+)\)/); 
      const price = priceMatch ? parseInt(priceMatch[1]) : 0;
      const title = header.replace(/\(\+\d+\)/, '').trim(); 
      let options = [];
      if (lines.length > 1) {
         const optionsLine = lines.slice(1).join(','); 
         options = optionsLine.split(',').map(o => o.trim()).filter(o => o);
      }
      return { title, price, options };
    }).filter(step => step !== null);
  };

  // --- LOGICA WIZARD ---
  const startWizard = (prod) => {
    const steps = parseWizardSteps(prod.customOptions);
    if (steps.length > 0) {
      setWizardState({ product: prod, steps: steps, currentStepIndex: 0, selections: {}, totalExtraCost: 0, showOptions: false });
    } else {
      addToCart(prod, 0, {}); 
    }
  };

  const handleWizardAction = (action, value = null) => {
    if (!wizardState) return;

    const currentStep = wizardState.steps[wizardState.currentStepIndex];
    let nextSelections = { ...wizardState.selections };
    let nextExtraCost = wizardState.totalExtraCost;
    let shouldAdvance = false;

    if (action === 'YES_CUSTOMIZE') {
      setWizardState(prev => ({ ...prev, showOptions: true }));
      return; 
    } 
    else if (action === 'NO_SKIP') {
      nextSelections[currentStep.title] = "Estándar (Sin cargo)";
      shouldAdvance = true;
    }
    else if (action === 'SELECT_OPTION') {
      nextSelections[currentStep.title] = value;
      nextExtraCost += currentStep.price; 
      shouldAdvance = true;
    }

    if (shouldAdvance) {
      if (wizardState.currentStepIndex < wizardState.steps.length - 1) {
        setWizardState(prev => ({ 
          ...prev, 
          currentStepIndex: prev.currentStepIndex + 1, 
          selections: nextSelections,
          totalExtraCost: nextExtraCost,
          showOptions: false
        }));
      } else {
        // Cerrar wizard y agregar
        addToCart(wizardState.product, nextExtraCost, nextSelections);
        setWizardState(null);
        // Si venía de la vista de detalle, cerramos también el detalle
        setViewingProduct(null);
      }
    }
  };

  const addToCart = (prod, extraCost, selectedOpts) => {
    const finalPrice = prod.price + extraCost;
    const optionsString = Object.entries(selectedOpts).map(([k, v]) => `${k}: ${v}`).join(' | ');
    const cartItemId = `${prod.id}-${optionsString}-${finalPrice}-${Date.now()}`; 
    setCart(prev => [...prev, { ...prod, price: finalPrice, qty: 1, selectedOptions: optionsString, cartItemId }]);
    showNotification("Agregado al carrito");
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId) => setCart(cart.filter(item => item.cartItemId !== cartItemId));
  const updateCartQty = (cartItemId, delta) => {
    setCart(cart.map(item => item.cartItemId === cartItemId ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const sendCartToWhatsapp = () => {
    if (cart.length === 0) return;
    if (!clientNameForCart.trim()) { showNotification("Por favor, ingresa tu nombre", "error"); return; }
    let message = `Hola INPERU PRODUCCIONES! Soy *${clientNameForCart}*.\nQuiero hacer el siguiente pedido:\n\n`;
    cart.forEach(item => {
      message += `▪️ ${item.qty} x ${item.name}`;
      if (item.selectedOptions) message += `\n   L ${item.selectedOptions}`;
      message += `\n   L $${(item.price * item.qty).toLocaleString()}\n`;
    });
    message += `\n*Total Estimado: $${cartTotal.toLocaleString()}*\n\nQuedo a la espera asi avanzamos con el pedido. Gracias!`;
    window.open(`https://wa.me/${LINKS.dani}?text=${encodeURIComponent(message)}`, '_blank');
    setCart([]); setIsCartOpen(false); setClientNameForCart('');
  };

  // --- FUNCIONES ADMIN ---
  const handleSaveProduct = async () => {
    if (!prodName || !prodPrice) return showNotification("Faltan datos", "error");
    const imageUrls = prodImages.split('\n').map(url => url.trim()).filter(url => url !== '');
    const mainImageUrl = imageUrls.length > 0 ? imageUrls[0] : 'https://via.placeholder.com/150?text=Sin+Foto';
    
    const productData = { 
      name: prodName, description: prodDescription, customOptions: prodCustomOptions, 
      price: parseFloat(prodPrice), imageUrl: mainImageUrl, imageUrls: imageUrls, category: 'Papelería', updatedAt: serverTimestamp() 
    };

    try {
      if (editingProductId) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', editingProductId), productData); showNotification("Producto actualizado"); } 
      else { productData.createdAt = serverTimestamp(); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), productData); showNotification("Producto agregado"); }
      setProdName(''); setProdPrice(''); setProdImages(''); setProdDescription(''); setProdCustomOptions(''); setEditingProductId(null);
    } catch (err) { showNotification("Error al guardar", "error"); }
  };

  const handleEditProduct = (prod) => { 
    setProdName(prod.name); setProdPrice(prod.price); setProdImages(prod.imageUrls ? prod.imageUrls.join('\n') : prod.imageUrl); 
    setProdDescription(prod.description || ''); setProdCustomOptions(prod.customOptions || ''); 
    setEditingProductId(prod.id); window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };
  const handleCancelEdit = () => { setProdName(''); setProdPrice(''); setProdImages(''); setProdDescription(''); setProdCustomOptions(''); setEditingProductId(null); };
  const handleDeleteProduct = async (id) => { if(window.confirm("¿Borrar producto?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id)); };

  const handleAddItem = () => {
    let prodName = 'Personalizado';
    if (selectedProduct !== 'custom') { const p = products.find(x => x.id === selectedProduct); if (p) prodName = p.name; }
    setOrderItems([...orderItems, { id: Date.now(), name: prodName, description: customDescription, quantity, unitPrice, subtotal: quantity * unitPrice }]);
    setCustomDescription(''); setQuantity(1); showNotification("Item agregado");
  };
  const handleRemoveItem = (id) => setOrderItems(orderItems.filter(i => i.id !== id));

  const handleCreateOrder = async () => {
    if (!newOrderName || !newOrderId || orderItems.length === 0) return showNotification("Faltan datos", "error");
    const total = calculateGrandTotal(); 
    const deposit = parseFloat(newOrderDeposit) || 0;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), {
      clientName: newOrderName, orderId: newOrderId, description: orderItems.map(i => `${i.quantity} x ${i.name} ${i.description ? `(${i.description})` : ''}`).join(' + '), items: orderItems, totalPrice: total, deposit: deposit, phone: newOrderPhone, social: newOrderSocial, status: 'received', finishedImage: '', createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    setNewOrderId(''); setNewOrderName(''); setNewOrderPhone(''); setNewOrderSocial(''); setNewOrderDeposit(''); setOrderItems([]); setCustomDescription(''); setQuantity(1); showNotification("Pedido creado");
  };
  
  const updateStatus = async (id, status) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id), { status, updatedAt: serverTimestamp() }); };
  const markAsPaid = async (order) => { if(window.confirm("¿Marcar como pagado?")) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id), { deposit: order.totalPrice, updatedAt: serverTimestamp() }); };
  const deleteOrder = async (id) => { if(window.confirm("¿Seguro?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id)); };
  const addFinishedPhoto = async (order) => { const url = prompt("Pega el link de la foto:"); if (url) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id), { finishedImage: url }); showNotification("¡Foto agregada!"); } };
  const sendWhatsAppMessage = (order) => {
    if (!order.phone) return showNotification("Sin teléfono", "error");
    const statusText = statusConfig[order.status]?.label || "Actualizado";
    const message = `Hola ${order.clientName}! 👋\n\nTe escribimos de Inperu Producciones.\n\nTu pedido #${order.orderId} ha cambiado de estado a: *${statusText}*.\n\nPuedes ver el detalle aquí: ${APP_URL}\n\n¡Muchas gracias!`;
    window.open(`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };
  const handleAdminLogin = (e) => { e.preventDefault(); if (adminPass === 'Luisana1510++') { setIsAdmin(true); setView('admin_panel'); setAdminPass(''); showNotification("¡Bienvenida!"); } else { showNotification("Clave incorrecta", "error"); } };
  const handleSearch = (e) => { e.preventDefault(); setLoading(true); setTimeout(() => {
      const res = orders.filter(o => (o.phone?.replace(/\D/g,'').includes(searchQuery.replace(/\D/g,''))) || o.orderId.toLowerCase() === searchQuery.toLowerCase() || o.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
      if (res.length > 0) { setFoundOrders(res); setView('search_result'); } else { showNotification("No encontrado", "error"); } setLoading(false); }, 600); };

  const statusConfig = {
    received: { label: 'Recibido', color: 'bg-slate-100 text-slate-600', icon: Clock, progress: 10 },
    designing: { label: 'En Diseño', color: 'bg-teal-100 text-teal-700', icon: Palette, progress: 35 },
    printing: { label: 'En Producción', color: 'bg-cyan-100 text-cyan-700', icon: Printer, progress: 60 },
    assembling: { label: 'Armado/Corte', color: 'bg-yellow-100 text-yellow-700', icon: Scissors, progress: 80 },
    ready: { label: 'Listo para Retirar', color: 'bg-green-100 text-green-700', icon: CheckCircle, progress: 100 },
    delivered: { label: 'Entregado', color: 'bg-slate-800 text-white', icon: Package, progress: 100 },
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24"> 
      
      {/* MODAL DETALLE PRODUCTO */}
      {viewingProduct && (
        <ProductDetailModal 
          prod={viewingProduct} 
          onClose={() => setViewingProduct(null)} 
          onAddToCart={(prod) => startWizard(prod)}
        />
      )}

      {/* --- WIZARD MODAL (PASO A PASO) --- */}
      {wizardState && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-teal-900">{wizardState.product.name}</h3>
              <button onClick={() => setWizardState(null)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>

            <div className="mb-6">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-2 py-1 rounded">Paso {wizardState.currentStepIndex + 1} de {wizardState.steps.length}</span>
               </div>
               
               <h4 className="text-xl font-bold text-slate-800 mb-4 text-center">{wizardState.steps[wizardState.currentStepIndex].title}</h4>
               
               {wizardState.showOptions || wizardState.steps[wizardState.currentStepIndex].price === 0 ? (
                  <div>
                    <p className="text-sm text-slate-500 mb-3 text-center">Elige una opción:</p>
                    <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto">
                        {wizardState.steps[wizardState.currentStepIndex].options.map((opt, idx) => (
                          <button 
                            key={idx}
                            onClick={() => handleWizardAction('SELECT_OPTION', opt)}
                            className="p-3 rounded-xl border-2 border-teal-100 bg-teal-50 text-teal-800 font-bold hover:bg-teal-100 hover:border-teal-300 transition text-center shadow-sm"
                          >
                            {opt}
                          </button>
                        ))}
                    </div>
                  </div>
               ) : (
                  <div className="text-center">
                     <div className="bg-green-50 border border-green-100 p-4 rounded-2xl mb-6">
                        <p className="text-green-800 font-medium mb-1">¿Te gustaría personalizarlo?</p>
                        <p className="text-2xl font-bold text-green-600">+${wizardState.steps[wizardState.currentStepIndex].price}</p>
                     </div>
                     
                     <div className="flex flex-col gap-3">
                        <button 
                          onClick={() => handleWizardAction('YES_CUSTOMIZE')}
                          className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-200 flex items-center justify-center gap-2"
                        >
                          SÍ, quiero elegir <ArrowRight size={18}/>
                        </button>
                        <button 
                          onClick={() => handleWizardAction('NO_SKIP')}
                          className="w-full bg-white border-2 border-slate-100 text-slate-400 py-3 rounded-xl font-medium hover:border-slate-300 hover:text-slate-600 transition"
                        >
                          NO, prefiero la opción estándar
                        </button>
                     </div>
                     <p className="text-xs text-slate-300 mt-4 italic">*Si eliges NO, avanzaremos al siguiente paso sin costo extra.</p>
                  </div>
               )}

            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex gap-1 h-1 mt-2">
                 {wizardState.steps.map((_, idx) => (
                   <div key={idx} className={`flex-1 rounded-full ${idx <= wizardState.currentStepIndex ? 'bg-teal-500' : 'bg-slate-200'}`}></div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CARRITO */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[80] flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-teal-700 text-white">
              <h2 className="font-bold text-lg flex items-center gap-2"><ShoppingCart/> Tu Carrito</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-white/20 rounded"><X/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingBag size={48} className="mx-auto mb-4 opacity-20"/>
                  <p>Tu carrito está vacío</p>
                  <button onClick={() => setIsCartOpen(false)} className="mt-4 text-teal-600 font-bold text-sm hover:underline">Ir a ver productos</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.cartItemId} className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <img src={item.imageUrl} className="w-16 h-16 rounded-lg object-cover bg-white"/>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-slate-800 line-clamp-1">{item.name}</p>
                        {item.selectedOptions && (
                          <div className="text-xs text-slate-500 mb-1 bg-white p-1.5 rounded border border-slate-200">
                            {item.selectedOptions.split('|').map((opt, i) => <div key={i}>• {opt.trim()}</div>)}
                          </div>
                        )}
                        <p className="text-teal-600 font-bold text-sm">${item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-lg border p-1 h-8 self-start">
                        <button onClick={() => updateCartQty(item.cartItemId, -1)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><Minus size={14}/></button>
                        <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateCartQty(item.cartItemId, 1)} className="p-1 hover:bg-slate-100 rounded text-teal-600"><Plus size={14}/></button>
                      </div>
                      <button onClick={() => removeFromCart(item.cartItemId)} className="text-red-400 p-2 self-start"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t bg-slate-50">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-slate-500">Total Estimado</span>
                  <span className="text-2xl font-bold text-teal-800">${cartTotal.toLocaleString()}</span>
                </div>
                <input 
                  placeholder="Tu Nombre (Obligatorio)" 
                  className="w-full p-3 border rounded-xl mb-3 text-sm border-gray-300"
                  value={clientNameForCart}
                  onChange={(e) => setClientNameForCart(e.target.value)}
                />
                <button onClick={sendCartToWhatsapp} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-200 transition">
                  <MessageCircle/> Pedir por WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-teal-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setView('home'); setFoundOrders([]); setSearchQuery('');}}>
            <img src={LOGO_URL} alt="Logo" className="w-8 h-8 object-contain" />
            <h1 className="font-bold text-xl text-teal-800 tracking-tight">INPERU <span className="text-teal-600 font-normal">PRODUCCIONES</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-teal-700 hover:bg-teal-50 rounded-full transition">
              <ShoppingCart size={20}/>
              {cart.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cart.length}</span>}
            </button>
            <button onClick={() => isAdmin ? setView('home') : setView('admin_login')} className="text-slate-400 hover:text-teal-600 transition p-2">
              {isAdmin ? <LogOut size={16}/> : <Lock size={16}/>}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 relative z-0">
        {notification && (
          <div className={`fixed top-20 right-4 px-4 py-3 rounded-lg shadow-lg border-l-4 z-50 ${notification.type === 'error' ? 'bg-white border-red-500 text-red-600' : 'bg-white border-teal-500 text-teal-700'}`}>
            <p className="font-medium text-sm">{notification.msg}</p>
          </div>
        )}

        {view === 'home' && (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="w-full bg-white rounded-3xl shadow-xl shadow-teal-50/50 p-8 text-center border border-teal-50 relative overflow-hidden mb-12">
              <div className="mb-6 relative z-10">
                <div className="w-32 h-32 mx-auto bg-white rounded-full shadow-md p-1 flex items-center justify-center border-4 border-teal-50">
                   <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain rounded-full"/>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-teal-900">Seguimiento de Pedidos</h2>
              <p className="text-slate-500 mb-6 text-sm">Ingresa tu número de teléfono para ver el estado.</p>
              <form onSubmit={handleSearch} className="relative z-10 max-w-sm mx-auto">
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
            </div>

            <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <h3 className="text-xl font-bold text-teal-900 flex items-center gap-2"><ShoppingBag size={20}/> Catálogo Digital</h3>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>
                
                {products.length === 0 ? (
                  <p className="text-center text-slate-400">Cargando productos...</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {products.map(prod => (
                      <ProductCardPublic key={prod.id} prod={prod} onAddToCart={() => setViewingProduct(prod)} onViewDetails={() => setViewingProduct(prod)} />
                    ))}
                  </div>
                )}
            </div>
              
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-50 text-center">
                 <h3 className="text-xs font-bold text-teal-800 uppercase mb-4">Comunicate y hace tu pedido a INPERU PRODUCCIONES =)</h3>
                 <div className="flex justify-center gap-4 mb-6">
                    <a href={LINKS.facebook} target="_blank" rel="noreferrer" className="text-blue-600 bg-blue-50 p-2 rounded-full hover:scale-110 transition"><Facebook size={20}/></a>
                    <a href={LINKS.instagram} target="_blank" rel="noreferrer" className="text-pink-600 bg-pink-50 p-2 rounded-full hover:scale-110 transition"><Instagram size={20}/></a>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href={getWaLink(LINKS.ceci, "Hola Ceci! 👋 Quiero hacer un pedido.")} target="_blank" className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-200">
                        Hablar con CECI
                    </a>
                    <a href={getWaLink(LINKS.dani, "Hola Dani! 👋 Quiero hacer un pedido.")} target="_blank" className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition">
                        Hablar con DANI
                    </a>
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
                      <div className="mb-6 rounded-xl overflow-hidden border-2 border-teal-500 shadow-lg relative group cursor-pointer" onClick={() => setEnlargedImage(order.finishedImage)}>
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

             <div className="mt-12 mb-12">
                <div className="flex items-center gap-4 mb-6"><div className="h-px bg-slate-200 flex-1"></div><h3 className="text-lg font-bold text-teal-900">Nuestros Productos</h3><div className="h-px bg-slate-200 flex-1"></div></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {products.map(prod => (
                    <ProductCardPublic key={prod.id} prod={prod} onAddToCart={() => setViewingProduct(prod)} onViewDetails={() => setViewingProduct(prod)} />
                  ))}
                </div>
             </div>

             <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-50 text-center">
                 <h3 className="text-sm font-bold text-teal-800 uppercase mb-4">Comunicate y hace tu pedido a INPERU PRODUCCIONES =)</h3>
                 <div className="flex justify-center gap-4 mb-6">
                    <a href={LINKS.facebook} target="_blank" rel="noreferrer" className="text-blue-600 bg-blue-50 p-2 rounded-full hover:scale-110 transition"><Facebook size={20}/></a>
                    <a href={LINKS.instagram} target="_blank" rel="noreferrer" className="text-pink-600 bg-pink-50 p-2 rounded-full hover:scale-110 transition"><Instagram size={20}/></a>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href={getWaLink(LINKS.ceci, "Hola Ceci! 👋 Quiero hacer un pedido.")} target="_blank" className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-200">
                        Hablar con CECI
                    </a>
                    <a href={getWaLink(LINKS.dani, "Hola Dani! 👋 Quiero hacer un pedido.")} target="_blank" className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition">
                        Hablar con DANI
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
                     
                     <div className="md:col-span-2">
                       <label className="text-xs text-slate-500 font-bold ml-1 mb-1 flex items-center gap-1"><Settings2 size={12}/> Opciones de Personalización (Paso a Paso)</label>
                       <p className="text-[10px] text-slate-400 mb-2 ml-1">Escribe bloques separados por doble ENTER. Formato: Título (+Precio Extra) y abajo las opciones.</p>
                       <textarea 
                         placeholder="Ejemplo:&#10;Color de Esferas (+100)&#10;Blanca, Verde, Roja&#10;&#10;Caja Personalizada (+300)&#10;Stitch, Grinch" 
                         className="p-3 bg-white border border-gray-300 rounded-lg w-full text-gray-900 placeholder-gray-400 h-40 resize-y font-mono text-sm" 
                         value={prodCustomOptions} 
                         onChange={(e)=>setProdCustomOptions(e.target.value)}
                       />
                     </div>

                     <textarea 
                       placeholder="Descripción del producto (lo que trae, medidas, etc.)" 
                       className="p-3 bg-white border border-gray-300 rounded-lg w-full col-span-2 text-gray-900 placeholder-gray-400 h-20 resize-y" 
                       value={prodDescription} 
                       onChange={(e)=>setProdDescription(e.target.value)}
                     />
                     <textarea 
                       placeholder="URLs de Imágenes (una por línea). La primera será la principal." 
                       className="p-3 bg-white border border-gray-300 rounded-lg w-full col-span-2 text-gray-900 placeholder-gray-400 h-24 resize-y" 
                       value={prodImages} 
                       onChange={(e)=>setProdImages(e.target.value)}
                     />
                   </div>
                   <div className="flex gap-2">
                      <button onClick={handleSaveProduct} className="bg-teal-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Save size={18}/> {editingProductId ? 'Actualizar' : 'Guardar'}</button>
                      {editingProductId && <button onClick={handleCancelEdit} className="bg-slate-200 text-slate-600 px-6 py-2 rounded-lg font-bold">Cancelar</button>}
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   {products.map(p => (
                     <div key={p.id} className="bg-white p-3 rounded-xl border shadow-sm relative group">
                        <img 
                          src={p.imageUrl} 
                          className="w-full aspect-square object-cover rounded-lg mb-2 cursor-pointer hover:opacity-90 transition" 
                          alt={p.name}
                          onClick={() => setEnlargedImage(p.imageUrl)}
                        />
                        {p.imageUrls && p.imageUrls.length > 1 && <div className="absolute top-4 left-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1"><Images size={12}/> {p.imageUrls.length}</div>}
                        
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
                    <h3 className="font-bold text-teal-700 mb-4 break-words leading-tight">Nuevo Pedido</h3>
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
      
      {/* BOTON FLOTANTE DE CARRITO SIEMPRE VISIBLE SI HAY ITEMS */}
      {cart.length > 0 && !isCartOpen && (
        <button 
          onClick={() => setIsCartOpen(true)} 
          className="fixed bottom-6 right-6 bg-teal-600 text-white p-4 rounded-full shadow-xl shadow-teal-200 animate-in slide-in-from-bottom-10 hover:scale-110 transition z-40 flex items-center gap-2"
        >
          <ShoppingCart size={24}/>
          <span className="font-bold">${cartTotal.toLocaleString()}</span>
        </button>
      )}
    </div>
  );
}