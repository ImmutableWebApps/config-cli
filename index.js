const minimist = require('minimist')
const args = minimist(process.argv.slice(2))._

/* commands */
const diff = require('./commands/diff')

module.exports = () => {
    switch(args[0]) {
        case 'diff':
            diff()
            break;
        default:
            throw new Error(`Command not found`)
    }
}