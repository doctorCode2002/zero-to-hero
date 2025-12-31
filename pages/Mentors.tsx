
import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { t } from '../lib/i18n';
import { Card, Button, Input, SectionTitle, Table, Thead, Tbody, Tr, Th, Td } from '../components/Ui';

export const Mentors: React.FC = () => {
  const { settings, mentors, addMentor, deleteMentor, updateMentor } = useAppStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    addMentor({ name: name.trim(), phone, email });
    setName(""); setPhone(""); setEmail("");
  };

  const filteredMentors = mentors.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    (m.phone && m.phone.includes(search)) ||
    (m.email && m.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <SectionTitle>{t(settings.lang, 'mentors')}</SectionTitle>
      
      <div className="grid grid-cols-1 gap-8">
        <Card title={t(settings.lang, 'add') + " " + t(settings.lang, 'mentors')}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
             <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">{t(settings.lang, 'name')}</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder={t(settings.lang, 'name')} />
             </div>
             <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">{t(settings.lang, 'phone')}</label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder={t(settings.lang, 'phone')} />
             </div>
             <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">{t(settings.lang, 'email')}</label>
                <Input value={email} onChange={e => setEmail(e.target.value)} placeholder={t(settings.lang, 'email')} />
             </div>
             <Button className="w-full" onClick={handleAdd}>{t(settings.lang, 'add')}</Button>
          </div>
        </Card>

        <Card title={t(settings.lang, 'mentors')} headerAction={
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
                <Th>{t(settings.lang, 'name')}</Th>
                <Th>{t(settings.lang, 'phone')}</Th>
                <Th>{t(settings.lang, 'email')}</Th>
                <Th className="text-right rtl:text-left">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredMentors.map(m => (
                <Tr key={m.id}>
                  <Td>
                    <Input 
                      className="!py-1 !px-2 text-sm font-bold" 
                      value={m.name} 
                      onChange={e => updateMentor(m.id, { name: e.target.value })} 
                    />
                  </Td>
                  <Td>
                    <Input 
                      className="!py-1 !px-2 text-sm" 
                      value={m.phone || ""} 
                      onChange={e => updateMentor(m.id, { phone: e.target.value })} 
                    />
                  </Td>
                  <Td>
                    <Input 
                      className="!py-1 !px-2 text-sm" 
                      value={m.email || ""} 
                      onChange={e => updateMentor(m.id, { email: e.target.value })} 
                    />
                  </Td>
                  <Td className="text-right rtl:text-left">
                    <Button 
                      variant="danger" 
                      onClick={() => {
                        if (window.confirm(t(settings.lang, 'confirmDeleteMentor'))) {
                          deleteMentor(m.id);
                        }
                      }}
                    >
                      {t(settings.lang, 'delete')}
                    </Button>
                  </Td>
                </Tr>
              ))}
              {filteredMentors.length === 0 && (
                <Tr>
                  <Td colSpan={4} className="text-center py-8 text-zinc-400 italic">No mentors found</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
};
