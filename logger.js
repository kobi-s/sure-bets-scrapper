
const SimpleNodeLogger = require('simple-node-logger')

options = {
    logFilePath: 'logs.log',
    timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
}

const logger = SimpleNodeLogger.createSimpleLogger(options)


module.exports = logger
