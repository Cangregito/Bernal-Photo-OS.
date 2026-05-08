import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 55,
    paddingBottom: 85,
    fontFamily: 'Helvetica',
  },
  watermark: {
    position: 'absolute',
    top: '38%',
    left: '5%',
    right: '5%',
    textAlign: 'center',
    transform: 'rotate(-35deg)',
    opacity: 0.04,
  },
  watermarkText: {
    fontSize: 55,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 8,
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#111827',
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  brand: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 3,
  },
  brandSub: {
    fontSize: 8,
    color: '#9CA3AF',
    letterSpacing: 1,
    marginTop: 3,
  },
  docLabel: {
    fontSize: 10,
    color: '#374151',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textAlign: 'right',
  },
  docDate: {
    fontSize: 8,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  statusSigned: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusSignedText: {
    fontSize: 9,
    color: '#065F46',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusDraft: {
    backgroundColor: '#FEF9C3',
    borderWidth: 1,
    borderColor: '#D97706',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDraftText: {
    fontSize: 9,
    color: '#92400E',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contentBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contentText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.7,
  },
  integrityBox: {
    marginTop: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 4,
    backgroundColor: '#ECFDF5',
  },
  integrityLabel: {
    fontSize: 8,
    color: '#059669',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  integrityHash: {
    fontSize: 7,
    color: '#065F46',
    fontFamily: 'Courier',
    marginBottom: 3,
  },
  integrityMeta: {
    fontSize: 7,
    color: '#065F46',
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 55,
    right: 55,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerText: {
    fontSize: 7,
    color: '#9CA3AF',
  },
  pageNumber: {
    fontSize: 7,
    color: '#9CA3AF',
    textAlign: 'right',
  },
});

export interface ContractPDFData {
  content: string;
  clientName: string;
  clientEmail: string;
  status: string;
  hashSignature?: string;
  signedAt?: string;
  createdAt: string;
}

interface ContractPDFProps {
  contract: ContractPDFData;
}

export function ContractPDF({ contract }: ContractPDFProps) {
  const genDate = new Date(contract.createdAt).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const isSigned = contract.status === 'signed';

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Watermark */}
        <View style={styles.watermark} fixed>
          <Text style={styles.watermarkText}>BERNAL PHOTO</Text>
          <Text style={[styles.watermarkText, { fontSize: 22, marginTop: 6 }]}>
            {isSigned ? 'FIRMADO' : 'BORRADOR'}
          </Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>BERNAL PHOTO</Text>
            <Text style={styles.brandSub}>FOTOGRAFÍA PROFESIONAL · ESTUDIO CREATIVO</Text>
          </View>
          <View>
            <Text style={styles.docLabel}>Contrato de Servicios</Text>
            <Text style={styles.docDate}>Emitido: {genDate}</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View style={styles.statusBadge}>
          {isSigned ? (
            <View style={styles.statusSigned}>
              <Text style={styles.statusSignedText}>✓ Contrato Firmado Digitalmente</Text>
            </View>
          ) : (
            <View style={styles.statusDraft}>
              <Text style={styles.statusDraftText}>⚠ Pendiente de Firma</Text>
            </View>
          )}
        </View>

        {/* Contract Content */}
        <View style={styles.contentBox}>
          <Text style={styles.contentText}>{contract.content}</Text>
        </View>

        {/* Integrity Seal (if signed) */}
        {isSigned && contract.hashSignature && (
          <View style={styles.integrityBox}>
            <Text style={styles.integrityLabel}>✓ Sello de Integridad Criptográfica SHA-256</Text>
            <Text style={styles.integrityHash}>Hash: {contract.hashSignature}</Text>
            {contract.signedAt && (
              <Text style={styles.integrityMeta}>
                Firmado el {new Date(contract.signedAt).toLocaleString('es-MX')} por {contract.clientName} ({contract.clientEmail})
              </Text>
            )}
            <Text style={[styles.integrityMeta, { marginTop: 4 }]}>
              Este sello garantiza que el contenido del contrato no ha sido alterado desde su firma original.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View>
            <Text style={styles.footerText}>Bernal Photo OS — Gestión Fotográfica Profesional</Text>
            <Text style={styles.footerText}>
              {isSigned ? `Firmado por ${contract.clientName}` : 'Documento sin firma digital — No tiene validez legal'}
            </Text>
          </View>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>

      </Page>
    </Document>
  );
}
