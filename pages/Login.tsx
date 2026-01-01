import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Mail, Lock, CheckCircle, Shield, Building2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>

      {/* Main Card */}
      <div className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-6 shadow-lg shadow-black/50">
            <Building2 className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-white mb-2 uppercase">Ventura Capital</h1>
          <p className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase">
            Institutional Access Portal
          </p>
        </div>

        <div className="glass-card p-1 rounded-2xl border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
          <div className="bg-black/40 rounded-xl p-8 border border-white/5">
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-3">
                <Shield className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-xs font-mono text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  Operator ID (Email)
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-accent transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all font-mono"
                    placeholder="ENTER ID..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  Secure Token (Password)
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-accent transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all font-mono"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-6 bg-accent hover:bg-accent/90 text-black font-bold uppercase tracking-wider text-xs shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    AUTHENTICATE <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-[10px] text-muted-foreground font-mono">
            UNAUTHORIZED ACCESS IS PROHIBITED
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>New analyst?</span>
            <Link
              to="/signup"
              className="text-accent hover:text-white transition-colors font-bold uppercase tracking-wide hover:underline decoration-1 underline-offset-4"
            >
              Request Access
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer / Legal */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-[9px] text-white/20 font-mono tracking-widest uppercase">
          SECURE CONNECTION ENCRYPTED · VENTURA CAPITAL SYSTEMS © 2024
        </p>
      </div>
    </div>
  );
};

export default Login;
