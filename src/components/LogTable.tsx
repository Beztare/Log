import React from 'react';
import { format } from 'date-fns';
import { LogEntry } from '../types';
import { cn } from '../lib/utils';
import { Database, Clock, Terminal } from 'lucide-react';

interface LogTableProps {
  logs: LogEntry[];
  selectedId?: string;
  onSelect: (log: LogEntry) => void;
}

const severityConfig = {
  info: { iconColor: 'text-blue-500', barColor: 'bg-blue-500', bgColor: 'bg-blue-50/50' },
  warn: { iconColor: 'text-orange-500', barColor: 'bg-orange-500', bgColor: 'bg-orange-50/50' },
  error: { iconColor: 'text-red-500', barColor: 'bg-red-500', bgColor: 'bg-red-50/50' },
  debug: { iconColor: 'text-gray-400', barColor: 'bg-gray-400', bgColor: 'bg-gray-50/50' },
};

export default function LogTable({ logs, selectedId, onSelect }: LogTableProps) {
  return (
    <div className="w-full border-collapse">
      <div className="flex border-b border-[#E0E0E0] bg-white sticky top-0 z-[5] text-[10px] uppercase font-bold text-[#999] tracking-widest px-4 py-2">
        <div className="w-12"></div>
        <div className="w-48 px-2 flex items-center gap-1.5"><Clock size={12} /> Timestamp</div>
        <div className="w-40 px-2 flex items-center gap-1.5"><Database size={12} /> Source</div>
        <div className="flex-1 px-2 flex items-center gap-1.5"><Terminal size={12} /> Message</div>
        <div className="w-24 px-2 tracking-normal">Severity</div>
      </div>
      
      <div className="divide-y divide-[#F0F0F0]">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-[#999]">
            <p className="mb-2">No logs found matching your filters</p>
            <p className="text-xs italic">Try adjusting your search criteria</p>
          </div>
        ) : (
          logs.map((log) => {
            const config = severityConfig[log.severity];
            const isSelected = selectedId === log.id;
            
            return (
              <div 
                key={log.id} 
                onClick={() => onSelect(log)}
                className={cn(
                  "flex items-center px-4 py-2.5 transition-all cursor-pointer group text-sm relative overflow-hidden",
                  isSelected ? "bg-[#FFF4ED] border-y border-orange-100" : "bg-white hover:bg-[#F9FAFB]"
                )}
              >
                {/* Severity indicator bar */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-1 opacity-0 transition-opacity", isSelected ? "opacity-100 bg-orange-500" : "group-hover:opacity-100", config.barColor)}></div>
                
                <div className="w-12 text-xs font-mono text-[#CCC] group-hover:text-[#999] transition-colors">
                  {log.id.slice(0, 4)}
                </div>
                
                <div className="w-48 px-2 font-mono text-[13px] text-[#666]">
                  {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                </div>
                
                <div className="w-40 px-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
                    {log.source}
                  </span>
                </div>
                
                <div className="flex-1 px-2 font-medium text-[#111] truncate">
                   {log.message}
                </div>
                
                <div className="w-24 px-2">
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold uppercase",
                    log.severity === 'error' ? "bg-red-50 text-red-600 border-red-100" :
                    log.severity === 'warn' ? "bg-orange-50 text-orange-600 border-orange-100" :
                    log.severity === 'info' ? "bg-blue-50 text-blue-600 border-blue-100" :
                    "bg-gray-50 text-gray-500 border-gray-100"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", config.barColor)}></div>
                    {log.severity}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
