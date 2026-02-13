import { Text, Button, Hr } from '@react-email/components'
import { EmailLayout, styles } from './layout'

export interface WelcomeEmailProps {
  confirmUrl: string
}

export function WelcomeEmail({ confirmUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to SongSwipe! Confirm your email to get started.">
      <Text style={styles.heading}>Welcome to SongSwipe</Text>
      <Text style={styles.subheading}>
        You're one step away from creating personalised songs for the people you love.
      </Text>

      <Text style={styles.body}>
        Click the button below to confirm your email and start creating.
      </Text>

      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button href={confirmUrl} style={styles.button}>
          Confirm My Email
        </Button>
      </div>

      <Hr style={styles.divider} />

      <Text style={{ ...styles.body, fontSize: '13px', color: styles.textMuted }}>
        If you didn't create a SongSwipe account, you can safely ignore this email.
      </Text>
    </EmailLayout>
  )
}

export default WelcomeEmail
