import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { User, UserPlus, Shield, CheckCircle, Mail, Lock, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Signup: React.FC = () => {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Credentials do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password security level too low (min 6 chars)');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, fullName);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden relative font-mono">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>

        <div className="w-full max-w-md p-8 relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 animate-pulse">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold tracking-widest text-white mb-2 uppercase">Registration Complete</h1>
          <p className="text-xs text-muted-foreground tracking-wider mb-8">
            OPERATOR CREDENTIALS GENERATED. PLEASE VERIFY IDENTITY VIA EMAIL UPLINK.
          </p>
          <Link to="/login">
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider text-xs py-5 px-8">
              PROCEED TO LOGIN
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 mb-4 shadow-lg">
            <UserPlus className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-xl font-bold tracking-widest text-white mb-1 uppercase">Operator Registration</h1>
          <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
            Create New Access Profile
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-accent transition-colors" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all font-mono"
                    placeholder="ENTER NAME..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-accent transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all font-mono"
                    placeholder="ENTER EMAIL..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-accent transition-colors" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all font-mono"
                      placeholder="••••••"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                      Confirm
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-accent transition-colors" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all font-mono"
                        placeholder="••••••"
                        required
                      />
                    </div>
                  </div>
              </div>

              <Button
                type="submit"
                className="w-full py-6 mt-2 bg-white hover:bg-slate-200 text-black font-bold uppercase tracking-wider text-xs shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                    REGISTER PROFILE <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>Already have credentials?</span>
            <Link
              to="/login"
              className="text-accent hover:text-white transition-colors font-bold uppercase tracking-wide hover:underline decoration-1 underline-offset-4"
            >
              System Login
            </Link>
          </div>
        </div>
      </div>
      
       {/* Footer / Legal */}
       <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-[9px] text-white/20 font-mono tracking-widest uppercase">
          SECURE REGISTRATION UPLINK · VENTURA CAPITAL SYSTEMS © 2024
        </p>
      </div>
    </div>
  );
};

export default Signup;
