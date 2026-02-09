import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Link,
  Hr,
  Preview,
} from '@react-email/components'

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
    <Html>
      <Head />
      <Preview>It's almost time to celebrate {occasionType} again!</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Section>
            <Text
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1a1a2e',
                marginBottom: '20px',
              }}
            >
              Continue the Story
            </Text>
            <Text
              style={{
                fontSize: '16px',
                lineHeight: '24px',
                color: '#333',
                marginBottom: '16px',
              }}
            >
              It's almost time to celebrate {occasionType} again! Last year, you created a
              special song for {recipientName}.
            </Text>
            <Text
              style={{
                fontSize: '16px',
                lineHeight: '24px',
                color: '#333',
                marginBottom: '24px',
              }}
            >
              Create a new version to continue your musical tradition:
            </Text>
            <Button
              href={createSongUrl}
              style={{
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                padding: '14px 28px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Create This Year's Song
            </Button>
          </Section>

          <Hr style={{ margin: '40px 0', borderColor: '#eee' }} />

          <Section style={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>
            <Text style={{ marginBottom: '8px' }}>SongSwipe</Text>
            <Text style={{ marginBottom: '8px' }}>
              {process.env.COMPANY_ADDRESS || '[Physical Address]'}
            </Text>
            <Text style={{ marginBottom: '4px' }}>
              <Link
                href={unsubscribeUrl}
                style={{ color: '#999', textDecoration: 'underline' }}
              >
                Unsubscribe from {occasionType} reminders
              </Link>
            </Text>
            <Text>
              <Link
                href={unsubscribeAllUrl}
                style={{ color: '#999', textDecoration: 'underline' }}
              >
                Unsubscribe from all SongSwipe emails
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default AnniversaryReminderEmail
