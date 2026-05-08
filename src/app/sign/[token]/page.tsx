'use client';

import { useState, useEffect, use } from 'react';
import { FileSignature, ShieldCheck, AlertTriangle, Loader2, XCircle } from 'lucide-react';

interface ContractData {
  content: string;
  clientName?: string;
}

export default function SignContractPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  // Load contract data from token
  useEffect(() => {
    async function loadContract() {
      try {
        const res = await fetch(`/api/sign/preview?token=${token}`);
        const data = await res.json();
        if (!res.ok) {
          setTokenError(data.error || 'Enlace inválido o expirado');
        } else {
          setContractData(data);
        }
      } catch {
        setTokenError('Error al cargar el contrato. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    }
    loadContract();
  }, [token]);

  const handleSign = async () => {
    if (!agreed) return;
    setSigning(true);
    setSignError(null);
    try {
      const res = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          signatureBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al firmar');
      setSigned(true);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error al procesar la firma. Intenta de nuevo.';
      setSignError(message);
    } finally {
      setSigning(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  // ── Invalid / expired token ───────────────────────────────────────────────
  if (tokenError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Enlace No Válido</h1>
          <p className="text-zinc-400 text-sm">{tokenError}</p>
        </div>
      </div>
    );
  }

  // ── Successfully signed ───────────────────────────────────────────────────
  if (signed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">¡Contrato Firmado!</h1>
          <p className="text-zinc-400 text-sm mb-6">
            Tu firma ha sido registrada y sellada con un hash criptográfico SHA-256.
            Este documento es ahora legalmente vinculante e inmutable.
          </p>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
            <p className="text-xs text-emerald-400 font-mono">Sello de integridad SHA-256 generado exitosamente</p>
            <p className="text-xs text-zinc-500 mt-2">Este enlace ha sido invalidado y no puede volver a utilizarse.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Sign form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">BERNAL PHOTO</h1>
          <p className="text-zinc-500 text-sm mt-1">Firma Digital de Contrato</p>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">

          {/* Title bar */}
          <div className="bg-zinc-800/60 px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <FileSignature className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-white">Contrato de Prestación de Servicios</p>
              {contractData?.clientName && (
                <p className="text-xs text-zinc-400">Preparado para: {contractData.clientName}</p>
              )}
            </div>
          </div>

          {/* Contract content */}
          <div className="p-6">
            <div className="bg-zinc-800/40 rounded-lg p-5 mb-5 max-h-80 overflow-y-auto">
              <pre className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-mono">
                {contractData?.content}
              </pre>
            </div>

            {/* One-time use warning */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 mb-5 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
                Este enlace es de <strong>un solo uso</strong>. Una vez que firmes, este enlace quedará invalidado permanentemente y el contrato será sellado con SHA-256.
              </p>
            </div>

            {/* Agreement checkbox */}
            <label className="flex items-start gap-3 mb-5 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-zinc-600 text-emerald-500 focus:ring-emerald-500/30 bg-zinc-800"
              />
              <span className="text-sm text-zinc-300 leading-relaxed group-hover:text-zinc-200 transition-colors">
                He leído y acepto todos los términos y condiciones de este contrato. Entiendo que mi firma digital tiene validez legal.
              </span>
            </label>

            {signError && (
              <p className="text-sm text-red-400 mb-4 bg-red-500/5 border border-red-500/20 rounded-md px-3 py-2">{signError}</p>
            )}

            {/* Sign button */}
            <button
              onClick={handleSign}
              disabled={signing || !agreed}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-6 py-3.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {signing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando firma digital...
                </>
              ) : (
                <>
                  <FileSignature className="w-4 h-4" />
                  Firmar Contrato Digitalmente
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          Protegido por Bernal Photo OS · Integridad criptográfica SHA-256
        </p>
      </div>
    </div>
  );
}
