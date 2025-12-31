
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { t } from '../lib/i18n';
import { Card, Button, Input } from '../components/Ui';

export const Login: React.FC = () => {
  const { settings, login } = useAppStore();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const res = login(username, password);
    if (res.ok) navigate('/');
    else setError(res.error || "Login Failed");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6">
      <Card className="max-w-md w-full !p-10 shadow-2xl border-none">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-brand-500 mb-2">{t(settings.lang, 'appName')}</h1>
          <p className="text-zinc-500 font-semibold">{t(settings.lang, 'login')}</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">{t(settings.lang, 'username')}</label>
            <Input value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">{t(settings.lang, 'password')}</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          
          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

          <Button className="w-full py-4 text-lg" onClick={handleLogin}>{t(settings.lang, 'signIn')}</Button>
          
          <div className="text-center">
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Use credentials admin / admin</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
