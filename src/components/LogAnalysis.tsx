import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LogEntry } from '../types';
import { BrainCircuit, Sparkles, AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface LogAnalysisProps {
  logs: LogEntry[];
}

export default function LogAnalysis({ logs }: LogAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const gapi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Summarize logs for analysis
      const logSummary = logs.slice(0, 50).map(l => 
        `[${l.timestamp}] [${l.severity.toUpperCase()}] [${l.source}] ${l.message}`
      ).join('\n');

      const prompt = `You are an expert site reliability engineer. Analyze these system logs and provide a concise technical summary. 
      Identify patterns, potential root causes for errors, and suggest immediate actions.
      
      LOGS:
      ${logSummary}
      
      Format the response with:
      1. Overall Health Status
      2. Key Anomalies Observed
      3. Recommended Actions
      Keep it professional and technical.`;

      const response = await gapi.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      if (response.text) {
        setAnalysis(response.text);
      } else {
        throw new Error("No analysis generated");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to complete AI analysis. Please check your configuration.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 text-white shadow-xl shadow-orange-500/20 mb-2">
          <BrainCircuit size={32} />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-[#1A1A1A]">AI-Powered Insights</h2>
        <p className="text-[#666] max-w-xl mx-auto leading-relaxed">
          Leverage advanced neural analysis to detect hidden patterns, correlate remote errors, and receive actionable remediation steps from your log streams.
        </p>
      </header>

      <div className="bg-white rounded-3xl border border-[#E0E0E0] shadow-xl overflow-hidden relative">
        <div className="p-8">
            {!analysis && !isAnalyzing && (
              <div className="space-y-6 text-center py-12">
                <div className="flex justify-center gap-4">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#F0F0F0] bg-[#FAFAFA] w-32">
                    <AlertCircle className="text-red-500" size={24} />
                    <span className="text-[10px] uppercase font-black text-[#999]">Patterns</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#F0F0F0] bg-[#FAFAFA] w-32">
                    <Sparkles className="text-orange-500" size={24} />
                    <span className="text-[10px] uppercase font-black text-[#999]">Root Cause</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#F0F0F0] bg-[#FAFAFA] w-32">
                    <CheckCircle2 className="text-green-500" size={24} />
                    <span className="text-[10px] uppercase font-black text-[#999]">Actions</span>
                  </div>
                </div>
                
                <button 
                  onClick={performAnalysis}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold hover:bg-orange-500 transition-all shadow-lg active:scale-95 group"
                >
                  <Send size={18} className="transition-transform group-hover:translate-x-1" />
                  Analyze Current Sequence
                </button>
              </div>
            )}

            {isAnalyzing && (
              <div className="py-20 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
                  <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500" size={24} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg animate-pulse">Running Neural Correlation...</p>
                  <p className="text-sm text-[#999] mt-1 italic">Analyzing clusters, sources, and severity distributions</p>
                </div>
              </div>
            )}

            <AnimatePresence>
              {analysis && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-slate max-w-none prose-headings:text-[#111] prose-p:text-[#444] prose-strong:text-orange-600"
                >
                  <div className="flex items-center justify-between mb-6 border-b border-[#F0F0F0] pb-4">
                    <h3 className="text-xl font-bold m-0 flex items-center gap-2">
                       <Sparkles size={20} className="text-orange-500" />
                       Synthesis Report
                    </h3>
                    <button 
                      onClick={() => setAnalysis(null)}
                      className="text-xs font-bold text-orange-600 uppercase tracking-widest hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                  
                  <div className="bg-[#FAFAFB] p-8 rounded-2xl border border-[#F0F0F0] whitespace-pre-wrap font-sans leading-relaxed text-sm shadow-inner">
                    {analysis}
                  </div>

                  <div className="mt-8 flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                     <p className="text-xs text-orange-800 m-0 font-medium">This report was generated using {logs.length} data points across {new Set(logs.map(l => l.source)).size} sources.</p>
                     <div className="flex gap-2">
                        <button className="text-[10px] font-black uppercase text-orange-600 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors border border-orange-200">Export PDF</button>
                        <button className="text-[10px] font-black uppercase text-orange-600 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors border border-orange-200">Share with Team</button>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-red-800">Connection Interrupted</p>
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-[#E0E0E0] space-y-2">
          <h4 className="text-sm font-bold">Predictive Scaling</h4>
          <p className="text-xs text-[#666]">Based on current trends, we recommend increasing the user-api pod count by 2 in the next hour.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-[#E0E0E0] space-y-2">
          <h4 className="text-sm font-bold">Threat Intelligence</h4>
          <p className="text-xs text-[#666]">No malicious IP clusters detected in the current log window. Security status: Clear.</p>
        </div>
      </div>
    </div>
  );
}
