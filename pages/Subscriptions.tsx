
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { t } from '../lib/i18n';
import { Card, Button, Input, Select, SectionTitle, Badge } from '../components/Ui';
import { formatCurrency } from '../lib/utils';
import { SubscriptionPlan } from '../types';

export const Subscriptions: React.FC = () => {
  const { settings, students, subscriptions, addSubscription, deleteSubscription, addSubscriptionPayment } = useAppStore();
  const [personName, setPersonName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [plan, setPlan] = useState<SubscriptionPlan>("monthly");
  const [totalPrice, setTotalPrice] = useState(settings.subPrices.monthly);
  const [method, setMethod] = useState<any>("cash");
  const [paymentInput, setPaymentInput] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    setTotalPrice(settings.subPrices[plan]);
  }, [plan, settings.subPrices]);

  const handleAdd = () => {
    const finalName = studentId ? students.find(s => s.id === studentId)?.name || "" : personName;
    if (!finalName.trim()) return;

    addSubscription({
      personName: finalName.trim(),
      studentId: studentId || undefined,
      plan,
      totalPrice,
      paidAmount: 0,
      method
    });
    setPersonName(""); setStudentId("");
  };

  const handlePayment = (subId: string) => {
    const amount = Number(paymentInput[subId]);
    if (isNaN(amount) || amount === 0) return;

    const sub = subscriptions.find(s => s.id === subId);
    if (!sub) return;

    const newPaid = sub.paidAmount + amount;

    if (newPaid >= 0 && newPaid <= sub.totalPrice) {
      addSubscriptionPayment(subId, amount);
      setPaymentInput({ ...paymentInput, [subId]: "" });
    } else {
      const errorMsg = newPaid < 0 
        ? (settings.lang === 'ar' ? 'المبلغ المدفوع لا يمكن أن يكون أقل من صفر' : 'Paid amount cannot be less than zero')
        : (settings.lang === 'ar' ? 'المبلغ يتجاوز السعر الإجمالي' : 'Amount exceeds total price');
      alert(errorMsg);
    }
  };

  return (
    <div className="space-y-8">
      <SectionTitle>{t(settings.lang, 'subscriptions')}</SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card title={t(settings.lang, 'add')}>
            <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">{t(settings.lang, 'students')} ({settings.lang === 'ar' ? 'اختياري' : 'Optional'})</label>
                  <Select value={studentId} onChange={e => setStudentId(e.target.value)}>
                    <option value="">{settings.lang === 'ar' ? 'زائر / آخر' : 'Guest / Other'}</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
               </div>
               {!studentId && (
                 <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">{t(settings.lang, 'name')}</label>
                    <Input value={personName} onChange={e => setPersonName(e.target.value)} placeholder="..." />
                 </div>
               )}
               <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">{settings.lang === 'ar' ? 'الخطة' : 'Plan'}</label>
                  <Select value={plan} onChange={e => setPlan(e.target.value as SubscriptionPlan)}>
                    <option value="daily">{t(settings.lang, 'daily')}</option>
                    <option value="weekly">{t(settings.lang, 'weekly')}</option>
                    <option value="monthly">{t(settings.lang, 'monthly')}</option>
                  </Select>
               </div>
               <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">{t(settings.lang, 'paymentMethod')}</label>
                  <Select value={method} onChange={e => setMethod(e.target.value)}>
                    <option value="cash">{t(settings.lang, 'cash')}</option>
                    <option value="bank">{t(settings.lang, 'bank')}</option>
                  </Select>
               </div>
               <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">{t(settings.lang, 'total')}</label>
                  <Input 
                    type="number" 
                    value={totalPrice} 
                    onChange={e => setTotalPrice(Number(e.target.value))} 
                    placeholder="0.00"
                  />
               </div>
               <Button className="w-full" onClick={handleAdd}>{t(settings.lang, 'add')}</Button>
            </div>
         </Card>

         <div className="lg:col-span-2 space-y-4">
            {subscriptions.map(s => {
              const remaining = s.totalPrice - s.paidAmount;
              const isFullyPaid = remaining <= 0;

              return (
                <Card key={s.id}>
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex-1 min-w-[150px]">
                       <h4 className="font-bold text-lg">{s.personName}</h4>
                       <div className="flex gap-2 mt-1">
                          {/* Changed from invalid color "zinc" to "slate" to fix TypeScript error */}
                          <Badge color="slate">{t(settings.lang, s.plan)}</Badge>
                          <Badge color="blue">{t(settings.lang, s.method)}</Badge>
                          {isFullyPaid && <Badge color="green">{settings.lang === 'ar' ? 'خالص' : 'Settled'}</Badge>}
                       </div>
                    </div>
                    <div className="text-right min-w-[120px]">
                       <p className="text-sm font-bold">{t(settings.lang, 'paid')}: <span className="text-green-500">{formatCurrency(s.paidAmount, settings.currency)}</span></p>
                       <p className="text-sm font-bold">
                          {t(settings.lang, 'remaining')}: 
                          <span className={isFullyPaid ? 'text-green-500 ml-1' : 'text-red-500 ml-1'}>
                            {isFullyPaid ? (settings.lang === 'ar' ? 'مدفوع بالكامل' : 'Fully Paid') : formatCurrency(remaining, settings.currency)}
                          </span>
                       </p>
                    </div>
                    <div className="flex items-center gap-2">
                       <Input 
                        type="number" 
                        placeholder="±" 
                        className="!py-1 !px-2 w-24 text-sm" 
                        value={paymentInput[s.id] || ""}
                        onChange={(ev) => setPaymentInput({...paymentInput, [s.id]: ev.target.value})}
                       />
                       <Button 
                        className="!py-1.5" 
                        onClick={() => handlePayment(s.id)}
                       >
                        {settings.lang === 'ar' ? 'تعديل' : 'Edit'}
                       </Button>
                       <Button 
                        variant="danger" 
                        className="!py-1.5" 
                        onClick={() => {
                          if (window.confirm(t(settings.lang, 'confirmDeleteSubscription'))) {
                            deleteSubscription(s.id);
                          }
                        }}
                        title={t(settings.lang, 'delete')}
                       >
                        X
                       </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
            {subscriptions.length === 0 && (
              <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                <p className="text-zinc-400 italic">No active subscriptions found.</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};
