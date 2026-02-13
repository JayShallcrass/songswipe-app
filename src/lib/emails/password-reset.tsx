import { Text, Button, Hr } from '@react-email/components'
import { EmailLayout, styles } from './layout'

export interface PasswordResetEmailProps {
  resetUrl: string
}

export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Reset your SongSwipe password">
      <Text style={styles.heading}>Reset Your Password</Text>
      <Text style={styles.subheading}>
        We received a request to reset your password.
      </Text>

      <Text style={styles.body}>
        Click the button below to choose a new password. This link expires in 1 hour.
      </Text>

      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button href={resetUrl} style={styles.button}>
          Reset Password
        </Button>
      </div>

      <Hr style={styles.divider} />

      <Text style={{ ...styles.body, fontSize: '13px', color: styles.textMuted }}>
        If you didn't request a password reset, you can safely ignore this email.
        Your password will remain unchanged.
      </Text>
    </EmailLayout>
  )
}

export default PasswordResetEmail
