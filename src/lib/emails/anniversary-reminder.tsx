import { Text, Button, Hr, Link } from '@react-email/components'
import { EmailLayout, styles } from './layout'

export interface AnniversaryReminderEmailProps {
  recipientName: string
  occasionType: string
  createSongUrl: string
  unsubscribeUrl: string
  unsubscribeAllUrl: string
}

export function AnniversaryReminderEmail({
  recipientName,
  occasionType,
  createSongUrl,
  unsubscribeUrl,
  unsubscribeAllUrl,
}: AnniversaryReminderEmailProps) {
  return (
    <EmailLayout preview={`It's almost time to celebrate ${occasionType} again!`}>
      <Text style={styles.heading}>Continue the Story</Text>
      <Text style={styles.subheading}>
        It's almost time to celebrate {occasionType} again!
      </Text>

      <Text style={styles.body}>
        Last year, you created a special song for {recipientName}. Why not make this year's
        even better?
      </Text>

      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button href={createSongUrl} style={styles.button}>
          Create This Year's Song
        </Button>
      </div>

      <Hr style={styles.divider} />

      <Text style={{ fontSize: '12px', color: styles.textMuted, textAlign: 'center', lineHeight: '20px', margin: 0 }}>
        <Link href={unsubscribeUrl} style={{ color: styles.textMuted, textDecoration: 'underline' }}>
          Unsubscribe from {occasionType} reminders
        </Link>
        {' | '}
        <Link href={unsubscribeAllUrl} style={{ color: styles.textMuted, textDecoration: 'underline' }}>
          Unsubscribe from all
        </Link>
      </Text>
    </EmailLayout>
  )
}

export default AnniversaryReminderEmail
