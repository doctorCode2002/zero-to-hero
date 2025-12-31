
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { t } from '../lib/i18n';
import { Card, Button, Input, Select, Badge, SectionTitle, Table, Thead, Tbody, Tr, Th, Td } from '../components/Ui';
import { formatCurrency } from '../lib/utils';

export const Courses: React.FC = () => {
  const { settings, courses, mentors, addCourse, deleteCourse, updateCourse } = useAppStore();
  const [title, setTitle] = useState("");
  const [mentorId, setMentorId] = useState("");
  const [price, setPrice] = useState(0);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleAddCourse = () => {
    if (!title.trim()) return;
    addCourse({ title: title.trim(), mentorId: mentorId || undefined, priceTotal: price });
    setTitle("");
    setMentorId("");
    setPrice(0);
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <SectionTitle>{t(settings.lang, 'courses')}</SectionTitle>

      <div className="grid grid-cols-1 gap-8">
        <Card title={t(settings.lang, 'add') + " " + t(settings.lang, 'courses')}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">{t(settings.lang, 'courseTitle')}</label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder={settings.lang === 'ar' ? 'اسم الدورة' : 'Course Title'} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">{t(settings.lang, 'mentor')}</label>
              <Select value={mentorId} onChange={e => setMentorId(e.target.value)}>
                <option value="">{settings.lang === 'ar' ? 'بدون مدرب' : 'No Mentor'}</option>
                {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">{t(settings.lang, 'price')}</label>
              <Input 
                type="number" 
                value={price} 
                onChange={e => setPrice(e.target.value === '' ? 0 : Number(e.target.value))} 
                placeholder="0.00"
              />
            </div>
            <Button className="w-full" onClick={handleAddCourse}>{t(settings.lang, 'add')}</Button>
          </div>
        </Card>

        <Card title={t(settings.lang, 'courses')} headerAction={
          <Input 
            className="w-64" 
            placeholder={t(settings.lang, 'search') + "..."} 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        }>
          <Table>
            <Thead>
              <Tr>
                <Th>{t(settings.lang, 'courseTitle')}</Th>
                <Th>{t(settings.lang, 'mentor')}</Th>
                <Th>{t(settings.lang, 'price')}</Th>
                <Th className="text-right rtl:text-left">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCourses.map(course => {
                const mentor = mentors.find(m => m.id === course.mentorId);
                return (
                  <Tr key={course.id}>
                    <Td>
                      <Input 
                        className="!py-1 !px-2 text-sm font-bold" 
                        value={course.title} 
                        onChange={e => updateCourse(course.id, { title: e.target.value })} 
                      />
                    </Td>
                    <Td>
                      <Select 
                        className="!py-1 !px-2 text-xs" 
                        value={course.mentorId || ""} 
                        onChange={e => updateCourse(course.id, { mentorId: e.target.value || undefined })}
                      >
                         <option value="">{settings.lang === 'ar' ? 'بدون' : 'None'}</option>
                         {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </Select>
                    </Td>
                    <Td>
                       <Input 
                        type="number"
                        className="!py-1 !px-2 text-sm font-semibold text-brand-600 w-24" 
                        value={course.priceTotal} 
                        onChange={e => updateCourse(course.id, { priceTotal: e.target.value === '' ? 0 : Number(e.target.value) })} 
                      />
                    </Td>
                    <Td className="text-right rtl:text-left">
                      <div className="flex justify-end rtl:justify-start gap-2">
                        <Button variant="secondary" onClick={() => navigate(`/courses/${course.id}`)}>
                          {settings.lang === 'ar' ? 'إدارة' : 'Manage'}
                        </Button>
                        <Button 
                          variant="danger" 
                          onClick={() => {
                            if (window.confirm(t(settings.lang, 'confirmDeleteCourse'))) {
                              deleteCourse(course.id);
                            }
                          }}
                        >
                          {t(settings.lang, 'delete')}
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
              {filteredCourses.length === 0 && (
                <Tr>
                  <Td colSpan={4} className="text-center py-8 text-zinc-400 italic">No courses found</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
};
