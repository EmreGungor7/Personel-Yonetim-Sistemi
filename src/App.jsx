import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { Trash2, Edit3, UserPlus, Search, RefreshCw, Camera, X } from 'lucide-react';

const API_URL = "xxxx.xxxx.xxxx.xxxxx";

function App() {
  const [selectedPerson, setSelectedPerson] = useState(null); // Pop-up'ta gösterilecek kişi
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // Arama için
  const [searchTerm, setSearchTerm] = useState(""); // Arama metni
  const [user, setUser] = useState({ sicilNo: '', ad: '', soyad: '', foto_url: '' });
  const [editingSicilNo, setEditingSicilNo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Resim State'leri
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // 1. VERİLERİ ÇEK
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data);
      setFilteredUsers(response.data); // İlk başta hepsi görünsün
    } catch (error) {
      toast.error("Veri çekilemedi!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ARAMA MANTIĞI
  useEffect(() => {
    const results = users.filter(u => 
      u.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(u.sicilNo || u.sicil_no).includes(searchTerm)
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  // DOSYA SEÇME
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // KAYDET / GÜNCELLE
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('sicil_no', user.sicilNo);
    formData.append('ad', user.ad);
    formData.append('soyad', user.soyad);
    if (selectedFile) formData.append('file', selectedFile);

    try {
      if (editingSicilNo) {
        await axios.put(`${API_URL}/${editingSicilNo}`, formData);
        toast.success("Kayıt güncellendi x");
      } else {
        await axios.post(API_URL, formData);
        toast.success("Yeni personel eklendi ");
      }
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error("İşlem başarısız.");
    }
  };

  // SİLME
  const deleteUser = async (targetSicilNo) => {
    if (!window.confirm("Silmek istediğine emin misin?")) return;
    try {
      await axios.delete(`${API_URL}/${targetSicilNo}`);
      toast.success("Personel silindi 🗑️");
      fetchUsers();
    } catch (error) {
      toast.error("Silinemedi.");
    }
  };

  // DÜZENLEME BAŞLAT
  const startEdit = (u) => {
    const gelensicil = u.sicilNo || u.sicil_no;
    setUser({ sicilNo: gelensicil, ad: u.ad, soyad: u.soyad, foto_url: u.foto_url });
    setEditingSicilNo(gelensicil);
    setPreview(null);
    setSelectedFile(null);
  };

  // FORM SIFIRLAMA
  const resetForm = () => {
    setUser({ sicilNo: '', ad: '', soyad: '', foto_url: '' });
    setSelectedFile(null);
    setPreview(null);
    setEditingSicilNo(null);
  };

  return (
    // MODERN GRADIENT ARKA PLAN
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 p-4 md:p-10 font-sans text-slate-800">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', background: '#333', color: '#fff' } }} />
      
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/80 p-4 rounded-3xl shadow-lg backdrop-blur-md text-indigo-600">
              <UserPlus size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Personel Yönetimi
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Sistemde toplam <span className="text-indigo-600 font-bold">{users.length}</span> kayıt var</p>
            </div>
          </div>

          {/* ARAMA VE YENİLEME */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Personel ara..." 
                className="w-full pl-10 pr-4 py-3 rounded-2xl border-none bg-white/80 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none transition-all placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={fetchUsers} className="p-3 bg-white/80 rounded-2xl shadow-sm hover:rotate-180 transition-all duration-500 text-indigo-600">
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* SOL: FORM KARTI (GLASSMORPHISM) */}
          <div className="lg:col-span-4 sticky top-8">
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold text-slate-700 flex items-center gap-2">
                  {editingSicilNo ? "Düzenle" : "Yeni Ekle"}
                </h2>
                {editingSicilNo && (
                  <button onClick={resetForm} className="text-xs font-bold text-red-500 bg-red-100 px-3 py-1 rounded-full hover:bg-red-200 transition">Vazgeç</button>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* FOTOĞRAF ALANI */}
                <div className="flex justify-center mb-6">
                  <div className="relative group">
                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-indigo-50 flex items-center justify-center">
                      {preview ? (
                        <img src={preview} className="w-full h-full object-cover" />
                      ) : user.foto_url ? (
                        <img src={user.foto_url} className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={40} className="text-indigo-200" />
                      )}
                    </div>
                    <label className="absolute bottom-1 right-1 bg-indigo-600 p-3 rounded-full text-white cursor-pointer hover:bg-indigo-700 hover:scale-110 transition-all shadow-lg border-4 border-white">
                      <Camera size={18} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                    </label>
                  </div>
                </div>

                {/* INPUTLAR */}
                <div className="space-y-4">
                  <div className="relative group">
                    <span className="absolute left-4 top-3.5 text-slate-400 text-xs font-bold uppercase">Sicil No</span>
                    <input 
                      className="w-full pt-8 pb-3 px-4 rounded-2xl bg-indigo-50/50 border border-transparent focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-mono font-bold text-indigo-900"
                      value={user.sicilNo} onChange={e => setUser({...user, sicilNo: e.target.value})} required placeholder="0000"
                    />
                  </div>
                  <div className="flex gap-3">
                    <input 
                      className="w-1/2 px-4 py-4 rounded-2xl bg-white border border-slate-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:font-medium"
                      value={user.ad} onChange={e => setUser({...user, ad: e.target.value})} required placeholder="Ad"
                    />
                    <input 
                      className="w-1/2 px-4 py-4 rounded-2xl bg-white border border-slate-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:font-medium"
                      value={user.soyad} onChange={e => setUser({...user, soyad: e.target.value})} required placeholder="Soyad"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg shadow-indigo-200 transition-all transform active:scale-95 ${editingSicilNo ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-300'}`}
                >
                  {loading ? "İşleniyor..." : (editingSicilNo ? "Değişiklikleri Kaydet" : "Personeli Kaydet")}
                </button>
              </form>
            </div>
          </div>

          {/* SAĞ: LİSTE KARTI */}
          <div className="lg:col-span-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/50 overflow-hidden min-h-[500px]">
              
              {/* TABLO BAŞLIĞI */}
              <div className="grid grid-cols-12 gap-4 p-6 bg-slate-50/50 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest">
                <div className="col-span-5 pl-4">Personel Bilgisi</div>
                <div className="col-span-3">Sicil No</div>
                <div className="col-span-4 text-right pr-4">İşlemler</div>
              </div>

              {/* LİSTE ELEMANLARI */}
              <div className="divide-y divide-slate-100">
                {filteredUsers.length > 0 ? filteredUsers.map((u, i) => {
                  const currentSicil = u.sicilNo || u.sicil_no;
                  return (
                    <div key={i} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-indigo-50/30 transition-colors group">
                      
                      {/* 1. Kolon: Resim ve İsim */}
                      <div 
                        onClick={() => setSelectedPerson(u)}
                        className="col-span-5 flex items-center gap-4 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm flex-shrink-0">
                          {u.foto_url ? (
                             <img src={u.foto_url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500 font-bold">
                              {u.ad[0]}{u.soyad[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-lg leading-tight">{u.ad} {u.soyad}</div>
                          <div className="text-xs text-slate-400 font-medium">Mühendis</div>
                        </div>
                      </div>

                      {/* 2. Kolon: Sicil */}
                      <div className="col-span-3">
                        <span className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm font-mono font-bold text-slate-600 shadow-sm">
                          #{currentSicil}
                        </span>
                      </div>

                      {/* 3. Kolon: Butonlar */}
                      <div className="col-span-4 flex justify-end gap-2 pr-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(u)} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition shadow-sm">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => deleteUser(currentSicil)} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition shadow-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>

                    </div>
                  )
                }) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p className="font-bold">Kayıt bulunamadı.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
      {/* --- POP-UP (MODAL) BAŞLANGIÇ --- */}
      {selectedPerson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm relative overflow-hidden animate-in fade-in zoom-in duration-200">
              
              {/* Kapatma Butonu */}
              <button 
                onClick={() => setSelectedPerson(null)} 
                className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-slate-100 rounded-full text-slate-500 transition-all z-10"
              >
                <X size={20} />
              </button>

              {/* Üst Arka Plan (Dekoratif) */}
              <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600"></div>

              {/* Büyük Fotoğraf */}
              <div className="flex justify-center -mt-16 relative z-0">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-indigo-50 flex items-center justify-center">
                  {selectedPerson.foto_url ? (
                    <img src={selectedPerson.foto_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-4xl font-black text-indigo-300">
                      {selectedPerson.ad[0]}{selectedPerson.soyad[0]}
                    </div>
                  )}
                </div>
              </div>

              {/* Personel Bilgileri */}
              <div className="p-8 pt-4 text-center">
                <h3 className="text-2xl font-black text-slate-800">{selectedPerson.ad} {selectedPerson.soyad}</h3>
                <p className="text-indigo-600 font-bold mb-6">Sicil No: #{selectedPerson.sicilNo || selectedPerson.sicil_no}</p>
                
                <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Durum</div>
                  <div className="text-sm font-medium text-slate-700">Aktif Çalışan</div>
                  {/* Buraya ileride departman, telefon, e-posta gibi bilgiler eklenebilir */}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* --- POP-UP (MODAL) BİTİŞ --- */}
    </div>
  );
}

export default App;