
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { t, isRTL } from '../lib/i18n';
import { Button } from './Ui';

const NavItem: React.FC<{ to: string; label: string; icon?: React.ReactNode }> = ({ to, label, icon }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
        isActive 
          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, setSettings } = useAppStore();
  const rtl = isRTL(settings.lang);

  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    setSettings({ theme: newTheme });
  };

  React.useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300 ${rtl ? 'text-right' : 'text-left'}`} dir={rtl ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className={`w-72 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-8 shadow-xl z-20 sticky top-0 h-screen overflow-y-auto ${rtl ? 'border-l' : 'border-r'}`}>
        <div>
          <h1 className="text-3xl font-black text-brand-500 mb-1">{t(settings.lang, 'appName')}</h1>
          <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">Center Management</p>
        </div>
        
        <nav className="flex flex-col gap-1 flex-1">
          <NavItem to="/" label={t(settings.lang, 'dashboard')} />
          <NavItem to="/ai-hub" label={t(settings.lang, 'aiHub')} />
          <NavItem to="/courses" label={t(settings.lang, 'courses')} />
          <NavItem to="/mentors" label={t(settings.lang, 'mentors')} />
          <NavItem to="/students" label={t(settings.lang, 'students')} />
          <NavItem to="/workspace" label={t(settings.lang, 'workspace')} />
          <NavItem to="/subscriptions" label={t(settings.lang, 'subscriptions')} />
          <NavItem to="/expenses" label={t(settings.lang, 'expenses')} />
          <NavItem to="/reports" label={t(settings.lang, 'reports')} />
          <NavItem to="/settings" label={t(settings.lang, 'settings')} />
        </nav>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
           <Button variant="secondary" onClick={toggleTheme}>
             {settings.theme === 'light' ? t(settings.lang, 'dark') : t(settings.lang, 'light')}
           </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};
