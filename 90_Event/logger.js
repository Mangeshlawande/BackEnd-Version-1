const fs = require("fs")
const os = require("os")

const EventEmitter = require('events')

class Logger extends EventEmitter{
    log(message){
        this.emit("message",{message}) // it will allow to broadcast everyone
    }

}

const logger = new Logger()
const logFile = './event.txt'// event.log are exactly same

// method responsible for grabbing the data 

const logToFile = (event) =>{
    const logMessage = `${new Date().toISOString()}- ${event.message} \n`
    // append data
    fs.appendFileSync(logFile, logMessage)
}

// call this log file
logger.on("message", logToFile);

//we want to get some resource >> calculate >> launch this 

setInterval(()=>{
    const memoryUsage = os.freemem()/os.totalmem() *100
    // throw the  log event by this log method 
    logger.log(`CURRENT MEMORY ::${memoryUsage.toFixed(2)}`)
}, 3000)

logger.log(`Application Started !!`)
logger.log(`Application event Occured  !!`)