import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { Trash2, Edit3, UserPlus, ClipboardList, RefreshCw } from 'lucide-react';

const API_URL = "xxxx.xxxx.xxxx.xxxx";

function App() {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({ sicilNo: '', ad: '', soyad: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. VERİLERİ ÇEK (GET)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (error) {
      toast.error("Veriler çekilemedi. API açık mı?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. KAYDET VEYA GÜNCELLE (POST / PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Backend'in beklediği tam format:
    const payload = {
      sicil_no: user.sicilNo, // Formdaki sicilNo'yu sicil_no olarak paketliyoruz
      ad: user.ad,
      soyad: user.soyad
    };
  
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
        toast.success("Personel güncellendi!");
      } else {
        await axios.post(API_URL, payload);
        toast.success("Personel sisteme eklendi!");
      }
      setUser({ sicilNo: '', ad: '', soyad: '' });
      setEditingId(null);
      fetchUsers();
    } catch (error) {
      console.error("Hata detayı:", error.response?.data);
      toast.error("İşlem başarısız. Veri formatını kontrol edin.");
    }
  };

  // 3. SİL (DELETE)
  const deleteUser = async (id) => {
    if (!window.confirm("Bu personeli silmek istediğine emin misin?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success("Personel silindi.");
      fetchUsers();
    } catch (error) {
      toast.error("Silme işlemi başarısız.");
    }
  };

  const startEdit = (u) => {
    setUser({ sicilNo: u.sicilNo, ad: u.ad, soyad: u.soyad });
    setEditingId(u.id || u._id); // Backend'den gelen ID'ye göre
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12 font-sans text-slate-900">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-5">
            <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-xl shadow-indigo-100">
              <ClipboardList size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">Personel Yönetimi</h1>
              <p className="text-slate-500 font-semibold uppercase text-xs tracking-widest mt-1">Canlı API: 10.141.5.228</p>
            </div>
          </div>
          <button 
            onClick={fetchUsers}
            className="p-3 text-slate-400 hover:text-indigo-600 bg-white rounded-xl border border-slate-200 shadow-sm transition-all"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </header>

        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* SOL: FORM */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 sticky top-8">
              <h2 className="text-2xl font-extrabold mb-8 flex items-center gap-3">
                {editingId ? <Edit3 className="text-amber-500" /> : <UserPlus className="text-indigo-600" />}
                {editingId ? "Güncelle" : "Yeni Personel"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-black text-slate-400 ml-1 uppercase tracking-tighter">Sicil No</label>
                  <input 
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-slate-50 font-mono"
                    value={user.sicilNo}
                    onChange={e => setUser({...user, sicilNo: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 ml-1 uppercase tracking-tighter">Ad</label>
                  <input 
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-slate-50"
                    value={user.ad}
                    onChange={e => setUser({...user, ad: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 ml-1 uppercase tracking-tighter">Soyad</label>
                  <input 
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-slate-50"
                    value={user.soyad}
                    onChange={e => setUser({...user, soyad: e.target.value})}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-5 rounded-2xl font-black text-white shadow-2xl transition-all active:scale-[0.97] ${editingId ? 'bg-amber-500 shadow-amber-100' : 'bg-indigo-600 shadow-indigo-100'}`}
                >
                  {loading ? "İŞLEM YAPILIYOR..." : (editingId ? "GÜNCELLEMEYİ KAYDET" : "SİSTEME GÖNDER")}
                </button>
              </form>
            </div>
          </div>

          {/* SAĞ: LİSTE */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400">
                  <tr>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest">Sicil</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest">Ad Soyad</th>
                    <th className="px-8 py-5 text-right text-xs font-black uppercase tracking-widest">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u) => (
                    <tr key={u.id || u._id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-6">
                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl font-bold text-sm border border-indigo-100">
                          {u.sicilNo}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-700">{u.ad} {u.soyad}</div>
                      </td>
                      <td className="px-8 py-6 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(u)} className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"><Edit3 size={18}/></button>
                        <button onClick={() => deleteUser(u.id || u._id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && !loading && (
                <div className="p-20 text-center text-slate-300 font-bold">Veritabanında kayıtlı personel yok.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;