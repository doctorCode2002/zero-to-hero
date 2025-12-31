
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { t } from '../lib/i18n';
import { Card, SectionTitle, Button, Badge } from '../components/Ui';
import { formatCurrency, calculateSessionCost } from '../lib/utils';
import { GoogleGenAI } from '@google/genai';

// Extension to handle AI Studio global helpers
declare global {
  /**
   * The AIStudio interface for key management.
   * This matches the environment's expected 'AIStudio' type name.
   */
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    /**
     * Declaring aistudio and using the AIStudio type.
     * Added readonly to match environment declarations and resolve modifier mismatch errors.
     */
    readonly aistudio: AIStudio;
  }
}

export const AIHub: React.FC = () => {
  const { settings, students, courses, enrollments, subscriptions, expenses, workspace } = useAppStore();
  const lang = settings.lang;
  
  const [loadingMap, setLoadingMap] = useState<{ [key: string]: boolean }>({});
  const [results, setResults] = useState<{ [key: string]: string }>({});
  const [hasKey, setHasKey] = useState<boolean>(false);

  // Check key status on mount
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        // Fallback for non-AI Studio environments
        setHasKey(!!process.env.API_KEY);
      }
    };
    checkKey();
  }, []);

  const handleOpenKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success as per race condition guidelines
      setHasKey(true);
    } else {
      alert("This environment does not support manual key selection. Ensure process.env.API_KEY is set.");
    }
  };

  const generateAI = async (id: string, type: 'brief' | 'finance' | 'growth') => {
    // Check for key selection before proceeding. Selected API key is in process.env.API_KEY
    if (!process.env.API_KEY && !hasKey) {
      await handleOpenKey();
      return;
    }
    
    setLoadingMap(prev => ({ ...prev, [id]: true }));
    try {
      // Create a fresh instance for every call to ensure updated credentials.
      // Always use the named parameter and named environment variable directly.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const courseRev = enrollments.reduce((acc, e) => acc + e.paidAmount, 0);
      const subRev = subscriptions.reduce((acc, s) => acc + s.paidAmount, 0);
      const workRev = workspace.reduce((acc, s) => acc + calculateSessionCost(s, settings.hourlyRate), 0);
      const totalRev = courseRev + subRev + workRev;
      const totalExp = expenses.reduce((acc, e) => acc + e.amount, 0);

      const dataStr = `
        Context: Training Center CRM
        Financials: Revenue ${totalRev}, Expenses ${totalExp}
        Metrics: ${students.length} students, ${courses.length} courses.
        Currency: ${settings.currency}
      `;

      let prompt = "";
      if (type === 'brief') {
        prompt = `You are a professional business advisor. Provide a concise 3-point strategic briefing for today based on these numbers: ${dataStr}. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}. No markdown formatting, just plain text bullets.`;
      } else if (type === 'finance') {
        prompt = `Analyze the financial health and cash flow based on: ${dataStr}. Suggest two specific actions to improve the net profit. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
      } else if (type === 'growth') {
        prompt = `Based on a student base of ${students.length}, suggest a creative growth or marketing strategy. ${dataStr}. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
      }

      // Using the correct model for basic text tasks
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }]
      });

      // Extracting text directly from .text property
      const text = response.text || "No analysis available.";
      setResults(prev => ({ ...prev, [id]: text }));
    } catch (e: any) {
      console.error("AI Error:", e);
      let errorMsg = lang === 'ar' ? 'حدث خطأ أثناء التحليل.' : 'Analysis failed.';
      
      // Reset key selection if entity not found (e.g., project/billing issue)
      if (e.message?.includes("Requested entity was not found")) {
        errorMsg = lang === 'ar' ? 'يرجى اختيار مفتاح API صالح.' : 'Please select a valid API key.';
        setHasKey(false);
      }
      
      setResults(prev => ({ ...prev, [id]: errorMsg }));
    } finally {
      setLoadingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  const clearResult = (id: string) => {
    setResults(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const ToolCard = ({ id, type, title, icon, description }: any) => {
    const isLoading = loadingMap[id];
    const result = results[id];

    return (
      <Card className="h-full flex flex-col group overflow-hidden border-none shadow-lg relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
        
        <div className="relative p-2 flex flex-col h-full">
           <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-brand-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-brand-500/20 group-hover:rotate-6 transition-transform">
                    {icon}
                 </div>
                 <div>
                    <h3 className="font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight">{title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{description}</p>
                 </div>
              </div>
              {result && (
                <button 
                  onClick={() => clearResult(id)}
                  className="text-[10px] font-black text-slate-300 hover:text-red-500 uppercase transition-colors"
                >
                  {lang === 'ar' ? 'مسح' : 'Clear'}
                </button>
              )}
           </div>
           
           <div className={`flex-1 min-h-[160px] rounded-2xl p-5 border transition-all duration-300 ${
             result 
              ? 'bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-700' 
              : 'bg-slate-50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800'
           } relative overflow-y-auto`}>
              {isLoading ? (
                 <div className="flex flex-col items-center justify-center gap-4 h-full py-10">
                    <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase text-brand-500 tracking-widest animate-pulse">
                      {lang === 'ar' ? 'جاري التحليل...' : 'Analyzing Data...'}
                    </span>
                 </div>
              ) : result ? (
                 <div className="text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {result}
                 </div>
              ) : (
                 <div className="h-full flex flex-col items-center justify-center opacity-40">
                    <div className="text-4xl mb-2">⚡</div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest text-center max-w-[120px]">
                      {lang === 'ar' ? 'اضغط أدناه للبدء' : 'Tap button to start analysis'}
                    </p>
                 </div>
              )}
           </div>

           <div className="mt-5 space-y-2">
             <Button 
                onClick={() => generateAI(id, type)} 
                disabled={isLoading} 
                className={`w-full !py-3.5 !rounded-2xl transition-all ${
                  result ? 'bg-slate-800 hover:bg-slate-900' : ''
                }`}
             >
                {isLoading ? (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...') : t(lang, type === 'brief' ? 'generateDailyBrief' : type === 'finance' ? 'financialAnalysis' : 'growthAdvice')}
             </Button>
           </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="relative rounded-[3rem] bg-slate-900 dark:bg-brand-950 p-12 text-white overflow-hidden shadow-2xl mb-12 border border-slate-800 dark:border-brand-900/50">
         <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-500/20 rounded-full blur-[100px] -mr-64 -mt-64 animate-pulse" />
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -ml-48 -mb-48" />
         
         <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left rtl:md:text-right">
               <div className="w-24 h-24 bg-gradient-to-br from-brand-400 to-brand-600 rounded-[2rem] shadow-2xl shadow-brand-500/40 flex items-center justify-center text-5xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  🧠
               </div>
               <div className="space-y-2">
                  <SectionTitle className="!text-white !m-0 !text-5xl lg:!text-6xl !leading-tight">{t(lang, 'aiHub')}</SectionTitle>
                  <p className="text-slate-400 font-medium max-w-lg text-lg leading-relaxed">
                     {lang === 'ar' 
                       ? 'قم بتشغيل محركات الذكاء الاصطناعي للحصول على رؤى استراتيجية فورية حول أداء مركزك.' 
                       : 'Engage AI engines to gain instant strategic insights into your center\'s performance.'}
                  </p>
               </div>
            </div>

            <div className="flex flex-col items-center lg:items-end gap-4">
              <Badge color={hasKey ? "green" : "orange"}>
                {hasKey ? (lang === 'ar' ? 'الذكاء الاصطناعي متصل' : 'AI Engine Connected') : (lang === 'ar' ? 'بانتظار الإعداد' : 'Setup Required')}
              </Badge>
              <Button 
                variant={hasKey ? "secondary" : "primary"} 
                onClick={handleOpenKey}
                className="!rounded-full !px-8 !py-4 shadow-2xl"
              >
                {lang === 'ar' ? '⚙️ إعداد الاتصال' : '⚙️ Setup AI Connection'}
              </Button>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">
                Powered by Gemini 3 Flash
              </p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <ToolCard 
            id="brief" 
            type="brief"
            title={t(lang, 'advisorBrief')}
            icon="✨"
            description={lang === 'ar' ? 'ملخص الصباح' : 'Daily Briefing'}
         />
         <ToolCard 
            id="finance" 
            type="finance"
            title={t(lang, 'financialAnalysis')}
            icon="📊"
            description={lang === 'ar' ? 'تحليل المديونية' : 'Debt & Revenue Analysis'}
         />
         <ToolCard 
            id="growth" 
            type="growth"
            title={t(lang, 'growthAdvice')}
            icon="🚀"
            description={lang === 'ar' ? 'استراتيجية التوسع' : 'Expansion Strategy'}
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-slate-50 dark:bg-slate-900/50 border-none">
          <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs mb-4 tracking-widest">
            {lang === 'ar' ? 'الخصوصية والبيانات' : 'Privacy & Data'}
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {lang === 'ar' 
                 ? 'يتم تشفير بياناتك وإرسالها فقط عند طلب التحليل. لا يتم تخزين المعلومات الشخصية للطلاب بشكل دائم في السحابة؛ يتم إرسال أرقام مجمعة فقط.'
                 : 'Your data is encrypted and sent only when you request an analysis. No individual student personal info is stored permanently in the cloud; only aggregated figures are sent.'}
          </p>
        </Card>
        
        <Card className="bg-brand-50/50 dark:bg-brand-900/10 border-none">
          <h4 className="font-black text-brand-600 dark:text-brand-400 uppercase text-xs mb-4 tracking-widest">
            {lang === 'ar' ? 'تلميحات الاستخدام' : 'Usage Tips'}
          </h4>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 font-medium">
            <li className="flex gap-2"><span>🔹</span> {lang === 'ar' ? 'قم بتحديث البيانات قبل طلب التحليل لضمان دقة الرؤى.' : 'Update records before analysis to ensure accurate insights.'}</li>
            <li className="flex gap-2"><span>🔹</span> {lang === 'ar' ? 'استخدم تقرير "تحليل المديونية" لمتابعة تحصيل الرسوم.' : 'Use the "Debt Analysis" report to track fee collections.'}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
