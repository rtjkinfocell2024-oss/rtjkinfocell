import React, { useState } from 'react';
import { Lock, Smartphone } from 'lucide-react';

interface LoginProps {
  onLogin: (password: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white mb-4 shadow-lg shadow-primary/20">
            <Smartphone size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Acesso Restrito</h1>
          <p className="text-slate-500 text-sm">Insira a senha mestra para acessar o sistema.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Senha de Acesso
            </label>
            <div className="relative group">
              <input 
                type="password"
                placeholder="••••••••••••"
                className="w-full h-14 pl-12 pr-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all hover:bg-primary-dark"
          >
            Entrar no Sistema
          </button>
        </form>

        <div className="text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-tight">
            RTJK INFOCELL - Sistema de Gestão Interna
          </p>
        </div>
      </div>
    </div>
  );
}
