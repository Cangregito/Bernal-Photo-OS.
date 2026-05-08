import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { DigitalDossier } from '../../../application/use-cases/client/GenerateDigitalDossier';
import { Contract } from '../../../domain/entities/Contract';
import { Session } from '../../../domain/entities/Session';
import { Quote } from '../../../domain/entities/Quote';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 50,
    paddingBottom: 80,
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  // ─── Marca de Agua ─────────────────────────────
  watermark: {
    position: 'absolute',
    top: '35%',
    left: '10%',
    right: '10%',
    textAlign: 'center',
    transform: 'rotate(-35deg)',
    opacity: 0.04,
  },
  watermarkText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 8,
  },
  // ─── Cabecera ──────────────────────────────────
  header: {
    marginBottom: 25,
    borderBottomWidth: 2,
    borderBottomColor: '#111827',
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  brandContainer: {
    flexDirection: 'column',
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
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  documentTitle: {
    fontSize: 11,
    color: '#374151',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  documentDate: {
    fontSize: 8,
    color: '#9CA3AF',
    marginTop: 3,
  },
  // ─── Secciones ─────────────────────────────────
  section: {
    marginTop: 15,
    marginBottom: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionBadge: {
    backgroundColor: '#111827',
    color: '#ffffff',
    fontSize: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
  },
  // ─── Datos ─────────────────────────────────────
  row: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingVertical: 2,
  },
  rowAlt: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 2,
  },
  label: {
    width: 130,
    fontSize: 9,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 9,
    color: '#111827',
    flex: 1,
  },
  // ─── Tabla de Items ────────────────────────────
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 3,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 8,
    color: '#ffffff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCell: {
    fontSize: 8,
    color: '#374151',
  },
  // ─── Footer ────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerLeft: {
    flexDirection: 'column',
    maxWidth: '70%',
  },
  footerText: {
    fontSize: 7,
    color: '#9CA3AF',
  },
  footerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  hashLabel: {
    fontSize: 6,
    color: '#059669',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  hashText: {
    fontSize: 6,
    color: '#059669',
    fontFamily: 'Courier',
    maxWidth: 200,
  },
  noHash: {
    fontSize: 7,
    color: '#D97706',
    fontFamily: 'Courier',
  },
  pageNumber: {
    fontSize: 7,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  // ─── Sello de Integridad ──────────────────────
  integrityBadge: {
    marginTop: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 4,
    backgroundColor: '#ECFDF5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  integrityText: {
    fontSize: 8,
    color: '#065F46',
    flex: 1,
  },
  integrityLabel: {
    fontSize: 7,
    color: '#059669',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
});

interface DigitalDossierPDFProps {
  dossier: DigitalDossier;
}

export function DigitalDossierPDF({ dossier }: DigitalDossierPDFProps) {
  const signedContract = dossier.contracts.find((c: Contract) => c.status === 'signed' && c.hashSignature);
  const genDate = new Date(dossier.generatedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const genTime = new Date(dossier.generatedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ─── Marca de Agua Diagonal ─────────────── */}
        <View style={styles.watermark} fixed>
          <Text style={styles.watermarkText}>BERNAL PHOTO</Text>
          <Text style={[styles.watermarkText, { fontSize: 20, marginTop: 5 }]}>CONFIDENCIAL</Text>
        </View>

        {/* ─── Cabecera con Branding ──────────────── */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <Text style={styles.brand}>BERNAL PHOTO</Text>
            <Text style={styles.brandSub}>FOTOGRAFÍA PROFESIONAL · ESTUDIO CREATIVO</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.documentTitle}>Expediente Digital</Text>
            <Text style={styles.documentDate}>{genDate} — {genTime}</Text>
          </View>
        </View>

        {/* ─── Información del Cliente ────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionBadge}>01</Text>
            <Text style={styles.title}>Información del Cliente</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre Completo:</Text>
            <Text style={styles.value}>{dossier.client.firstName} {dossier.client.lastName}</Text>
          </View>
          <View style={styles.rowAlt}>
            <Text style={styles.label}>Correo Electrónico:</Text>
            <Text style={styles.value}>{dossier.client.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>{dossier.client.phone || 'No proporcionado'}</Text>
          </View>
          {dossier.client.notes && (
            <View style={styles.rowAlt}>
              <Text style={styles.label}>Notas:</Text>
              <Text style={styles.value}>{dossier.client.notes}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de Registro:</Text>
            <Text style={styles.value}>{new Date(dossier.client.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </View>
        </View>

        {/* ─── Sesiones Contratadas ───────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionBadge}>02</Text>
            <Text style={styles.title}>Sesiones Contratadas ({dossier.sessions.length})</Text>
          </View>
          {dossier.sessions.length === 0 ? (
            <Text style={[styles.value, { color: '#9CA3AF' }]}>Sin sesiones registradas.</Text>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: '30%' }]}>Fecha</Text>
                <Text style={[styles.tableHeaderText, { width: '20%' }]}>Tipo</Text>
                <Text style={[styles.tableHeaderText, { width: '20%' }]}>Estado</Text>
                <Text style={[styles.tableHeaderText, { width: '30%' }]}>Ubicación</Text>
              </View>
              {dossier.sessions.map((session: Session, i: number) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '30%' }]}>{new Date(session.date).toLocaleDateString('es-MX')}</Text>
                  <Text style={[styles.tableCell, { width: '20%' }]}>{session.type.toUpperCase()}</Text>
                  <Text style={[styles.tableCell, { width: '20%' }]}>{session.status.toUpperCase()}</Text>
                  <Text style={[styles.tableCell, { width: '30%' }]}>{session.location || '—'}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* ─── Resumen Financiero ─────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionBadge}>03</Text>
            <Text style={styles.title}>Cotizaciones ({dossier.quotes.length})</Text>
          </View>
          {dossier.quotes.length === 0 ? (
            <Text style={[styles.value, { color: '#9CA3AF' }]}>Sin cotizaciones registradas.</Text>
          ) : (
            dossier.quotes.map((quote: Quote, i: number) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <View style={styles.rowAlt}>
                  <Text style={styles.label}>Monto Total:</Text>
                  <Text style={[styles.value, { fontWeight: 'bold' }]}>$ {quote.totalAmount.toLocaleString()} MXN</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Estado:</Text>
                  <Text style={styles.value}>{quote.status.toUpperCase()}</Text>
                </View>
                {quote.items && quote.items.length > 0 && (
                  <View style={{ marginTop: 4, paddingLeft: 10 }}>
                    {quote.items.map((item, j: number) => (
                      <Text key={j} style={{ fontSize: 8, color: '#6B7280', marginBottom: 2 }}>
                        • {item.quantity}x {item.name} — ${item.price.toLocaleString()} MXN
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* ─── Sello de Integridad ────────────────── */}
        {signedContract && (
          <View style={styles.integrityBadge}>
            <View style={{ flex: 1 }}>
              <Text style={styles.integrityLabel}>✓ Documento Verificado — Sello de Integridad</Text>
              <Text style={styles.integrityText}>
                Este expediente está protegido por un sello criptográfico SHA-256 que garantiza que su contenido no ha sido alterado desde la firma original.
              </Text>
              <Text style={[styles.hashText, { marginTop: 4, color: '#065F46' }]}>
                {signedContract.hashSignature}
              </Text>
            </View>
          </View>
        )}

        {/* ─── Footer con Paginación ─────────────── */}
        <View style={styles.footer} fixed>
          <View style={styles.footerLeft}>
            <Text style={styles.footerText}>Bernal Photo OS — Plataforma de Gestión Fotográfica Profesional</Text>
            <Text style={styles.footerText}>Generado el {genDate} a las {genTime} hrs.</Text>
            {signedContract ? (
              <View style={{ marginTop: 3 }}>
                <Text style={styles.hashLabel}>Sello SHA-256</Text>
                <Text style={styles.hashText}>{signedContract.hashSignature}</Text>
              </View>
            ) : (
              <Text style={[styles.noHash, { marginTop: 3 }]}>⚠ EXPEDIENTE SIN SELLO LEGAL (Firma Pendiente)</Text>
            )}
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
          </View>
        </View>

      </Page>
    </Document>
  );
}
