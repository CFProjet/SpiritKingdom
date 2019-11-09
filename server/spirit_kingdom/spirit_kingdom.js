var wssGodotClass = require("../src/godot_wss");
var wssGodot;
var boltDataBase = require("../src/bolt_bdd");
var ip = require("ip");

var alphaNum = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789";


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

    // SUCCESS
    console.log("spiritKingdom wss : " + ip.address() + ":" + port)


    // ON AJOUTE LES EVENT D'ECOUTE DU SERVER

    // SIMPLE PING
    wssGodot.addEvent("ping", (data) => {
        return true;
    });


    // LOGIN
    wssGodot.addEvent("TAG_LOGIN", (data) => {

        // ON VERFIRIE QUE CE QUI ARRIVE SUR LE SERVER EST BIEN CE QUI EST ATTENDU
        let ref = { userName: "exemple", hashPass : "exemple" };
        let valideRef = checkValideObjFromReference(data, ref);
        if (!valideRef)
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
        // S'il n'existe
        else{
            // On créer l'utilisateur
            userBase.set(data.userName, "hashPass", data.hashPass);
        }
        userBase.stopUse();

        // ON ENVOIS L'ETAT D'UN JOUEUR
        return getPlayerState(data.userName, true);
    });
}


function getPlayerState(userName, connection){
    let playerStateBase = boltDataBase.getDataBase("history/spirit_kingdom/users", "state");
    var state = playerStateBase.get(userName, "state");

    // SI LE STATE N'EXISTE PAS ET QUE LE JOUEUR VEUX SE CONNECTER, ON CREER SON ETAT D'ORIGINE
    if (state == null && connection){
        state = {level : 1, experience : 0, life : 1, lifeMax : 200, position : {x : 0, y : 0, z : 0}};
        playerStateBase.set(userName, "state", state);
    }

    // ne jamais oublié de signaler la fin de l'utilisation d'une bdd
    playerStateBase.stopUse();

    return state;
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