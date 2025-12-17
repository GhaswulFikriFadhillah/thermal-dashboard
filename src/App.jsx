import React, { useState, useEffect, useMemo, memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LayoutDashboard, History, Activity, BarChart2, Edit3, Trash2, Info, X, HelpCircle, CheckCircle, ChevronRight, ServerCrash, BrainCircuit } from 'lucide-react';

// --- HELPER FUNCTIONS ---

// ✅ FORMULA FROM NOTEBOOK: (0.8 * T) + ((H * T) / 500)
const calculateTHI = (temp, humidity) => {
  const thi = (0.8 * temp) + ((humidity * temp) / 500);
  return parseFloat(thi.toFixed(2));
};

const getComfortStatus = (thi) => {
  if (thi < 21) {
    return { 
        label: 'Cool / Cold', 
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', 
        emoji: '🥶', 
        title: 'Sejuk', 
        suggestion: 'Suhu cukup rendah. Kurangi pendingin ruangan.',
        alertLevel: 'info' 
      };
  } else if (thi >= 21 && thi <= 26) { 
    return { 
      label: 'Comfortable', 
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50', 
      emoji: '😌', 
      title: 'Nyaman', 
      suggestion: 'Kondisi ruangan optimal. Pertahankan ventilasi saat ini.',
      alertLevel: 'normal' 
    };
  } else if (thi > 26 && thi < 29) {
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

// --- KOMPONEN UI TERPISAH ---

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
const OverviewPage = memo(({ data, onOpenModal, isEmpty, isError }) => {
  if (isError) {
    return (
       <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 animate-fade-in">
         <ServerCrash size={64} className="text-rose-500" />
         <h3 className="text-xl font-bold text-white">Connection Error</h3>
         <p className="text-slate-400 max-w-md">Tidak dapat terhubung ke Server API. Pastikan <code>node server.js</code> sedang berjalan.</p>
       </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      <button 
        onClick={onOpenModal}
        className="absolute -top-2 right-0 flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors bg-slate-800 px-3 py-1 rounded-full border border-slate-700 z-10"
      >
        <HelpCircle size={14} /> Detail Info
      </button>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-lg transition-all duration-300">
          <p className="text-slate-400 mb-2 font-medium">Temperature</p>
          <span className="text-5xl font-bold text-white transition-all duration-300">{isEmpty ? '--' : data.temp}°C</span>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-lg transition-all duration-300">
          <p className="text-slate-400 mb-2 font-medium">Humidity</p>
          <span className="text-5xl font-bold text-white transition-all duration-300">{isEmpty ? '--' : data.hum}%</span>
        </div>
        
        {/* NEW AI FORECAST CARD */}
        <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-500/30 shadow-lg transition-all duration-300 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit size={16} className="text-indigo-400" />
            <p className="text-indigo-300 font-medium text-sm">AI Forecast (Next Min)</p>
          </div>
          <span className="text-5xl font-bold text-indigo-100 transition-all duration-300">
            {data.thi_forecast ? parseFloat(data.thi_forecast).toFixed(2) : '--'}
          </span>
          <p className="text-xs text-indigo-400 mt-2">Predicted THI</p>
        </div>
      </div>

      <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700/50 shadow-lg mt-8">
        <div className="flex justify-between text-slate-400 mb-2">
           <span>THI Gauge (Notebook Formula)</span>
           <span className="text-white font-bold transition-all duration-300">{isEmpty ? '--' : data.thi}</span>
        </div>
        <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden relative">
          <div className={`h-full transition-all duration-1000 ease-out rounded-full ${
              data.thi >= 29 ? 'bg-gradient-to-r from-orange-500 to-red-600' : 
              data.thi >= 26 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
              data.thi >= 21 ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(Math.max((data.thi - 20) * (100/15), 5), 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>20 (Cool)</span>
            <span>26 (Limit)</span>
            <span>35 (Hot)</span>
        </div>
      </div>
      
      {/* COMFORT STATUS CARD */}
      <div 
        onClick={onOpenModal}
        className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-lg cursor-pointer hover:bg-slate-800 transition-all duration-300 group mt-6 relative overflow-hidden"
      >
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex-shrink-0 text-center md:text-left">
               <h4 className="text-3xl md:text-4xl font-bold text-slate-500 leading-none group-hover:text-slate-400 transition-colors">
                 Comfort
               </h4>
               <h4 className="text-3xl md:text-4xl font-bold text-white leading-none">
                 Status
               </h4>
            </div>

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

            <div className="flex-shrink-0 self-center md:self-center">
               <div className="bg-slate-700/50 p-3 rounded-full group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all">
                  <ChevronRight size={24} />
               </div>
            </div>
         </div>
         
         <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-3xl opacity-10 transition-colors duration-500 ${data.statusColor?.includes('emerald') ? 'bg-emerald-500' : data.statusColor?.includes('yellow') ? 'bg-yellow-500' : 'bg-rose-500'}`}></div>
      </div>

      {isEmpty && (
        <div className="mt-4 text-center text-sm text-slate-500 animate-pulse">
           Menunggu data dari sensor...
        </div>
      )}
    </div>
  );
});

// 3. HISTORY PAGE (UPDATED WITH AI COMPARISON)
const HistoryPage = memo(({ sensorData }) => {
  // We process Real Data here
  const chartData = useMemo(() => {
    // Reverse array so chart goes Left(Old) -> Right(New)
    return [...sensorData].reverse().map(d => {
      // Calculate real THI for comparison
      const realTHI = d.thi || calculateTHI(d.temp, d.hum);
      return {
        ...d,
        thi: realTHI,
        // Ensure forecast exists, format it
        thi_forecast: d.thi_forecast ? parseFloat(d.thi_forecast) : null
      };
    });
  }, [sensorData]);

  const formatXAxis = (tickItem) => {
    if (!tickItem) return '';
    const date = new Date(tickItem);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Special Card for Double Area Chart (Actual vs Forecast)
  const AIComparisonCard = () => {
    return (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-indigo-500/30 shadow-lg col-span-1 lg:col-span-2 xl:col-span-3">
            <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/20 p-2 rounded-lg"><BrainCircuit className="text-indigo-400" size={24}/></div>
                    <div>
                        <p className="text-slate-400 text-sm mb-1">AI Performance Analysis</p>
                        <h3 className="text-xl font-bold text-white">Actual THI vs Predicted</h3>
                    </div>
                </div>
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-pink-500 rounded-full"></div>Real Data</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-400 rounded-full"></div>AI Forecast</div>
                </div>
            </div>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="timestamp" tickFormatter={formatXAxis} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={40} domain={['auto', 'auto']} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                            labelFormatter={(label) => `Waktu: ${formatXAxis(label)}`}
                        />
                        {/* Real THI Area */}
                        <Area type="monotone" dataKey="thi" name="Real THI" stroke="#ec4899" strokeWidth={2} fill="url(#colorReal)" />
                        {/* AI Forecast Area (Dashed or Lighter) */}
                        <Area type="monotone" dataKey="thi_forecast" name="AI Predicted" stroke="#818cf8" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorAI)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
  };

  const ChartCard = ({ title, dataKey, color }) => {
    const lastVal = chartData.length > 0 ? chartData[chartData.length - 1][dataKey] : 0;
    const displayVal = typeof lastVal === 'number' ? lastVal.toFixed(2) : '--';

    return (
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-lg">
        <div className="mb-4 flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-sm mb-1">{title}</p>
            <h3 className="text-4xl font-bold text-white mb-1">{displayVal}</h3>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded animate-pulse">LIVE DB</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis hide domain={['auto', 'auto']}/>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} labelFormatter={() => ''} />
              <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} fill={`url(#color${dataKey})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-white text-center md:text-left">Live Database History</h2>
      
      {/* 1. Comparison Chart (Big) */}
      <AIComparisonCard />

      {/* 2. Small Individual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Suhu (°C)" dataKey="temp" color="#60a5fa" />
        <ChartCard title="Kelembaban (%)" dataKey="hum" color="#34d399" />
      </div>
    </div>
  );
});

// 4. REALTIME PAGE (UPDATED TABLE)
const RealtimePage = memo(({ sensorData }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-white">Live Data Log</h2>
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-300 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Temp</th>
                <th className="px-6 py-4">Hum</th>
                <th className="px-6 py-4 text-pink-400">Real THI</th>
                <th className="px-6 py-4 text-indigo-400">AI Forecast</th>
                <th className="px-6 py-4">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {sensorData.map((row, idx) => {
                  const thi = row.thi || calculateTHI(row.temp, row.hum);
                  const forecast = row.thi_forecast ? parseFloat(row.thi_forecast).toFixed(2) : '--';
                  return (
                    <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        {new Date(row.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-white">{row.temp}°C</td>
                      <td className="px-6 py-4 text-white">{row.hum}%</td>
                      <td className="px-6 py-4 text-pink-300 font-bold">{thi}</td>
                      <td className="px-6 py-4 text-indigo-300 font-mono">{forecast}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">MongoDB</span>
                      </td>
                    </tr>
                  );
              })}
              {sensorData.length === 0 && (
                  <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No data received yet...</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

// 5. TABLEAU PAGE
const TableauPage = () => {
  const [embedUrl, setEmbedUrl] = useState(() => localStorage.getItem('tableau_embed_url') || '');
  const [isEmbedded, setIsEmbedded] = useState(() => !!localStorage.getItem('tableau_embed_url'));
  const [inputValue, setInputValue] = useState(() => localStorage.getItem('tableau_embed_url') || '');

  const handleEmbed = () => {
    if (inputValue.trim()) {
      let finalUrl = inputValue.trim();
      if (!finalUrl.includes('?')) finalUrl += '?:embed=yes&:showVizHome=no';
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
            <button onClick={() => setIsEmbedded(false)} className="px-3 py-1 bg-yellow-600/20 text-yellow-500 rounded text-sm"><Edit3 size={14} /></button>
            <button onClick={handleDelete} className="px-3 py-1 bg-rose-600/20 text-rose-500 rounded text-sm"><Trash2 size={14} /></button>
          </div>
        )}
      </div>
      <div className="w-full h-[600px] bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden relative">
        {!isEmbedded ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <BarChart2 size={64} className="mb-4 text-slate-600" />
            <div className="flex gap-2 w-full max-w-md">
              <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Paste Tableau Public Link..." className="flex-1 bg-slate-900 border border-slate-700 text-white rounded px-4 py-2" />
              <button onClick={handleEmbed} className="px-6 py-2 bg-blue-600 text-white rounded">Load</button>
            </div>
          </div>
        ) : (
          <iframe src={embedUrl} className="w-full h-full border-0 bg-white" title="Tableau Dashboard" />
        )}
      </div>
    </div>
  );
};

// 6. SETTINGS PAGE (Simplified since we use Auto-Fetch)
const SettingsPage = () => (
  <div className="space-y-6 animate-fade-in">
     <h2 className="text-2xl font-bold text-white">System Settings</h2>
     <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-4 text-emerald-400 mb-4">
             <div className="bg-emerald-500/20 p-3 rounded-full"><Activity size={24}/></div>
             <div>
                 <h3 className="font-bold text-white">Live Data Mode Active</h3>
                 <p className="text-sm text-slate-400">Dashboard is currently fetching data from MongoDB (Port 5000) every 5 seconds.</p>
             </div>
        </div>
     </div>
  </div>
);

// --- KOMPONEN UTAMA (APP) ---
export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sensorData, setSensorData] = useState([]);
  const [isError, setIsError] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentData = useMemo(() => {
     if (sensorData.length === 0) {
         return { temp: 0, hum: 0, thi: 0, statusLabel: 'Waiting...', statusColor: 'bg-slate-700', emoji: '⏳', title: '-', suggestion: 'Waiting for sensor data...' };
     }
     const latest = sensorData[0]; 
     const thi = latest.thi || calculateTHI(latest.temp, latest.hum);
     const status = getComfortStatus(thi);
     
     return { 
         ...latest, 
         thi, 
         ...status 
     };
  }, [sensorData]);

  // --- FETCHING LOGIC ---
  const fetchData = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/readings');
        if (!response.ok) throw new Error("API Error");
        const jsonData = await response.json();
        setSensorData(jsonData);
        setIsError(false);
    } catch (error) {
        console.error("Error fetching data:", error);
        setIsError(true);
    }
  };

  useEffect(() => {
    fetchData(); 
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []);

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
            isError={isError}
          />
        )}
        {activeTab === 'history' && <HistoryPage sensorData={sensorData} />}
        {activeTab === 'realtime' && <RealtimePage sensorData={sensorData} />}
        {activeTab === 'tableau' && <TableauPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>
      
      {/* INFO MODAL */}
      <InfoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Detail Informasi"
      >
        {modalContent}
      </InfoModal>

      <div className="md:hidden fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-50">
         <button onClick={() => setActiveTab('overview')} className={`p-2 rounded-lg ${activeTab === 'overview' ? 'text-blue-400 bg-slate-800' : 'text-slate-500'}`}><LayoutDashboard /></button>
         <button onClick={() => setActiveTab('history')} className={`p-2 rounded-lg ${activeTab === 'history' ? 'text-blue-400 bg-slate-800' : 'text-slate-500'}`}><History /></button>
         <button onClick={() => setActiveTab('realtime')} className={`p-2 rounded-lg ${activeTab === 'realtime' ? 'text-blue-400 bg-slate-800' : 'text-slate-500'}`}><Activity /></button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(0); } }
      `}</style>
    </div>
  );
}