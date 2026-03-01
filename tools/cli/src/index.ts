import { Command } from 'commander'
import { validateCommand } from './commands/validate.js'
import { convertCommand } from './commands/convert.js'

const program = new Command()

program
  .name('openweight')
  .description('CLI tool for the openweight strength training data format')
  .version('0.1.0')

program.addCommand(validateCommand)
program.addCommand(convertCommand)

program.parse()
