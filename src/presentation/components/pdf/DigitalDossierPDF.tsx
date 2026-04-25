import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { DigitalDossier } from '../../../application/use-cases/client/GenerateDigitalDossier';
import { Contract } from '../../../domain/entities/Contract';
import { Session } from '../../../domain/entities/Session';
import { Quote } from '../../../domain/entities/Quote';

// Crear estilos profesionales para el documento
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 2,
  },
  documentTitle: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 120,
    fontSize: 10,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 10,
    color: '#111827',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  hashText: {
    fontSize: 7,
    color: '#059669', // Emerald 600
    marginTop: 5,
    fontFamily: 'Courier',
  }
});

interface DigitalDossierPDFProps {
  dossier: DigitalDossier;
}

export function DigitalDossierPDF({ dossier }: DigitalDossierPDFProps) {
  // Extraemos el hash del primer contrato firmado (si existe) para sellar el documento
  const signedContract = dossier.contracts.find((c: Contract) => c.status === 'signed' && c.hashSignature);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Cabecera / Branding */}
        <View style={styles.header}>
          <Text style={styles.brand}>BERNAL OS</Text>
          <Text style={styles.documentTitle}>Expediente Digital</Text>
        </View>

        {/* Información del Cliente */}
        <View style={styles.section}>
          <Text style={styles.title}>Información del Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre Completo:</Text>
            <Text style={styles.value}>{dossier.client.firstName} {dossier.client.lastName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Correo Electrónico:</Text>
            <Text style={styles.value}>{dossier.client.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>{dossier.client.phone || 'N/A'}</Text>
          </View>
        </View>

        {/* Resumen de Sesiones */}
        <View style={styles.section}>
          <Text style={styles.title}>Sesiones Contratadas ({dossier.sessions.length})</Text>
          {dossier.sessions.map((session: Session, i: number) => (
            <View key={i} style={styles.row}>
              <Text style={styles.label}>Fecha:</Text>
              <Text style={styles.value}>
                {new Date(session.date).toLocaleDateString()} - {session.type.toUpperCase()} ({session.status})
              </Text>
            </View>
          ))}
        </View>

        {/* Resumen Financiero */}
        <View style={styles.section}>
          <Text style={styles.title}>Cotizaciones ({dossier.quotes.length})</Text>
          {dossier.quotes.map((quote: Quote, i: number) => (
            <View key={i} style={styles.row}>
              <Text style={styles.label}>Monto Total:</Text>
              <Text style={styles.value}>
                $ {quote.totalAmount.toLocaleString()} MXN - Estado: {quote.status.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer Criptográfico (Integridad Legal) */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Documento generado automáticamente por Bernal Photo OS el {dossier.generatedAt.toLocaleDateString()}</Text>
          {signedContract ? (
            <Text style={styles.hashText}>SELLO DIGITAL SHA-256: {signedContract.hashSignature}</Text>
          ) : (
            <Text style={styles.hashText}>DOCUMENTO SIN SELLO LEGAL (Firma Pendiente)</Text>
          )}
        </View>

      </Page>
    </Document>
  );
}
