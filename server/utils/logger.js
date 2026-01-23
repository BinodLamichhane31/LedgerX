const { createLogger, format, transports } = require("winston");
require("winston-mongodb");

const mongoTransport = new transports.MongoDB({
  db: process.env.MONGO_URI,
  collection: "SystemLog",
  level: "info",
  tryReconnect: true,
  capped: true,            
  cappedMax: 1000000      
});

mongoTransport.on('warning', (warn) => console.warn('MongoDB Logger Warning:', warn));
mongoTransport.on('error', (err) => console.warn('MongoDB Logger Error:', err));


const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    // new transports.Console({
    //   format: format.combine(format.colorize(), format.simple())
    // }),
    mongoTransport
  ],
  exitOnError: false,
});

module.exports = logger;
