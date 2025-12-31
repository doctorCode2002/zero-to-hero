
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { t } from '../lib/i18n';
import { Card, Button, Input, SectionTitle, Badge, Table, Thead, Tbody, Tr, Th, Td } from '../components/Ui';
import { formatCurrency, dateKey, calculateSessionCost } from '../lib/utils';

export const Workspace: React.FC = () => {
  const { settings, workspace, checkIn, checkOut, deleteWorkspaceSession } = useAppStore();
  const [personName, setPersonName] = useState("");
  const [search, setSearch] = useState("");
  const [viewDate, setViewDate] = useState(dateKey());
  const lang = settings.lang;

  // Filter sessions based on selected date and search query
  const sessions = useMemo(() => {
    return workspace.filter(w => 
      w.date === viewDate && 
      w.personName.toLowerCase().includes(search.toLowerCase())
    );
  }, [workspace, viewDate, search]);

  // Calculate total for the selected day
  const dailyTotal = useMemo(() => {
    return sessions.reduce((acc, s) => acc + calculateSessionCost(s, settings.hourlyRate), 0);
  }, [sessions, settings.hourlyRate]);

  const handleCheckIn = () => {
    if (personName.trim()) {
      // Pass viewDate to checkIn so users can log sessions for specific days if needed
      checkIn(personName.trim(), viewDate);
      setPersonName("");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه الجلسة؟' : 'Are you sure you want to delete this session?')) {
      deleteWorkspaceSession(id);
    }
  };

  return (
    <div className="space-y-8">
      <SectionTitle>{t(lang, 'workspace')}</SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <Card title={t(lang, 'checkIn')}>
             <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase mb-1 block tracking-widest">{t(lang, 'name')}</label>
                  <Input 
                    value={personName} 
                    onChange={e => setPersonName(e.target.value)} 
                    placeholder={lang === 'ar' ? 'اسم الزائر' : "Visitor Name"} 
                    onKeyDown={e => e.key === 'Enter' && handleCheckIn()}
                  />
                </div>
                <Button className="w-full" onClick={handleCheckIn}>
                  {t(lang, 'checkIn')}
                </Button>
                <div className="mt-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 text-orange-600 text-sm font-bold border border-orange-100 dark:border-orange-900/20">
                   {t(lang, 'hourlyRate')}: {formatCurrency(settings.hourlyRate, settings.currency)} / hr
                </div>
             </div>
          </Card>

          <Card title={lang === 'ar' ? 'إجمالي اليوم' : 'Daily Total'}>
            <div className="flex flex-col items-center justify-center py-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{viewDate}</span>
              <h2 className="text-4xl font-black text-brand-500 tracking-tighter">
                {formatCurrency(dailyTotal, settings.currency)}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
                {sessions.length} {lang === 'ar' ? 'جلسات إجمالية' : 'Total Sessions'}
              </p>
            </div>
          </Card>
        </div>

        <Card 
          className="lg:col-span-2" 
          title={t(lang, 'sessions')} 
          headerAction={
            <div className="flex items-center gap-3">
              <Input 
                type="date"
                className="!py-1.5 !px-3 w-40 !text-xs" 
                value={viewDate} 
                onChange={e => setViewDate(e.target.value)} 
              />
              <Input 
                className="!py-1.5 !px-3 w-40 !text-xs" 
                placeholder={t(lang, 'search') + "..."} 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
          }
        >
          <Table>
            <Thead>
              <Tr>
                <Th>{t(lang, 'name')}</Th>
                <Th>{t(lang, 'checkIn')}</Th>
                <Th>{t(lang, 'checkOut')}</Th>
                <Th>{t(lang, 'cost')}</Th>
                <Th className="text-right">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sessions.map(s => {
                const isDone = !!s.checkOutAt;
                const cost = calculateSessionCost(s, settings.hourlyRate);
                
                return (
                  <Tr key={s.id}>
                    <Td className="font-bold text-slate-900 dark:text-slate-100">{s.personName}</Td>
                    <Td className="text-xs font-semibold">
                      {new Date(s.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Td>
                    <Td className="text-xs font-semibold">
                      {isDone ? new Date(s.checkOutAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </Td>
                    <Td>
                      {isDone ? (
                        <Badge color="green">{formatCurrency(cost, settings.currency)}</Badge>
                      ) : (
                        <Badge color="orange">{lang === 'ar' ? 'نشط' : 'Active'}</Badge>
                      )}
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-2">
                        {!isDone && (
                          <Button 
                            variant="secondary" 
                            className="!py-1 !px-3 text-[10px]" 
                            onClick={() => checkOut(s.id)}
                          >
                            {t(lang, 'checkOut')}
                          </Button>
                        )}
                        <Button 
                          variant="danger" 
                          className="!py-1 !px-3 text-[10px]" 
                          onClick={() => handleDelete(s.id)}
                        >
                          {lang === 'ar' ? 'حذف' : 'Del'}
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
              {sessions.length === 0 && (
                <Tr>
                  <Td colSpan={5} className="text-center py-16 text-slate-400 italic font-medium">
                    {lang === 'ar' 
                      ? `لا توجد جلسات مسجلة لتاريخ ${viewDate}` 
                      : `No sessions found for ${viewDate}.`}
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
};
