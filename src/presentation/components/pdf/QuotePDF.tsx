import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 50,
    paddingBottom: 80,
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
    marginBottom: 28,
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
  // Client info block
  clientBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clientLabel: {
    fontSize: 7,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  clientDetail: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 3,
  },
  validLabel: {
    fontSize: 7,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  validDate: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'right',
  },
  // Table
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 3,
    marginBottom: 0,
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
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
  },
  // Total
  totalBox: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalInner: {
    backgroundColor: '#111827',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginRight: 20,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  // Notes / terms
  termsBox: {
    marginTop: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
  },
  termsTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  termsText: {
    fontSize: 8,
    color: '#6B7280',
    lineHeight: 1.5,
  },
  // Footer
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

const formatCurrency = (amount: number) =>
  `$${new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} MXN`;

export interface QuotePDFData {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  totalAmount: number;
  status: string;
  validUntil: string;
  createdAt?: string;
}

interface QuotePDFProps {
  quote: QuotePDFData;
}

export function QuotePDF({ quote }: QuotePDFProps) {
  const genDate = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const validDate = new Date(quote.validUntil).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Watermark */}
        <View style={styles.watermark} fixed>
          <Text style={styles.watermarkText}>BERNAL PHOTO</Text>
          <Text style={[styles.watermarkText, { fontSize: 22, marginTop: 6 }]}>COTIZACIÓN</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>BERNAL PHOTO</Text>
            <Text style={styles.brandSub}>FOTOGRAFÍA PROFESIONAL · ESTUDIO CREATIVO</Text>
          </View>
          <View>
            <Text style={styles.docLabel}>Cotización Oficial</Text>
            <Text style={styles.docDate}>Generada el {genDate}</Text>
          </View>
        </View>

        {/* Client Block */}
        <View style={styles.clientBox}>
          <View>
            <Text style={styles.clientLabel}>Preparada para</Text>
            <Text style={styles.clientName}>{quote.clientName}</Text>
            <Text style={styles.clientDetail}>{quote.clientEmail}</Text>
            {quote.clientPhone && <Text style={styles.clientDetail}>{quote.clientPhone}</Text>}
          </View>
          <View>
            <Text style={styles.validLabel}>Válida hasta</Text>
            <Text style={styles.validDate}>{validDate}</Text>
          </View>
        </View>

        {/* Items Table */}
        <Text style={styles.sectionTitle}>Desglose de Servicios</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Servicio</Text>
          <Text style={[styles.tableHeaderText, { width: 50, textAlign: 'center' }]}>Cant.</Text>
          <Text style={[styles.tableHeaderText, { width: 80, textAlign: 'right' }]}>Precio Unit.</Text>
          <Text style={[styles.tableHeaderText, { width: 90, textAlign: 'right' }]}>Subtotal</Text>
        </View>
        {quote.items.map((item, i) => (
          <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.name}</Text>
            <Text style={[styles.tableCell, { width: 50, textAlign: 'center' }]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, { width: 80, textAlign: 'right' }]}>{formatCurrency(item.price)}</Text>
            <Text style={[styles.tableCell, { width: 90, textAlign: 'right', fontWeight: 'bold', color: '#111827' }]}>{formatCurrency(item.price * item.quantity)}</Text>
          </View>
        ))}

        {/* Total */}
        <View style={styles.totalBox}>
          <View style={styles.totalInner}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>{formatCurrency(quote.totalAmount)}</Text>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsBox}>
          <Text style={styles.termsTitle}>Términos y Condiciones</Text>
          <Text style={styles.termsText}>
            • Esta cotización es válida por 30 días a partir de su fecha de emisión.{'\n'}
            • Los precios incluyen el servicio completo descrito. No incluyen impuestos adicionales salvo indicación.{'\n'}
            • Para confirmar la reservación, se requiere un anticipo del 50% del monto total.{'\n'}
            • Cualquier cambio en el alcance del servicio puede afectar el precio final.{'\n'}
            • Bernal Photo se reserva el derecho de utilizar las imágenes con fines promocionales, salvo acuerdo contrario.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View>
            <Text style={styles.footerText}>Bernal Photo OS — Plataforma de Gestión Fotográfica Profesional</Text>
            <Text style={styles.footerText}>Cotización generada el {genDate}</Text>
          </View>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>

      </Page>
    </Document>
  );
}
