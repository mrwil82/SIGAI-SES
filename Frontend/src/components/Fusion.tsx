import React, { useState, useEffect } from "react";
import { ToastProvider } from "./Toaster";
import {
  LayoutDashboard,
  Package,
  ShieldCheck,
  Users,
  History,
  Settings,
  Bell,
  Search,
  LogOut,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  Menu,
  UserCog,
  Briefcase,
  FileText,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardAlerts } from "../services/alerts";
import { globalSearch } from "../services/analytics";
import { logger } from "../lib/logger";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
const API_BACKEND_BASE = API_BASE_URL.replace(/\/api\/v\d+\/?$/, '');

export function resolveAvatarUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BACKEND_BASE}${url}`;
}

/* seccion del titulo */

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="mb-3 md:mb-4">
    <span className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-content-muted">
      {children}
    </span>
  </div>
);

/* targeta */

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}> = ({ children, className = "", glow = false }) => (
  <div
    className={`
    bg-bg2 rounded-[12px] md:rounded-[14px] border border-white/5 p-3 md:p-4 shadow-neo relative overflow-hidden
    ${glow ? "shadow-[0_0_20px_rgba(0,194,106,0.05),2px_2px_8px_rgba(0,0,0,0.3)]" : ""}
    ${className}
  `}
  >
    {children}
  </div>
);

/* Modal */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-bg0/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative w-full max-w-lg md:max-w-xl lg:max-w-2xl my-8 bg-bg1 rounded-xl md:rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ${className}`}>
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-bg2">
          <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-emerald-primary">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-content-muted hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 md:p-6 max-h-[60vh] overflow-y-auto custom-scrollbar text-content-primary">
          {children}
        </div>
        {footer && (
          <div className="p-4 md:p-6 border-t border-white/5 bg-bg2 flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/* Modal de confirmación */

export const ConfirmModal: React.FC<{
  isOpen: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({
  isOpen,
  title = "Confirmar",
  message = "¿Estás seguro?",
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="neo" onClick={onCancel}>
            {" "}
            <X size={14} /> Cancelar
          </Button>
          <Button onClick={onConfirm}>
            <CheckCircle2 size={14} /> Confirmar
          </Button>
        </>
      }
    >
      <p className="text-sm text-content-muted">{message}</p>
    </Modal>
  );
};

/* Alerta */

export interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const styles: Record<
    string,
    { icon: React.ElementType; color: string; bg: string; border: string }
  > = {
    success: {
      icon: CheckCircle2,
      color: "text-emerald-primary",
      bg: "bg-emerald-primary/10",
      border: "border-emerald-primary/20",
    },
    error: {
      icon: AlertCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    warning: {
      icon: AlertCircle,
      color: "text-gold",
      bg: "bg-gold/10",
      border: "border-gold/20",
    },
    info: {
      icon: Info,
      color: "text-chart-blue",
      bg: "bg-chart-blue/10",
      border: "border-chart-blue/20",
    },
  };

  const config = styles[type];
  const Icon = config.icon;

  return (
    <div
      className={`p-3 md:p-4 rounded-xl border ${config.bg} ${config.border} flex items-start gap-3 animate-in slide-in-from-top-2 duration-300`}
    >
      <Icon className={`${config.color} shrink-0 mt-0.5`} size={16} />
      <p
        className={`text-[10px] md:text-xs ${config.color} flex-1 leading-relaxed break-words`}
      >
        {message}
      </p>
      {onClose && (
        <button
          onClick={onClose}
          className={`${config.color} opacity-50 hover:opacity-100`}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

/* Formulario de Elementos */

export const FormGroup: React.FC<{
  label: string;
  children: React.ReactNode;
  error?: string;
  htmlFor?: string;
}> = ({ label, children, error, htmlFor }) => (
  <div className="space-y-1 md:space-y-2 mb-3">
    <label
      htmlFor={htmlFor}
      className="text-[9px] md:text-[10px] uppercase tracking-widest text-content-secondary ml-1 block"
    >
      {label}
    </label>
    {children}
    {error && (
      <span className="text-[9px] text-red-500 ml-1 block">{error}</span>
    )}
  </div>
);

export const NeoInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <input
    {...props}
    id={props.id || props.name}
    ref={ref}
    className={`
      w-full bg-bginput border border-white/5 rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3
      text-xs md:text-sm text-content-primary outline-none shadow-neo-inset
      focus:ring-1 focus:ring-emerald-primary/30 focus:border-emerald-primary/50 transition-all
      ${props.className || ""}
    `}
  />
));

export const NeoSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ children, ...props }, ref) => (
  <select
    {...props}
    id={props.id || props.name}
    ref={ref}
    className={`
      w-full bg-bg2 border border-white/10 rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3
      text-xs md:text-sm text-content-primary outline-none
      focus:ring-1 focus:ring-emerald-primary/30 transition-all
      ${props.className || ""}
    `}
  >
    {children}
  </select>
));

export const NeoTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => (
  <textarea
    {...props}
    ref={ref}
    className={`
      w-full bg-bginput border border-white/5 rounded-xl px-4 py-3 min-h-[100px] resize-y
      text-sm text-content-primary outline-none shadow-neo-inset
      focus:ring-1 focus:ring-emerald-primary/30 transition-all
      ${props.className || ""}
    `}
  />
));

/* Boton  */
export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "neo" | "danger" | "ghost";
  }
> = ({ children, variant = "primary", className = "", ...props }) => {
  const baseStyles =
    "px-4 md:px-6 py-[10px] md:py-[12px] font-bold text-[10px] md:text-[11px] rounded-xl border-none cursor-pointer font-mono tracking-widest transition-all duration-200 uppercase flex items-center justify-center gap-2";
  const variants = {
    primary:
      "bg-emerald-primary text-bg0 shadow-[0_0_20px_rgba(0,194,106,0.35)] hover:shadow-[0_0_25px_rgba(0,194,106,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
    neo: "bg-bg3 text-content-secondary shadow-neo border border-white/5 hover:text-content-primary hover:bg-bginput active:shadow-neo-inset",
    danger:
      "bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30 active:scale-95",
    ghost:
      "bg-transparent text-content-muted hover:text-content-primary hover:bg-white/5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/* Tabla de Componentes */

export const TableContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="w-full overflow-x-auto custom-scrollbar -mx-4 md:mx-0 px-4 md:px-0">
    <table className="w-full border-collapse text-left min-w-[700px]">
      {children}
    </table>
  </div>
);

export const THead: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <thead className="border-b border-white/5 bg-bg2/50">
    <tr>{children}</tr>
  </thead>
);

export const TH: React.FC<
  React.ThHTMLAttributes<HTMLTableHeaderCellElement>
> = ({ children, className = "", ...props }) => (
  <th
    {...props}
    className={`py-4 px-4 md:px-6 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-content-muted ${className}`}
  >
    {children}
  </th>
);

export const TBody: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <tbody className="divide-y divide-white/5">{children}</tbody>;

export const TR: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  onClick,
  className = "",
  ...props
}) => (
  <tr
    {...props}
    onClick={onClick}
    className={`group transition-colors hover:bg-emerald-primary/[0.02] ${onClick ? "cursor-pointer" : ""} ${className}`}
  >
    {children}
  </tr>
);

export const TD: React.FC<React.TdHTMLAttributes<HTMLTableDataCellElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <td
    {...props}
    className={`py-4 px-4 md:px-6 text-[11px] md:text-xs text-content-secondary ${className}`}
  >
    {children}
  </td>
);

/* grafico de donna */

export const DonutChart: React.FC<{
  percent?: number;
  color?: string;
  size?: number;
  label?: string;
}> = ({ percent = 0, color = "#00C26A", size = 80, label }) => {
  const r = 28,
    cx = 40,
    cy = 40;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        className="drop-shadow-glow"
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--emerald-muted)"
          strokeWidth="6"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{
            transition: "stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-content-primary text-[14px] md:text-[16px] font-bold font-mono"
        >
          {percent}%
        </text>
      </svg>
      {label && (
        <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-content-muted">
          {label}
        </span>
      )}
    </div>
  );
};

export const Badge: React.FC<{ label: string; color: string; bg: string }> = ({
  label,
  color,
  bg,
}) => (
  <span
    className="text-[8px] md:text-[9px] font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full border inline-flex items-center justify-center tracking-widest uppercase"
    style={{ backgroundColor: bg, color, borderColor: `${color}20` }}
  >
    {label}
  </span>
);

/* componente de item de sidebar */

const SidebarItem = ({
  to,
  icon,
  label,
  active = false,
  onClick,
  isCollapsed,
}: {
  to: string;
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
  isCollapsed?: boolean;
}) => (
  <Link
    to={to}
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    className={`
      flex items-center gap-4 px-5 py-3.5 rounded-xl cursor-pointer transition-all no-underline group
      ${
        active
          ? "bg-bg3 text-emerald-primary shadow-neo border border-white/5"
          : "text-content-secondary hover:text-content-primary hover:bg-white/5"
      }
      ${isCollapsed ? "justify-center px-0" : ""}
    `}
  >
    <div
      className={`${active ? "text-emerald-primary" : "text-content-muted group-hover:text-emerald-primary"} transition-colors shrink-0`}
    >
      {icon}
    </div>
    {!isCollapsed && (
      <span className="text-[11px] font-bold uppercase tracking-[0.15em]">
        {label}
      </span>
    )}
    {active && !isCollapsed && (
      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-primary shadow-glow-sm" />
    )}
  </Link>
);

const NavButton = ({
  icon,
  count,
  className = "",
  onClick,
}: {
  icon: any;
  count?: number;
  className?: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-9 h-9 md:w-10 md:h-10 rounded-xl bg-bg3 flex items-center justify-center text-content-secondary hover:text-emerald-primary transition-all border border-white/5 shadow-neo relative hover:scale-105 active:scale-95 ${className}`}
  >
    {icon}
    {count && (
      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-red-500 text-[7px] md:text-[8px] font-bold text-white rounded-full flex items-center justify-center border-2 border-bg0 shadow-glow-red">
        {count}
      </span>
    )}
  </button>
);

const Sidebar = ({
  className = "",
  onItemClick,
  isCollapsed,
  onToggle,
}: {
  className?: string;
  onItemClick?: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.rol === "ADMIN";

  return (
    <aside
      className={`${className} ${isCollapsed ? "w-20" : "w-72"} h-screen sticky top-0 flex flex-col bg-bg1 border-r border-white/5 shadow-neo z-[70] overflow-hidden transition-all duration-300`}
    >
      {/* Logo  */}

      <div
        className={`p-8 mb-4 flex-shrink-0 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}
      >
        <Link
          to="/"
          className={`flex items-center gap-4 no-underline group ${isCollapsed ? "justify-center" : ""}`}
          onClick={onItemClick}
        >
          <div className="w-10 h-10 rounded-xl bg-bg3 flex items-center justify-center shadow-neo group-hover:shadow-glow transition-all duration-300 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32">
              <rect x="2" y="2" width="28" height="28" rx="7" fill="none" stroke="#10b981" stroke-width="1.5"/>
              <g transform="translate(8,8)">
                <rect x="1" y="3" width="14" height="11" rx="1.5" fill="none" stroke="#10b981" stroke-width="1.5"/>
                <rect x="1" y="1" width="14" height="3" rx="1" fill="#10b981" opacity="0.9"/>
                <path d="M5 10l2 2 4-4" fill="none" stroke="#0d1a12" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </g>
            </svg>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tighter text-content-primary whitespace-nowrap">
                SIGAI-<span className="text-emerald-primary">SES</span>
              </span>
              <span className="text-[8px] text-content-muted tracking-[0.3em] uppercase">
                Securitas Lab
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Scroll de navegación */}

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto sidebar-scroll">
        <SidebarItem
          to="/"
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          active={location.pathname === "/"}
          onClick={onItemClick}
          isCollapsed={isCollapsed}
        />
        {!isCollapsed && (
          <div className="py-2">
            <SectionTitle>Operaciones</SectionTitle>
          </div>
        )}
        <SidebarItem
          to="/inventory"
          icon={<Package size={18} />}
          label="Inventario"
          active={location.pathname.startsWith("/inventory")}
          onClick={onItemClick}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          to="/desmontes"
          icon={<Settings size={18} />}
          label="Desmontes"
          active={location.pathname.startsWith("/desmontes")}
          onClick={onItemClick}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          to="/guarantees"
          icon={<ShieldCheck size={18} />}
          label="Garantías"
          active={location.pathname.startsWith("/guarantees")}
          onClick={onItemClick}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          to="/projects"
          icon={<Briefcase size={18} />}
          label="Proyectos"
          active={location.pathname.startsWith("/projects")}
          onClick={onItemClick}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          to="/alerts"
          icon={<AlertCircle size={18} />}
          label="Alertas"
          active={location.pathname.startsWith("/alerts")}
          onClick={onItemClick}
          isCollapsed={isCollapsed}
        />
        {isAdmin && (
          <SidebarItem
            to="/deliveries"
            icon={<FileText size={18} />}
            label="Actas"
            active={location.pathname.startsWith("/deliveries")}
            onClick={onItemClick}
            isCollapsed={isCollapsed}
          />
        )}
        {!isCollapsed && isAdmin && (
          <div className="py-2">
            <SectionTitle>Administración</SectionTitle>
          </div>
        )}
        <SidebarItem
          to="/clients"
          icon={<Users size={18} />}
          label="Clientes"
          active={location.pathname.startsWith("/clients")}
          onClick={onItemClick}
          isCollapsed={isCollapsed}
        />
        {isAdmin && (
          <SidebarItem
            to="/users"
            icon={<UserCog size={18} />}
            label="Usuarios"
            active={location.pathname.startsWith("/users")}
            onClick={onItemClick}
            isCollapsed={isCollapsed}
          />
        )}
        {isAdmin && (
          <SidebarItem
            to="/audit"
            icon={<History size={18} />}
            label="Auditoría"
            active={location.pathname.startsWith("/audit")}
            onClick={onItemClick}
            isCollapsed={isCollapsed}
          />
        )}
        <div className="pb-4" />
      </nav>

      {/* Sección del usuario */}

      <div
        className={`p-4 mt-auto flex-shrink-0 border-t border-white/5 ${isCollapsed ? "flex flex-col items-center gap-3" : ""}`}
      >
        <div
          className={`bg-bg2/50 rounded-2xl ${isCollapsed ? "p-2" : "p-4"} border border-white/5 flex ${isCollapsed ? "flex-col items-center" : "items-center gap-4"} shadow-neo-inset`}
        >
          {user?.avatar_url ? (
            <img
              src={resolveAvatarUrl(user.avatar_url)}
              alt={user?.nombre}
              className={`rounded-xl border border-emerald-primary/20 shrink-0 object-cover ${isCollapsed ? "w-9 h-9" : "w-10 h-10"}`}
              title={user?.nombre}
            />
          ) : (
            <div
              className={`rounded-xl bg-emerald-primary/10 flex items-center justify-center text-emerald-primary border border-emerald-primary/20 font-bold shrink-0 ${isCollapsed ? "w-9 h-9 text-[10px]" : "w-10 h-10"}`}
            >
              {user?.nombre?.substring(0, 2).toUpperCase() || "US"}
            </div>
          )}

          {!isCollapsed && (
            <div className="min-w-0 flex-1 text-content-primary">
              <p className="text-[11px] font-bold truncate">{user?.nombre}</p>
              <p className="text-[9px] text-emerald-primary/70 font-bold tracking-widest uppercase">
                {user?.rol}
              </p>
            </div>
          )}

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            title="Cerrar sesión"
            className={`p-2 rounded-lg bg-bg3 text-content-muted hover:text-red-500 transition-colors shadow-neo shrink-0 ${isCollapsed ? "mt-2" : ""}`}
          >
            <LogOut size={isCollapsed ? 14 : 16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
{
  /* Componente de barra de navegación*/
}

const Navbar = ({
  onMenuClick,
  onToggleSidebar,
}: {
  onMenuClick: () => void;
  onToggleSidebar: () => void;
}) => {
  const [showAlerts, setShowAlerts] = useState(false);
  const [alerts, setAlerts] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const pathParts = location.pathname.split("/").filter((p) => p);
  const breadcrumb =
    pathParts.length > 0 ? pathParts[pathParts.length - 1] : "Dashboard";

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getDashboardAlerts();
        setAlerts(data);
      } catch (error) {
        logger.error("Failed to fetch alerts", error);
      }
    };
    fetchAlerts();

    // Refrescar cada 5 minutos

    const interval = setInterval(fetchAlerts, 300000);
    return () => clearInterval(interval);
  }, []);

  // Lógica de búsqueda con debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await globalSearch(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        logger.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAlertClick = (alertId?: number) => {
    setShowAlerts(false);
    navigate("/alerts", { state: { selectedAlertId: alertId } });
  };

  const handleResultClick = (link: string) => {
    setShowResults(false);
    setSearchQuery("");
    navigate(link);
  };

  return (
    <header className="h-16 md:h-20 bg-bg0/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-10 z-40 sticky top-0">
      <div className="flex items-center gap-3 md:gap-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 rounded-xl bg-bg3 flex items-center justify-center text-emerald-primary shadow-neo border border-white/5 active:shadow-neo-inset transition-all"
        >
          <Menu size={20} />
        </button>
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex w-10 h-10 rounded-xl bg-bg3 items-center justify-center text-emerald-primary shadow-neo border border-white/5 active:shadow-neo-inset transition-all"
        >
          <Menu size={20} />
        </button>{" "}
        <div className="flex flex-col">
          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-content-muted">
            Sistema Central
          </span>
          <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest text-content-primary flex items-center gap-2">
            <span className="text-emerald-primary hidden sm:inline">/</span>{" "}
            {breadcrumb}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden md:flex relative" ref={searchRef}>
          <div className="flex items-center bg-bginput rounded-xl px-4 py-2.5 border border-white/5 shadow-neo-inset group focus-within:border-emerald-primary/30 transition-all">
            <Search
              size={14}
              className={`${isSearching ? "animate-pulse text-emerald-primary" : "text-content-muted"} group-focus-within:text-emerald-primary transition-colors`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Búsqueda global..."
              className="bg-transparent border-none outline-none text-[11px] w-48 xl:w-64 text-content-primary ml-3 font-mono placeholder:text-content-muted/50"
            />
          </div>

          {/* Panel de resultados */}
          {showResults && (
            <div className="absolute top-12 left-0 w-full bg-bg3 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[400px] overflow-y-auto custom-scrollbar">
              <div className="p-3 border-b border-white/5 bg-white/5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-content-muted">
                  Resultados Encontrados
                </p>
              </div>
              {searchResults.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {searchResults.map((res, i) => (
                    <div
                      key={i}
                      onClick={() => handleResultClick(res.link)}
                      className="p-3 hover:bg-emerald-primary/5 cursor-pointer transition-colors flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-bg2 flex items-center justify-center text-emerald-primary group-hover:bg-emerald-primary group-hover:text-bg0 transition-all">
                        {res.type === "Activo" && <Package size={14} />}
                        {res.type === "Ítem" && <ShieldCheck size={14} />}
                        {res.type === "Cliente" && <Users size={14} />}
                        {res.type === "Usuario" && <UserCog size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-content-primary truncate">
                          {res.title}
                        </p>
                        <p className="text-[9px] text-content-muted uppercase tracking-tighter">
                          {res.type} • {res.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-[10px] text-content-muted italic">
                    No se encontraron coincidencias.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 md:gap-3 relative">
          <NavButton
            icon={<Bell size={18} />}
            count={alerts?.total > 0 ? alerts.total : undefined}
            onClick={() => setShowAlerts(!showAlerts)}
          />
          <NavButton
            icon={<Settings size={18} />}
            onClick={() => navigate('/settings')}
          />

          {showAlerts && alerts && (
            <div className="absolute right-0 top-12 w-80 md:w-96 max-w-[calc(100vw-2rem)] bg-bg3 border border-white/10 rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in zoom-in duration-200">
              <h3 className="font-bold text-[10px] md:text-xs uppercase text-content-primary mb-4 flex justify-between items-center">
                <span>Notificaciones</span>
                <span className="bg-emerald-primary/10 text-emerald-primary px-2 py-0.5 rounded-full">
                  {alerts.total} pendientes
                </span>
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                {alerts.stock.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase text-gold tracking-widest">
                      Stock Crítico
                    </p>
                    {alerts.stock.map((s: any, i: number) => (
                      <div
                        key={i}
                        onClick={() => handleAlertClick(s.id)}
                        className="bg-white/5 p-3 rounded-lg flex justify-between items-center border border-white/5 hover:border-gold/30 transition-all cursor-pointer group"
                      >
                        <span className="text-[10px] md:text-xs text-content-secondary font-medium group-hover:text-gold transition-colors">
                          {s.title}
                        </span>
                        <span className="text-[9px] md:text-[10px] font-bold bg-gold/10 text-gold px-2 py-0.5 rounded">
                          Q: {s.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {alerts.garantias.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase text-red-400 tracking-widest mt-2">
                      Garantías (Vencimiento)
                    </p>
                    {alerts.garantias.map((g: any, i: number) => (
                      <div
                        key={i}
                        onClick={() => handleAlertClick(g.id)}
                        className="bg-white/5 p-3 rounded-lg border border-white/5 hover:border-red-500/30 transition-all cursor-pointer group"
                      >
                        <span className="text-[10px] md:text-xs text-red-400 font-medium group-hover:text-red-300 transition-colors">
                          {g.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {alerts.total === 0 && (
                  <p className="text-center text-[10px] md:text-xs text-content-muted italic py-4">
                    Sin alertas pendientes.
                  </p>
                )}
              </div>
              <button
                onClick={() => handleAlertClick()}
                className="w-full mt-4 py-2 text-[9px] font-bold uppercase tracking-widest text-emerald-primary hover:bg-emerald-primary/5 rounded-lg transition-all border border-emerald-primary/20"
              >
                Ver todas las alertas
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};

/* LAYOUT de Dashboard */

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ToastProvider>
      <div className="flex h-screen bg-bg0 text-content-primary font-mono overflow-hidden">
        {/* Sidebar de pc */}

        <Sidebar
          className="hidden lg:flex flex-shrink-0"
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Sidebar para Móvil */}

        <div
          className={`
        fixed inset-0 z-[100] lg:hidden transition-all duration-300
        ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}
        >
          <div
            className="absolute inset-0 bg-bg0/80 backdrop-blur-md"
            onClick={() => setIsSidebarOpen(false)}
          />
          <Sidebar
            className={`
            flex w-72 h-screen transform transition-transform duration-300
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
            onItemClick={() => setIsSidebarOpen(false)}
            isCollapsed={false}
            onToggle={() => {}}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Navbar
            onMenuClick={() => setIsSidebarOpen(true)}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar text-[10px] md:text-xs">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};
