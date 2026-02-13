import { Text, Button, Hr, Section } from '@react-email/components'
import { EmailLayout, styles } from './layout'

export interface OrderConfirmationEmailProps {
  recipientName: string
  occasion: string
  genre: string
  orderId: string
  generateUrl: string
}

export function OrderConfirmationEmail({
  recipientName,
  occasion,
  genre,
  orderId,
  generateUrl,
}: OrderConfirmationEmailProps) {
  return (
    <EmailLayout preview={`Order confirmed! Your song for ${recipientName} is being created.`}>
      <Text style={styles.heading}>Order Confirmed</Text>
      <Text style={styles.subheading}>
        Your personalised song is being crafted right now.
      </Text>

      {/* Order details */}
      <Section style={{
        backgroundColor: styles.bgDark,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tr>
            <td style={{ padding: '4px 0', fontSize: '13px', color: styles.textMuted }}>For</td>
            <td style={{ padding: '4px 0', fontSize: '14px', color: styles.textPrimary, textAlign: 'right' }}>{recipientName}</td>
          </tr>
          <tr>
            <td style={{ padding: '4px 0', fontSize: '13px', color: styles.textMuted }}>Occasion</td>
            <td style={{ padding: '4px 0', fontSize: '14px', color: styles.textPrimary, textAlign: 'right' }}>{occasion}</td>
          </tr>
          <tr>
            <td style={{ padding: '4px 0', fontSize: '13px', color: styles.textMuted }}>Genre</td>
            <td style={{ padding: '4px 0', fontSize: '14px', color: styles.textPrimary, textAlign: 'right' }}>{genre}</td>
          </tr>
          <tr>
            <td style={{ padding: '4px 0', fontSize: '13px', color: styles.textMuted }}>Order</td>
            <td style={{ padding: '4px 0', fontSize: '12px', color: styles.textMuted, textAlign: 'right', fontFamily: 'monospace' }}>{orderId}</td>
          </tr>
        </table>
      </Section>

      <Text style={styles.body}>
        We'll email you again when your song variants are ready to listen. This usually takes a few minutes.
      </Text>

      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button href={generateUrl} style={styles.button}>
          Track Progress
        </Button>
      </div>

      <Hr style={styles.divider} />

      <Text style={{ ...styles.body, fontSize: '13px', color: styles.textMuted }}>
        Questions? Reply to this email and we'll help you out.
      </Text>
    </EmailLayout>
  )
}

export default OrderConfirmationEmail
