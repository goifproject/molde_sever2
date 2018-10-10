var moment = require('moment');
let fs = require("fs");
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
 
const logDir = 'log';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const myFormat = printf(info => {
    return `${moment().format('YYYY-MM-DD HH:mm:ss.SSS ZZ')} : ${info.message}`;
});
   
const logger = createLogger({
    format: combine(
      timestamp(),
      myFormat
    ),
    transports: [
        new transports.File({ 
            level: 'info',
            filename: `${logDir}/logs.log`,
            maxsize:1000000,
            maxFiles:5,
          })
      ]
});

module.exports = logger;