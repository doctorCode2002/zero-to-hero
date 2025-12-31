
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { t } from '../lib/i18n';
import { Card, Button, Input, SectionTitle, Table, Thead, Tbody, Tr, Th, Td } from '../components/Ui';
import * as XLSX from 'xlsx';

export const Students: React.FC = () => {
  const { settings, students, addStudent, addStudentsBatch, deleteStudent, updateStudent } = useAppStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!name.trim()) return;
    addStudent({ name: name.trim(), phone });
    setName(""); setPhone("");
  };

  const downloadTemplate = () => {
    const headers = [
      t(settings.lang, 'name'),
      t(settings.lang, 'phone')
    ];
    const data = [headers];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "Student_Import_Template.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const newStudents = data.map(row => {
        const keys = Object.keys(row);
        const studentName = row[t(settings.lang, 'name')] || row[keys[0]];
        const studentPhone = row[t(settings.lang, 'phone')] || row[keys[1]];
        
        return {
          name: String(studentName || "").trim(),
          phone: String(studentPhone || "").trim(),
        };
      }).filter(s => s.name.length > 0);

      if (newStudents.length > 0) {
        addStudentsBatch(newStudents);
        alert(t(settings.lang, 'importSuccess'));
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsBinaryString(file);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.phone && s.phone.includes(search))
  );

  return (
    <div className="space-y-8">
      <SectionTitle>{t(settings.lang, 'students')}</SectionTitle>
      
      <div className="grid grid-cols-1 gap-8">
        <Card title={t(settings.lang, 'add') + " " + t(settings.lang, 'students')}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
             <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">{t(settings.lang, 'name')}</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder={t(settings.lang, 'name')} />
             </div>
             <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">{t(settings.lang, 'phone')}</label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder={t(settings.lang, 'phone')} />
             </div>
             <Button className="w-full" onClick={handleAdd}>{t(settings.lang, 'add')}</Button>
          </div>
        </Card>

        <Card 
          title={t(settings.lang, 'students')} 
          headerAction={
            <div className="flex items-center gap-3">
              <Input 
                className="w-48 lg:w-64" 
                placeholder={t(settings.lang, 'search') + "..."} 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={downloadTemplate} className="!py-2 !text-xs">
                  {t(settings.lang, 'downloadTemplate')}
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".xlsx, .xls" 
                  onChange={handleFileUpload} 
                />
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="!py-2 !text-xs">
                  {t(settings.lang, 'importExcel')}
                </Button>
              </div>
            </div>
          }
        >
          <Table>
            <Thead>
              <Tr>
                <Th>{t(settings.lang, 'name')}</Th>
                <Th>{t(settings.lang, 'phone')}</Th>
                <Th className="text-right rtl:text-left">{settings.lang === 'ar' ? 'الإجراءات' : 'Actions'}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredStudents.map(s => (
                <Tr key={s.id}>
                  <Td>
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{s.name}</span>
                      <button 
                        onClick={() => navigate(`/students/${s.id}`)}
                        className="text-[10px] text-brand-500 font-bold uppercase hover:underline text-left rtl:text-right cursor-pointer"
                      >
                        {t(settings.lang, 'viewProfile')}
                      </button>
                    </div>
                  </Td>
                  <Td>
                    <Input 
                      className="!py-1 !px-2 text-sm max-w-xs" 
                      value={s.phone || ""} 
                      onChange={e => updateStudent(s.id, { phone: e.target.value })} 
                    />
                  </Td>
                  <Td className="text-right rtl:text-left">
                    <div className="flex justify-end rtl:justify-start gap-2">
                       <Button variant="secondary" className="!py-1" onClick={() => navigate(`/students/${s.id}`)}>
                         {t(settings.lang, 'details')}
                       </Button>
                       <Button 
                        variant="danger" 
                        className="!py-1" 
                        onClick={() => {
                          if (window.confirm(t(settings.lang, 'confirmDeleteStudent'))) {
                            deleteStudent(s.id);
                          }
                        }}
                      >
                         {t(settings.lang, 'delete')}
                       </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
              {filteredStudents.length === 0 && (
                <Tr>
                  <Td colSpan={3} className="text-center py-8 text-zinc-400 italic">No students found</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
};
