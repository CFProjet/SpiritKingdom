var boltDataBase = require("../src/bolt_bdd");
var BC = require("./generatedClass");


var afkTimeKick = 1000 * 60 * 10; // 10 MIN

function setControlToken(userName, controlToken){
    let playerStateBase = boltDataBase.getDataBase("history/spirit_kingdom/users", "state");
    
    // ON ENREGISTRE LE CONTROL TOKEN ET LA DATE
    playerStateBase.set(userName, "controlToken", controlToken);
    playerStateBase.set(userName, "controlTokenDate", Date.now());

    var state = playerStateBase.get(userName, "state");
    // SI LE STATE N'EXISTE PAS, ON CREER  l'ETAT D'ORIGINE
    if (state == null){
        state = new BC.BC_PlayerState();
        playerStateBase.set(userName, "state", state);
    }

    // ne jamais oublié de signaler la fin de l'utilisation d'une bdd
    playerStateBase.stopUse();
}

function isValideControlToken(userName, controlToken){
    let playerStateBase = boltDataBase.getDataBase("history/spirit_kingdom/users", "state");
    var checkControlToken = playerStateBase.get(userName, "controlToken");

    // SI LE TOKEN DE CONTROL N'EST PAS BON ON RETOURNE UNE ERREUR
    if (checkControlToken != controlToken){
        playerStateBase.stopUse();
        return false;
    }

    // SI LE TOKEN N'ES PAS EXPIREE
    var time = playerStateBase.get(userName, "controlTokenDate");
    if (Date.now() - time > afkTimeKick)
    {
        playerStateBase.stopUse();
        return false;
    }

    return true;
}

function getPlayerState(userName, controlToken){

    // ON VERIFIE QUE L'UTILISATEUR EST BIEN PROPRIETAIRE DU JOUEUR
    if (!isValideControlToken(userName, controlToken))
        return {error : true, errorStr : "invalide token"};

    let playerStateBase = boltDataBase.getDataBase("history/spirit_kingdom/users", "state");
    var state = playerStateBase.get(userName, "state");
    playerStateBase.stopUse();

    return state;
}


exports.getPlayerState = getPlayerState;
exports.setControlToken = setControlToken;
exports.isValideControlToken = isValideControlToken;