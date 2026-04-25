import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  LayoutDashboard, 
  Logs, 
  Search, 
  Settings, 
  Terminal,
  Filter,
  RefreshCw,
  Info,
  AlertTriangle,
  AlertCircle,
  Database,
  BrainCircuit,
  X,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from './lib/utils';
import { LogEntry, Severity, LogFilter } from './types';
import { SOURCES, SEVERITIES, generateMockLogs } from './constants';
import LogTable from './components/LogTable';
import Dashboard from './components/Dashboard';
import LogAnalysis from './components/LogAnalysis';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'analysis'>('dashboard');
  const [logs, setLogs] = useState<LogEntry[]>(() => generateMockLogs(500));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [filters, setFilters] = useState<LogFilter>({
    search: '',
    sources: [],
    severities: [],
    dateRange: { start: null, end: null }
  });

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = log.message.toLowerCase().includes(filters.search.toLowerCase()) || 
                          log.source.toLowerCase().includes(filters.search.toLowerCase());
      const matchSource = filters.sources.length === 0 || filters.sources.includes(log.source);
      const matchSeverity = filters.severities.length === 0 || filters.severities.includes(log.severity);
      return matchSearch && matchSource && matchSeverity;
    });
  }, [logs, filters]);

  const stats = useMemo(() => {
    const errorCount = logs.filter(l => l.severity === 'error').length;
    const warnCount = logs.filter(l => l.severity === 'warn').length;
    const criticalRate = ((errorCount / logs.length) * 100).toFixed(1);
    
    return { errorCount, warnCount, criticalRate, total: logs.length };
  }, [logs]);

  const refreshLogs = () => {
    setLogs(generateMockLogs(500));
    setSelectedLog(null);
  };

  return (
    <div className="flex h-screen bg-[#F0F0F0] text-[#1A1A1A] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "bg-[#1A1A1A] text-[#F0F0F0] transition-all duration-300 flex flex-col border-r border-[#333]",
        isSidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="p-4 flex items-center gap-3 border-b border-[#333]">
          <div className="bg-orange-500 p-1.5 rounded-lg">
            <Terminal size={20} className="text-white" />
          </div>
          {isSidebarOpen && <span className="font-bold text-lg tracking-tight">LuminaLogs</span>}
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem 
            icon={<Logs size={20} />} 
            label="Log Explorer" 
            active={activeTab === 'logs'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('logs')}
          />
          <NavItem 
            icon={<BrainCircuit size={20} />} 
            label="AI Analysis" 
            active={activeTab === 'analysis'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('analysis')}
          />
          <div className="pt-4 mt-4 border-t border-[#333]">
            <NavItem 
              icon={<Search size={20} />} 
              label="Saved Queries" 
              active={false} 
              collapsed={!isSidebarOpen}
              onClick={() => {}}
            />
            <NavItem 
              icon={<Settings size={20} />} 
              label="Settings" 
              active={false} 
              collapsed={!isSidebarOpen}
              onClick={() => {}}
            />
          </div>
        </nav>

        <div className="p-4 border-t border-[#333]">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full h-10 flex items-center justify-center hover:bg-[#333] transition-colors rounded-lg"
          >
            {isSidebarOpen ? <X size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="h-16 border-b border-[#E0E0E0] px-6 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold capitalize tracking-tight">{activeTab}</h1>
            <div className="flex gap-2 text-xs font-mono">
              <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100">{stats.errorCount} Errors</span>
              <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100">{stats.warnCount} Warnings</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={refreshLogs}
              className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors group"
              title="Refresh Logs"
            >
              <RefreshCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
            </button>
            <div className="h-6 w-[1px] bg-[#E0E0E0]"></div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F7] rounded-full border border-[#E0E0E0]">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-medium text-[#666]">Connected: us-east-1a</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-[#FAFAFA]">
          {activeTab === 'dashboard' && <Dashboard logs={logs} />}
          {activeTab === 'logs' && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-[#E0E0E0] bg-white flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                  <input 
                    type="text" 
                    placeholder="Search logs by message or source..."
                    className="w-full pl-10 pr-4 py-2 bg-[#F5F5F7] border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-orange-500 text-sm transition-all shadow-sm"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <FilterDropdown 
                  label="Severity" 
                  items={SEVERITIES} 
                  selected={filters.severities}
                  onChange={(val) => setFilters(prev => ({ 
                    ...prev, 
                    severities: prev.severities.includes(val) 
                      ? prev.severities.filter(s => s !== val) 
                      : [...prev.severities, val as Severity]
                  }))}
                />
                <FilterDropdown 
                  label="Source" 
                  items={SOURCES} 
                  selected={filters.sources}
                  onChange={(val) => setFilters(prev => ({ 
                    ...prev, 
                    sources: prev.sources.includes(val) 
                      ? prev.sources.filter(s => s !== val) 
                      : [...prev.sources, val]
                  }))}
                />
                <button 
                  onClick={() => setFilters({ search: '', sources: [], severities: [], dateRange: { start: null, end: null } })}
                  className="px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                >
                  Clear Filters
                </button>
              </div>

              <div className="flex-1 flex min-h-0">
                <div className="flex-1 overflow-auto">
                  <LogTable 
                    logs={filteredLogs} 
                    selectedId={selectedLog?.id} 
                    onSelect={setSelectedLog} 
                  />
                </div>
                
                <AnimatePresence>
                  {selectedLog && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20, width: 0 }}
                      animate={{ opacity: 1, x: 0, width: 400 }}
                      exit={{ opacity: 0, x: 20, width: 0 }}
                      className="border-l border-[#E0E0E0] bg-white h-full overflow-y-auto shadow-2xl relative"
                    >
                      <LogDetail log={selectedLog} onClose={() => setSelectedLog(null)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
          {activeTab === 'analysis' && <LogAnalysis logs={logs} />}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, collapsed, onClick }: { 
  icon: React.ReactNode, 
  label: string, 
  active: boolean, 
  collapsed: boolean,
  onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full group",
        active ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-[#999] hover:bg-[#2A2A2A] hover:text-[#F0F0F0]"
      )}
    >
      <div className={cn("transition-transform group-hover:scale-110", active ? "text-white" : "")}>{icon}</div>
      {!collapsed && <span className="font-medium text-sm tracking-wide">{label}</span>}
      {!collapsed && active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-50"></div>}
    </button>
  );
}

function FilterDropdown({ label, items, selected, onChange }: { 
  label: string, 
  items: string[], 
  selected: string[],
  onChange: (val: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "px-3 py-2 text-sm font-medium border rounded-lg flex items-center gap-2 transition-all",
          selected.length > 0 ? "border-orange-500 bg-orange-50 text-orange-700" : "border-[#E0E0E0] bg-white text-[#666] hover:bg-[#F9F9F9]"
        )}
      >
        <Filter size={14} />
        {label} 
        {selected.length > 0 && <span className="bg-orange-500 text-white px-1.5 rounded-full text-[10px]">{selected.length}</span>}
        <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-[#E0E0E0] rounded-xl shadow-xl z-30 py-2 overflow-hidden animate-in fade-in zoom-in duration-150">
            {items.map(item => (
              <label 
                key={item} 
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#F5F5F7] cursor-pointer group"
              >
                <input 
                  type="checkbox" 
                  checked={selected.includes(item)}
                  onChange={() => onChange(item)}
                  className="rounded border-[#E0E0E0] text-orange-500 focus:ring-orange-500 w-4 h-4"
                />
                <span className="text-sm font-medium capitalize text-[#444] group-hover:text-[#1A1A1A]">{item}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function LogDetail({ log, onClose }: { log: LogEntry; onClose: () => void }) {
  const severityColors = {
    info: 'bg-blue-500',
    warn: 'bg-orange-500',
    error: 'bg-red-500',
    debug: 'bg-gray-500',
  };

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-bold tracking-tight">Entry Details</h2>
        <button onClick={onClose} className="p-1 hover:bg-[#F5F5F7] rounded-full transition-colors">
          <X size={20} />
        </button>
      </header>

      <section className="space-y-6">
        <div className="flex items-center gap-3 bg-[#F5F5F7] p-3 rounded-lg border border-[#E0E0E0]">
          <div className={cn("w-3 h-3 rounded-full", severityColors[log.severity])}></div>
          <span className="text-sm font-mono font-bold uppercase tracking-wider">{log.severity}</span>
          <span className="text-[#999] opacity-30 text-xs">|</span>
          <span className="text-xs font-mono text-[#666]">{log.id}</span>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-[#999] tracking-widest block">Message</label>
          <div className="p-4 bg-[#1A1A1A] text-green-400 rounded-lg font-mono text-sm leading-relaxed border border-[#333] shadow-inner">
            {log.message}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[#999] tracking-widest block">Timestamp</label>
            <p className="text-sm font-medium text-[#333]">{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[#999] tracking-widest block">Source</label>
            <p className="text-sm font-medium text-[#333] flex items-center gap-1">
              <Database size={14} className="text-[#999]" />
              {log.source}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] uppercase font-bold text-[#999] tracking-widest block">Metadata</label>
          <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] divide-y divide-[#E5E7EB]">
            {Object.entries(log.metadata || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3">
                <span className="text-xs font-medium text-[#666]">{key}</span>
                <span className="text-xs font-mono text-[#111]">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-[#E0E0E0]">
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-[#E0E0E0] rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#F9FAFB] transition-all shadow-sm">
            <BrainCircuit size={16} className="text-orange-500" />
            Analyze in Insights
          </button>
        </div>
      </section>
    </div>
  );
}
