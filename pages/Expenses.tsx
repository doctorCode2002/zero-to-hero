
import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { t } from '../lib/i18n';
import { Card, Button, Input, Select, SectionTitle, Table, Thead, Tbody, Tr, Th, Td, Badge } from '../components/Ui';
import { formatCurrency, dateKey } from '../lib/utils';
import { ExpenseCategory } from '../types';

export const Expenses: React.FC = () => {
  const { settings, expenses, addExpense, deleteExpense } = useAppStore();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [date, setDate] = useState(dateKey());
  const lang = settings.lang;

  const handleAdd = () => {
    if (!title.trim() || amount <= 0) return;
    addExpense({ title: title.trim(), amount, category, date });
    setTitle(""); setAmount(0);
  };

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-8">
      <SectionTitle>{t(lang, 'expenses')}</SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title={t(lang, 'add') + " " + t(lang, 'expenses')}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">{t(lang, 'name')}</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="..." />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">{t(lang, 'amount')}</label>
              <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">{t(lang, 'category')}</label>
              <Select value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)}>
                <option value="rent">{t(lang, 'rent')}</option>
                <option value="salary">{t(lang, 'salary')}</option>
                <option value="utilities">{t(lang, 'utilities')}</option>
                <option value="marketing">{t(lang, 'marketing')}</option>
                <option value="supplies">{t(lang, 'supplies')}</option>
                <option value="other">{t(lang, 'other')}</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">{t(lang, 'date')}</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleAdd}>{t(lang, 'add')}</Button>
          </div>
        </Card>

        <Card title={t(lang, 'history')} className="lg:col-span-2" headerAction={
          <Badge color="red">{t(lang, 'total')}: {formatCurrency(totalExpenses, settings.currency)}</Badge>
        }>
          <Table>
            <Thead>
              <Tr>
                <Th>{t(lang, 'name')}</Th>
                <Th>{t(lang, 'category')}</Th>
                <Th>{t(lang, 'amount')}</Th>
                <Th>{t(lang, 'date')}</Th>
                <Th className="text-right rtl:text-left">{t(lang, 'delete')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {[...expenses].sort((a,b) => b.date.localeCompare(a.date)).map(e => (
                <Tr key={e.id}>
                  <Td className="font-bold text-zinc-900 dark:text-zinc-100">{e.title}</Td>
                  {/* Changed from invalid color "zinc" to supported "slate" */}
                  <Td><Badge color="slate">{t(lang, e.category)}</Badge></Td>
                  <Td className="text-red-500 font-bold">{formatCurrency(e.amount, settings.currency)}</Td>
                  <Td className="text-xs font-semibold">{e.date}</Td>
                  <Td className="text-right rtl:text-left">
                    <Button 
                      variant="danger" 
                      className="!py-1 !px-3" 
                      onClick={(event) => {
                        event.stopPropagation();
                        if (window.confirm(t(settings.lang, 'confirmDeleteExpense'))) {
                          deleteExpense(e.id);
                        }
                      }}
                    >
                      X
                    </Button>
                  </Td>
                </Tr>
              ))}
              {expenses.length === 0 && (
                <Tr>
                  <Td colSpan={5} className="text-center py-12 text-zinc-400 italic">No expenses recorded yet.</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
};
