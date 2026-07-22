import React from 'react';
import { Card, Badge } from './Fusion';

export const StatCard = ({ title, value, icon, trend, color, trendUp }: any) => {
  const colorSchemes: any = {
    blue: {
      border: "border-chart-blue/20",
      bg: "bg-chart-blue/5",
      gradient: "from-chart-blue/10 to-transparent",
      iconBg: "bg-chart-blue/20",
      iconColor: "text-chart-blue",
      shadow: "shadow-[0_0_20px_rgba(59,130,246,0.1)]"
    },
    emerald: {
      border: "border-emerald-primary/20",
      bg: "bg-emerald-primary/5",
      gradient: "from-emerald-primary/10 to-transparent",
      iconBg: "bg-emerald-primary/20",
      iconColor: "text-emerald-primary",
      shadow: "shadow-[0_0_20px_rgba(16,185,129,0.1)]"
    },
    gold: {
      border: "border-gold/20",
      bg: "bg-gold/5",
      gradient: "from-gold/10 to-transparent",
      iconBg: "bg-gold/20",
      iconColor: "text-gold",
      shadow: "shadow-[0_0_20px_rgba(234,179,8,0.1)]"
    },
    purple: {
      border: "border-chart-purple/20",
      bg: "bg-chart-purple/5",
      gradient: "from-chart-purple/10 to-transparent",
      iconBg: "bg-chart-purple/20",
      iconColor: "text-chart-purple",
      shadow: "shadow-[0_0_20px_rgba(168,85,247,0.1)]"
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <Card className={`${scheme.border} ${scheme.bg} bg-gradient-to-br ${scheme.gradient} hover:scale-[1.02] transition-all duration-300 cursor-default group overflow-hidden`}>
      <div className="flex justify-between items-start relative z-10">
        <div className={`p-3 rounded-2xl ${scheme.iconBg} shadow-inner transition-transform group-hover:rotate-6`}>
          {React.cloneElement(icon as React.ReactElement, { size: 24, className: scheme.iconColor })}
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full bg-bg3/50 backdrop-blur-md border border-bg4 text-[10px] font-bold ${trendUp === false ? 'text-danger/80' : 'text-emerald-primary'}`}>
           {trend}
        </div>
      </div>
      <div className="mt-6 relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-content-muted/80 mb-1.5">{title}</p>
        <div className="flex items-baseline gap-2">
           <h3 className="text-4xl font-black tracking-tighter text-content-primary leading-none">{value}</h3>
           <div className={`w-1.5 h-1.5 rounded-full ${scheme.iconBg.replace('bg-', 'bg-')} animate-pulse`} />
        </div>
      </div>

      {/* elementos decorativos */}

      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${scheme.iconBg} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
    </Card>
  );
};

export const QuickAccessBtn = ({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full flex flex-col gap-1 items-center justify-center p-3 rounded-xl bg-bg3 border border-bg4 shadow-neo hover:bg-white/5/80 transition-all active:scale-95"
  >
    {icon}
    <span className="text-[8px] uppercase tracking-widest text-content-muted">{label}</span>
  </button>
);

//notificaciones del dashboard

export const NotificationItem = ({ icon, title, time }: any) => (
  <div className="flex gap-3 p-3 rounded-xl bg-bg2/50 border border-bg4 hover:bg-bg2 transition-colors cursor-pointer group">
    <div className="mt-0.5">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-content-primary truncate group-hover:text-emerald-primary transition-colors">{title}</p>
      <p className="text-[8px] text-content-muted mt-0.5 uppercase tracking-tighter">{time}</p>
    </div>
  </div>
);
