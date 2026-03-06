import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { INITIAL_EMISSION_DATA, INITIAL_SUPPLIERS } from './constants';
import { EmissionData, ScenarioParameters, Supplier } from './types';
import { predictFutureEmissions, runMonteCarlo, simulateScenario } from './services/predictionEngine';
import { computeSupplierImpact } from './services/graphService';
import SupplierGraph from './components/SupplierGraph';
import ChatInterface from './components/ChatInterface';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import { PieChart, Pie } from "recharts";


const App: React.FC = () => {
  // State
  const [view, setView] = useState<"dashboard" | "scope3">("dashboard");
  const [history, setHistory] = useState<EmissionData[]>(INITIAL_EMISSION_DATA);
  const [suppliers, setSuppliers] = useState<Supplier[]>(computeSupplierImpact(INITIAL_SUPPLIERS));
  const [scenario, setScenario] = useState<ScenarioParameters>({
    renewableEnergyPct: 0,
    evFleetConversionPct: 0,
    supplierEfficiencyImprovement: 0,
    productionVolumeChange: 0
  });

  // Predictions & Simulations
  const forecast = useMemo(() => predictFutureEmissions(history), [history]);
  const scenarioResults = useMemo(() => simulateScenario(history, scenario), [history, scenario]);
  
  const currentTotal = history[history.length - 1].total;
  const monteCarlo = useMemo(() => runMonteCarlo(currentTotal), [currentTotal]);

  const reportRef = useRef<HTMLDivElement>(null);

  const dashboardStats = [
    { label: 'Current Total Emissions', value: `${currentTotal.toLocaleString()} CO₂e Units`, color: 'text-slate-900' },
    { label: 'Forecast (6m)', value: `+${((forecast[forecast.length-1].total / currentTotal - 1) * 100).toFixed(1)}%`, color: 'text-rose-500' },
    { label: 'Uncertainty Range', value: `${Math.round(monteCarlo.confidenceInterval[0])} - ${Math.round(monteCarlo.confidenceInterval[1])}`, color: 'text-amber-500' },
    { label: 'Top Supplier Impact', value: suppliers[0].name, color: 'text-emerald-600' }
  ];

  const handleExportReport = async () => {
  if (!reportRef.current) return;

  const element = reportRef.current;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#f8fafc",
    windowWidth: document.documentElement.scrollWidth,
    windowHeight: document.documentElement.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save("carbon-intellect-report.pdf");
};

//Ingest data 

const fileInputRef = useRef<HTMLInputElement>(null);
const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target?.result as string);
      if (json.history) {
        const formattedHistory = json.history.map((d: any) => ({
          month: d.month,
          scope1: Number(d.scope1),
          scope2: Number(d.scope2),
          scope3: Number(d.scope3),
          total: Number(d.total)
        }));

        setHistory(formattedHistory);
      }

      if (json.suppliers) {
        setSuppliers(
  json.suppliers.sort(
    (a: any, b: any) => b.contributionScore - a.contributionScore
  )
);
      }
 const historyCount = json.history ? json.history.length : 0;
const supplierCount = json.suppliers ? json.suppliers.length : 0;



console.log("Data successfully ingested", {
  file: file.name,
  historyCount,
  supplierCount
});
    } catch (err) {
      console.error("Invalid JSON file:", err);
      alert("Invalid JSON format");
    }
  };

  reader.readAsText(file);
};

const pieColors = ["#ef4444","#f97316","#6366f1","#10b981","#14b8a6"];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Sidebar Navigation */}
<aside className="w-full lg:w-64 bg-slate-900 text-white p-6 shrink-0 flex flex-col">

  <div className="flex items-center gap-2 mb-8">
    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white">
      C
    </div>
    <h1 className="text-xl font-bold tracking-tight">Carbon Intellect</h1>
  </div>

  <nav className="space-y-1 flex-1">

    {/* Dashboard */}
    <div
      onClick={() => setView("dashboard")}
      className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all ${
        view === "dashboard"
          ? "bg-slate-800 text-emerald-400 font-medium"
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      }`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"
        />
      </svg>
      Dashboard
    </div>

    {/* Scope 3 Graph */}
    <div
      onClick={() => setView("scope3")}
      className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all ${
        view === "scope3"
          ? "bg-slate-800 text-emerald-400 font-medium"
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      }`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2"
        />
      </svg>
      Scope 3 Graph
    </div>

  </nav>

  <div className="mt-auto pt-6 border-t border-slate-800">
    <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-900/50">
      <p className="text-xs text-emerald-500 font-semibold mb-1 uppercase">
        Sustainability Score
      </p>
      <p className="text-2xl font-bold text-emerald-400">
        74<span className="text-sm font-normal text-emerald-600">/100</span>
      </p>
    </div>
  </div>

</aside>

      {/* Main Content Area */}
      <main ref={reportRef} className="flex-1 p-6 lg:p-8">

{view === "dashboard" && (
<>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Organizational Emissions Intelligence</h2>
            <p className="text-slate-500">ML-driven forecasting and scenario analysis</p>

          </div>
          <div className="flex gap-3">
            <button onClick={handleExportReport} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors" >
              Export Report
            </button>
            <button  onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Ingest New Data</button>
          </div>
        </header>

{/* Hidden file input for ingesting data */}
<input
  type="file"
  accept=".json"
  ref={fileInputRef}
  onChange={handleFileUpload}
  className="hidden"
/>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Emission Trend */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800">Emissions Trend & ML Forecast</h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-3 h-3 bg-emerald-500 rounded-full"></span> Historical</span>
                <span className="flex items-center gap-1 text-xs text-slate-500"><span className="w-3 h-3 bg-rose-400 rounded-full"></span> Forecast</span>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[...history, ...forecast]}>
                  <defs>
                    <linearGradient id="colorS1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="scope1" stackId="1" stroke="#10b981" fillOpacity={1} fill="url(#colorS1)" />
                  <Area type="monotone" dataKey="scope2" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="scope3" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Supplier Impact Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Top Supplier Impact</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={suppliers} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={100} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="contributionScore" radius={[0, 4, 4, 0]}>
                    {suppliers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-400 mt-4 italic">Weighted contribution based on spend and dependency paths.</p>
          </div>
        </div>

        {/* Supplier Network & Scenario Analysis Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SupplierGraph suppliers={suppliers} />
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-2">Scenario Simulator</h3>
            <p className="text-sm text-slate-500 mb-6">Adjust parameters to see projected carbon reduction.</p>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="text-slate-700 font-medium">Renewable Energy Mix (%)</label>
                  <span className="text-emerald-600 font-bold">{scenario.renewableEnergyPct}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={scenario.renewableEnergyPct} 
                  onChange={e => setScenario(s => ({...s, renewableEnergyPct: parseInt(e.target.value)}))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="text-slate-700 font-medium">Fleet Electrification (%)</label>
                  <span className="text-emerald-600 font-bold">{scenario.evFleetConversionPct}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={scenario.evFleetConversionPct} 
                  onChange={e => setScenario(s => ({...s, evFleetConversionPct: parseInt(e.target.value)}))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="text-slate-700 font-medium">Supplier Efficiency Improvement (%)</label>
                  <span className="text-emerald-600 font-bold">{scenario.supplierEfficiencyImprovement}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={scenario.supplierEfficiencyImprovement} 
                  onChange={e => setScenario(s => ({...s, supplierEfficiencyImprovement: parseInt(e.target.value)}))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">Projected Total Reductions:</span>
                  <span className="text-lg font-bold text-emerald-600">
                    -{Math.round(((currentTotal - scenarioResults[scenarioResults.length-1].total) / currentTotal) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface Row */}
        <div className="grid grid-cols-1 gap-8 mb-8 min-h-[500px]">
          <ChatInterface currentData={{
            history,
            suppliers: suppliers.slice(0, 5),
            forecast: forecast.slice(0, 3)
          }} />
        </div>
        </>
)}
{view === "scope3" && (
<div className="space-y-8">

<h2 className="text-2xl font-bold text-slate-800">
Scope 3 Supply Chain Analysis
</h2>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

<SupplierGraph suppliers={suppliers} />

<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
<h3 className="font-bold text-slate-800 mb-6">
Supplier Contribution Ranking
</h3>


<ResponsiveContainer width="100%" height={250}>
  <BarChart
    data={suppliers}
    layout="vertical"
    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
  >
    <XAxis type="number" />

    <YAxis
      type="category"
      dataKey="name"
      width={200}
      tick={{ fontSize: 12 }}
    />

    <Tooltip />

    <Bar dataKey="contributionScore" fill="#6366f1" radius={[0,4,4,0]} />
  </BarChart>
</ResponsiveContainer>
</div>
<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
  <h3 className="font-bold text-slate-800 mb-6">
    Scope-3 Emission Distribution
  </h3>

  <ResponsiveContainer width="100%" height={350}>
    <PieChart>
      <Pie
        data={suppliers}
        dataKey="contributionScore"
        nameKey="name"
        outerRadius={120}
        label
      >
        {suppliers.map((entry, index) => (
          <Cell key={index} fill={pieColors[index % pieColors.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>

  <p className="text-xs text-slate-400 mt-3">
    Shows percentage contribution of each supplier to Scope-3 emissions.
  </p>
</div>

</div>

</div>
)}

      </main>
    </div>
  );
};


export default App;