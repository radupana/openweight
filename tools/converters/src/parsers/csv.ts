import Papa from 'papaparse'
import { CSVParseError } from '../errors.js'
import type { ParsedCSV } from '../types.js'

export function parseCSV(csv: string): ParsedCSV {
  const result = Papa.parse<Record<string, string>>(csv.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })

  if (result.errors.length > 0) {
    const critical = result.errors.filter((e) => e.type !== 'FieldMismatch')
    if (critical.length > 0) {
      throw new CSVParseError(
        `CSV parsing failed: ${critical[0].message}`,
        critical
      )
    }
  }

  if (!result.meta.fields || result.meta.fields.length === 0) {
    throw new CSVParseError('CSV has no headers')
  }

  return {
    headers: result.meta.fields,
    rows: result.data,
  }
}
