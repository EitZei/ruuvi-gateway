const winston = require('winston');
require('winston-daily-rotate-file');

const logFormat = winston.format.printf(info => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`);

const formatter = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  logFormat,
);

if (process.env.LOG_DIR) {
  winston.add(new winston.transports.DailyRotateFile({
    level: 'info',
    format: formatter,
    dirname: process.env.LOG_DIR,
    filename: 'ruuvi-gateway-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }));
}

if (process.env.NODE_ENV !== 'production') {
  winston.add(new winston.transports.Console({
    level: 'debug',
    format: formatter,
  }));
}
