import { Users, Camera, TrendingUp, Clock } from 'lucide-react';

const stats = [
  { name: 'Clientes Activos', value: '142', icon: Users, trend: '+4.75%' },
  { name: 'Sesiones este Mes', value: '28', icon: Camera, trend: '+12.5%' },
  { name: 'Ingresos Mensuales', value: '$12,450', icon: TrendingUp, trend: '+8.2%' },
  { name: 'Pendientes de Firma', value: '5', icon: Clock, trend: '-2' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">Dashboard Overview</h2>
        <p className="text-sm text-white/50 mt-1">
          Bienvenido a Bernal Photo OS. Aquí tienes un resumen de tu actividad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="glass-card rounded-xl p-6 relative overflow-hidden group">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/5 blur-3xl group-hover:bg-white/10 transition-colors duration-500"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <p className="text-sm font-medium text-white/60">{stat.name}</p>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                  <Icon className="w-5 h-5 text-white/80" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline space-x-3 relative z-10">
                <h3 className="text-3xl font-semibold tracking-tight text-white">{stat.value}</h3>
                <span className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-xl p-6 h-96 flex flex-col items-center justify-center border border-white/5">
          <p className="text-white/40 text-sm">El gráfico de actividad se implementará pronto.</p>
        </div>
        <div className="glass-card rounded-xl p-6 border border-white/5">
          <h3 className="text-sm font-medium text-white/80 mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400/50"></div>
                <div>
                  <p className="text-sm text-white/90">Sesión fotográfica &ldquo;Boda García&rdquo;</p>
                  <p className="text-xs text-white/40">hace 2 horas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
