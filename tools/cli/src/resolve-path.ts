import { resolve, isAbsolute } from 'node:path'

/**
 * Resolve a file path relative to the user's actual working directory.
 * When run via npx in a workspace, process.cwd() may point to the
 * package root instead of the user's shell cwd. npm/npx sets INIT_CWD
 * to the original directory, so we prefer that for relative paths.
 */
export function resolvePath(filePath: string): string {
  if (isAbsolute(filePath)) return filePath
  const base = process.env.INIT_CWD || process.cwd()
  return resolve(base, filePath)
}
