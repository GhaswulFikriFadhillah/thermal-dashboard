import React, { useState, useEffect, useMemo, memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, History, Activity, BarChart2, Upload, Edit3, Trash2, Info, X, HelpCircle, CheckCircle, ChevronRight } from 'lucide-react';

// --- HELPER FUNCTIONS ---
const calculateTHI = (temp, humidity) => {
  const rhDecimal = humidity / 100;
  const thi = (0.8 * temp) + (rhDecimal * (temp - 14.4)) + 46.4;
  return parseFloat(thi.toFixed(1));
};

const getComfortStatus = (thi) => {
  if (thi < 70) {
    return { 
      label: 'Comfortable', 
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50', 
      emoji: '😌', 
      title: 'Nyaman', 
      suggestion: 'Kondisi ruangan optimal. Pertahankan ventilasi saat ini.',
      alertLevel: 'normal' 
    };
  } else if (thi >= 70 && thi < 75) {
    return { 
      label: 'Slightly Uncomfortable', 
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', 
      emoji: '😐', 
      title: 'Agak Hangat', 
      suggestion: 'Suhu mulai meningkat. Pertimbangkan menyalakan kipas angin.',
      alertLevel: 'warning' 
    };
  } else {
    return { 
      label: 'Uncomfortable', 
      color: 'bg-rose-500/20 text-rose-400 border-rose-500/50', 
      emoji: '🥵', 
      title: 'Tidak Nyaman', 
      suggestion: 'Peringatan panas! Nyalakan AC atau buka jendela segera.',
      alertLevel: 'danger' 
    };
  }
};

// --- DATA DUMMY AWAL ---
const initialData = [];

// --- KOMPONEN UI TERPISAH ---

// 1. MODAL COMPONENT
const InfoModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100">
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900/50">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            {title === 'Success' ? <CheckCircle size={18} className="text-emerald-400"/> : <Info size={18} className="text-blue-400"/>} 
            {title}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
};

// 2. OVERVIEW PAGE
const OverviewPage = memo(({ data, onOpenModal, isEmpty }) => {
  return (
    <div className="space-y-6 animate-fade-in relative">
      <button 
        onClick={onOpenModal}
        className="absolute -top-2 right-0 flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors bg-slate-800 px-3 py-1 rounded-full border border-slate-700 z-10"
      >
        <HelpCircle size={14} /> Detail Info
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-lg transition-all duration-300">
          <p className="text-slate-400 mb-2 font-medium">Temperature</p>
          <span className="text-5xl font-bold text-white transition-all duration-300">{data.temp}°C</span>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-lg transition-all duration-300">
          <p className="text-slate-400 mb-2 font-medium">Humidity</p>
          <span className="text-5xl font-bold text-white transition-all duration-300">{data.hum}%</span>
        </div>
      </div>

      <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700/50 shadow-lg mt-8">
        <div className="flex justify-between text-slate-400 mb-2">
           <span>THI Gauge</span>
           <span className="text-white font-bold transition-all duration-300">{data.thi}</span>
        </div>
        <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden relative">
          <div className={`h-full transition-all duration-1000 ease-out rounded-full ${
              data.thi >= 75 ? 'bg-gradient-to-r from-orange-500 to-red-600' : 
              data.thi >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min((data.thi / 100) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>0 (Cool)</span>
            <span>70 (Limit)</span>
            <span>100 (Hot)</span>
        </div>
      </div>
      
      {/* CARD COMFORT STATUS - REDESIGNED */}
      <div 
        onClick={onOpenModal}
        className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-lg cursor-pointer hover:bg-slate-800 transition-all duration-300 group mt-6 relative overflow-hidden"
      >
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            {/* Bagian Kiri: Judul Besar 2 Baris */}
            <div className="flex-shrink-0 text-center md:text-left">
               <h4 className="text-3xl md:text-4xl font-bold text-slate-500 leading-none group-hover:text-slate-400 transition-colors">
                 Comfort
               </h4>
               <h4 className="text-3xl md:text-4xl font-bold text-white leading-none">
                 Status
               </h4>
            </div>

            {/* Bagian Tengah: Emoji & Badge Status */}
            <div className="flex items-center gap-4 flex-1 justify-center md:justify-start">
               <div className="text-5xl md:text-6xl animate-bounce-slow drop-shadow-lg filter">
                 {data.emoji}
               </div>
               <div className="flex flex-col">
                  <span className={`text-sm md:text-base font-bold px-4 py-1.5 rounded-full border backdrop-blur-sm transition-all duration-300 ${data.statusColor || ''}`}>
                      {data.statusLabel}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 ml-1">Current Condition</span>
               </div>
            </div>

            {/* Bagian Kanan: Panah Detail */}
            <div className="flex-shrink-0 self-center md:self-center">
               <div className="bg-slate-700/50 p-3 rounded-full group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all">
                  <ChevronRight size={24} />
               </div>
               <span className="text-[10px] text-slate-600 uppercase tracking-widest mt-1 block text-center opacity-0 group-hover:opacity-100 transition-opacity">
                 Detail
               </span>
            </div>
         </div>
         
         {/* Background Glow Effect */}
         <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-3xl opacity-10 transition-colors duration-500 ${data.statusColor?.includes('emerald') ? 'bg-emerald-500' : data.statusColor?.includes('yellow') ? 'bg-yellow-500' : 'bg-rose-500'}`}></div>
      </div>

      {isEmpty && (
        <div className="mt-4 text-center text-sm text-slate-500">
           Menampilkan data dummy. Upload JSON di Settings untuk data asli.
        </div>
      )}
    </div>
  );
});

// 3. HISTORY PAGE
const HistoryPage = memo(({ sensorData, currentIndex }) => {
  const [filter, setFilter] = useState('6h');

  const chartData = useMemo(() => {
    if (sensorData.length === 0) return [];
    const end = currentIndex + 1;
    let range = 20; 
    if (filter === '6h') range = 50;
    if (filter === '12h') range = 100;
    const start = Math.max(0, end - range);
    return sensorData.slice(start, end);
  }, [sensorData, currentIndex, filter]);

  const formatXAxis = (tickItem) => {
    if (!tickItem) return '';
    if (typeof tickItem === 'string' && tickItem.includes('T')) {
        const timePart = tickItem.split('T')[1];
        return timePart.substring(0, 5);
    }
    return tickItem;
  };

  const ChartCard = ({ title, dataKey, color }) => {
    const lastVal = chartData.length > 0 ? chartData[chartData.length - 1][dataKey] : 0;
    return (
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-lg">
        <div className="mb-4 flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-sm mb-1">{title}</p>
            <h3 className="text-4xl font-bold text-white mb-1 transition-all duration-300">{lastVal}</h3>
          </div>
          <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-1 rounded animate-pulse">LIVE</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatXAxis} 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                width={40}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                labelFormatter={(label) => `Waktu: ${formatXAxis(label)}`}
              />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={3} 
                fill={`url(#color${dataKey})`} 
                isAnimationActive={false} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-white text-center md:text-left">Tren Data Historis</h2>
      <div className="mb-6 flex flex-col items-center">
        <p className="text-slate-400 mb-2 text-sm font-medium">Pilih Rentang Waktu</p>
        <div className="flex bg-slate-800 rounded-lg p-1 w-full md:w-fit border border-slate-700">
          {['1 Jam Terakhir', '6 Jam Terakhir', '12 Jam Terakhir'].map((label, idx) => {
            const val = idx === 0 ? '1h' : idx === 1 ? '6h' : '12h';
            return (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === val ? 'bg-slate-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartCard title="Suhu (°C)" dataKey="temp" color="#60a5fa" />
        <ChartCard title="Kelembaban (%)" dataKey="hum" color="#34d399" />
        <ChartCard title="THI Index" dataKey="thi" color="#f472b6" />
      </div>
    </div>
  );
});

// 4. REALTIME PAGE
const RealtimePage = memo(({ sensorData, currentIndex }) => {
  const tableData = useMemo(() => {
      if (sensorData.length === 0) return [];
      const end = currentIndex + 1;
      const start = Math.max(0, end - 20);
      return sensorData.slice(start, end).reverse();
  }, [sensorData, currentIndex]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-white">Data Log</h2>
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-300 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Temp</th>
                <th className="px-6 py-4">Hum</th>
                <th className="px-6 py-4">THI</th>
                <th className="px-6 py-4">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {tableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                    {typeof row.timestamp === 'string' && row.timestamp.includes('T') ? row.timestamp.split('T')[1].split('.')[0] : row.timestamp}
                  </td>
                  <td className="px-6 py-4 text-white">{row.temp}</td>
                  <td className="px-6 py-4 text-white">{row.hum}</td>
                  <td className="px-6 py-4 text-slate-300">{row.thi}</td>
                  <td className="px-6 py-4">
                    {row.type === 'prediction' 
                      ? <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">AI Forecast</span>
                      : <span className="text-xs bg-slate-500/20 text-slate-400 px-2 py-1 rounded">History</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

// 5. TABLEAU PAGE
const TableauPage = () => {
  const [embedUrl, setEmbedUrl] = useState(() => {
    return localStorage.getItem('tableau_embed_url') || '';
  });
  const [isEmbedded, setIsEmbedded] = useState(() => {
    return !!localStorage.getItem('tableau_embed_url');
  });
  const [inputValue, setInputValue] = useState(() => {
    return localStorage.getItem('tableau_embed_url') || '';
  });

  const handleEmbed = () => {
    if (inputValue.trim()) {
      let finalUrl = inputValue.trim();
      if (!finalUrl.includes('?')) {
         finalUrl += '?:embed=yes&:showVizHome=no';
      } else {
         if (!finalUrl.includes('embed=yes')) finalUrl += '&:embed=yes';
         if (!finalUrl.includes('showVizHome=no')) finalUrl += '&:showVizHome=no';
      }
      localStorage.setItem('tableau_embed_url', finalUrl);
      setEmbedUrl(finalUrl);
      setIsEmbedded(true);
    }
  };

  const handleDelete = () => {
    localStorage.removeItem('tableau_embed_url');
    setIsEmbedded(false); 
    setEmbedUrl(''); 
    setInputValue('');
  };

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Tableau Visualization</h2>
        {isEmbedded && (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEmbedded(false)}
              className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600/20 text-yellow-500 border border-yellow-600/50 rounded-lg hover:bg-yellow-600/30 transition-colors text-sm"
            >
              <Edit3 size={14} /> Edit
            </button>
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-1.5 bg-rose-600/20 text-rose-500 border border-rose-600/50 rounded-lg hover:bg-rose-600/30 transition-colors text-sm"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="w-full h-[calc(100vh-200px)] min-h-[600px] bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden relative">
        {!isEmbedded ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <BarChart2 size={64} className="mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">Embed Tableau</h3>
            <p className="max-w-md text-slate-500 mb-6">
              Paste link Tableau Public/Server di sini. Link akan disimpan otomatis agar tidak hilang saat refresh.
            </p>
            
            <div className="w-full max-w-md flex gap-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="https://public.tableau.com/views/..."
                className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600"
              />
              <button 
                onClick={handleEmbed}
                disabled={!inputValue.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                Load
              </button>
            </div>
          </div>
        ) : (
          <iframe 
            src={embedUrl}
            className="w-full h-full border-0 animate-fade-in bg-white"
            title="Tableau Dashboard"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};

// 6. SETTINGS PAGE
const SettingsPage = ({ onDataUpload }) => (
  <div className="space-y-6 animate-fade-in">
     <h2 className="text-2xl font-bold text-white">Settings</h2>
     <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700/50 text-center">
        <Upload size={48} className="mx-auto text-slate-500 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Data Source</h3>
        <p className="text-slate-400 mb-6 text-sm">
          Upload file <code>sensor_data.json</code> hasil training Python.
        </p>
        <input 
          type="file" 
          accept=".json"
          onChange={onDataUpload}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer mx-auto max-w-xs"
        />
     </div>
  </div>
);

// --- KOMPONEN UTAMA (APP) ---
export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sensorData, setSensorData] = useState(initialData);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // State Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadSuccessOpen, setIsUploadSuccessOpen] = useState(false); // Modal baru untuk Upload

  const [currentData, setCurrentData] = useState({ 
    temp: 0, hum: 0, thi: 0, 
    statusLabel: 'No Data', statusColor: 'bg-slate-700', 
    emoji: '❓', title: '-', suggestion: 'Data belum tersedia.' 
  });

  useEffect(() => {
    if (sensorData.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1 >= sensorData.length ? 0 : prev + 1));
    }, 2000); 
    return () => clearInterval(interval);
  }, [sensorData.length]); 

  useEffect(() => {
    if (sensorData.length > 0) {
      const raw = sensorData[currentIndex];
      const computedStatus = getComfortStatus(raw.thi);
      let newData = { ...raw, ...computedStatus };
      if (!raw.emoji) {
         newData = { ...raw, ...computedStatus };
      }
      setCurrentData(newData);
    }
  }, [currentIndex, sensorData]);

  const handleDataUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          setSensorData(JSON.parse(ev.target.result));
          setCurrentIndex(0);
          setIsUploadSuccessOpen(true); // Ganti Alert dengan Modal Sukses
        } catch (err) { alert("Format JSON invalid."); }
      };
      reader.readAsText(file);
    }
  };

  const modalContent = (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-2">{currentData.emoji}</div>
        <h2 className="text-2xl font-bold text-white">{currentData.title}</h2>
        <p className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-2 ${currentData.statusColor}`}>
          {currentData.statusLabel}
        </p>
      </div>
      <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/50 mt-4">
        <h4 className="text-sm font-semibold text-slate-400 mb-1">AI Suggestion:</h4>
        <p className="text-white">{currentData.suggestion}</p>
      </div>
    </div>
  );

  const uploadSuccessContent = (
    <div className="space-y-4 text-center">
      <div className="bg-emerald-500/20 p-4 rounded-full inline-block mb-2">
         <CheckCircle size={48} className="text-emerald-500" />
      </div>
      <h2 className="text-2xl font-bold text-white">Upload Berhasil!</h2>
      <p className="text-slate-400">
        Data sensor telah berhasil dimuat ke dalam sistem. Dashboard akan mulai menampilkan data secara realtime simulasi.
      </p>
      <button 
        onClick={() => { setIsUploadSuccessOpen(false); setActiveTab('overview'); }}
        className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg w-full transition-colors font-semibold"
      >
        Lihat Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30">
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg shadow-white/10 shadow-lg">
                <LayoutDashboard size={20} className="text-slate-900" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">Thermal Comfort Dashboard</span>
            </div>
            <div className="hidden md:flex items-center space-x-1 ml-auto">
              {['overview', 'history', 'realtime', 'tableau', 'settings'].map((id) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                    activeTab === id ? 'text-white bg-slate-800 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {activeTab === 'overview' && (
          <OverviewPage 
            data={currentData} 
            onOpenModal={() => setIsModalOpen(true)} 
            isEmpty={sensorData.length === 0}
          />
        )}
        {activeTab === 'history' && <HistoryPage sensorData={sensorData} currentIndex={currentIndex} />}
        {activeTab === 'realtime' && <RealtimePage sensorData={sensorData} currentIndex={currentIndex} />}
        {activeTab === 'tableau' && <TableauPage />}
        {activeTab === 'settings' && <SettingsPage onDataUpload={handleDataUpload} />}
      </main>
      
      {/* INFO MODAL */}
      <InfoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Detail Informasi"
      >
        {modalContent}
      </InfoModal>

      {/* UPLOAD SUCCESS MODAL */}
      <InfoModal 
        isOpen={isUploadSuccessOpen} 
        onClose={() => setIsUploadSuccessOpen(false)} 
        title="Success"
      >
        {uploadSuccessContent}
      </InfoModal>

      <div className="md:hidden fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-50">
         <button onClick={() => setActiveTab('overview')} className={`p-2 rounded-lg ${activeTab === 'overview' ? 'text-blue-400 bg-slate-800' : 'text-slate-500'}`}><LayoutDashboard /></button>
         <button onClick={() => setActiveTab('history')} className={`p-2 rounded-lg ${activeTab === 'history' ? 'text-blue-400 bg-slate-800' : 'text-slate-500'}`}><History /></button>
         <button onClick={() => setActiveTab('realtime')} className={`p-2 rounded-lg ${activeTab === 'realtime' ? 'text-blue-400 bg-slate-800' : 'text-slate-500'}`}><Activity /></button>
         <button onClick={() => setActiveTab('tableau')} className={`p-2 rounded-lg ${activeTab === 'tableau' ? 'text-blue-400 bg-slate-800' : 'text-slate-500'}`}><BarChart2 /></button>
         <button onClick={() => setActiveTab('settings')} className={`p-2 rounded-lg ${activeTab === 'settings' ? 'text-blue-400 bg-slate-800' : 'text-slate-500'}`}><Upload /></button>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(0); } }
      `}</style>
    </div>
  );
}