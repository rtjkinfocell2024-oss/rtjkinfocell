import React, { useState } from 'react';
import { Lock, Smartphone, User as UserIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface LoginProps {
  onLogin: (user: string, password: string) => void;
}

const USERS = [
  { id: 'Thales', name: 'Thales' },
  { id: 'Juca', name: 'Juca' }
];

export function Login({ onLogin }: LoginProps) {
  const [selectedUser, setSelectedUser] = useState(USERS[0].id);
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedUser, password);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-10 space-y-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary text-white mb-2 shadow-xl shadow-primary/20">
            <Smartphone size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sistema RTJK</h1>
          <p className="text-slate-500 font-medium">Selecione seu usuário para entrar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* User Selection */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              Colaborador
            </label>
            <div className="grid grid-cols-2 gap-4">
              {USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUser(user.id)}
                  className={cn(
                    "h-14 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-2",
                    selectedUser === user.id 
                      ? "border-primary bg-primary/5 text-primary shadow-sm" 
                      : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                  )}
                >
                  <UserIcon size={18} />
                  {user.name}
                </button>
              ))}
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              Senha de Acesso
            </label>
            <div className="relative group">
              <input 
                type="password"
                placeholder="Digite sua senha"
                className="w-full h-16 pl-14 pr-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-bold text-xl tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={24} />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full h-16 bg-primary text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/30 active:scale-[0.98] hover:scale-[1.01] transition-all hover:bg-primary-dark"
          >
            Entrar no Painel
          </button>
        </form>

        <div className="text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
            Gestão Interna • RTJK Infocell
          </p>
        </div>
      </div>
    </div>
  );
}
