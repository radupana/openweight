export class ConvertError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'ConvertError'
  }
}

export class FormatDetectionError extends ConvertError {
  constructor(message: string = 'Unable to detect CSV format') {
    super(message, 'FORMAT_DETECTION_FAILED')
    this.name = 'FormatDetectionError'
  }
}

export class CSVParseError extends ConvertError {
  constructor(message: string, details?: unknown) {
    super(message, 'CSV_PARSE_ERROR', details)
    this.name = 'CSVParseError'
  }
}
