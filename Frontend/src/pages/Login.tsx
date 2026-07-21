import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as loginService } from "../services/auth";
import { Card, Button, Badge } from "../components/Fusion";
import { Lock, User, AlertCircle, Eye, EyeOff } from "lucide-react";

const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("username", data.username);
      params.append("password", data.password);

      const response = await loginService(params);
      if (response.access_token) {
        login(response.access_token, response.refresh_token);
        navigate("/");
      } else {
        throw new Error("No access token received");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const detail = err.response?.data?.detail;
      setError(
        Array.isArray(detail)
          ? detail
              .map((e: any) => e.msg)
              .filter(Boolean)
              .join("; ")
          : detail || "Error al iniciar sesión. Verifique sus credenciales.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo con gradientes animados */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-chart-purple/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-10 relative">
          {/* Icono grande y brillante */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-primary/20 to-emerald-primary/5 flex items-center justify-center shadow-[0_0_40px_rgba(0,194,106,0.2)] mb-6 border border-emerald-primary/30 backdrop-blur-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="56"
              height="56"
              viewBox="0 0 32 32"
              className="drop-shadow-[0_0_10px_rgba(0,194,106,0.5)]"
            >
              <rect
                x="2"
                y="2"
                width="28"
                height="28"
                rx="7"
                fill="none"
                stroke="url(#loginAccent)"
                stroke-width="1.5"
              />
              <g transform="translate(8,8)">
                <rect
                  x="1"
                  y="3"
                  width="14"
                  height="11"
                  rx="1.5"
                  fill="none"
                  stroke="url(#loginAccent)"
                  stroke-width="1.5"
                />
                <rect
                  x="1"
                  y="1"
                  width="14"
                  height="3"
                  rx="1"
                  fill="url(#loginAccent)"
                  opacity="0.9"
                />
                <path
                  d="M5 10l2 2 4-4"
                  fill="none"
                  stroke="#0d1a12"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
              <defs>
                <linearGradient id="loginAccent" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#10b981" />
                  <stop offset="100%" stop-color="#059669" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">
            SIGAI-<span className="text-emerald-primary">SES</span>
          </h1>
          <p className="text-content-muted text-[10px] uppercase tracking-[0.4em] mt-3 font-mono text-center">
            Securitas Lab Control
          </p>
        </div>

        {/* Contenedor efecto cristal */}

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-500 text-xs">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#9AB8A4] ml-1 font-bold">
                Credencial de Acceso
              </label>
              <div className="relative group">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A7A65]"
                  size={18}
                />
                <input
                  {...register("username", {
                    required: "El correo/usuario es requerido",
                  })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:ring-1 focus:ring-emerald-primary/50 outline-none transition-all"
                  placeholder="nombre.apellido@securitas.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#9AB8A4] ml-1 font-bold">
                Contraseña de Seguridad
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A7A65]"
                  size={18}
                />
                <input
                  {...register("password", {
                    required: "La contraseña es requerida",
                  })}
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-sm text-white placeholder:text-white/20 focus:ring-1 focus:ring-emerald-primary/50 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-green-900 hover:text-emerald-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-4 rounded-xl mt-4 font-bold uppercase tracking-[0.2em] text-[11px] h-14 bg-emerald-primary text-black hover:bg-emerald-bright transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Validando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[8px] text-white/30 mt-4 uppercase tracking-widest">
            © 2026 SIGAI-SES - v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
