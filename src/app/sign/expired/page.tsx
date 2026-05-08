import { ShieldAlert } from 'lucide-react';

export default function SignExpiredPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Enlace Expirado</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Este enlace de firma ya fue utilizado o ha expirado. 
          Por seguridad, cada enlace solo puede ser usado una vez.
        </p>
        <p className="text-xs text-zinc-600">
          Si necesitas un nuevo enlace, contacta a tu fotógrafo.
        </p>
      </div>
    </div>
  );
}
