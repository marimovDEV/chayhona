import { useState, useEffect, FormEvent } from 'react';
import {
  Plus, X, Edit3, Trash2, Search, Check, ChefHat,
  Tag, DollarSign, TrendingUp, AlertTriangle, Package
} from 'lucide-react';
import { MenuCategory, MenuItem, RecipeItem, WarehouseItem } from '../types';
import {
  fetchMenuCategories, createMenuCategory, updateMenuCategory, deleteMenuCategory,
  fetchMenuItems, createMenuItem, updateMenuItem, deleteMenuItem,
  addRecipe, updateRecipe, deleteRecipe
} from '../api';

interface MenuViewProps {
  warehouseItems: WarehouseItem[];
}

export default function MenuView({ warehouseItems }: MenuViewProps) {
  // Data
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [recipeTarget, setRecipeTarget] = useState<MenuItem | null>(null);

  // Form states
  const [catName, setCatName] = useState('');
  const [catOrder, setCatOrder] = useState(0);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemPrice, setItemPrice] = useState(0);
  const [itemDesc, setItemDesc] = useState('');
  const [itemAvailable, setItemAvailable] = useState(true);

  // Recipe form
  const [recipeIngredient, setRecipeIngredient] = useState('');
  const [recipeQty, setRecipeQty] = useState('');
  const [useGrams, setUseGrams] = useState(false);

  // UI
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'menu' | 'foodcost'>('menu');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = async () => {
    try {
      const cats = await fetchMenuCategories();
      setCategories(cats);
      const items = await fetchMenuItems();
      setMenuItems(items);
    } catch (err) {
      console.error('Menu load error', err);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Filtered items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // === CATEGORY CRUD ===
  const handleSaveCategory = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateMenuCategory(editingCategory.id, catName, catOrder);
        showToast('Kategoriya yangilandi!');
      } else {
        await createMenuCategory(catName, catOrder);
        showToast('Yangi kategoriya qo\'shildi!');
      }
      setShowCategoryModal(false);
      setCatName(''); setCatOrder(0); setEditingCategory(null);
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.name?.[0] || 'Xatolik!');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Bu kategoriyani o\'chirmoqchimisiz?')) return;
    try {
      await deleteMenuCategory(id);
      showToast('Kategoriya o\'chirildi');
      loadData();
    } catch (err) { alert('Xatolik!'); }
  };

  // === MENU ITEM CRUD ===
  const handleSaveItem = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, {
          name: itemName, category: itemCategory,
          selling_price: itemPrice, is_available: itemAvailable, description: itemDesc
        });
        showToast('Menyu elementi yangilandi!');
      } else {
        await createMenuItem({
          name: itemName, category: itemCategory,
          selling_price: itemPrice, description: itemDesc
        });
        showToast('Yangi menyu elementi qo\'shildi!');
      }
      setShowItemModal(false);
      resetItemForm();
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.name?.[0] || 'Xatolik!');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Bu menyu elementini o\'chirmoqchimisiz?')) return;
    try {
      await deleteMenuItem(id);
      showToast('Menyu elementi o\'chirildi');
      loadData();
    } catch (err) { alert('Xatolik!'); }
  };

  const resetItemForm = () => {
    setItemName(''); setItemCategory(''); setItemPrice(0); setItemDesc(''); setItemAvailable(true); setEditingItem(null);
  };

  const openEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemPrice(item.sellingPrice);
    setItemDesc(item.description);
    setItemAvailable(item.isAvailable);
    setShowItemModal(true);
  };

  // === RECIPE CRUD ===
  const handleAddRecipe = async (e: FormEvent) => {
    e.preventDefault();
    if (!recipeTarget || !recipeIngredient || !recipeQty) return;
    const qtyValue = parseFloat(recipeQty);
    if (isNaN(qtyValue) || qtyValue <= 0) {
      alert("Iltimos, to'g'ri miqdor kiriting");
      return;
    }

    const selectedItem = warehouseItems.find(w => w.id === recipeIngredient);
    const isWeightOrLiquid = selectedItem?.unit === 'kg' || selectedItem?.unit === 'litr';
    const finalQty = (isWeightOrLiquid && useGrams) ? qtyValue / 1000 : qtyValue;

    try {
      await addRecipe(recipeTarget.id, recipeIngredient, finalQty);
      showToast('Ingredient qo\'shildi!');
      setRecipeIngredient('');
      setRecipeQty('');
      setUseGrams(false);
      loadData();
    } catch (err: any) {
      alert(err?.response?.data?.non_field_errors?.[0] || err?.response?.data?.ingredient?.[0] || 'Xatolik!');
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      await deleteRecipe(recipeId);
      showToast('Ingredient o\'chirildi');
      loadData();
    } catch (err) { alert('Xatolik!'); }
  };

  // Refresh recipe target when data reloads
  useEffect(() => {
    if (recipeTarget) {
      const updated = menuItems.find(m => m.id === recipeTarget.id);
      if (updated) setRecipeTarget(updated);
    }
  }, [menuItems]);

  const formatMoney = (n: number) => n.toLocaleString('uz-UZ');

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Toast */}
      {notification && (
        <div className="fixed top-5 right-5 bg-sky-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg shadow-sky-500/20 z-50 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-sky-400" />
            Menyu boshqaruvi
          </h2>
          <p className="text-xs text-slate-400 mt-1">Kategoriyalar, menyu elementlari va retseptlar</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('menu')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${viewMode === 'menu' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            Menyu
          </button>
          <button
            onClick={() => setViewMode('foodcost')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${viewMode === 'foodcost' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            Texnologik karta
          </button>
        </div>
      </div>

      {viewMode === 'menu' ? (
        <>
          {/* Categories Bar */}
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${activeCategory === 'all' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/10' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700'}`}
            >
              Barchasi ({menuItems.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${activeCategory === cat.id ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/10' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700'}`}
              >
                {cat.name} ({cat.itemsCount})
              </button>
            ))}
            <button
              onClick={() => { setEditingCategory(null); setCatName(''); setCatOrder(categories.length); setShowCategoryModal(true); }}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Kategoriya
            </button>
          </div>

          {/* Search + Add Item */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Menyu elementlarini qidirish..."
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>
            <button
              onClick={() => { resetItemForm(); setShowItemModal(true); }}
              className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-sky-500/10"
            >
              <Plus className="w-4 h-4" /> Yangi element
            </button>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:border-sky-500/30 transition group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded-full font-semibold mt-1 inline-block">{item.categoryName}</span>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => { setRecipeTarget(item); setShowRecipeModal(true); }} className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition" title="Retsept">
                      <ChefHat className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => openEditItem(item)} className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg hover:bg-sky-500/20 transition" title="Tahrirlash">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition" title="O'chirish">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-black text-white">{formatMoney(item.sellingPrice)} <span className="text-[10px] text-slate-400">UZS</span></span>
                  {!item.isAvailable && <span className="text-[10px] px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-full font-bold">Mavjud emas</span>}
                </div>

                {/* Mini food cost info */}
                {item.recipes.length > 0 && (
                  <div className="bg-slate-900/50 rounded-xl p-3 space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Tannarx:</span>
                      <span className="text-amber-400 font-bold">{formatMoney(item.foodCost)} UZS</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Foyda:</span>
                      <span className="text-emerald-400 font-bold">{formatMoney(item.profitPerItem)} UZS</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Food Cost %:</span>
                      <span className={`font-bold ${item.foodCostPercent > 35 ? 'text-rose-400' : item.foodCostPercent > 25 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {item.foodCostPercent}%
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {item.recipes.length} ta ingredient
                    </div>
                  </div>
                )}

                {item.recipes.length === 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] text-amber-400 font-semibold">Retsept belgilanmagan</span>
                  </div>
                )}
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="col-span-3 text-center py-16 text-slate-500">
                <ChefHat className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p className="text-sm font-semibold">Menyu elementlari topilmadi</p>
                <p className="text-xs mt-1">Yangi element qo'shing yoki qidiruv so'zini o'zgartiring</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* FOOD COST VIEW */
        <div className="space-y-4">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-900/60 text-slate-400 uppercase tracking-wider">
                  <th className="text-left py-3 px-4 font-bold">Nomi</th>
                  <th className="text-left py-3 px-4 font-bold">Kategoriya</th>
                  <th className="text-right py-3 px-4 font-bold">Sotuv narxi</th>
                  <th className="text-right py-3 px-4 font-bold">Tannarx</th>
                  <th className="text-right py-3 px-4 font-bold">Foyda</th>
                  <th className="text-right py-3 px-4 font-bold">Food Cost %</th>
                  <th className="text-center py-3 px-4 font-bold">Ingredientlar</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.filter(i => i.recipes.length > 0).map(item => (
                  <tr key={item.id} className="border-t border-slate-700/30 hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-bold text-white">{item.name}</td>
                    <td className="py-3 px-4 text-slate-400">{item.categoryName}</td>
                    <td className="py-3 px-4 text-right text-white font-semibold">{formatMoney(item.sellingPrice)}</td>
                    <td className="py-3 px-4 text-right text-amber-400 font-semibold">{formatMoney(item.foodCost)}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold">{formatMoney(item.profitPerItem)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-bold ${item.foodCostPercent > 35 ? 'text-rose-400' : item.foodCostPercent > 25 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {item.foodCostPercent}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">{item.recipes.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === CATEGORY MODAL === */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-white text-sm">{editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kategoriya nomi *</label>
                <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} required placeholder="Masalan: Kaboblar"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tartib raqami</label>
                <input type="number" value={catOrder} onChange={(e) => setCatOrder(parseInt(e.target.value) || 0)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 font-bold text-xs text-white rounded-xl transition shadow-lg shadow-sky-500/10">
                {editingCategory ? 'Saqlash' : 'Qo\'shish'}
              </button>
            </form>
            {editingCategory && (
              <button onClick={() => { handleDeleteCategory(editingCategory.id); setShowCategoryModal(false); }}
                className="w-full mt-2 py-2 text-rose-400 text-xs font-bold hover:bg-rose-500/10 rounded-xl transition">
                O'chirish
              </button>
            )}
          </div>
        </div>
      )}

      {/* === MENU ITEM MODAL === */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-white text-sm">{editingItem ? 'Elementni tahrirlash' : 'Yangi menyu elementi'}</h3>
              <button onClick={() => { setShowItemModal(false); resetItemForm(); }} className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nomi *</label>
                <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} required placeholder="Masalan: Shashlik"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kategoriya *</label>
                <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} required
                  className="w-full text-xs px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-white">
                  <option value="">Tanlang</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sotuv narxi (UZS) *</label>
                <input type="number" value={itemPrice} onChange={(e) => setItemPrice(parseInt(e.target.value) || 0)} required min="0"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Izoh</label>
                <input type="text" value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} placeholder="Ixtiyoriy"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition" />
              </div>
              {editingItem && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-semibold">Mavjudligi</span>
                  <button type="button" onClick={() => setItemAvailable(!itemAvailable)}
                    className={`w-11 h-6 rounded-full transition relative ${itemAvailable ? 'bg-sky-500' : 'bg-slate-700'}`}>
                    <span className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${itemAvailable ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              )}
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 font-bold text-xs text-white rounded-xl transition shadow-lg shadow-sky-500/10">
                {editingItem ? 'Saqlash' : 'Qo\'shish'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* === RECIPE MODAL === */}
      {showRecipeModal && recipeTarget && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-slate-700/60 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-sky-400" />
                  Retsept: {recipeTarget.name}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Sotuv narxi: {formatMoney(recipeTarget.sellingPrice)} UZS</p>
              </div>
              <button onClick={() => { setShowRecipeModal(false); setRecipeTarget(null); }} className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>

            {/* Existing recipes */}
            {recipeTarget.recipes.length > 0 && (
              <div className="space-y-2 mb-5">
                <h4 className="text-xs font-bold text-slate-300">Ingredientlar</h4>
                {recipeTarget.recipes.map(recipe => (
                  <div key={recipe.id} className="flex items-center justify-between bg-slate-900/50 rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-xs text-white font-semibold">{recipe.ingredientName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-300">{recipe.quantity} {recipe.ingredientUnit}</span>
                      <span className="text-xs text-amber-400 font-semibold">{formatMoney(recipe.cost)} UZS</span>
                      <button onClick={() => handleDeleteRecipe(recipe.id)} className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <div className="bg-slate-800/60 rounded-xl p-3 mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Jami tannarx:</span>
                    <span className="text-amber-400 font-bold">{formatMoney(recipeTarget.foodCost)} UZS</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Foyda:</span>
                    <span className="text-emerald-400 font-bold">{formatMoney(recipeTarget.profitPerItem)} UZS</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Food Cost %:</span>
                    <span className={`font-bold ${recipeTarget.foodCostPercent > 35 ? 'text-rose-400' : recipeTarget.foodCostPercent > 25 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {recipeTarget.foodCostPercent}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Add new ingredient */}
            <form onSubmit={handleAddRecipe} className="space-y-3 pt-4 border-t border-slate-700/50">
              <h4 className="text-xs font-bold text-slate-300">Yangi ingredient qo'shish</h4>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Ombor mahsuloti</label>
                <select 
                  value={recipeIngredient} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setRecipeIngredient(val);
                    setRecipeQty('');
                    const selected = warehouseItems.find(w => w.id === val);
                    setUseGrams(selected?.unit === 'kg' || selected?.unit === 'litr');
                  }} 
                  required
                  className="w-full text-xs px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-white"
                >
                  <option value="">Tanlang</option>
                  {warehouseItems.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.unit}) — {formatMoney(w.purchasePrice)} UZS/{w.unit}</option>
                  ))}
                </select>
              </div>

              {(() => {
                const selectedWarehouseItem = warehouseItems.find(w => w.id === recipeIngredient);
                const isWeightOrLiquid = selectedWarehouseItem?.unit === 'kg' || selectedWarehouseItem?.unit === 'litr';
                const displayUnit = isWeightOrLiquid && useGrams 
                  ? (selectedWarehouseItem?.unit === 'kg' ? 'gramm' : 'ml') 
                  : (selectedWarehouseItem?.unit || 'birlik');

                return (
                  <>
                    {isWeightOrLiquid && (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          id="useGramsCheckbox"
                          checked={useGrams}
                          onChange={(e) => {
                            setUseGrams(e.target.checked);
                            setRecipeQty('');
                          }}
                          className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900/60 text-sky-500 focus:ring-0 focus:ring-offset-0"
                        />
                        <label htmlFor="useGramsCheckbox" className="text-[10px] text-slate-300 font-semibold cursor-pointer select-none">
                          Miqdorni {selectedWarehouseItem?.unit === 'kg' ? 'gramm (gr)' : 'millilitr (ml)'}da kiritish
                        </label>
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Miqdor ({displayUnit}da) *
                      </label>
                      <input 
                        type="text" 
                        inputMode="decimal"
                        value={recipeQty} 
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                            setRecipeQty(val);
                          }
                        }} 
                        required 
                        placeholder={
                          isWeightOrLiquid && useGrams
                            ? `Masalan: 150 (150 gr = 0.15 kg)`
                            : `Masalan: ${selectedWarehouseItem?.unit === 'kg' ? '0.15 (150 gr)' : '0.2 (200 ml)'}`
                        }
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition" 
                      />
                    </div>
                  </>
                );
              })()}
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 font-bold text-xs text-white rounded-xl transition shadow-lg shadow-emerald-500/10">
                Ingredient qo'shish
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
