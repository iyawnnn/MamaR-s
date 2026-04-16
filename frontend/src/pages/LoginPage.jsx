import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShoppingBag } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    
    try {
      if (!login) {
        throw new Error("Critical Error: AuthContext is missing.");
      }
      
      await login({ email, password });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error caught in LoginPage:", error);
      // Display the exact reason it failed on the screen
      setErr(error.response?.data?.error || error.message || "Network timeout or connection refused");
    } finally {
      // THIS FORCES THE SPINNER TO STOP
      setLoading(false); 
    }
  };

  const inputClass = "w-full h-12 pl-12 pr-12 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium text-stone-800";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-stone-50 p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/50 overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-stone-100">
        
        {/* === LEFT SIDE: LOGIN FORM === */}
        <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 text-left">
             <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30">
                <Lock className="text-white w-6 h-6" />
             </div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-800 tracking-tight font-display">
              Welcome back
            </h2>
            <p className="text-stone-400 font-medium mt-2">
              Management Portal Login
            </p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-500 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  placeholder="name@bakery.com"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                Security Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {err && (
              <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100 animate-shake flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                {err}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-stone-800 transition-all active:scale-[0.98] shadow-xl shadow-stone-900/20 disabled:opacity-70 mt-4 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Access Portal
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-stone-400 text-[10px] font-bold uppercase tracking-widest">
            Authorized Personnel & Admin Access Only
          </p>
        </div>

        {/* === RIGHT SIDE: IMAGE / BRANDING === */}
        <div className="hidden md:flex flex-1 bg-stone-900 relative overflow-hidden items-center justify-center p-12">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-800 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 text-center space-y-6">
             <div className="inline-flex p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 mb-4">
                <ShoppingBag className="text-amber-500 w-12 h-12" />
             </div>
             <h1 className="text-white text-4xl font-black font-display tracking-tight leading-tight">
                Streamline Your <br /> 
                <span className="text-amber-500">Bakery Operations</span>
             </h1>
             <p className="text-stone-400 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                Manage stock levels, track sales trends, and generate reports in one powerful dashboard.
             </p>
          </div>
          
          {/* Version Tag */}
          <div className="absolute bottom-8 right-8">
            <span className="text-[10px] font-black text-stone-600 tracking-widest uppercase">Version 2.0.1</span>
          </div>
        </div>
      </div>
    </div>
  );
}