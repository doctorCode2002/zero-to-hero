
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { t } from '../lib/i18n';
import { Card, SectionTitle, Badge, Button, Table, Thead, Tbody, Tr, Th, Td } from '../components/Ui';
import { formatCurrency } from '../lib/utils';

export const StudentDetail: React.FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { settings, students, courses, enrollments, subscriptions } = useAppStore();
  const lang = settings.lang;

  const student = students.find(s => s.id === studentId);
  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-xl font-bold text-zinc-400">Student not found</p>
        <Button onClick={() => navigate('/students')} className="mt-4">{t(lang, 'backToList')}</Button>
      </div>
    );
  }

  const studentEnrollments = enrollments.filter(e => e.studentId === student.id);
  const studentSubscriptions = subscriptions.filter(sub => sub.studentId === student.id);

  // Financial Stats
  const courseTotal = studentEnrollments.reduce((acc, e) => {
    const course = courses.find(c => c.id === e.courseId);
    return acc + (course?.priceTotal || 0);
  }, 0);
  const coursePaid = studentEnrollments.reduce((acc, e) => acc + e.paidAmount, 0);

  const subTotal = studentSubscriptions.reduce((acc, sub) => acc + sub.totalPrice, 0);
  const subPaid = studentSubscriptions.reduce((acc, sub) => acc + sub.paidAmount, 0);

  const totalDue = courseTotal + subTotal;
  const totalPaid = coursePaid + subPaid;
  const remaining = totalDue - totalPaid;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <SectionTitle>{student.name}</SectionTitle>
          <div className="flex gap-4 -mt-4 mb-4">
            <Badge color="brand">{student.phone || (lang === 'ar' ? 'لا يوجد رقم' : 'No Phone')}</Badge>
            <Badge color={remaining > 0 ? "red" : "green"}>
              {remaining > 0 
                ? `${t(lang, 'remaining')}: ${formatCurrency(remaining, settings.currency)}` 
                : t(lang, 'fullyPaid')}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" onClick={() => navigate('/students')} className="px-6">
          {t(lang, 'backToList')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Financial Summary */}
        <Card title={t(lang, 'financialSummary')}>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t(lang, 'total')}</span>
              <span className="font-black text-lg">{formatCurrency(totalDue, settings.currency)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t(lang, 'paid')}</span>
              <span className="font-black text-emerald-500">{formatCurrency(totalPaid, settings.currency)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t(lang, 'remaining')}</span>
              <span className={`font-black text-3xl ${remaining > 0 ? 'text-red-500' : 'text-emerald-500'} tracking-tighter`}>
                {formatCurrency(remaining, settings.currency)}
              </span>
            </div>
          </div>
        </Card>

        {/* Courses List */}
        <Card title={t(lang, 'courses')} className="lg:col-span-2">
          <Table>
            <Thead>
              <Tr>
                <Th>{t(lang, 'courseTitle')}</Th>
                <Th>{t(lang, 'attendance')}</Th>
                <Th>{t(lang, 'financialSummary')}</Th>
                <Th className="text-right rtl:text-left">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {studentEnrollments.map(e => {
                const course = courses.find(c => c.id === e.courseId);
                const attendanceCount = Object.values(e.attendance).filter(Boolean).length;
                const rem = (course?.priceTotal || 0) - e.paidAmount;
                return (
                  <Tr key={e.id}>
                    <Td className="font-black text-zinc-900 dark:text-zinc-100">{course?.title || '—'}</Td>
                    <Td>
                      <Badge color="blue">{attendanceCount} {t(lang, 'sessions')}</Badge>
                    </Td>
                    <Td>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-emerald-500">{t(lang, 'paid')}: {formatCurrency(e.paidAmount, settings.currency)}</span>
                        <span className={`text-xs font-black ${rem > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {rem > 0 ? `${t(lang, 'remaining')}: ${formatCurrency(rem, settings.currency)}` : t(lang, 'settled')}
                        </span>
                      </div>
                    </Td>
                    <Td className="text-right rtl:text-left">
                       <Button variant="secondary" className="!py-1 !px-3 text-xs" onClick={() => navigate(`/courses/${e.courseId}`)}>
                         {t(lang, 'manage')}
                       </Button>
                    </Td>
                  </Tr>
                );
              })}
              {studentEnrollments.length === 0 && (
                <Tr>
                  <Td colSpan={4} className="text-center py-12 text-zinc-400 italic font-medium">
                    {lang === 'ar' ? 'غير مسجل في أي دورات حالياً' : 'Not enrolled in any courses.'}
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Card>

        {/* Subscriptions List */}
        <Card title={t(lang, 'subscriptions')} className="lg:col-span-3">
           <Table>
             <Thead>
               <Tr>
                 <Th>{t(lang, 'date')}</Th>
                 <Th>{lang === 'ar' ? 'الخطة' : 'Plan'}</Th>
                 <Th>{t(lang, 'total')}</Th>
                 <Th>{t(lang, 'paid')}</Th>
                 <Th>{t(lang, 'paymentMethod')}</Th>
                 <Th className="text-right rtl:text-left">{t(lang, 'status')}</Th>
               </Tr>
             </Thead>
             <Tbody>
               {studentSubscriptions.map(sub => {
                 const isDone = sub.paidAmount >= sub.totalPrice;
                 return (
                   <Tr key={sub.id}>
                     <Td className="text-xs font-semibold">{new Date(sub.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</Td>
                     <Td><Badge color="brand">{t(lang, sub.plan)}</Badge></Td>
                     <Td className="font-black">{formatCurrency(sub.totalPrice, settings.currency)}</Td>
                     <Td className="text-emerald-600 font-black">{formatCurrency(sub.paidAmount, settings.currency)}</Td>
                     <Td className="uppercase text-[10px] font-black text-zinc-400">{t(lang, sub.method)}</Td>
                     <Td className="text-right rtl:text-left">
                       {isDone ? <Badge color="green">{t(lang, 'settled')}</Badge> : <Badge color="red">{t(lang, 'pending')}</Badge>}
                     </Td>
                   </Tr>
                 );
               })}
               {studentSubscriptions.length === 0 && (
                 <Tr>
                   <Td colSpan={6} className="text-center py-12 text-zinc-400 italic font-medium">
                     {lang === 'ar' ? 'لا يوجد سجل اشتراكات' : 'No subscription history.'}
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
