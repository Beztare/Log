import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { LogEntry } from '../types';
import { format, subHours, startOfHour } from 'date-fns';
import { TrendingUp, AlertTriangle, Activity, Globe } from 'lucide-react';

interface DashboardProps {
  logs: LogEntry[];
}

export default function Dashboard({ logs }: DashboardProps) {
  const timeData = useMemo(() => {
    const hours: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 24 hours
    for (let i = 23; i >= 0; i--) {
      const hourStr = format(subHours(now, i), 'HH:00');
      hours[hourStr] = 0;
    }

    logs.forEach(log => {
      const h = format(new Date(log.timestamp), 'HH:00');
      if (hours[h] !== undefined) {
        hours[h]++;
      }
    });

    return Object.entries(hours).map(([hour, count]) => ({ hour, count }));
  }, [logs]);

  const severityData = useMemo(() => {
    const counts = { info: 0, warn: 0, error: 0, debug: 0 };
    logs.forEach(log => counts[log.severity]++);
    return [
      { name: 'Info', value: counts.info, color: '#3B82F6' },
      { name: 'Warning', value: counts.warn, color: '#F97316' },
      { name: 'Error', value: counts.error, color: '#EF4444' },
      { name: 'Debug', value: counts.debug, color: '#9CA3AF' },
    ];
  }, [logs]);

  const sourceData = useMemo(() => {
    const sources: Record<string, number> = {};
    logs.forEach(log => {
      sources[log.source] = (sources[log.source] || 0) + 1;
    });
    return Object.entries(sources)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Events" 
          value={logs.length.toLocaleString()} 
          change="+12.5%" 
          icon={<Activity size={20} className="text-blue-500" />} 
          subtitle="Events per second: 12.4"
        />
        <StatCard 
          title="Error Rate" 
          value={((logs.filter(l => l.severity === 'error').length / logs.length) * 100).toFixed(2) + '%'} 
          change="-2.1%" 
          icon={<AlertTriangle size={20} className="text-red-500" />} 
          subtitle="Critical failures detected"
          isNegative
        />
        <StatCard 
          title="Active Sources" 
          value={new Set(logs.map(l => l.source)).size.toString()} 
          change="0%" 
          icon={<Globe size={20} className="text-purple-500" />} 
          subtitle="All clusters reporting"
        />
        <StatCard 
          title="Mean Latency" 
          value="42ms" 
          change="+5ms" 
          icon={<TrendingUp size={20} className="text-green-500" />} 
          subtitle="Avg response across edge"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Event Throughput</h3>
              <p className="text-xs text-[#999]">Log volume ingested over the last 24 hours</p>
            </div>
            <div className="flex gap-2 text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Live Stream
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#999' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#999' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#F97316" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-sm">
          <h3 className="text-lg font-bold tracking-tight mb-8">Severity Distribution</h3>
          <div className="h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {severityData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs font-medium text-[#666]">{item.name}</span>
                </div>
                <span className="text-xs font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-sm">
          <h3 className="text-lg font-bold tracking-tight mb-8">Source Distribution</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0F0F0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#666' }}
                  width={100}
                />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="#F97316" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Quick Insights List */}
        <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-sm">
          <h3 className="text-lg font-bold tracking-tight mb-4">Anomaly Detection</h3>
          <div className="space-y-2">
             <InsightItem 
               type="error" 
               title="Multiple timeouts in payment-gateway" 
               time="2 mins ago" 
               desc="Higher than average latency detected in us-east-1 region"
             />
             <InsightItem 
               type="warn" 
               title="Database cluster re-indexing in progress" 
               time="15 mins ago" 
               desc="Query response time may be impacted for the next 10 minutes"
             />
             <InsightItem 
               type="info" 
               title="New software version deployed" 
               time="1 hour ago" 
               desc="user-api version v2.4.1 is now live in production"
             />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon, subtitle, isNegative = false }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] shadow-sm flex flex-col justify-between h-[140px] hover:border-orange-200 transition-colors cursor-default">
      <div className="flex justify-between items-start">
        <div className="bg-[#F9FAFB] p-2 rounded-xl border border-[#F3F4F6]">
          {icon}
        </div>
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isNegative ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {change}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-medium text-[#999] uppercase tracking-widest">{title}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight">{value}</span>
        </div>
        <p className="text-[10px] text-[#BBB] mt-1 italic">{subtitle}</p>
      </div>
    </div>
  );
}

function InsightItem({ type, title, time, desc }: any) {
  const colors = {
    error: 'bg-red-50 text-red-600 border-red-100',
    warn: 'bg-orange-50 text-orange-600 border-orange-100',
    info: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  return (
    <div className="p-4 rounded-xl border border-[#F0F0F0] hover:bg-[#F9F9FB] transition-colors group">
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-sm font-bold text-[#333] group-hover:text-orange-600 transition-colors">{title}</h4>
        <span className="text-[10px] font-medium text-[#999]">{time}</span>
      </div>
      <p className="text-xs text-[#666] leading-relaxed mb-2">{desc}</p>
      <div className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${colors[type as keyof typeof colors]}`}>
        {type}
      </div>
    </div>
  );
}
