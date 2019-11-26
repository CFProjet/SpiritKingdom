var boltDataBase = require("../src/bolt_bdd");
var tools = require("../src/tools");
var BC = require("./generatedClass");

var stateManager = require("./stateManager");

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
        state.type = "player";
        state.groupes = ["player"];
        state.uniqueID = tools.getUniqueID("player");
        state.userName = userName;
        state.creationTime = Date.now();
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

    // SI TOUT EST OK ON MET A JOUR LA DATE DU TOKEN
    playerStateBase.set(userName, "controlTokenDate", Date.now());
    playerStateBase.stopUse();
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


function movePlayer(userName, origin, direction, duration, controlToken){
        // ON VERIFIE QUE L'UTILISATEUR EST BIEN PROPRIETAIRE DU JOUEUR
    if (!isValideControlToken(userName, controlToken))
        return {error : true, errorStr : "invalide token"};
    
    let playerStateBase = boltDataBase.getDataBase("history/spirit_kingdom/users", "state");
    var state = playerStateBase.get(userName, "state");
    stateManager.clearEffect(state);
    stateManager.applyEffect(state, "position");
    state.position = origin;
    var move = new BC.BC_Effect();
    move.name = "move";
    move.property = "position";
    move.speed = getSpeedVector(direction, state.moveSpeed);
    move.duration = duration;
    move.creationTime = Date.now();
    stateManager.addEffect(state, move);
    playerStateBase.set(userName, "state", state);
    playerStateBase.stopUse();
    return state;
}

function getSpeedVector(direction, speed){
    direction.x *= speed;
    direction.y *= speed;
    direction.z *= speed;
    return direction;
}

exports.getPlayerState = getPlayerState;
exports.movePlayer = movePlayer;
exports.setControlToken = setControlToken;
exports.isValideControlToken = isValideControlToken;