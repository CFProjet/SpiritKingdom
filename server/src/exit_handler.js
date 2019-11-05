
var exitFctTab = [];
var exited = false;

function exitHandler(exit) {
    if (exited)
        return;
    exited = true;
    for (var i = 0; i < exitFctTab.length; i++)
        exitFctTab[i]();
    if (exit)
        process.exit(1);
}

//do something when app is closing

process.addListener('exit', exitHandler.bind(null, false));

//catches ctrl+c event
process.addListener('SIGINT', exitHandler.bind(null, true));

// // catches "kill pid" (for example: nodemon restart)
// process.addListener('SIGUSR1', exitHandler);
// process.addListener('SIGUSR2', exitHandler);

//catches uncaught exceptions
// process.on('uncaughtException', exitHandler);


/**Add callback to launch before any exit route */
var onExit = (callback) => {
    exitFctTab.push(callback);
}

exports.onExit = onExit;