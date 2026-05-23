import type { SamvidhanCardPdfData } from '@/lib/samvidhan-advisory-card-pdf';
import { Document, Image, Page, Path, StyleSheet, Svg, Text, View } from '@react-pdf/renderer';

const NAVY = '#0f2c5c';
const WHITE = '#ffffff';
const CARD_W = 340;
const CARD_H = 500;
const DETAIL_LABEL_W = 118;
const DETAIL_COLON_W = 10;
const DETAIL_VALUE_W = CARD_W - 48 - DETAIL_LABEL_W - DETAIL_COLON_W;
const AVATAR_SIZE = 110;

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    padding: 20,
    gap: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: WHITE,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  // ─── FRONT ───
  frontHeader: {
    backgroundColor: NAVY,
    paddingTop: 18,
    paddingBottom: 32,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 55,
    height: 55,
    objectFit: 'contain',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: WHITE,
    fontFamily: 'Helvetica-Oblique',
    fontSize: 12,
    marginTop: 2,
  },
  frontBody: {
    alignItems: 'center',
    paddingTop: 14,
    flex: 1,
  },
  avatarClip: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: '#cccccc',
    borderStyle: 'solid',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e5e5e5',
  },
  // Oversized + clipped — react-pdf often ignores objectFit: cover on square photos.
  avatarImage: {
    position: 'absolute',
    top: -12,
    left: -12,
    width: AVATAR_SIZE + 24,
    height: AVATAR_SIZE + 24,
    objectFit: 'cover',
  },
  detailsWrap: {
    paddingHorizontal: 24,
    paddingTop: 18,
    width: CARD_W,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: DETAIL_LABEL_W + DETAIL_COLON_W + DETAIL_VALUE_W,
  },
  detailLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    width: DETAIL_LABEL_W,
    flexShrink: 0,
  },
  detailColon: {
    fontSize: 11,
    width: DETAIL_COLON_W,
    flexShrink: 0,
  },
  detailValue: {
    fontSize: 11,
    width: DETAIL_VALUE_W,
    flexShrink: 0,
    lineHeight: 1.35,
  },
  // Bottom footer on front (wave)
  frontFooterWrap: {
    height: 70,
    position: 'relative',
  },
  frontFooterSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: CARD_W,
    height: 70,
  },
  // ─── BACK ───
  backHeader: {
    backgroundColor: NAVY,
    paddingTop: 14,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backHeaderTitle: {
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 8,
  },
  termText: {
    color: WHITE,
    fontSize: 9,
    lineHeight: 1.5,
    marginBottom: 2,
  },
  backBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  signatureImage: {
    width: 120,
    height: 60,
  },
  signatureLine: {
    width: 120,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    borderTopStyle: 'solid',
    marginTop: 6,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#333333',
    letterSpacing: 0.5,
    marginTop: 4,
    fontFamily: 'Helvetica-Bold',
  },
  phoneText: {
    fontSize: 11,
    color: '#1a1a1a',
    marginTop: 14,
  },
  backFooter: {
    backgroundColor: NAVY,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  addressText: {
    color: WHITE,
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 1.5,
  },
});

interface Props {
  data: SamvidhanCardPdfData;
}

export const SamvidhanCardPdfDocument = ({ data }: Props) => (
  <Document>
    <Page size={[CARD_W * 2 + 60, CARD_H + 40]} style={styles.page}>
      {/* ─── FRONT CARD ─── */}
      <View style={styles.card}>
        {/* Header with logo */}
        <View style={styles.frontHeader}>
          {data.logoUrl && <Image src={data.logoUrl} style={styles.logo} />}
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>SAMVIDHAN</Text>
            <Text style={styles.headerSubtitle}>Legal Advisory</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.frontBody}>
          {/* Profile photo */}
          <View style={styles.avatarClip}>
            {data.photoUrl && <Image src={data.photoUrl} style={styles.avatarImage} />}
          </View>

          {/* Details */}
          <View style={styles.detailsWrap}>
            <DetailRow label="Name" value={data.name} />
            <DetailRow label="Mem. No" value={data.memberNo} />
            <DetailRow label="Valid from" value={data.memStartDate} />
            <DetailRow label="Valid till" value={data.memEndDate} />
            <DetailRow label="Mob. No" value={data.userMobileNo} />
          </View>
        </View>

        {/* Wave footer */}
        <View style={styles.frontFooterWrap}>
          <Svg style={styles.frontFooterSvg} viewBox={`0 0 ${CARD_W} 70`}>
            <Path
              d={`M0,30 C${CARD_W * 0.25},5 ${CARD_W * 0.75},55 ${CARD_W},30 L${CARD_W},70 L0,70 Z`}
              fill={NAVY}
            />
          </Svg>
        </View>
      </View>

      {/* ─── BACK CARD ─── */}
      <View style={styles.card}>
        {/* Terms header */}
        <View style={styles.backHeader}>
          <Text style={styles.backHeaderTitle}>TERM &amp; CONDITION</Text>
          <Text style={styles.termText}>1. This Card Is For Identity Only.</Text>
          <Text style={styles.termText}>2. This Card Must Be Displayed By The Holder.</Text>
          <Text style={styles.termText}>
            3. Please Ensure Safe Custody Of This Card And Report Loss Immediately To Issuing
            Authority.
          </Text>
        </View>

        {/* Signature section */}
        <View style={styles.backBody}>
          {data.signatureUrl && <Image src={data.signatureUrl} style={styles.signatureImage} />}
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>SIGNATURE</Text>
          <Text style={styles.phoneText}>+91 9152921212</Text>
        </View>

        {/* Address footer */}
        <View style={styles.backFooter}>
          <Text style={styles.addressText}>
            Add.: Office No. 12, Shiv Surbhi Apartment,{'\n'}Thakur Village, Kandivali East,{'\n'}
            Mumbai - 400101
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);

/** Prevent PDF line-breaks on hyphens in names (e.g. "Dum-my" → three lines). */
function pdfSafeText(value?: string): string {
  if (!value) return '';
  return value.replace(/-/g, '\u2011');
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailColon}>:</Text>
      <Text style={styles.detailValue}>{pdfSafeText(value)}</Text>
    </View>
  );
}
