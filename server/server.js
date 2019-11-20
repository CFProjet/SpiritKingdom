var fs = require('file-system');
var bolt_bdd = require("./src/bolt_bdd"); 

var httpsOptions;

// DEFAULT PARAMS 
var appName = "Spirit kingdom server"
var localDevMode = true;

// APPLY APP PARAMS 
for (var i = 2; i < process.argv.length; i++) {
    let arg = (process.argv[i]).toUpperCase();
    let tab = arg.split("=");
    let id = tab[0];
    let val = tab[1];

    if (id == "PROD")
        localDevMode = false;
}

bolt_bdd.setAppRoot(__dirname);

/* SERVER INFORMATION */
console.log("- " + appName + "-");
console.log("Process PID = " + process.pid);
if (localDevMode)
    console.log("MODE LOCAL DEV")
else
    console.log("MODE PRODUCTION");
////////////////////////////////////////////



// HTTPS CERT AND KEY //
if (localDevMode != true){
    httpsOptions = {
        cert: fs.readFileSync('./cert/fullchain.pem'),
        key: fs.readFileSync('./cert/privkey.pem')
    };
}

// LAUNCH SERVERS
require("./spirit_kingdom/spirit_kingdom.js").init(localDevMode, httpsOptions);

// SAVE PID TO MANAGE IT OR KILL IT IF NEEDED
fs.fs.writeFileSync(__dirname + "/lastPID", "" + process.pid);