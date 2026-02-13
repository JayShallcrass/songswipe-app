// eslint-disable-next-line @typescript-eslint/no-var-requires
const filter = require('leo-profanity')

// Load English dictionary (loaded by default, but explicit for clarity)
filter.loadDictionary('en')

// Add custom terms that leo-profanity may miss
filter.add([
  'kys',
  'n1gger',
  'n1gga',
  'nigg3r',
  'f4g',
  'f4ggot',
  'tr4nny',
  'r3tard',
])

export interface ModerationResult {
  clean: boolean
  /** The field name that was flagged (if any) */
  flaggedField?: string
}

/**
 * Check a single string for prohibited content.
 */
export function moderateText(text: string): boolean {
  if (!text || !text.trim()) return true
  return !filter.check(text)
}

/**
 * Check all user-supplied form fields for prohibited content.
 * Returns the first flagged field name, or null if all clean.
 */
export function moderateFormFields(fields: Record<string, string | undefined>): ModerationResult {
  for (const [fieldName, value] of Object.entries(fields)) {
    if (!value || !value.trim()) continue
    if (filter.check(value)) {
      return { clean: false, flaggedField: fieldName }
    }
  }
  return { clean: true }
}
