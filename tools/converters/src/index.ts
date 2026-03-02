export { convert, detectFormat } from './convert.js'
export { isJefit } from './parsers/jefit.js'
export { ConvertError, FormatDetectionError, CSVParseError } from './errors.js'
export { createAIProvider } from './ai/provider.js'
export { MappingCache } from './ai/cache.js'
export type {
  SourceFormat,
  ConvertOptions,
  ConvertResult,
  IntermediateRow,
  ColumnMapping,
  ConversionWarning,
  ConversionReport,
  SourceParser,
  ParsedCSV,
} from './types.js'
export type {
  AIProvider,
  AIProviderOptions,
  ColumnMappingRequest,
  AIColumnMapping,
  ExerciseNormRequest,
  AIExerciseMapping,
} from './ai/provider.js'
