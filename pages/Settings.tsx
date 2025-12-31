
import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { t } from '../lib/i18n';
import { Card, Button, Input, Select, SectionTitle, Badge } from '../components/Ui';
import { formatCurrency, calculateSessionCost } from '../lib/utils';

export const Settings: React.FC = () => {
  const { settings, setSettings, importJSON, enrollments, subscriptions, workspace, expenses } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lang = settings.lang;

  // Revenue Breakdown
  const courseRevenue = enrollments.reduce((acc, e) => acc + e.paidAmount, 0);
  const subRevenue = subscriptions.reduce((acc, s) => acc + s.paidAmount, 0);
  const workspaceRevenue = workspace.reduce((acc, s) => acc + calculateSessionCost(s, settings.hourlyRate), 0);
  const totalRev = courseRevenue + subRevenue + workspaceRevenue;
  const totalExp = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netBalance = totalRev - totalExp;

  const handleJSONExport = () => {
    const data = JSON.stringify(useAppStore.getState());
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `z2h-system-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const handleJSONImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const res = importJSON(content);
      if (res.ok) {
        alert(t(settings.lang, 'importSuccess'));
      } else {
        alert("Error: " + res.error);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const updateSubPrice = (plan: 'daily' | 'weekly' | 'monthly', value: number) => {
    setSettings({
      subPrices: {
        ...settings.subPrices,
        [plan]: value
      }
    });
  };

  return (
    <div className="space-y-8">
      <SectionTitle>{t(settings.lang, 'settings')}</SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preference Card */}
        <div className="space-y-8 lg:col-span-1">
          <Card title={settings.lang === 'ar' ? 'تفضيلات النظام' : 'System Preferences'}>
             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2 block tracking-widest">{t(settings.lang, 'language')}</label>
                   <Select value={settings.lang} onChange={e => setSettings({ lang: e.target.value as any })}>
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                   </Select>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2 block tracking-widest">{t(settings.lang, 'hourlyRate')}</label>
                   <Input type="number" value={settings.hourlyRate} onChange={e => setSettings({ hourlyRate: Number(e.target.value) })} />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2 block tracking-widest">{settings.lang === 'ar' ? 'العملة' : 'Currency Code'}</label>
                   <Select value={settings.currency} onChange={e => setSettings({ currency: e.target.value })}>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="ILS">ILS (₪)</option>
                      <option value="EGP">EGP (LE)</option>
                      <option value="SAR">SAR (SR)</option>
                      <option value="AED">AED</option>
                   </Select>
                </div>
             </div>
          </Card>

          <Card title={settings.lang === 'ar' ? 'أسعار الاشتراكات' : 'Subscription Prices'}>
             <div className="space-y-4">
                <div className="grid grid-cols-2 items-center gap-4">
                  <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-400">{t(settings.lang, 'daily')}</span>
                  <Input type="number" value={settings.subPrices.daily} onChange={e => updateSubPrice('daily', Number(e.target.value))} />
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-400">{t(settings.lang, 'weekly')}</span>
                  <Input type="number" value={settings.subPrices.weekly} onChange={e => updateSubPrice('weekly', Number(e.target.value))} />
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-400">{t(settings.lang, 'monthly')}</span>
                  <Input type="number" value={settings.subPrices.monthly} onChange={e => updateSubPrice('monthly', Number(e.target.value))} />
                </div>
             </div>
          </Card>
        </div>

        {/* Financial Summary Card */}
        <div className="lg:col-span-1">
          <Card title={t(lang, 'summary')}>
             <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t(lang, 'revenue')}</p>
                  <p className="text-3xl font-black text-brand-500">{formatCurrency(totalRev, settings.currency)}</p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                   <div className="flex justify-between items-center px-2 py-1">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t(lang, 'courses')}</span>
                      <span className="text-xs font-black text-slate-900 dark:text-slate-50">{formatCurrency(courseRevenue, settings.currency)}</span>
                   </div>
                   <div className="flex justify-between items-center px-2 py-1">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t(lang, 'subscriptions')}</span>
                      <span className="text-xs font-black text-slate-900 dark:text-slate-50">{formatCurrency(subRevenue, settings.currency)}</span>
                   </div>
                   <div className="flex justify-between items-center px-2 py-1">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t(lang, 'workspace')}</span>
                      <span className="text-xs font-black text-slate-900 dark:text-slate-50">{formatCurrency(workspaceRevenue, settings.currency)}</span>
                   </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

                <div className="flex justify-between items-center px-2">
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t(lang, 'expenses')}</span>
                   <span className="text-xs font-black text-red-500">{formatCurrency(totalExp, settings.currency)}</span>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{t(lang, 'profit')}</p>
                  <p className={`text-2xl font-black ${netBalance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatCurrency(netBalance, settings.currency)}</p>
                </div>
             </div>
          </Card>
        </div>

        {/* Backup Card */}
        <div className="lg:col-span-1 space-y-8">
          <Card title={t(settings.lang, 'fullSystemBackup')}>
            <div className="space-y-6">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t(settings.lang, 'backupDescription')}</p>
                <Button variant="primary" className="w-full" onClick={handleJSONExport}>
                  {t(settings.lang, 'exportData')} (.json)
                </Button>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800" />

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t(settings.lang, 'restoreDescription')}</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".json" 
                  onChange={handleJSONImport} 
                />
                <Button variant="secondary" className="w-full" onClick={() => fileInputRef.current?.click()}>
                  {t(settings.lang, 'importData')} (.json)
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
