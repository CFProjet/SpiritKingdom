var wssGodotClass = require("../src/godot_wss");
var wssGodot;
var boltDataBase = require("../src/bolt_bdd");
var ip = require("ip");
var alphaNum = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789";

// BOLT CLASS GENERATOR
var bolt_cg = require("../src/bolt_class_generator");
bolt_cg.setPathJson(__dirname + "/../boltClass");
bolt_cg.setGeneratedPath_js(__dirname + "/generatedClass.js");
bolt_cg.setGeneratedPath_gd(__dirname + "/../../game/generated/");
bolt_cg.loadJsonClass();
bolt_cg.generateFileClass_js();
bolt_cg.generateFileClass_gd();
var BC = require("./generatedClass");

// PLAYER MANAGER
var playerManager = require("./playerManager");
// EVENT MAP MANAGER
var eventMapManager = require("./entityMapManager");


//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

function init(localDevMode, httpsOptions) {

    // ON CHOISIT UN PORT ET ON LANCE LE SERVER
    var port = 7788;

    if (!localDevMode) {
        var serverWs = require('https').createServer(httpsOptions);
    } else {
        var serverWs = require('http').createServer();
    }
    wssGodot = wssGodotClass.new(serverWs);
    serverWs.listen(port);
    eventMapManager.init(wssGodot);

    // SUCCESS
    console.log("spiritKingdom wss : " + ip.address() + ":" + port)


    // ON AJOUTE LES EVENT D'ECOUTE DU SERVER

    // SIMPLE PING
    wssGodot.addEvent("ping", (data, clientWs) => {
        return true;
    });

    wssGodot.addEvent("TAG_GET_TIMESTAMP", (data, clientWs) => {
        return Date.now();
    });


    // LOGIN
    wssGodot.addEvent("TAG_LOGIN", (data, clientWs) => {

        // ON VERFIRIE QUE CE QUI ARRIVE SUR LE SERVER EST BIEN CE QUI EST ATTENDU
        if (bolt_cg.isSameType(data, new BC.BC_EventLogin()) != true)
            return { error: true, errorStr: "Objet reference error" };

        // ON NE PAS PEUT ETRE CERTAIN QU'UN UTILISATEUR A BIEN RESPECTER LES LIMITATIONS DE CHAR DU PSEUDO ALORS ON REVERIFIE
        var i = 0;
        while (i < data.userName.length)
        {
            var c = data.userName.charAt(i);
            if (alphaNum.search(c) < 0)
                return {error : true, errorStr : "Pseudo : invalide char ( " + c + " )"};
            i += 1;
        }

        if (data.userName.length < 4)
            return {error : true, errorStr : "Pseudo : too short "};
        
        if (data.userName.length > 15)
            return {error : true, errorStr : "Pseudo : too long "};

        //UNE FOIS QU'ON EST SUR D'AVOIR DES DONNEES VALIDE, ON LES TRAITES

        // on recupere la bdd de la listes des utilisateurs
        let userBase = boltDataBase.getDataBase("history/spirit_kingdom/users", "list");

        // On cherche si l'utilisateur existe
        var BDD_hashPass = userBase.get(data.userName, "hashPass");

        // S'il existe
        if (BDD_hashPass != null){
            // si le password est erroné
            if (BDD_hashPass != data.hashPass)
            {
                // ne jamais oublié de signaler la fin de l'utilisation d'une bdd
                userBase.stopUse();
                return {error : true, errorStr : "invalide password"};
            }
        }
        // S'il n'existe pas
        else{
            // On créer l'utilisateur
            userBase.set(data.userName, "hashPass", data.hashPass);
        }
    
        // ON CREER UN NOUVEAU TOKEN D'AUTHORISATION CONTROL UNIQUE
        var tokenControl = "t_" + Math.floor(Date.now() + Math.random() * 100000) + data.hashPass.substring(0,10);
        userBase.stopUse();

        playerManager.setControlToken(data.userName, tokenControl);

        // ON ENVOIS LE TOKEN DE CONTROL A L'UTILISATEUR
        return tokenControl;
    });


    wssGodot.addEvent("TAG_GET_PLAYER", (data, clientWs) => {

        // ON VERFIRIE QUE CE QUI ARRIVE SUR LE SERVER EST BIEN CE QUI EST ATTENDU
        if (bolt_cg.isSameType(data, new BC.BC_EventGetPlayer()) != true)
            return { error: true, errorStr: "Objet reference error" };
    
        // ON ENVOIS L'ETAT DU JOUEUR A L'UTILISATEUR ET AUX AUTRES UTILISATEUR
        var state = playerManager.getPlayerState(data.userName, data.controlToken);
        eventMapManager.refreshPlayerPosition(data.userName, state.position, state,  clientWs);
        return state;
    });

    wssGodot.addEvent("TAG_MOVE_PLAYER", (data, clientWs) => {

        // ON VERFIRIE QUE CE QUI ARRIVE SUR LE SERVER EST BIEN CE QUI EST ATTENDU
        if (bolt_cg.isSameType(data, new BC.BC_EventMove()) != true)
            return { error: true, errorStr: "Objet reference error" };
        
        // ON APPLIQUE LE MOUVEMENT
        var state = playerManager.movePlayer(data.userName, data.direction, data.duration, data.controlToken);
        // ERROR
        if (state["error"])
            return null;
        // ON RAFRAICHIT LA MAP
        eventMapManager.refreshPlayerPosition(data.userName, state.position, state, clientWs);
    });
}


exports.init = init;