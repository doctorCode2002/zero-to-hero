
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { t } from '../lib/i18n';
import { Card, SectionTitle, Badge, Button } from '../components/Ui';
import { formatCurrency, calculateSessionCost, dateKey } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const { settings, students, courses, enrollments, subscriptions, expenses, workspace } = useAppStore();
  const lang = settings.lang;
  const navigate = useNavigate();

  // Calculate Financials
  const courseRevenue = enrollments.reduce((acc, e) => acc + e.paidAmount, 0);
  const subRevenue = subscriptions.reduce((acc, s) => acc + s.paidAmount, 0);
  const workspaceRevenue = workspace.reduce((acc, s) => acc + calculateSessionCost(s, settings.hourlyRate), 0);
  const totalRevenue = courseRevenue + subRevenue + workspaceRevenue;
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netBalance = totalRevenue - totalExpenses;

  // Debt Calculation
  const totalCoursePotential = enrollments.reduce((acc, e) => {
    const course = courses.find(c => c.id === e.courseId);
    return acc + (course?.priceTotal || 0);
  }, 0);
  const totalSubPotential = subscriptions.reduce((acc, s) => acc + s.totalPrice, 0);
  const totalDebt = (totalCoursePotential + totalSubPotential) - (courseRevenue + subRevenue);

  const chartData = [
    { name: t(lang, 'revenue'), value: totalRevenue, color: '#f97316' }, 
    { name: t(lang, 'expenses'), value: totalExpenses, color: '#ef4444' },
    { name: t(lang, 'totalDebt'), value: totalDebt, color: '#64748b' },
  ];

  const StatCard = ({ title, value, sub, color, bgColor, iconColor }: any) => (
    <Card className={`hover:scale-[1.02] transition-all border-none shadow-md ${bgColor} relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 group-hover:scale-110 transition-transform ${iconColor}`} />
      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
      <h3 className={`text-3xl font-black mb-1 tracking-tight ${color}`}>{value}</h3>
      <p className="text-[10px] text-slate-400 font-bold uppercase">{sub}</p>
    </Card>
  );

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <SectionTitle>{t(lang, 'dashboard')}</SectionTitle>
        <Badge color="brand">{dateKey()}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t(lang, 'revenue')} 
          value={formatCurrency(totalRevenue, settings.currency)} 
          sub={lang === 'ar' ? 'من جميع المصادر' : 'All Sources Combined'} 
          color="text-brand-500" 
          bgColor="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          iconColor="bg-brand-500"
        />
        <StatCard 
          title={t(lang, 'totalDebt')} 
          value={formatCurrency(totalDebt, settings.currency)} 
          sub={lang === 'ar' ? 'مبالغ لم يتم تحصيلها' : 'Uncollected Balance'} 
          color="text-red-500" 
          bgColor="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          iconColor="bg-red-500"
        />
        <StatCard 
          title={t(lang, 'students')} 
          value={students.length} 
          sub={lang === 'ar' ? 'طالب مسجل حالياً' : 'Total Registered'} 
          color="text-blue-500" 
          bgColor="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          iconColor="bg-blue-500"
        />
        <StatCard 
          title={t(lang, 'profit')} 
          value={formatCurrency(netBalance, settings.currency)} 
          sub={lang === 'ar' ? 'صافي الربح' : "Net Profit"} 
          color={netBalance >= 0 ? "text-emerald-500" : "text-red-500"} 
          bgColor="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          iconColor="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title={lang === 'ar' ? 'الأداء المالي' : 'Financial Health'} className="lg:col-span-2">
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f97316', opacity: 0.05 }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px', backgroundColor: '#1e293b', color: '#fff' }} 
                  itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title={t(lang, 'paymentAlerts')}>
            <div className="space-y-3 mt-2 max-h-[400px] overflow-y-auto">
              {students.filter(s => {
                const sEnrollments = enrollments.filter(e => e.studentId === s.id);
                const sSubs = subscriptions.filter(sub => sub.studentId === s.id);
                const due = sEnrollments.reduce((acc, e) => acc + (courses.find(c => c.id === e.courseId)?.priceTotal || 0), 0) +
                            sSubs.reduce((acc, sub) => acc + sub.totalPrice, 0);
                const paid = sEnrollments.reduce((acc, e) => acc + e.paidAmount, 0) + 
                             sSubs.reduce((acc, sub) => acc + sub.paidAmount, 0);
                return (due - paid) > 0;
              }).slice(0, 10).map(s => (
                <div key={s.id} className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-brand-500/50 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate(`/students/${s.id}`)}>
                  <div>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100">{s.name}</p>
                    <Badge color="red">{t(lang, 'pendingBalance')}</Badge>
                  </div>
                  <div className="text-brand-500 font-bold">
                    {lang === 'ar' ? '←' : '→'}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
