'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { DigitalDossierPDF } from './DigitalDossierPDF';
import { DigitalDossier } from '../../../application/use-cases/client/GenerateDigitalDossier';

interface DownloadPDFButtonProps {
  dossier: DigitalDossier;
}

export function DownloadPDFButton({ dossier }: DownloadPDFButtonProps) {
  return (
    <PDFDownloadLink
      document={<DigitalDossierPDF dossier={dossier} />}
      fileName={`Expediente_${dossier.client.firstName}_${dossier.client.lastName}.pdf`}
      className="inline-flex items-center justify-center p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors group"
      title="Descargar Expediente PDF"
    >
      {/* react-pdf inyecta { loading } como argumento de función si lo queremos usar */}
      <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
    </PDFDownloadLink>
  );
}
