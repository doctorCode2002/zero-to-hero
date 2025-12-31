
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { t } from '../lib/i18n';
import { Card, SectionTitle, Badge, Input, Button } from '../components/Ui';
import { formatCurrency, calculateSessionCost, isDateInRange } from '../lib/utils';

export const Reports: React.FC = () => {
  const { settings, enrollments, subscriptions, expenses, workspace } = useAppStore();
  const lang = settings.lang;

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Filtered Data Calculations
  const metrics = useMemo(() => {
    const filteredEnrollments = enrollments.filter(e => isDateInRange(e.createdAt, startDate, endDate));
    const filteredSubscriptions = subscriptions.filter(s => isDateInRange(s.createdAt, startDate, endDate));
    const filteredExpenses = expenses.filter(ex => isDateInRange(ex.date, startDate, endDate));
    const filteredWorkspace = workspace.filter(w => isDateInRange(w.date, startDate, endDate));

    const courseRevenue = filteredEnrollments.reduce((acc, e) => acc + e.paidAmount, 0);
    const subRevenue = filteredSubscriptions.reduce((acc, s) => acc + s.paidAmount, 0);
    const workspaceRevenue = filteredWorkspace.reduce((acc, s) => acc + calculateSessionCost(s, settings.hourlyRate), 0);
    
    const totalRev = courseRevenue + subRevenue + workspaceRevenue;
    const totalExp = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = totalRev - totalExp;
    const profitMargin = totalRev > 0 ? ((netProfit / totalRev) * 100).toFixed(1) : "0";

    return {
      courseRevenue,
      subRevenue,
      workspaceRevenue,
      totalRev,
      totalExp,
      netProfit,
      profitMargin
    };
  }, [enrollments, subscriptions, expenses, workspace, startDate, endDate, settings.hourlyRate]);

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <SectionTitle>{t(lang, 'reports')}</SectionTitle>
        
        <Card className="!p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[150px]">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">
                {lang === 'ar' ? 'من تاريخ' : 'From Date'}
              </label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="!py-1.5 !text-xs"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">
                {lang === 'ar' ? 'إلى تاريخ' : 'To Date'}
              </label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="!py-1.5 !text-xs"
              />
            </div>
            <Button 
              variant="secondary" 
              onClick={resetFilters}
              disabled={!startDate && !endDate}
              className="!py-2 !px-4 !text-[10px]"
            >
              {lang === 'ar' ? 'كل الأوقات' : 'All Time'}
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title={t(lang, 'summary')} headerAction={
          <Badge color={startDate || endDate ? "brand" : "slate"}>
            {startDate || endDate 
              ? `${startDate || '...'} / ${endDate || '...'}` 
              : (lang === 'ar' ? 'كامل الفترة' : 'All Time')}
          </Badge>
        }>
           <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
                 <span>{lang === 'ar' ? 'المصدر' : 'Source'}</span>
                 <span>{lang === 'ar' ? 'المبلغ' : 'Amount'}</span>
              </div>
              
              <div className="flex justify-between items-center group">
                 <span className="text-slate-600 dark:text-slate-400 font-bold group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                   {t(lang, 'courses')}
                 </span>
                 <span className="font-black text-sm text-slate-900 dark:text-slate-50">
                   {formatCurrency(metrics.courseRevenue, settings.currency)}
                 </span>
              </div>
              
              <div className="flex justify-between items-center group">
                 <span className="text-slate-600 dark:text-slate-400 font-bold group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                   {t(lang, 'subscriptions')}
                 </span>
                 <span className="font-black text-sm text-slate-900 dark:text-slate-50">
                   {formatCurrency(metrics.subRevenue, settings.currency)}
                 </span>
              </div>
              
              <div className="flex justify-between items-center group">
                 <span className="text-slate-600 dark:text-slate-400 font-bold group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                   {t(lang, 'workspace')}
                 </span>
                 <span className="font-black text-sm text-slate-900 dark:text-slate-50">
                   {formatCurrency(metrics.workspaceRevenue, settings.currency)}
                 </span>
              </div>
              
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
              
              <div className="flex justify-between items-center p-3 rounded-xl bg-brand-50/50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/40">
                 <span className="text-brand-600 dark:text-brand-400 font-black text-xs uppercase tracking-widest">{t(lang, 'revenue')}</span>
                 <span className="font-black text-brand-600 dark:text-brand-400 text-lg">{formatCurrency(metrics.totalRev, settings.currency)}</span>
              </div>
              
              <div className="flex justify-between items-center px-3">
                 <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase">{t(lang, 'expenses')}</span>
                 <span className="font-black text-red-500">{formatCurrency(metrics.totalExp, settings.currency)}</span>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                 <div className="flex justify-between items-end mb-4">
                    <span className="text-slate-900 dark:text-slate-100 font-black text-2xl tracking-tighter">{t(lang, 'profit')}</span>
                    <span className={`font-black text-3xl tracking-tighter ${metrics.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                       {formatCurrency(metrics.netProfit, settings.currency)}
                    </span>
                 </div>
                 
                 <div className="flex items-center gap-2">
                   <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-500 transition-all duration-1000" 
                        style={{ width: `${Math.min(100, Math.max(0, Number(metrics.profitMargin)))}%` }} 
                      />
                   </div>
                   <Badge color="brand">{metrics.profitMargin}%</Badge>
                 </div>
              </div>
           </div>
        </Card>

        <div className="space-y-6">
          <Card title={lang === 'ar' ? 'نصيحة سريعة' : 'Quick Tip'}>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {lang === 'ar' 
                ? 'استخدم منتقي التاريخ في الأعلى لمشاهدة أداء المركز في فترات زمنية محددة مثل الشهر الحالي أو الأسبوع الماضي.'
                : 'Use the date picker above to view the center\'s performance for specific time periods like the current month or last week.'}
            </p>
          </Card>
          
          <div className="p-8 rounded-3xl bg-slate-900 dark:bg-brand-950 text-white relative overflow-hidden shadow-xl border border-slate-800 dark:border-brand-900/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              {lang === 'ar' ? 'رؤى الذكاء الاصطناعي' : 'AI Insights'}
            </h4>
            <p className="text-lg font-bold mb-4">
              {lang === 'ar' 
                ? 'هل تريد تحليلاً أعمق لهذه الأرقام؟' 
                : 'Want a deeper analysis of these numbers?'}
            </p>
            <Button variant="primary" className="!rounded-full !px-6" onClick={() => window.location.hash = '#/ai-hub'}>
              {t(lang, 'aiHub')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
