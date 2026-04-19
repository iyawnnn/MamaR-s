import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoUrl from "@/assets/logo/mama-rs-logo.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    
    try {
      if (!login) {
        throw new Error("Critical Error: AuthContext is missing.");
      }
      await login({ email, password });
      navigate("/");
    } catch (error: any) {
      console.error("Error caught in LoginPage:", error);
      setErr(error.response?.data?.error || error.message || "Network timeout or connection refused");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8 animate-in fade-in duration-1000">
      <div className="max-w-5xl w-full bg-card rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-border/40">
        
        {/* === LEFT SIDE: BRANDING (Thematic split) === */}
        <div className="hidden md:flex flex-1 bg-foreground relative overflow-hidden items-center justify-center p-12">
          {/* Accent lighting */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 text-center space-y-6 flex flex-col items-center">
             <div className="p-4 bg-background/10 backdrop-blur-md rounded-3xl border border-background/10 mb-4">
               <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
             </div>
             <h1 className="text-background text-5xl font-black tracking-tight leading-tight" style={{ fontFamily: '"Instrument Serif", serif' }}>
                Mama R's <br /> 
                <span className="text-primary italic">Command Center</span>
             </h1>
             <p className="text-background/60 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                Pre-order lifecycle management, automated accounting, and secure inventory control.
             </p>
          </div>
          
          <div className="absolute bottom-8 right-8">
            <span className="text-[10px] font-black text-background/40 tracking-widest uppercase">System v2.0</span>
          </div>
        </div>

        {/* === RIGHT SIDE: LOGIN FORM === */}
        <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-background">
          <div className="mb-10 text-left">
            <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight" style={{ fontFamily: '"Instrument Serif", serif' }}>
              Authentication
            </h2>
            <p className="text-muted-foreground font-sans text-sm font-medium mt-2">
              Authorized personnel access only.
            </p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Admin Email
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <Input
                  type="email"
                  placeholder="admin@mamars.com"
                  className="h-14 pl-12 pr-4 bg-muted/20 border-border/40 font-bold focus:border-primary text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Passcode
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-14 pl-12 pr-12 bg-muted/20 border-border/40 font-bold focus:border-primary text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {err && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-xs font-bold border border-destructive/20 animate-in slide-in-from-top-2 flex items-center gap-3">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                {err}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg shadow-primary/20 mt-8"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  Secure Login <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}