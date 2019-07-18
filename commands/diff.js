const minimist = require('minimist')
const assert = require('assert')
const args = minimist(process.argv.slice(2))._
const path = require('path')
const fs = require('fs')
const _ = require('underscore')
const chalk = require('chalk')

module.exports = () => {
    assert(args.length === 3, "Invalid number of arguments. Must have exactly two files to compare")
    
    const filePaths = args.slice(1, 3)
    filePaths.forEach(file => {
        assert(isSupportedFileType(file), `${path.extname(file)} is not a currently supported file type`)
    })
    
    let parsedConfig = filePaths.map(file => { 
        const contents = fs.readFileSync(file)
        const ext = path.extname(file)

        return parseConfig(contents, ext)
    })

    let missingConfig
    try {
        missingConfig = compareConfig(parsedConfig)
    } catch(e) {
        throw new Error("Error comparing configuration")
    }

    if (!Object.keys(missingConfig).length) {
        console.log(chalk.green("No missing configuration found! Good to go!"))
        return process.exit(0)
    }

    console.log(chalk.red.underline.bold("Missing configuration found!"))
    console.log(chalk.red(require('util').inspect(missingConfig, { colors: false, depth: null })));
    process.exit(1)
}

function isSupportedFileType(file) {
    const supportedFileTypes = ['.json']

    return supportedFileTypes.includes(path.extname(file))
}

function parseConfig(contents, ext) {
    if (ext === '.json') {
        return JSON.parse(contents)
    }
}

function compareConfig(config) {
    var missingConfig = {}

    compareObjects(config[0], config[1])

    return missingConfig

    function compareObjects(obj1, obj2, missingNestedKey) {
        Object.keys(obj1).forEach(key => {
            if (obj2[key] === undefined) {
                if (!missingNestedKey) {
                    missingConfig[key] = 'MISSING'
                } else {
                    missingConfig[missingNestedKey][key] = 'MISSING'
                }
            } else if (_.isObject(obj1[key])) {
                missingConfig[key] = {}
                compareObjects(obj1[key], obj2[key], key)
            }
        })

        if (missingNestedKey && !Object.keys(missingConfig[missingNestedKey]).length) {
            delete missingConfig[missingNestedKey]
        }
    }
}