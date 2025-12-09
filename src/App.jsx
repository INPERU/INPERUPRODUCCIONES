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
  orderBy,
  writeBatch 
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
  Maximize2,
  Eye,
  ArrowLeft,
  User,
  RotateCcw,
  FileText,
  Calendar,      
  Filter,        
  AlertTriangle,
  Layers,
  Box,
  Calculator,
  Truck,
  Barcode,
  TrendingUp,
  ClipboardList
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

const ProductDetailModal = ({ prod, onClose, onAddToCart }) => {
  const [currentImg, setCurrentImg] = useState(prod.imageUrl);
  const images = prod.imageUrls && prod.imageUrls.length > 0 ? prod.imageUrls : [prod.imageUrl];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-white/80 p-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-red-500 transition shadow-sm"><X size={24}/></button>
        <div className="w-full md:w-1/2 bg-slate-50 p-4 flex flex-col justify-center relative border-b md:border-b-0 md:border-r border-slate-100">
           <div className="aspect-square w-full rounded-xl overflow-hidden bg-white shadow-sm mb-4 relative group">
              <img src={currentImg} alt={prod.name} className="w-full h-full object-contain"/>
           </div>
           {images.length > 1 && (
             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar justify-center">
               {images.map((img, idx) => (
                 <button key={idx} onClick={() => setCurrentImg(img)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${currentImg === img ? 'border-teal-500 ring-2 ring-teal-100' : 'border-slate-200 hover:border-teal-300'}`}><img src={img} className="w-full h-full object-cover"/></button>
               ))}
             </div>
           )}
        </div>
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto bg-white">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 leading-tight">{prod.name}</h2>
              <p className="text-3xl font-bold text-teal-600 mb-6">${prod.price.toLocaleString()}</p>
              <div className="prose prose-slate text-slate-600 mb-8 text-sm md:text-base leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2 uppercase text-xs tracking-wider flex items-center gap-2"><FileText size={14}/> Descripción</h4>
                <p className="whitespace-pre-line">{prod.description || "Sin descripción detallada."}</p>
              </div>
            </div>
            <div className="mt-auto pt-6 border-t border-slate-100">
              <button onClick={() => onAddToCart(prod)} className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-teal-200 hover:bg-teal-700 transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"><Plus size={24}/> Agregar al Pedido</button>
            </div>
        </div>
      </div>
    </div>
  );
};

const ProductCardPublic = ({ prod, onAddToCart, onViewDetails }) => {
  const [currentImg, setCurrentImg] = useState(prod.imageUrl);
  const images = prod.imageUrls && prod.imageUrls.length > 0 ? prod.imageUrls : [prod.imageUrl];
  useEffect(() => { setCurrentImg(prod.imageUrl); }, [prod]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition flex flex-col h-full relative">
      <div className="p-3 pb-0 relative cursor-pointer" onClick={() => onViewDetails(prod)}>
         <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50">
            <img src={currentImg} alt={prod.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-105"/>
             {images.length > 1 && <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none"><Images size={12}/> {images.length}</div>}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center opacity-0 group-hover:opacity-100"><div className="bg-white/90 text-slate-800 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm backdrop-blur-sm"><Eye size={14}/> Ver Detalle</div></div>
         </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
         <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 cursor-pointer hover:text-teal-600 transition" onClick={() => onViewDetails(prod)}>{prod.name}</h4>
         {prod.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2 flex-1">{prod.description}</p>}
         <div className="flex items-center justify-between mt-auto pt-2">
            <span className="text-lg font-bold text-teal-600">${prod.price.toLocaleString()}</span>
            <button onClick={(e) => {e.stopPropagation(); onAddToCart(prod);}} className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 transition shadow-md shadow-teal-100 flex items-center gap-2 text-sm font-bold px-3"><Plus size={18}/> Lo quiero</button>
         </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const LOGO_URL = "https://i.ibb.co/99Fcyfcj/LOGO-INPERU-PRODUCCIONES.png"; 
  const APP_URL = typeof window !== 'undefined' ? window.location.origin : ''; 
  const LINKS = { ceci: "5492804547014", dani: "5492974177629", facebook: "https://www.facebook.com/share/p/17rqcQJWQT/", instagram: "https://www.instagram.com/inperuproducciones?igsh=MXZuaG5yaHQ0Y3Z6cQ==" };
  const getWaLink = (phone, text) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

  // ESTADOS
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState('home'); 
  const [adminTab, setAdminTab] = useState('orders'); 
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [foundOrders, setFoundOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [clientNameForCart, setClientNameForCart] = useState('');
  const [wizardState, setWizardState] = useState(null);
  
  // ADMIN STATES - ORDERS
  const [newOrderId, setNewOrderId] = useState('');
  const [newOrderName, setNewOrderName] = useState('');
  const [newOrderPhone, setNewOrderPhone] = useState('');
  const [newOrderSocial, setNewOrderSocial] = useState('');
  const [newOrderDeposit, setNewOrderDeposit] = useState(''); 
  const [newOrderPaymentMethod, setNewOrderPaymentMethod] = useState('Efectivo');
  const [newOrderDeliveryDate, setNewOrderDeliveryDate] = useState('');
  const [newOrderGeneralNotes, setNewOrderGeneralNotes] = useState(''); 
  const [editingOrderId, setEditingOrderId] = useState(null); 
  
  // ADMIN STATES - PRODUCTS
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImages, setProdImages] = useState(''); 
  const [prodDescription, setProdDescription] = useState('');
  const [prodCustomOptions, setProdCustomOptions] = useState('');
  const [prodSeller, setProdSeller] = useState('dani'); 
  const [editingProductId, setEditingProductId] = useState(null); 

  // COTIZADOR ADMIN (ITEMS DE PEDIDO)
  const [orderItems, setOrderItems] = useState([]); 
  const [selectedProduct, setSelectedProduct] = useState('custom');
  const [customItemName, setCustomItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [editingItemIndex, setEditingItemIndex] = useState(-1);
  
  // NUEVO: Materiales Manuales para Items de Pedido
  const [itemManualMaterials, setItemManualMaterials] = useState([]); // [{ stockId, qty, name }]
  const [selectedStockForManual, setSelectedStockForManual] = useState('');
  const [manualQty, setManualQty] = useState('');
  
  // STOCK FORM
  const [stockCode, setStockCode] = useState('');
  const [stockName, setStockName] = useState('');
  const [stockQty, setStockQty] = useState(''); 
  const [stockSupplier, setStockSupplier] = useState(''); 
  const [stockCost, setStockCost] = useState(''); 
  const [stockPackageQty, setStockPackageQty] = useState(''); 
  const [editingStockId, setEditingStockId] = useState(null); 
  const [stockSearch, setStockSearch] = useState('');

  // COSTOS / RECETAS FORM
  const [selectedProductForCost, setSelectedProductForCost] = useState('');
  const [recipeItems, setRecipeItems] = useState([]); 
  const [selectedStockForRecipe, setSelectedStockForRecipe] = useState('');
  const [recipeQty, setRecipeQty] = useState('');
  
  const [customerHistory, setCustomerHistory] = useState({ count: 0, isVip: false });
  const [adminPass, setAdminPass] = useState('');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminFilterStatus, setAdminFilterStatus] = useState('all');

  // EFFECTS & LOGIC
  useEffect(() => { const initAuth = async () => { try { await signInAnonymously(auth); } catch (e) { console.error(e); } }; initAuth(); const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u)); return () => unsubscribe(); }, []);
  
  useEffect(() => { 
    if (!user) return; 
    const unsubOrders = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'orders')), (s) => { const list = s.docs.map(d => ({ id: d.id, ...d.data() })); list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)); setOrders(list); }); 
    const unsubProducts = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'products')), (s) => { const list = s.docs.map(d => ({ id: d.id, ...d.data() })); list.sort((a, b) => a.name.localeCompare(b.name)); setProducts(list); }); 
    const unsubStock = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'stock')), (s) => { const list = s.docs.map(d => ({ id: d.id, ...d.data() })); list.sort((a, b) => a.name.localeCompare(b.name)); setStockItems(list); });
    return () => { unsubOrders(); unsubProducts(); unsubStock(); }; 
  }, [user]);

  useEffect(() => { if (view === 'admin_panel' && !newOrderId && !editingOrderId) { const maxId = orders.reduce((max, o) => { const num = parseInt(o.orderId); return !isNaN(num) && num > max ? num : max; }, 99); setNewOrderId((maxId + 1).toString()); } }, [orders, view, newOrderId, editingOrderId]);
  useEffect(() => { if (newOrderPhone.length > 6) { const past = orders.filter(o => o.phone && o.phone.includes(newOrderPhone)); const count = past.length; const isVipMoment = (count + 1) % 5 === 0 && (count + 1) > 0; setCustomerHistory({ count, isVip: isVipMoment }); if (count > 0 && !newOrderName) { setNewOrderName(past[0].clientName); setNewOrderSocial(past[0].social || ''); showNotification(`¡Cliente frecuente! (${count} compras)`, 'success'); } } else { setCustomerHistory({ count: 0, isVip: false }); } }, [newOrderPhone, orders]);
  useEffect(() => { if (selectedProduct === 'custom') { if (editingItemIndex === -1) setUnitPrice(''); } else { const prod = products.find(p => p.id === selectedProduct); if (prod && editingItemIndex === -1) setUnitPrice(prod.price); } }, [selectedProduct, products]);

  // Cargar receta al seleccionar producto en Costos
  useEffect(() => {
      if (selectedProductForCost) {
          const prod = products.find(p => p.id === selectedProductForCost);
          if (prod && prod.recipe) { setRecipeItems(prod.recipe); } else { setRecipeItems([]); }
      } else { setRecipeItems([]); }
  }, [selectedProductForCost, products]);

  const financials = useMemo(() => { let totalRevenue = 0; let totalPending = 0; orders.forEach(o => { const balance = Math.max(0, (o.totalPrice || 0) - (o.deposit || 0)); totalRevenue += (o.deposit || 0); totalPending += balance; }); return { totalRevenue, totalPending }; }, [orders]);
  const showNotification = (msg, type = 'success') => { setNotification({ msg, type }); setTimeout(() => setNotification(null), 3000); };
  const calculateGrandTotal = () => orderItems.reduce((acc, i) => acc + i.subtotal, 0);

  // --- WIZARD AND CART FUNCTIONS ---
  const parseWizardSteps = (text) => { if (!text) return []; const blocks = text.split(/\n\s*\n/); return blocks.map(block => { const lines = block.split('\n').map(l => l.trim()).filter(l => l); if (lines.length === 0) return null; const header = lines[0]; const priceMatch = header.match(/\(\+(\d+)\)/); const price = priceMatch ? parseInt(priceMatch[1]) : 0; const title = header.replace(/\(\+\d+\)/, '').trim(); let options = []; if (lines.length > 1) { const optionsLine = lines.slice(1).join(','); options = optionsLine.split(',').map(o => o.trim()).filter(o => o); } return { title, price, options }; }).filter(step => step !== null); };
  const startWizard = (prod) => { const steps = parseWizardSteps(prod.customOptions); if (steps.length > 0) { setWizardState({ product: prod, steps: steps, currentStepIndex: 0, selections: {}, totalExtraCost: 0, showOptions: false }); } else { addToCart(prod, 0, {}); } };
  const handleWizardAction = (action, value = null) => { if (!wizardState) return; const currentStep = wizardState.steps[wizardState.currentStepIndex]; let nextSelections = { ...wizardState.selections }; let nextExtraCost = wizardState.totalExtraCost; let shouldAdvance = false; if (action === 'YES_CUSTOMIZE') { setWizardState(prev => ({ ...prev, showOptions: true })); return; } else if (action === 'NO_SKIP') { nextSelections[currentStep.title] = "Estándar (Sin cargo)"; shouldAdvance = true; } else if (action === 'SELECT_OPTION') { nextSelections[currentStep.title] = value; nextExtraCost += currentStep.price; shouldAdvance = true; } if (shouldAdvance) { if (wizardState.currentStepIndex < wizardState.steps.length - 1) { setWizardState(prev => ({ ...prev, currentStepIndex: prev.currentStepIndex + 1, selections: nextSelections, totalExtraCost: nextExtraCost, showOptions: false })); } else { addToCart(wizardState.product, nextExtraCost, nextSelections); setWizardState(null); setViewingProduct(null); } } };
  const addToCart = (prod, extraCost, selectedOpts) => { const finalPrice = prod.price + extraCost; const optionsString = Object.entries(selectedOpts).map(([k, v]) => `${k}: ${v}`).join(' | '); const cartItemId = `${prod.id}-${optionsString}-${finalPrice}-${Date.now()}`; setCart(prev => [...prev, { ...prod, price: finalPrice, qty: 1, selectedOptions: optionsString, cartItemId, seller: prod.seller }]); showNotification("Agregado al carrito"); setIsCartOpen(true); };
  const removeFromCart = (cartItemId) => setCart(cart.filter(item => item.cartItemId !== cartItemId));
  const updateCartQty = (cartItemId, delta) => { setCart(cart.map(item => item.cartItemId === cartItemId ? { ...item, qty: Math.max(1, item.qty + delta) } : item)); };
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const sendCartToWhatsapp = (phoneTarget) => { if (cart.length === 0) return; if (!clientNameForCart.trim()) { showNotification("Por favor, ingresa tu nombre", "error"); return; } let message = `Hola INPERU PRODUCCIONES! Soy *${clientNameForCart}*.\nQuiero hacer el siguiente pedido:\n\n`; cart.forEach(item => { message += `▪️ ${item.qty} x ${item.name}`; if (item.selectedOptions) message += `\n   L ${item.selectedOptions}`; message += `\n   L $${(item.price * item.qty).toLocaleString()}\n`; }); message += `\n*Total Estimado: $${cartTotal.toLocaleString()}*\n\nQuedo a la espera asi avanzamos con el pedido. Gracias!`; window.open(`https://wa.me/${phoneTarget}?text=${encodeURIComponent(message)}`, '_blank'); setCart([]); setIsCartOpen(false); setClientNameForCart(''); };

  // --- HELPER FECHA CORRECTA ---
  const formatDateString = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // --- HELPER DESCUENTO STOCK ---
  const handleDeductStock = async (order, targetStatus) => {
    // Si ya se descontó antes, no hacemos nada (salvo que querramos reversar, pero por ahora solo descuento)
    if (order.stockDeducted) return;

    const batch = writeBatch(db);
    const updates = new Map(); // stockId -> qtyToRemove

    order.items.forEach(item => {
        // 1. Materiales de la Receta (Si es producto standard)
        if (item.productId) {
            const product = products.find(p => p.id === item.productId);
            if (product && product.recipe) {
                product.recipe.forEach(ing => {
                    const totalQty = ing.qty * item.quantity;
                    updates.set(ing.stockId, (updates.get(ing.stockId) || 0) + totalQty);
                });
            }
        }
        // 2. Materiales Manuales (Personalizados en el pedido)
        if (item.manualMaterials) {
            item.manualMaterials.forEach(mat => {
                updates.set(mat.stockId, (updates.get(mat.stockId) || 0) + mat.qty);
            });
        }
    });

    if (updates.size === 0) return; // Nada que descontar

    // Preparar actualizaciones de stock
    updates.forEach((qtyToRemove, stockId) => {
        const stockItem = stockItems.find(s => s.id === stockId);
        if (stockItem) {
            const newQty = stockItem.quantity - qtyToRemove;
            const stockRef = doc(db, 'artifacts', appId, 'public', 'data', 'stock', stockId);
            batch.update(stockRef, { quantity: newQty, updatedAt: serverTimestamp() });
        }
    });

    // Marcar pedido como descontado
    const orderRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id);
    batch.update(orderRef, { status: targetStatus, stockDeducted: true, updatedAt: serverTimestamp() });

    try {
        await batch.commit();
        showNotification("Stock descontado automáticamente", "success");
    } catch (e) {
        console.error("Error descontando stock", e);
        showNotification("Error al descontar stock", "error");
    }
  };

  // --- HANDLERS ADMIN ORDER ---
  // Materiales Manuales para el item que se esta creando
  const handleAddManualMaterial = () => {
      if (!selectedStockForManual || !manualQty) return;
      const sItem = stockItems.find(s => s.id === selectedStockForManual);
      if (!sItem) return;
      
      setItemManualMaterials([...itemManualMaterials, { stockId: sItem.id, name: sItem.name, qty: parseFloat(manualQty) }]);
      setManualQty('');
      setSelectedStockForManual('');
  };
  const handleRemoveManualMaterial = (idx) => {
      const copy = [...itemManualMaterials];
      copy.splice(idx, 1);
      setItemManualMaterials(copy);
  };

  const handleAddOrUpdateItem = () => {
    let finalName = ''; 
    let productId = null;

    if (selectedProduct === 'custom') { 
        if (!customItemName.trim()) return showNotification("Escribe el nombre del producto", "error"); 
        finalName = customItemName; 
    } else { 
        const p = products.find(x => x.id === selectedProduct); 
        if (p) {
            finalName = p.name;
            productId = p.id;
        } else {
            finalName = 'Producto';
        }
    }
    const qtyVal = parseInt(quantity); 
    const priceVal = parseFloat(unitPrice);
    if (!qtyVal || qtyVal <= 0) return showNotification("Cantidad inválida", "error"); 
    if (isNaN(priceVal)) return showNotification("Precio inválido", "error");
    
    // Guardamos item con productId y manualMaterials para el descuento de stock luego
    const newItem = { 
        id: Date.now(), 
        name: finalName, 
        productId: productId, // Importante para recetas
        manualMaterials: itemManualMaterials, // Importante para personalizados
        description: customDescription, 
        quantity: qtyVal, 
        unitPrice: priceVal, 
        subtotal: qtyVal * priceVal 
    };

    if (editingItemIndex >= 0) {
        const updatedItems = [...orderItems];
        updatedItems[editingItemIndex] = { ...updatedItems[editingItemIndex], ...newItem, id: updatedItems[editingItemIndex].id }; 
        setOrderItems(updatedItems);
        setEditingItemIndex(-1);
        showNotification("Item actualizado");
    } else {
        setOrderItems([...orderItems, newItem]); 
        showNotification("Item agregado");
    }
    setCustomDescription(''); setQuantity(''); setCustomItemName(''); 
    setSelectedProduct('custom'); setUnitPrice(''); setItemManualMaterials([]);
  };

  const handleEditItemInList = (index) => {
    const item = orderItems[index];
    setEditingItemIndex(index);
    if (item.productId) { setSelectedProduct(item.productId); } else { setSelectedProduct('custom'); setCustomItemName(item.name); }
    setQuantity(item.quantity); setUnitPrice(item.unitPrice); setCustomDescription(item.description || '');
    setItemManualMaterials(item.manualMaterials || []);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...orderItems]; newItems.splice(index, 1); setOrderItems(newItems);
    if (editingItemIndex === index) setEditingItemIndex(-1);
  };
  
  const handleSaveOrder = async () => {
    if (!newOrderName || !newOrderId || orderItems.length === 0) return showNotification("Faltan datos", "error");
    const total = calculateGrandTotal(); const deposit = parseFloat(newOrderDeposit) || 0;
    const autoDescription = orderItems.map(i => `${i.quantity} x ${i.name} ${i.description ? `(${i.description})` : ''}`).join('\n');
    const finalDescription = newOrderGeneralNotes ? `${autoDescription}\n\nNota: ${newOrderGeneralNotes}` : autoDescription;

    const orderData = {
      clientName: newOrderName, orderId: newOrderId, description: finalDescription, generalNotes: newOrderGeneralNotes, items: orderItems, totalPrice: total, deposit: deposit, paymentMethod: newOrderPaymentMethod, phone: newOrderPhone, social: newOrderSocial, deliveryDate: newOrderDeliveryDate, updatedAt: serverTimestamp()
    };
    try { 
        if (editingOrderId) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', editingOrderId), orderData); showNotification("Pedido actualizado"); } else { orderData.status = 'received'; orderData.stockDeducted = false; orderData.finishedImage = ''; orderData.createdAt = serverTimestamp(); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderData); showNotification("Pedido creado"); } 
        handleCancelOrderEdit(); 
    } catch (err) { showNotification("Error al guardar", "error"); }
  };

  const handleEditOrder = (order) => { 
      setEditingOrderId(order.id); setNewOrderId(order.orderId); setNewOrderName(order.clientName); setNewOrderPhone(order.phone || ''); setNewOrderSocial(order.social || ''); setNewOrderDeposit(order.deposit || ''); setNewOrderPaymentMethod(order.paymentMethod || 'Efectivo'); setNewOrderDeliveryDate(order.deliveryDate || ''); setOrderItems(order.items || []); setNewOrderGeneralNotes(order.generalNotes || ''); 
      window.scrollTo({ top: 0, behavior: 'smooth' }); showNotification("Editando pedido #" + order.orderId, "info"); 
  };

  const handleCancelOrderEdit = () => { 
      setEditingOrderId(null); setNewOrderId(''); setNewOrderName(''); setNewOrderPhone(''); setNewOrderSocial(''); setNewOrderDeposit(''); setNewOrderDeliveryDate(''); setNewOrderGeneralNotes(''); setOrderItems([]); setCustomDescription(''); setQuantity(''); setCustomItemName(''); setEditingItemIndex(-1); setItemManualMaterials([]);
  };
  
  // --- HANDLERS ADMIN PRODUCTS ---
  const handleSaveProduct = async () => { if (!prodName || !prodPrice) return showNotification("Faltan datos", "error"); const imageUrls = prodImages.split('\n').map(url => url.trim()).filter(url => url !== ''); const mainImageUrl = imageUrls.length > 0 ? imageUrls[0] : 'https://via.placeholder.com/150?text=Sin+Foto'; const productData = { name: prodName, description: prodDescription, customOptions: prodCustomOptions, price: parseFloat(prodPrice), imageUrl: mainImageUrl, imageUrls: imageUrls, seller: prodSeller, category: 'Papelería', updatedAt: serverTimestamp() }; try { if (editingProductId) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', editingProductId), productData); showNotification("Producto actualizado"); } else { productData.createdAt = serverTimestamp(); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), productData); showNotification("Producto agregado"); } setProdName(''); setProdPrice(''); setProdImages(''); setProdDescription(''); setProdCustomOptions(''); setProdSeller('dani'); setEditingProductId(null); } catch (err) { showNotification("Error al guardar", "error"); } };
  const handleEditProduct = (prod) => { setProdName(prod.name); setProdPrice(prod.price); setProdImages(prod.imageUrls ? prod.imageUrls.join('\n') : prod.imageUrl); setProdDescription(prod.description || ''); setProdCustomOptions(prod.customOptions || ''); setProdSeller(prod.seller || 'dani'); setEditingProductId(prod.id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleCancelEdit = () => { setProdName(''); setProdPrice(''); setProdImages(''); setProdDescription(''); setProdCustomOptions(''); setProdSeller('dani'); setEditingProductId(null); };
  const handleDeleteProduct = async (id) => { if(window.confirm("¿Borrar producto?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id)); };
  
  // --- HANDLERS STOCK ---
  const handleSaveStock = async () => {
    if (!stockName || !stockQty) return showNotification("Falta nombre o cantidad", "error");
    let calculatedUnitCost = 0;
    const cost = parseFloat(stockCost) || 0;
    const packQty = parseFloat(stockPackageQty) || 1;
    if (cost > 0 && packQty > 0) { calculatedUnitCost = cost / packQty; }
    
    let finalCode = stockCode.trim();
    if (!finalCode) {
        const prefix = stockName.substring(0, 3).toUpperCase();
        const rand = Math.floor(Math.random() * 1000);
        finalCode = `${prefix}-${rand}`;
    }

    const stockData = {
        name: stockName, code: finalCode, quantity: parseInt(stockQty) || 0, supplier: stockSupplier, totalCost: cost, packageQty: packQty, unitCost: calculatedUnitCost, updatedAt: serverTimestamp()
    };

    try {
        if (editingStockId) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'stock', editingStockId), stockData); showNotification("Stock actualizado"); } else { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'stock'), stockData); showNotification("Stock agregado"); }
        handleCancelStockEdit();
    } catch (e) { showNotification("Error al guardar stock", "error"); }
  };

  const handleEditStock = (item) => {
      setEditingStockId(item.id); setStockName(item.name); setStockCode(item.code || ''); setStockQty(item.quantity); setStockSupplier(item.supplier || ''); setStockCost(item.totalCost || ''); setStockPackageQty(item.packageQty || '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelStockEdit = () => { setEditingStockId(null); setStockName(''); setStockCode(''); setStockQty(''); setStockSupplier(''); setStockCost(''); setStockPackageQty(''); };
  const handleUpdateStockQty = async (item, delta) => { const newQty = Math.max(0, item.quantity + delta); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'stock', item.id), { quantity: newQty, updatedAt: serverTimestamp() }); };
  const handleDeleteStock = async (id) => { if(window.confirm("¿Borrar item de stock?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'stock', id)); };

  // --- HANDLERS COSTOS / RECETAS ---
  const handleAddRecipeItem = () => {
    if (!selectedStockForRecipe || !recipeQty) return showNotification("Selecciona insumo y cantidad", "error");
    const stockItem = stockItems.find(s => s.id === selectedStockForRecipe);
    if (!stockItem) return;
    
    const existing = recipeItems.find(r => r.stockId === stockItem.id);
    if (existing) {
        const updated = recipeItems.map(r => r.stockId === stockItem.id ? { ...r, qty: parseFloat(r.qty) + parseFloat(recipeQty) } : r);
        setRecipeItems(updated);
    } else { setRecipeItems([...recipeItems, { stockId: stockItem.id, qty: parseFloat(recipeQty) }]); }
    setRecipeQty(''); setSelectedStockForRecipe('');
  };

  const handleRemoveRecipeItem = (stockId) => { setRecipeItems(recipeItems.filter(r => r.stockId !== stockId)); };
  const handleSaveRecipe = async () => {
      if (!selectedProductForCost) return showNotification("Selecciona un producto primero", "error");
      try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', selectedProductForCost), { recipe: recipeItems, updatedAt: serverTimestamp() }); showNotification("Receta guardada exitosamente"); } catch (e) { showNotification("Error al guardar receta", "error"); }
  };

  const calculateRecipeTotalCost = () => {
      return recipeItems.reduce((acc, item) => {
          const stockItem = stockItems.find(s => s.id === item.stockId);
          const unitCost = stockItem ? (stockItem.unitCost || 0) : 0;
          return acc + (unitCost * item.qty);
      }, 0);
  };
  const currentRecipeCost = calculateRecipeTotalCost();
  const activeProductForCost = products.find(p => p.id === selectedProductForCost);

  // --- STATUS UPDATE CON LOGICA DE STOCK ---
  const updateStatus = async (order, status) => { 
      // Si el nuevo estado es Ready o Delivered, intentamos descontar stock
      if ((status === 'ready' || status === 'delivered') && !order.stockDeducted) {
          if (window.confirm("¿Cambiar estado y descontar stock automáticamente?")) {
              await handleDeductStock(order, status);
          } else {
              // Solo cambia estado sin descontar
              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id), { status, updatedAt: serverTimestamp() }); 
          }
      } else {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id), { status, updatedAt: serverTimestamp() }); 
      }
  };
  const markAsPaid = async (order) => { if(window.confirm("¿Marcar como pagado?")) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id), { deposit: order.totalPrice, updatedAt: serverTimestamp() }); };
  const deleteOrder = async (id) => { if(window.confirm("¿Seguro?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id)); };
  const addFinishedPhoto = async (order) => { const url = prompt("Pega el link de la foto:"); if (url) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id), { finishedImage: url }); showNotification("¡Foto agregada!"); } };
  const deleteFinishedPhoto = async (order) => { if(window.confirm("¿Borrar foto?")) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id), { finishedImage: '' }); showNotification("Foto eliminada"); } };
  const sendWhatsAppMessage = (order) => { if (!order.phone) return showNotification("Sin teléfono", "error"); const statusText = statusConfig[order.status]?.label || "Actualizado"; const message = `Hola ${order.clientName}! 👋\n\nTe escribimos de Inperu Producciones.\n\nTu pedido #${order.orderId} ha cambiado de estado a: *${statusText}*.\n\nPuedes ver el detalle aquí: ${APP_URL}\n\n¡Muchas gracias!`; window.open(`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank'); };
  const handleAdminLogin = (e) => { e.preventDefault(); if (adminPass === 'Luisana1510++') { setIsAdmin(true); setView('admin_panel'); setAdminPass(''); showNotification("¡Bienvenida!"); } else { showNotification("Clave incorrecta", "error"); } };
  const handleSearch = (e) => { e.preventDefault(); setLoading(true); setTimeout(() => { const res = orders.filter(o => (o.phone?.replace(/\D/g,'').includes(searchQuery.replace(/\D/g,''))) || o.orderId.toLowerCase() === searchQuery.toLowerCase() || o.clientName.toLowerCase().includes(searchQuery.toLowerCase())); if (res.length > 0) { setFoundOrders(res); setView('search_result'); } else { showNotification("No encontrado", "error"); } setLoading(false); }, 600); };

  // FILTRO ADMIN
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = adminSearchQuery === '' || o.clientName.toLowerCase().includes(adminSearchQuery.toLowerCase()) || o.orderId.includes(adminSearchQuery);
      const matchesStatus = adminFilterStatus === 'all' || (adminFilterStatus === 'active' && o.status !== 'delivered') || (adminFilterStatus === 'delivered' && o.status === 'delivered');
      return matchesSearch && matchesStatus;
    });
  }, [orders, adminSearchQuery, adminFilterStatus]);

  // FILTRO STOCK
  const filteredStock = useMemo(() => {
      if (!stockSearch) return stockItems;
      const lower = stockSearch.toLowerCase();
      return stockItems.filter(s => s.name.toLowerCase().includes(lower) || (s.code && s.code.toLowerCase().includes(lower)) || (s.supplier && s.supplier.toLowerCase().includes(lower)));
  }, [stockItems, stockSearch]);

  const statusConfig = { received: { label: 'Recibido', color: 'bg-slate-100 text-slate-600', icon: Clock, progress: 10 }, designing: { label: 'En Diseño', color: 'bg-teal-100 text-teal-700', icon: Palette, progress: 35 }, printing: { label: 'En Producción', color: 'bg-cyan-100 text-cyan-700', icon: Printer, progress: 60 }, assembling: { label: 'Armado/Corte', color: 'bg-yellow-100 text-yellow-700', icon: Scissors, progress: 80 }, ready: { label: 'Listo para Retirar', color: 'bg-green-100 text-green-700', icon: CheckCircle, progress: 100 }, delivered: { label: 'Entregado', color: 'bg-slate-800 text-white', icon: Package, progress: 100 } };
  const formatDate = (timestamp) => { if (!timestamp) return '-'; return new Date(timestamp.seconds * 1000).toLocaleDateString('es-AR'); };
  const getDaysElapsed = (timestamp) => { if (!timestamp) return 0; const diff = new Date() - new Date(timestamp.seconds * 1000); return Math.floor(diff / (1000 * 60 * 60 * 24)); };
  
  // FUNCION FORMATO FECHA INPUT (YYYY-MM-DD)
  const getTodayString = () => new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24"> 
      {enlargedImage && (<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setEnlargedImage(null)}><button className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20"><X size={32}/></button><img src={enlargedImage} alt="Grande" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"/></div>)}
      {viewingProduct && (<ProductDetailModal prod={viewingProduct} onClose={() => setViewingProduct(null)} onAddToCart={(prod) => startWizard(prod)}/>)}
      {wizardState && (<div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"><div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200"><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-xl text-teal-900">{wizardState.product.name}</h3><button onClick={() => setWizardState(null)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button></div><div className="mb-6"><div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-2 py-1 rounded">Paso {wizardState.currentStepIndex + 1} de {wizardState.steps.length}</span></div><h4 className="text-xl font-bold text-slate-800 mb-4 text-center">{wizardState.steps[wizardState.currentStepIndex].title}</h4>{wizardState.showOptions || wizardState.steps[wizardState.currentStepIndex].price === 0 ? (<div><p className="text-sm text-slate-500 mb-3 text-center">Elige una opción:</p><div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto">{wizardState.steps[wizardState.currentStepIndex].options.map((opt, idx) => (<button key={idx} onClick={() => handleWizardAction('SELECT_OPTION', opt)} className="p-3 rounded-xl border-2 border-teal-100 bg-teal-50 text-teal-800 font-bold hover:bg-teal-100 hover:border-teal-300 transition text-center shadow-sm break-words">{opt}</button>))}</div></div>) : (<div className="text-center"><div className="bg-green-50 border border-green-100 p-4 rounded-2xl mb-6"><p className="text-green-800 font-medium mb-1">¿Te gustaría personalizarlo?</p><p className="text-2xl font-bold text-green-600">+${wizardState.steps[wizardState.currentStepIndex].price}</p></div><div className="flex flex-col gap-3"><button onClick={() => handleWizardAction('YES_CUSTOMIZE')} className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-200 flex items-center justify-center gap-2">SÍ, quiero elegir <ArrowRight size={18}/></button><button onClick={() => handleWizardAction('NO_SKIP')} className="w-full bg-white border-2 border-slate-100 text-slate-400 py-3 rounded-xl font-medium hover:border-slate-300 hover:text-slate-600 transition">NO, prefiero la opción estándar</button></div><p className="text-xs text-slate-300 mt-4 italic">*Si eliges NO, avanzaremos al siguiente paso sin costo extra.</p></div>)}</div><div className="pt-4 border-t border-slate-100"><div className="flex gap-1 h-1 mt-2">{wizardState.steps.map((_, idx) => (<div key={idx} className={`flex-1 rounded-full ${idx <= wizardState.currentStepIndex ? 'bg-teal-500' : 'bg-slate-200'}`}></div>))}</div></div></div></div>)}
      {isCartOpen && (<div className="fixed inset-0 z-[80] flex justify-end"><div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div><div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col"><div className="p-4 border-b flex justify-between items-center bg-teal-700 text-white"><h2 className="font-bold text-lg flex items-center gap-2"><ShoppingCart/> Tu Carrito</h2><button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-white/20 rounded"><X/></button></div><div className="flex-1 overflow-y-auto p-4">{cart.length === 0 ? (<div className="text-center py-12 text-slate-400"><ShoppingBag size={48} className="mx-auto mb-4 opacity-20"/><p>Tu carrito está vacío</p><button onClick={() => setIsCartOpen(false)} className="mt-4 text-teal-600 font-bold text-sm hover:underline">Ir a ver productos</button></div>) : (<div className="space-y-4">{cart.map(item => (<div key={item.cartItemId} className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100"><img src={item.imageUrl} className="w-16 h-16 rounded-lg object-cover bg-white"/><div className="flex-1"><p className="font-bold text-sm text-slate-800 line-clamp-1">{item.name}</p>{item.selectedOptions && (<div className="text-xs text-slate-500 mb-1 bg-white p-1.5 rounded border border-slate-200">{item.selectedOptions.split('|').map((opt, i) => <div key={i}>• {opt.trim()}</div>)}</div>)}<p className="text-teal-600 font-bold text-sm">${item.price.toLocaleString()}</p></div><div className="flex items-center gap-2 bg-white rounded-lg border p-1 h-8 self-start"><button onClick={() => updateCartQty(item.cartItemId, -1)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><Minus size={14}/></button><span className="text-sm font-bold w-4 text-center">{item.qty}</span><button onClick={() => updateCartQty(item.cartItemId, 1)} className="p-1 hover:bg-slate-100 rounded text-teal-600"><Plus size={14}/></button></div><button onClick={() => removeFromCart(item.cartItemId)} className="text-red-400 p-2 self-start"><Trash2 size={16}/></button></div>))}</div>)}</div>{cart.length > 0 && (<div className="p-4 border-t bg-slate-50"><div className="flex justify-between items-end mb-4"><span className="text-slate-500">Total Estimado</span><span className="text-2xl font-bold text-teal-800">${cartTotal.toLocaleString()}</span></div><input placeholder="Tu Nombre (Obligatorio)" className="w-full p-3 border rounded-xl mb-3 text-sm border-gray-300" value={clientNameForCart} onChange={(e) => setClientNameForCart(e.target.value)}/><div className="grid grid-cols-2 gap-3"><button onClick={() => sendCartToWhatsapp(LINKS.dani)} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-green-700 shadow-lg shadow-green-200 transition text-sm"><MessageCircle size={20}/> Pedir a DANI</button><button onClick={() => sendCartToWhatsapp(LINKS.ceci)} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-green-700 shadow-lg shadow-green-200 transition text-sm"><MessageCircle size={20}/> Pedir a CECI</button></div></div>)}</div></div>)}

      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-teal-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between relative">
          <div className="flex items-center gap-2 cursor-pointer z-20" onClick={() => {setView('home'); setFoundOrders([]); setSearchQuery('');}}>{view === 'search_result' && (<button onClick={(e) => {e.stopPropagation(); setView('home'); setFoundOrders([]); setSearchQuery('');}} className="mr-1 text-slate-400 hover:text-teal-600 p-1 rounded-full hover:bg-slate-100"><ArrowLeft size={20}/></button>)}<img src={LOGO_URL} alt="Logo" className="w-8 h-8 object-contain" /><h1 className="font-bold text-xl text-teal-800 tracking-tight">INPERU <span className="text-teal-600 font-normal">PRODUCCIONES</span></h1></div>
          <div className="flex items-center gap-2 z-20"><button onClick={() => setIsCartOpen(true)} className="relative p-2 text-teal-700 hover:bg-teal-50 rounded-full transition"><ShoppingCart size={20}/>{cart.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cart.length}</span>}</button><button onClick={() => isAdmin ? setView('home') : setView('admin_login')} className={`transition p-2 rounded-full ${isAdmin ? 'text-red-400 hover:bg-red-50' : 'text-slate-400 hover:text-teal-600 hover:bg-slate-50'}`} title={isAdmin ? "Salir Admin" : "Ingreso Admin"}>{isAdmin ? <LogOut size={16}/> : <Lock size={16}/>}</button></div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 relative z-0">
        {notification && (<div className={`fixed top-20 right-4 px-4 py-3 rounded-lg shadow-lg border-l-4 z-50 ${notification.type === 'error' ? 'bg-white border-red-500 text-red-600' : 'bg-white border-teal-500 text-teal-700'}`}><p className="font-medium text-sm">{notification.msg}</p></div>)}

        {view === 'home' && (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="w-full bg-white rounded-3xl shadow-xl shadow-teal-50/50 p-8 text-center border border-teal-50 relative overflow-hidden mb-12">
              <div className="mb-6 relative z-10"><div className="w-32 h-32 mx-auto bg-white rounded-full shadow-md p-1 flex items-center justify-center border-4 border-teal-50"><img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain rounded-full"/></div></div>
              <h2 className="text-2xl font-bold mb-2 text-teal-900">Seguimiento de Pedidos</h2>
              <p className="text-slate-500 mb-6 text-sm">Ingresa tu número de teléfono para ver el estado.</p>
              <form onSubmit={handleSearch} className="relative z-10 max-w-sm mx-auto"><input type="text" placeholder="Tu teléfono o número de pedido" className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-700 shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/><Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" /><button type="submit" disabled={loading || !searchQuery} className="w-full mt-4 bg-teal-700 hover:bg-teal-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-teal-200">{loading ? 'Buscando...' : 'Consultar Estado'}</button></form>
            </div>
            <div className="mb-16"><div className="flex items-center gap-4 mb-8"><div className="h-px bg-slate-200 flex-1"></div><h3 className="text-xl font-bold text-teal-900 flex items-center gap-2"><ShoppingBag size={20}/> Catálogo Digital</h3><div className="h-px bg-slate-200 flex-1"></div></div>{products.length === 0 ? (<p className="text-center text-slate-400">Cargando productos...</p>) : (<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{products.map(prod => (<ProductCardPublic key={prod.id} prod={prod} onAddToCart={() => startWizard(prod)} onEnlarge={setEnlargedImage} onViewDetails={() => setViewingProduct(prod)} />))}</div>)}</div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-50 text-center"><h3 className="text-sm font-bold text-teal-800 uppercase mb-4">Comunicate y hace tu pedido a INPERU PRODUCCIONES =)</h3><div className="flex justify-center gap-4 mb-6"><a href={LINKS.facebook} target="_blank" rel="noreferrer" className="text-blue-600 bg-blue-50 p-2 rounded-full hover:scale-110 transition"><Facebook size={20}/></a><a href={LINKS.instagram} target="_blank" rel="noreferrer" className="text-pink-600 bg-pink-50 p-2 rounded-full hover:scale-110 transition"><Instagram size={20}/></a></div><div className="flex flex-col sm:flex-row gap-3 justify-center"><a href={getWaLink(LINKS.ceci, "Hola Ceci! 👋 Quiero hacer un pedido.")} target="_blank" className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition">Hablar con CECI</a><a href={getWaLink(LINKS.dani, "Hola Dani! 👋 Quiero hacer un pedido.")} target="_blank" className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition">Hablar con DANI</a></div></div>
          </div>
        )}

        {view === 'search_result' && foundOrders.length > 0 && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 pb-12">
            <h2 className="text-lg font-bold text-slate-800 mb-4 px-2 flex items-center gap-2"><span className="w-2 h-6 bg-teal-600 rounded-full"></span> Hola, {foundOrders[0].clientName} 👋</h2>
            {foundOrders.map((order) => {
                const balance = Math.max(0, (order.totalPrice || 0) - (order.deposit || 0));
                return (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100 mb-8">
                  <div className="bg-slate-800 p-6 text-white flex justify-between items-start"><div><p className="text-teal-400 text-xs uppercase tracking-wider font-bold mb-1">Pedido #{order.orderId}</p><h2 className="text-xl font-bold">{order.clientName}</h2></div><div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusConfig[order.status].color.split(' ')[0]} ${statusConfig[order.status].color.split(' ')[1]}`}>{statusConfig[order.status].label}</div></div>
                  <div className="p-6">
                    {order.finishedImage && (<div className="mb-6 rounded-xl overflow-hidden border-2 border-teal-500 shadow-lg relative group cursor-pointer" onClick={() => setEnlargedImage(order.finishedImage)}><div className="absolute top-0 left-0 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10">¡Tu Pedido Listo! ✨</div><img src={order.finishedImage} alt="Producto Terminado" className="w-full h-auto max-h-96 object-contain bg-slate-50 transition transform group-hover:scale-105"/><div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/10"><div className="bg-white/90 text-slate-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm backdrop-blur-sm"><Maximize2 size={14}/> Ver Foto</div></div></div>)}
                    <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100"><div className="bg-teal-50 p-3 rounded-lg"><ShoppingBag className="text-teal-600 w-6 h-6"/></div><div className="flex-1"><p className="text-sm text-slate-500 mb-1">Detalle</p><div className="text-slate-800 font-medium text-sm">{order.description ? order.description.split('\n').map((line, i) => (<div key={i} className="border-b border-slate-50 last:border-0 py-1">{line}</div>)) : "Sin detalle"}</div></div></div>
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200"><div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-200"><div><p className="text-xs text-slate-400 mb-1">Total</p><p className="font-bold text-slate-700">${(order.totalPrice||0).toLocaleString()}</p></div><div><p className="text-xs text-slate-400 mb-1">Abonado</p><p className="font-bold text-green-600">${(order.deposit||0).toLocaleString()}</p></div><div><p className="text-xs text-slate-400 mb-1">Resta</p><p className={`font-bold ${balance > 0 ? 'text-red-500' : 'text-slate-400'}`}>${balance.toLocaleString()}</p></div></div></div>
                    {order.status !== 'delivered' && (<div className="mb-6"><div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-1000" style={{ width: `${statusConfig[order.status].progress}%` }}></div></div></div>)}
                  </div>
                </div>
             )})}
             <div className="mt-12 mb-12"><div className="flex items-center gap-4 mb-6"><div className="h-px bg-slate-200 flex-1"></div><h3 className="text-lg font-bold text-teal-900">Nuestros Productos</h3><div className="h-px bg-slate-200 flex-1"></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{products.map(prod => (<ProductCardPublic key={prod.id} prod={prod} onAddToCart={() => startWizard(prod)} onEnlarge={setEnlargedImage} onViewDetails={() => setViewingProduct(prod)} />))}</div></div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-50 text-center"><h3 className="text-sm font-bold text-teal-800 uppercase mb-4">Comunicate y hace tu pedido a INPERU PRODUCCIONES =)</h3><div className="flex justify-center gap-4 mb-6"><a href={LINKS.facebook} target="_blank" rel="noreferrer" className="text-blue-600 bg-blue-50 p-2 rounded-full hover:scale-110 transition"><Facebook size={20}/></a><a href={LINKS.instagram} target="_blank" rel="noreferrer" className="text-pink-600 bg-pink-50 p-2 rounded-full hover:scale-110 transition"><Instagram size={20}/></a></div><div className="flex flex-col sm:flex-row gap-3 justify-center"><a href={getWaLink(LINKS.ceci, "Hola Ceci! 👋 Quiero hacer un pedido.")} target="_blank" className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition">Hablar con CECI</a><a href={getWaLink(LINKS.dani, "Hola Dani! 👋 Quiero hacer un pedido.")} target="_blank" className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition">Hablar con DANI</a></div></div>
          </div>
        )}

        {view === 'admin_login' && (<div className="max-w-sm mx-auto pt-12"><button onClick={() => setView('home')} className="mb-6 text-slate-400 flex items-center gap-1"><X size={14}/> Cancelar</button><div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center"><h3 className="font-bold text-lg text-teal-900 mb-6">Hola Inperu Producciones</h3><form onSubmit={handleAdminLogin}><input type="password" placeholder="Contraseña" className="w-full p-3 border bg-white border-slate-200 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500 outline-none text-gray-900" value={adminPass} onChange={(e) => setAdminPass(e.target.value)}/><button className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg hover:bg-slate-900">Ingresar</button></form></div></div>)}

        {view === 'admin_panel' && isAdmin && (
           <div className="animate-in fade-in duration-300">
             <div className="flex gap-4 mb-6 border-b border-slate-200 pb-1 overflow-x-auto">
               <button onClick={() => setAdminTab('orders')} className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 transition ${adminTab === 'orders' ? 'text-teal-700 border-b-2 border-teal-600' : 'text-slate-400'}`}><List size={18}/> Pedidos</button>
               <button onClick={() => setAdminTab('products')} className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 transition ${adminTab === 'products' ? 'text-teal-700 border-b-2 border-teal-600' : 'text-slate-400'}`}><LayoutGrid size={18}/> Productos</button>
               <button onClick={() => setAdminTab('materials')} className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 transition ${adminTab === 'materials' ? 'text-teal-700 border-b-2 border-teal-600' : 'text-slate-400'}`}><Calculator size={18}/> Costos/Recetas</button>
               <button onClick={() => setAdminTab('stock')} className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 transition ${adminTab === 'stock' ? 'text-teal-700 border-b-2 border-teal-600' : 'text-slate-400'}`}><Box size={18}/> Stock</button>
             </div>

             {adminTab === 'materials' && (
                <div>
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                       <h3 className="font-bold text-teal-800 mb-4 flex items-center gap-2"><Calculator size={18}/> Costo por Receta</h3>
                       <p className="text-sm text-slate-500 mb-4">Selecciona un producto y define qué materiales usas para crearlo.</p>
                       
                       <div className="mb-6">
                           <label className="text-xs text-slate-400 block mb-1">Producto a Calcular:</label>
                           <select className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-bold" value={selectedProductForCost} onChange={(e)=>setSelectedProductForCost(e.target.value)}>
                               <option value="">-- Seleccionar Producto --</option>
                               {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                           </select>
                       </div>

                       {selectedProductForCost && (
                           <div className="animate-in fade-in duration-300">
                               <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                                   <div className="flex justify-between items-center mb-2">
                                       <span className="text-slate-600 text-sm">Precio de Venta:</span>
                                       <span className="font-bold text-lg text-slate-800">${activeProductForCost ? activeProductForCost.price.toLocaleString() : 0}</span>
                                   </div>
                                   <div className="flex justify-between items-center mb-2">
                                       <span className="text-slate-600 text-sm">Costo Materiales:</span>
                                       <span className="font-bold text-lg text-red-600">-${currentRecipeCost.toFixed(2)}</span>
                                   </div>
                                   <div className="border-t border-orange-200 pt-2 flex justify-between items-center">
                                       <span className="text-slate-800 font-bold text-sm">Margen / Ganancia:</span>
                                       <span className={`font-bold text-xl ${(activeProductForCost?.price - currentRecipeCost) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                           ${(activeProductForCost ? activeProductForCost.price - currentRecipeCost : 0).toFixed(2)}
                                       </span>
                                   </div>
                               </div>

                               <div className="mb-4">
                                   <h4 className="font-bold text-sm text-slate-700 mb-2">Agregar Material a la Receta:</h4>
                                   <div className="flex gap-2">
                                       <select className="p-3 bg-white border border-gray-300 rounded-lg flex-1 text-gray-900 text-sm" value={selectedStockForRecipe} onChange={(e)=>setSelectedStockForRecipe(e.target.value)}>
                                           <option value="">-- Seleccionar Insumo --</option>
                                           {stockItems.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code}) - ${s.unitCost ? s.unitCost.toFixed(2) : '0'}</option>)}
                                       </select>
                                       <input type="number" placeholder="Cant." className="p-3 bg-white border border-gray-300 rounded-lg w-20 text-gray-900 text-sm" value={recipeQty} onChange={(e)=>setRecipeQty(e.target.value)}/>
                                       <button onClick={handleAddRecipeItem} className="bg-teal-700 text-white px-4 rounded-lg font-bold"><Plus size={18}/></button>
                                   </div>
                               </div>

                               <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                                   <table className="w-full text-sm text-left">
                                       <thead className="bg-slate-100 text-slate-500 font-bold">
                                           <tr>
                                               <th className="p-3">Material</th>
                                               <th className="p-3 text-right">Cant.</th>
                                               <th className="p-3 text-right">Unit.</th>
                                               <th className="p-3 text-right">Subtotal</th>
                                               <th className="p-3"></th>
                                           </tr>
                                       </thead>
                                       <tbody className="divide-y divide-slate-200">
                                           {recipeItems.length === 0 && (
                                               <tr><td colSpan="5" className="p-4 text-center text-slate-400">No hay materiales en la receta.</td></tr>
                                           )}
                                           {recipeItems.map((item, idx) => {
                                               const stockItem = stockItems.find(s => s.id === item.stockId);
                                               const unitCost = stockItem ? (stockItem.unitCost || 0) : 0;
                                               const subtotal = unitCost * item.qty;
                                               return (
                                                   <tr key={idx} className="bg-white">
                                                       <td className="p-3">{stockItem ? stockItem.name : 'Item eliminado'}</td>
                                                       <td className="p-3 text-right">{item.qty}</td>
                                                       <td className="p-3 text-right">${unitCost.toFixed(2)}</td>
                                                       <td className="p-3 text-right font-bold">${subtotal.toFixed(2)}</td>
                                                       <td className="p-3 text-right">
                                                           <button onClick={() => handleRemoveRecipeItem(item.stockId)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                                       </td>
                                                   </tr>
                                               );
                                           })}
                                       </tbody>
                                   </table>
                               </div>
                               
                               <div className="mt-4 flex justify-end">
                                   <button onClick={handleSaveRecipe} className="bg-teal-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-teal-200 hover:bg-teal-700 transition">
                                       <Save size={18}/> Guardar Receta en Producto
                                   </button>
                               </div>
                           </div>
                       )}
                   </div>
                </div>
             )}

             {adminTab === 'stock' && (
               <div>
                 <div className="flex gap-4 mb-4">
                     <div className="flex-1 bg-white border border-slate-200 rounded-lg flex items-center px-3">
                         <Search size={18} className="text-slate-400"/>
                         <input className="w-full p-3 outline-none text-sm" placeholder="Buscar stock por nombre, código o proveedor..." value={stockSearch} onChange={(e) => setStockSearch(e.target.value)}/>
                     </div>
                 </div>

                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                   <h3 className="font-bold text-teal-800 mb-4 flex items-center gap-2">{editingStockId ? <Pencil size={18}/> : <Plus size={18}/>} {editingStockId ? 'Editar Item' : 'Nuevo Item'}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div>
                         <label className="text-xs text-slate-400 block mb-1">Nombre del Material</label>
                         <input placeholder="ej: Resma A4" className="p-3 bg-white border border-gray-300 rounded-lg w-full text-gray-900" value={stockName} onChange={(e)=>setStockName(e.target.value)}/>
                     </div>
                     <div>
                         <label className="text-xs text-slate-400 block mb-1">Código (Opcional - Auto si vacío)</label>
                         <input placeholder="ej: INS-001" className="p-3 bg-white border border-gray-300 rounded-lg w-full text-gray-900" value={stockCode} onChange={(e)=>setStockCode(e.target.value)}/>
                     </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div>
                         <label className="text-xs text-slate-400 block mb-1">Proveedor</label>
                         <input placeholder="Nombre proveedor" className="p-3 bg-white border border-gray-300 rounded-lg w-full text-gray-900" value={stockSupplier} onChange={(e)=>setStockSupplier(e.target.value)}/>
                     </div>
                     <div>
                         <label className="text-xs text-slate-400 block mb-1">Stock Actual (Unidades)</label>
                         <input type="number" placeholder="Cant. Real" className="p-3 bg-white border border-gray-300 rounded-lg w-full text-gray-900" value={stockQty} onChange={(e)=>setStockQty(e.target.value)}/>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div>
                             <label className="text-xs text-slate-400 block mb-1">Costo Compra (Paquete/Bulto)</label>
                             <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-400">$</span>
                                <input type="number" placeholder="8200" className="pl-6 p-3 bg-white border border-gray-300 rounded-lg w-full text-gray-900" value={stockCost} onChange={(e)=>setStockCost(e.target.value)}/>
                             </div>
                        </div>
                        <div>
                             <label className="text-xs text-slate-400 block mb-1">Unidades que trae el Paquete</label>
                             <input type="number" placeholder="500" className="p-3 bg-white border border-gray-300 rounded-lg w-full text-gray-900" value={stockPackageQty} onChange={(e)=>setStockPackageQty(e.target.value)}/>
                        </div>
                        <div className="col-span-2 text-right">
                             <span className="text-xs text-slate-500 mr-2">Costo Unitario Calculado:</span>
                             <span className="font-bold text-lg text-teal-700">
                                 ${(parseFloat(stockCost) > 0 && parseFloat(stockPackageQty) > 0) ? (parseFloat(stockCost)/parseFloat(stockPackageQty)).toFixed(2) : '0.00'}
                             </span>
                        </div>
                   </div>
                   <div className="flex gap-2">
                       <button onClick={handleSaveStock} className="flex-1 bg-teal-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"><Save size={18}/> {editingStockId ? 'Actualizar Stock' : 'Guardar en Stock'}</button>
                       {editingStockId && <button onClick={handleCancelStockEdit} className="bg-slate-200 text-slate-600 px-6 rounded-lg font-bold">Cancelar</button>}
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {filteredStock.map(item => (
                     <div key={item.id} className={`bg-white p-4 rounded-xl border flex flex-col gap-2 relative group ${item.quantity < 5 ? 'border-red-200 bg-red-50' : 'border-slate-100'}`}>
                       <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                           <button onClick={() => handleEditStock(item)} className="p-2 bg-white shadow-sm border rounded-full text-teal-600 hover:bg-teal-50"><Pencil size={14}/></button>
                           <button onClick={() => handleDeleteStock(item.id)} className="p-2 bg-white shadow-sm border rounded-full text-red-500 hover:bg-red-50"><Trash2 size={14}/></button>
                       </div>

                       <div className="flex justify-between items-start pr-16">
                           <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{item.code}</span>
                                    {item.quantity < 5 && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertTriangle size={10}/> Bajo</span>}
                                </div>
                                <p className="font-bold text-slate-800 text-lg leading-tight">{item.name}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Truck size={12}/> {item.supplier || 'Sin proveedor'}</p>
                           </div>
                       </div>
                       
                       <div className="flex justify-between items-end mt-2 pt-3 border-t border-slate-200/50">
                           <div>
                               <p className="text-[10px] text-slate-400 uppercase">Costo Unitario</p>
                               <p className="font-bold text-teal-600">${item.unitCost ? item.unitCost.toFixed(2) : '0.00'}</p>
                           </div>
                           <div className="flex items-center gap-3">
                              <button onClick={() => handleUpdateStockQty(item, -1)} className="p-1 bg-white border rounded hover:bg-slate-50 text-red-500"><Minus size={14}/></button>
                              <span className="font-bold w-8 text-center text-lg text-slate-700">{item.quantity}</span>
                              <button onClick={() => handleUpdateStockQty(item, 1)} className="p-1 bg-white border rounded hover:bg-slate-50 text-green-500"><Plus size={14}/></button>
                           </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {adminTab === 'products' && (<div><div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6"><h3 className="font-bold text-teal-800 mb-4 flex items-center gap-2">{editingProductId ? <><Pencil size={18}/> Editar Producto</> : <><Plus size={18}/> Agregar Producto</>}</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><input placeholder="Nombre" className="p-3 bg-white border border-gray-300 rounded-lg w-full text-gray-900 placeholder-gray-400" value={prodName} onChange={(e)=>setProdName(e.target.value)}/><input type="number" placeholder="Precio" className="p-3 bg-white border border-gray-300 rounded-lg w-full text-gray-900 placeholder-gray-400" value={prodPrice} onChange={(e)=>setProdPrice(e.target.value)}/><div className="md:col-span-2"><label className="text-xs text-slate-500 font-bold ml-1 mb-1 flex items-center gap-1"><Settings2 size={12}/> Opciones de Personalización (Paso a Paso)</label><p className="text-[10px] text-slate-400 mb-2 ml-1">Escribe bloques separados por doble ENTER. Formato: Título (+Precio Extra) y abajo las opciones.</p><textarea placeholder="Ejemplo:&#10;Color de Esferas (+100)&#10;Blanca, Verde, Roja&#10;&#10;Caja Personalizada (+300)&#10;Stitch, Grinch" className="p-3 bg-white border border-gray-300 rounded-lg w-full text-gray-900 placeholder-gray-400 h-40 resize-y font-mono text-sm" value={prodCustomOptions} onChange={(e)=>setProdCustomOptions(e.target.value)}/></div><textarea placeholder="Descripción del producto (lo que trae, medidas, etc.)" className="p-3 bg-white border border-gray-300 rounded-lg w-full col-span-2 text-gray-900 placeholder-gray-400 h-20 resize-y" value={prodDescription} onChange={(e)=>setProdDescription(e.target.value)}/><textarea placeholder="URLs de Imágenes (una por línea). La primera será la principal." className="p-3 bg-white border border-gray-300 rounded-lg w-full col-span-2 text-gray-900 placeholder-gray-400 h-24 resize-y" value={prodImages} onChange={(e)=>setProdImages(e.target.value)}/><div className="mt-4 flex items-center gap-2 md:col-span-2"><label className="text-xs text-slate-500 font-bold flex items-center gap-1"><User size={12}/> ¿Quién vende?</label><select className="p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 outline-none" value={prodSeller} onChange={(e) => setProdSeller(e.target.value)}><option value="dani">Dani</option><option value="ceci">Ceci</option></select></div></div><div className="flex gap-2"><button onClick={handleSaveProduct} className="bg-teal-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Save size={18}/> {editingProductId ? 'Actualizar' : 'Guardar'}</button>{editingProductId && <button onClick={handleCancelEdit} className="bg-slate-200 text-slate-600 px-6 py-2 rounded-lg font-bold">Cancelar</button>}</div></div><div className="grid grid-cols-2 gap-4">{products.length === 0 ? <p className="col-span-2 text-center text-slate-400">No hay productos cargados.</p> : products.map(p => (<div key={p.id} className="bg-white p-3 rounded-xl border shadow-sm relative group"><img src={p.imageUrl} className="w-full aspect-square object-cover rounded-lg mb-2 cursor-pointer hover:opacity-90 transition" alt={p.name} onClick={() => setEnlargedImage(p.imageUrl)}/>{p.imageUrls && p.imageUrls.length > 1 && <div className="absolute top-4 left-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1"><Images size={12}/> {p.imageUrls.length}</div>}<p className="font-bold text-gray-900">{p.name}</p><p className="text-teal-600 font-bold">${p.price.toLocaleString()}</p><div className="absolute bottom-2 left-2 bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded-full border border-slate-200 uppercase font-bold">{p.seller || 'dani'}</div><div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition"><button onClick={() => handleEditProduct(p)} className="bg-white p-1 rounded-full shadow text-teal-600 hover:bg-teal-50"><Pencil size={14}/></button><button onClick={() => handleDeleteProduct(p.id)} className="bg-white p-1 rounded-full shadow text-red-500 hover:bg-red-50"><Trash2 size={14}/></button></div></div>))}</div></div>)}

             {adminTab === 'orders' && (
               <div>
                 <div className="flex flex-col md:flex-row gap-4 mb-6"><div className="flex-1"><div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200"><Search size={20} className="text-slate-400"/><input placeholder="Buscar pedido (Nombre o ID)..." className="w-full outline-none text-sm" value={adminSearchQuery} onChange={(e) => setAdminSearchQuery(e.target.value)}/></div></div><div className="flex gap-2 overflow-x-auto pb-2 md:pb-0"><button onClick={() => setAdminFilterStatus('all')} className={`px-4 py-2 rounded-lg text-sm font-bold border transition whitespace-nowrap ${adminFilterStatus === 'all' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-500 border-slate-200'}`}>Todos</button><button onClick={() => setAdminFilterStatus('active')} className={`px-4 py-2 rounded-lg text-sm font-bold border transition whitespace-nowrap ${adminFilterStatus === 'active' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-500 border-slate-200'}`}>Pendientes</button><button onClick={() => setAdminFilterStatus('delivered')} className={`px-4 py-2 rounded-lg text-sm font-bold border transition whitespace-nowrap ${adminFilterStatus === 'delivered' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-500 border-slate-200'}`}>Entregados</button></div></div>
                 <div className="grid grid-cols-2 gap-4 mb-6"><div className="bg-teal-700 p-4 rounded-xl text-white"><p className="text-xs opacity-70 uppercase">Cobrado</p><h3 className="text-2xl font-bold">${financials.totalRevenue.toLocaleString()}</h3></div><div className="bg-white border p-4 rounded-xl"><p className="text-xs text-slate-400 uppercase">Por Cobrar</p><h3 className="text-2xl font-bold text-red-500">${financials.totalPending.toLocaleString()}</h3></div></div>

                 <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-teal-100">
                    <h3 className="font-bold text-teal-700 mb-4 flex items-center gap-2">{editingOrderId ? <><Pencil size={20}/> Editando Pedido #{newOrderId}</> : "Nuevo Pedido"}</h3>
                    {customerHistory.count > 0 && !editingOrderId && <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm font-bold">¡Cliente Frecuente! {customerHistory.count} compras previas.</div>}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"><input value={newOrderId} readOnly className="p-3 bg-gray-100 border border-gray-300 rounded-lg text-center font-bold text-gray-900"/><input placeholder="Teléfono" value={newOrderPhone} onChange={(e)=>setNewOrderPhone(e.target.value)} className="p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400"/><input placeholder="Nombre" value={newOrderName} onChange={(e)=>setNewOrderName(e.target.value)} className="p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400"/></div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
                       <h4 className="font-bold text-sm text-slate-600 mb-2">{editingItemIndex >= 0 ? `Editando Item #${editingItemIndex + 1}` : 'Agregar Item'}</h4>
                       <div className="flex flex-col md:flex-row gap-2 mb-2">
                          <select className="p-2 border bg-white rounded-lg flex-1 text-gray-900 border-gray-300" value={selectedProduct} onChange={(e)=>setSelectedProduct(e.target.value)}><option value="custom">Personalizado / Item Manual</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
                          {selectedProduct === 'custom' && <input placeholder="Nombre del Producto Manual" className="p-2 bg-white border border-gray-300 rounded-lg flex-1 text-gray-900" value={customItemName} onChange={(e)=>setCustomItemName(e.target.value)}/>}
                          <input type="number" className="p-2 bg-white border border-gray-300 rounded-lg w-20 text-gray-900 text-center" placeholder="Cant" value={quantity} onChange={(e)=>setQuantity(e.target.value)}/>
                          <input type="number" className="p-2 bg-white border border-gray-300 rounded-lg w-24 text-gray-900" placeholder="Precio" value={unitPrice} onChange={(e)=>setUnitPrice(e.target.value)}/>
                          <button onClick={handleAddOrUpdateItem} className={`text-white p-2 rounded-lg flex items-center justify-center ${editingItemIndex >= 0 ? 'bg-orange-500 hover:bg-orange-600' : 'bg-teal-600 hover:bg-teal-700'}`}>{editingItemIndex >= 0 ? <Save size={20}/> : <Plus size={20}/>}</button>
                       </div>
                       
                       <div className="mb-4 bg-white p-3 border border-orange-100 rounded-lg">
                           <p className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1"><Box size={12}/> Consumo de Stock (Opcional)</p>
                           <div className="flex gap-2 mb-2">
                               <select className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded text-xs" value={selectedStockForManual} onChange={(e)=>setSelectedStockForManual(e.target.value)}>
                                   <option value="">- Agregar Material a Descontar -</option>
                                   {stockItems.map(s => <option key={s.id} value={s.id}>{s.name} ({s.quantity} disp.)</option>)}
                               </select>
                               <input type="number" placeholder="Cant" className="w-16 p-2 bg-slate-50 border border-slate-200 rounded text-xs" value={manualQty} onChange={(e)=>setManualQty(e.target.value)}/>
                               <button onClick={handleAddManualMaterial} className="p-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"><Plus size={14}/></button>
                           </div>
                           <div className="flex flex-wrap gap-2">
                               {itemManualMaterials.map((mat, idx) => (
                                   <span key={idx} className="text-xs bg-orange-50 text-orange-800 px-2 py-1 rounded border border-orange-100 flex items-center gap-1">
                                       {mat.qty} x {mat.name} <button onClick={()=>handleRemoveManualMaterial(idx)} className="text-orange-400 hover:text-red-500 ml-1"><X size={10}/></button>
                                   </span>
                               ))}
                           </div>
                       </div>

                       <textarea placeholder="Detalle..." className="w-full p-2 bg-white border border-gray-300 rounded-lg mb-2 text-gray-900 placeholder-gray-400 resize-y h-20" value={customDescription} onChange={(e)=>setCustomDescription(e.target.value)}/>
                       
                       <div className="space-y-1 mt-4">
                           {orderItems.map((i, index) => (
                               <div key={i.id} className={`flex justify-between items-center text-sm border-b py-2 px-2 rounded ${editingItemIndex === index ? 'bg-orange-50 border-orange-200' : 'border-slate-100 hover:bg-white'}`}>
                                   <div className="flex-1">
                                       <span className="font-bold">{i.quantity} x {i.name}</span>
                                       {i.description && <span className="text-slate-500 text-xs block truncate max-w-xs">{i.description}</span>}
                                       {i.manualMaterials && i.manualMaterials.length > 0 && (
                                           <div className="flex gap-1 mt-1">
                                               {i.manualMaterials.map((m, k) => <span key={k} className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded">{m.qty} {m.name}</span>)}
                                           </div>
                                       )}
                                   </div>
                                   <div className="flex items-center gap-3">
                                       <span className="font-bold text-slate-700">${i.subtotal}</span>
                                       <div className="flex gap-1">
                                            <button onClick={()=>handleEditItemInList(index)} className="text-slate-400 hover:text-orange-500 p-1"><Pencil size={16}/></button>
                                            <button onClick={()=>handleRemoveItem(index)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                                       </div>
                                   </div>
                               </div>
                           ))}
                       </div>
                       <div className="text-right font-bold mt-4 text-lg text-gray-900 border-t pt-2">Total: ${calculateGrandTotal()}</div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-end items-start gap-4">
                       <div className="w-full md:w-auto flex-1">
                           <label className="text-xs text-slate-400 block mb-1">Notas Generales del Pedido:</label>
                           <textarea className="w-full p-2 border rounded bg-white text-sm h-20 resize-none" placeholder="Aclaraciones generales..." value={newOrderGeneralNotes} onChange={(e)=>setNewOrderGeneralNotes(e.target.value)}></textarea>
                       </div>
                       <div className="flex flex-col gap-4">
                           <div className="flex items-center gap-4">
                              <label className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={12}/> Entrega:</label>
                              <input type="date" className="p-2 border rounded bg-white text-sm" value={newOrderDeliveryDate} onChange={(e)=>setNewOrderDeliveryDate(e.target.value)} />
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">Pago:</span>
                              <select className="p-2 border rounded bg-white text-sm" value={newOrderPaymentMethod} onChange={(e)=>setNewOrderPaymentMethod(e.target.value)}><option value="Efectivo">Efectivo</option><option value="Transferencia">Transferencia</option></select>
                           </div>
                           <div className="text-right flex items-center gap-2"><span className="text-xs text-slate-400">Seña:</span><input type="number" className="p-2 border bg-white border-gray-300 rounded w-24 font-bold text-green-600" value={newOrderDeposit} onChange={(e)=>setNewOrderDeposit(e.target.value)}/></div>
                           {editingOrderId ? (<><button onClick={handleCancelOrderEdit} className="bg-slate-200 text-slate-600 px-6 py-2 rounded-lg font-bold flex items-center gap-2 justify-center"><RotateCcw size={18}/> Cancelar</button><button onClick={handleSaveOrder} className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 justify-center"><Save size={18}/> Guardar Cambios</button></>) : (<button onClick={handleSaveOrder} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold">Crear Pedido</button>)}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    {filteredOrders.length === 0 ? (<p className="text-center text-slate-400 py-10">No se encontraron pedidos.</p>) : (
                       filteredOrders.map(o => {
                        const total = o.totalPrice || 0;
                        const paid = o.deposit || 0;
                        const balance = Math.max(0, total - paid);
                        const daysElapsed = getDaysElapsed(o.createdAt);
                        const isLate = daysElapsed > 7 && o.status !== 'delivered';

                        return (
                          <div key={o.id} className="bg-white p-4 rounded-xl border shadow-sm relative">
                             <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2"><span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">#{o.orderId}</span><h4 className="font-bold text-lg text-gray-900">{o.clientName}</h4>{o.social && <span className="text-xs text-teal-600 flex items-center gap-0.5"><Instagram size={10}/>{o.social}</span>}</div>
                                <div className="text-right">
                                   <p className="font-bold text-lg text-slate-800">${total.toLocaleString()}</p>
                                   <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                                      <Calendar size={10}/> {o.deliveryDate ? `Entrega: ${formatDateString(o.deliveryDate)}` : `Creado: ${formatDate(o.createdAt)}`} 
                                      {isLate && <AlertTriangle size={10} className="text-red-500"/>}
                                   </div>
                                </div>
                             </div>
                             <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3 bg-slate-50 p-2 rounded border border-slate-100"><div><span className="block text-slate-400">Total</span> <b>${total}</b></div><div><span className="block text-slate-400">Pagado ({o.paymentMethod || 'Efec.'})</span> <b className="text-green-600">${paid}</b></div><div><span className="block text-slate-400">Saldo</span> <b className={balance>0?'text-red-500':'text-slate-300'}>${balance}</b></div></div>
                             
                             <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
                                {o.description && o.description.split('\n').map((line, i) => (
                                    <div key={i} className={`py-1 ${line.startsWith('Nota:') ? 'mt-2 pt-2 border-t border-slate-200 font-bold text-slate-500 text-xs italic' : 'border-b border-slate-200 last:border-0'}`}>
                                        {line.startsWith('Nota:') ? line : (
                                            <div className="flex items-start gap-2">
                                                <span className="text-teal-500 mt-1">•</span>
                                                <span>{line}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                             </div>

                             <div className="flex flex-wrap gap-2 items-center">
                                <button onClick={()=>handleEditOrder(o)} className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-teal-50 hover:text-teal-600" title="Editar Pedido"><Pencil size={18}/></button>
                                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                {Object.keys(statusConfig).map(k => k !== 'delivered' && (
                                    <button key={k} onClick={()=>updateStatus(o, k)} className={`p-2 rounded-lg ${o.status===k ? 'bg-teal-600 text-white':'bg-slate-100 text-slate-400'}`}>{statusConfig[k].label}</button>
                                ))} 
                                <button onClick={()=>updateStatus(o, 'delivered')} className={`p-2 rounded-lg flex items-center gap-1 ${o.status==='delivered'?'bg-slate-800 text-white':'bg-slate-100 text-slate-600'}`}>
                                    {o.stockDeducted && <ClipboardList size={14} className="text-green-400"/>} Entregar
                                </button>
                                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                <button onClick={()=>deleteFinishedPhoto(o)} className={`p-2 rounded-lg border ${o.finishedImage ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'hidden'}`} title="Borrar foto"><Trash2 size={18}/></button>
                                <button onClick={()=>addFinishedPhoto(o)} className={`p-2 rounded-lg border ${o.finishedImage ? 'bg-teal-50 text-teal-600 border-teal-200' : 'bg-white text-slate-400 border-slate-200'}`} title="Agregar foto producto terminado"><Camera size={18}/></button>
                                <button onClick={()=>sendWhatsAppMessage(o)} className="bg-green-50 text-green-600 border border-green-200 p-2 rounded-lg hover:bg-green-100" title="Enviar aviso por WhatsApp"><Send size={18}/></button>
                                {balance > 0 && <button onClick={()=>markAsPaid(o)} className="bg-yellow-50 text-yellow-600 border border-yellow-200 p-2 rounded-lg" title="Saldar deuda"><Banknote size={18}/></button>}
                                <button onClick={()=>deleteOrder(o.id)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                             </div>
                          </div>
                       );
                    })
                    )}
                 </div>
               </div>
             )}
           </div>
        )}
      </main>
      {cart.length > 0 && !isCartOpen && (<button onClick={() => setIsCartOpen(true)} className="fixed bottom-6 right-6 bg-teal-600 text-white p-4 rounded-full shadow-xl shadow-teal-200 animate-in slide-in-from-bottom-10 hover:scale-110 transition z-40 flex items-center gap-2"><ShoppingCart size={24}/><span className="font-bold">${cartTotal.toLocaleString()}</span></button>)}
    </div>
  );
}