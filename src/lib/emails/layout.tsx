import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Img,
  Hr,
  Link,
  Font,
} from '@react-email/components'
import { ReactNode } from 'react'

const brandOrange = '#f97316'
const brandAmber = '#f59e0b'
const bgDark = '#0f0d0a'
const bgCard = '#1a1816'
const borderColor = '#292724'
const textPrimary = '#ffffff'
const textSecondary = '#a1a1aa'
const textMuted = '#71717a'

export interface EmailLayoutProps {
  preview: string
  children: ReactNode
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="system-ui"
          fallbackFontFamily="Helvetica"
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Body style={{
        backgroundColor: bgDark,
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
        margin: 0,
        padding: 0,
      }}>
        {/* Hidden preview text */}
        <Text style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
          {preview}
        </Text>

        <Container style={{
          maxWidth: '560px',
          margin: '0 auto',
          padding: '40px 20px',
        }}>
          {/* Logo header */}
          <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Text style={{
              fontSize: '28px',
              fontWeight: 700,
              background: `linear-gradient(135deg, ${brandOrange}, ${brandAmber})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: brandOrange,
              margin: 0,
              letterSpacing: '-0.5px',
            }}>
              SongSwipe
            </Text>
          </Section>

          {/* Main content card */}
          <Section style={{
            backgroundColor: bgCard,
            border: `1px solid ${borderColor}`,
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '24px',
          }}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={{ textAlign: 'center', padding: '0 20px' }}>
            <Text style={{
              color: textMuted,
              fontSize: '12px',
              lineHeight: '20px',
              margin: '0 0 8px 0',
            }}>
              AI-Powered Personalised Songs for Every Occasion
            </Text>
            <Text style={{
              color: '#52525b',
              fontSize: '11px',
              lineHeight: '18px',
              margin: 0,
            }}>
              <Link href="https://songswipe.io" style={{ color: '#52525b', textDecoration: 'underline' }}>
                songswipe.io
              </Link>
              {' | '}
              <Link href="https://songswipe.io/privacy" style={{ color: '#52525b', textDecoration: 'underline' }}>
                Privacy
              </Link>
              {' | '}
              <Link href="https://songswipe.io/terms" style={{ color: '#52525b', textDecoration: 'underline' }}>
                Terms
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Shared styles for use in child templates
export const styles = {
  brandOrange,
  brandAmber,
  bgDark,
  bgCard,
  borderColor,
  textPrimary,
  textSecondary,
  textMuted,
  heading: {
    fontSize: '22px',
    fontWeight: 700 as const,
    color: textPrimary,
    margin: '0 0 8px 0',
    lineHeight: '28px',
  },
  subheading: {
    fontSize: '15px',
    color: textSecondary,
    margin: '0 0 24px 0',
    lineHeight: '22px',
  },
  body: {
    fontSize: '15px',
    color: textSecondary,
    lineHeight: '24px',
    margin: '0 0 16px 0',
  },
  button: {
    backgroundColor: brandOrange,
    background: `linear-gradient(135deg, ${brandOrange}, ${brandAmber})`,
    color: '#ffffff',
    padding: '14px 32px',
    borderRadius: '9999px',
    fontSize: '15px',
    fontWeight: 600 as const,
    textDecoration: 'none' as const,
    display: 'inline-block' as const,
    textAlign: 'center' as const,
  },
  divider: {
    borderColor: borderColor,
    margin: '24px 0',
  },
  badge: {
    display: 'inline-block' as const,
    backgroundColor: `${brandOrange}1a`,
    color: brandOrange,
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 600 as const,
  },
}
