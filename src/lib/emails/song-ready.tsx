import { Text, Button, Hr, Section } from '@react-email/components'
import { EmailLayout, styles } from './layout'

export interface SongReadyEmailProps {
  recipientName: string
  occasion: string
  songUrl: string
}

export function SongReadyEmail({ recipientName, occasion, songUrl }: SongReadyEmailProps) {
  return (
    <EmailLayout preview={`Your song for ${recipientName} is ready to listen!`}>
      <Text style={styles.heading}>Your Song is Ready</Text>
      <Text style={styles.subheading}>
        Time to hear something special.
      </Text>

      {/* Song details card */}
      <Section style={{
        backgroundColor: styles.bgDark,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <Text style={{ margin: '0 0 4px 0', fontSize: '13px', color: styles.textMuted }}>
          Created for
        </Text>
        <Text style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 600, color: styles.textPrimary }}>
          {recipientName}
        </Text>
        <div>
          <span style={styles.badge}>{occasion}</span>
        </div>
      </Section>

      <Text style={styles.body}>
        Your personalised song has been generated. Listen to the variants and pick your favourite,
        then share it with {recipientName}!
      </Text>

      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button href={songUrl} style={styles.button}>
          Listen Now
        </Button>
      </div>

      <Hr style={styles.divider} />

      <Text style={{ ...styles.body, fontSize: '13px', color: styles.textMuted }}>
        Tip: You can download, share, or tweak your song from your dashboard.
      </Text>
    </EmailLayout>
  )
}

export default SongReadyEmail
