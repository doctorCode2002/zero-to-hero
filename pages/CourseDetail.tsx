
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { t } from '../lib/i18n';
import { Card, Button, Input, Select, Badge, SectionTitle, Table, Thead, Tbody, Tr, Th, Td } from '../components/Ui';
import { formatCurrency, dateKey } from '../lib/utils';
import * as XLSX from 'xlsx';

export const CourseDetail: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { settings, courses, mentors, students, enrollments, enrollStudent, unenroll, addCoursePayment, toggleAttendance, updateEnrollment } = useAppStore();
  
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [paymentInput, setPaymentInput] = useState<{ [id: string]: string }>({});
  const [attendanceDate, setAttendanceDate] = useState(dateKey());

  const course = courses.find(c => c.id === courseId);
  const mentor = mentors.find(m => m.id === course?.mentorId);
  const courseEnrollments = enrollments.filter(e => e.courseId === courseId);

  if (!course) return <div className="p-20 text-center">Course not found</div>;

  const handlePayment = (enrollmentId: string) => {
    const amount = Number(paymentInput[enrollmentId]);
    if (isNaN(amount) || amount === 0) return;
    const enrollment = courseEnrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return;
    const newPaid = enrollment.paidAmount + amount;
    if (newPaid >= 0 && newPaid <= course.priceTotal) {
      addCoursePayment(enrollmentId, amount);
      setPaymentInput({ ...paymentInput, [enrollmentId]: "" });
    } else alert("Invalid Amount");
  };

  const downloadCourseAttendance = () => {
    // 1. Get all unique dates from all students' attendance for this course
    const allDatesSet = new Set<string>();
    courseEnrollments.forEach(e => {
      Object.keys(e.attendance).forEach(date => allDatesSet.add(date));
    });
    
    // Convert to sorted array
    const sortedDates = Array.from(allDatesSet).sort();
    
    // 2. Build rows: Student info + each date column
    const attendanceData = courseEnrollments.map(e => {
      const student = students.find(s => s.id === e.studentId);
      const row: any = { 
        [lang === 'ar' ? "الاسم" : "Student Name"]: student?.name || "Unknown",
        [lang === 'ar' ? "العلامة" : "Grade"]: e.grade || 0,
        [lang === 'ar' ? "الحالة" : "Status"]: t(settings.lang, e.status),
        [lang === 'ar' ? "المدفوع" : "Paid"]: e.paidAmount,
        [lang === 'ar' ? "المتبقي" : "Remaining"]: course.priceTotal - e.paidAmount
      };
      
      // Add columns for each date
      sortedDates.forEach(date => {
        row[date] = e.attendance[date] ? (lang === 'ar' ? "حاضر" : "Present") : (lang === 'ar' ? "غائب" : "Absent");
      });
      
      return row;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(attendanceData);
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Grid");
    XLSX.writeFile(wb, `${course.title}_Attendance_Report.xlsx`);
  };

  const lang = settings.lang;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <SectionTitle>{course.title}</SectionTitle>
          <div className="flex gap-4 -mt-4 mb-4">
            <Badge color="blue">{t(settings.lang, 'mentor')}: {mentor?.name || '—'}</Badge>
            <Badge color="orange">{t(settings.lang, 'price')}: {formatCurrency(course.priceTotal, settings.currency)}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={downloadCourseAttendance}>
            {settings.lang === 'ar' ? 'تحميل سجل الحضور' : 'Download Attendance'}
          </Button>
          <Button variant="ghost" onClick={() => navigate('/courses')}>
            {t(settings.lang, 'backToList')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card title={t(settings.lang, 'enroll')}>
            <div className="space-y-4">
              <Select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
                <option value="">{settings.lang === 'ar' ? 'اختر طالب' : 'Select Student'}</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
              <Button className="w-full" onClick={() => { if(selectedStudentId) enrollStudent(selectedStudentId, [course.id]); setSelectedStudentId(""); }}>{t(settings.lang, 'add')}</Button>
            </div>
          </Card>
          <Card title={t(settings.lang, 'attendance')}>
             <Input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
          </Card>
        </div>

        <Card title={t(settings.lang, 'students')} className="lg:col-span-3">
          <Table>
            <Thead>
              <Tr>
                <Th>{t(settings.lang, 'name')}</Th>
                <Th>{t(settings.lang, 'status')}</Th>
                <Th>{t(settings.lang, 'grade')}</Th>
                <Th>{t(settings.lang, 'attendance')}</Th>
                <Th className="text-right">{t(settings.lang, 'remaining')}</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {courseEnrollments.map(e => {
                const student = students.find(s => s.id === e.studentId);
                const isPresent = !!e.attendance[attendanceDate];
                const rem = course.priceTotal - e.paidAmount;
                return (
                  <Tr key={e.id}>
                    <Td className="font-bold">{student?.name || '—'}</Td>
                    <Td>
                      <Select 
                        className="!py-1 !px-2 !text-[10px] uppercase font-black" 
                        value={e.status} 
                        onChange={ev => updateEnrollment(e.id, { status: ev.target.value as any })}
                      >
                         <option value="active">{t(settings.lang, 'active')}</option>
                         <option value="completed">{t(settings.lang, 'completed')}</option>
                         <option value="dropped">{t(settings.lang, 'dropped')}</option>
                      </Select>
                    </Td>
                    <Td>
                       <Input 
                        type="number" 
                        className="w-16 !py-1 !px-2 text-center font-black" 
                        value={e.grade || ""} 
                        placeholder="0"
                        onChange={ev => updateEnrollment(e.id, { grade: Number(ev.target.value) })}
                       />
                    </Td>
                    <Td>
                      <button onClick={() => toggleAttendance(e.id, attendanceDate)} className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${isPresent ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                         {isPresent ? "✓" : ""}
                      </button>
                    </Td>
                    <Td className="text-right font-black">
                       <span className={rem > 0 ? 'text-red-500' : 'text-emerald-500'}>{formatCurrency(rem, settings.currency)}</span>
                    </Td>
                    <Td className="text-right flex gap-2 justify-end">
                       <Input type="number" className="w-20 !py-1 !px-2" placeholder="±" value={paymentInput[e.id] || ""} onChange={ev => setPaymentInput({...paymentInput, [e.id]: ev.target.value})} />
                       <Button onClick={() => handlePayment(e.id)} className="!py-1 !px-3">Edit</Button>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
};
