var wssGodotClass = require("../src/godot_wss");
var wssGodot;
var boltDataBase = require("../src/bolt_bdd");
var ip = require("ip");

var alphaNum = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789";


function init(localDevMode, httpsOptions) {

    var port = 7788;

    if (!localDevMode) {
        var serverWs = require('https').createServer(httpsOptions);
    } else {
        var serverWs = require('http').createServer();
    }

    wssGodot = wssGodotClass.new(serverWs);
    serverWs.listen(port);
    // SUCCESS
    console.log("spiritKingdom wss : " + ip.address() + ":" + port)


    wssGodot.addEvent("ping", (data) => {
        return true;
    })

    wssGodot.addEvent("exempleData", (data) => {

        let ref = { gameID: "string" };
        let valideRef = checkValideObjFromReference(data, ref);
        if (!valideRef)
            return { error: true, errorStr: "Objet reference error" };

        let gameBase = boltDataBase.getDataBase("history/spirit_kingdom/server", "main");
        gameBase.stopUse();

        return { player: "test" };
    })
}




exports.init = init;


var checkValideObjFromReference = (obj, reference) => {
    for (var key in reference) {
        if (obj[key] == undefined || typeof obj[key] != typeof reference[key]) {
            console.log("Wrong obj received !")
            console.log("obj[ " + typeof obj[key] + " ]('" + key + "' )");
            console.log("ref[ " + typeof reference[key] + " ]('" + key + "' )");
            return 0;
        }
    }
    for (var key in obj) {
        if (reference[key] == undefined || typeof obj[key] != typeof reference[key]) {
            console.log("Wrong obj received !")
            console.log("ref[ " + typeof obj[key] + " ]('" + key + "' )");
            console.log("obj[ " + typeof reference[key] + " ]('" + key + "' )");
            return 0;
        }
    }
    return 1;
}