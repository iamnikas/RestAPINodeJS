const util = require('util')
const intel = require('intel')

intel.config({
  formatters: {
    'simple': {
      'format': '[%(levelname)s] %(message)s',
      'strip': true
    },
    'details': {
      'format': '[%(date)s] %(name)s.%(levelname)s: %(message)s',
      'colorize': 'true'
    }
  },
  handlers: {
    'terminal': {
      'class': intel.handlers.Console,
      'formatter': 'details',
      'level': intel.VERBOSE
    },
    'logfile': {
      'class': intel.handlers.File,
      'level': intel.VERBOSE,
      'file': 'service_log.log',
      'formatter': 'details'
    }
  },
  loggers: {
    'patrol': {
      'handlers': ['terminal'],
      'level': 'ALL',
      'handleExceptions': true,
      'exitOnError': false,
      'propagate': false
    },
    'patrol.db': {
      'handlers': ['logfile'],
      'level': 'ALL',
      'handleExceptions': true,
      'exitOnError': false,
      'propagate': false
    },
    'patrol.node_modules.express': {
      'handlers': ['logfile'],
      'level': 'WARN'
    }
  }
})

function ServiceErrorHandler () {
  intel.Handler.call(this, {level: intel.ERROR})
}
util.inherits(ServiceErrorHandler, intel.Handler)
ServiceErrorHandler.prototype.emit = function customEmit (record) {
  console.log('> Custom Logger error handler')
}

let createLogger = function (debug) {
  let logger
  if (debug) {
    logger = intel.getLogger('patrol')
  } else {
    logger = intel.getLogger('patrol.db')
  }

  logger.addHandler(new ServiceErrorHandler())

  return logger
}

module.exports = createLogger
