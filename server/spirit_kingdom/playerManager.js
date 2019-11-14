var boltDataBase = require("../src/bolt_bdd");
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


function movePlayer(userName, direction, duration, controlToken){
        // ON VERIFIE QUE L'UTILISATEUR EST BIEN PROPRIETAIRE DU JOUEUR
    if (!isValideControlToken(userName, controlToken))
        return {error : true, errorStr : "invalide token"};
    
    let playerStateBase = boltDataBase.getDataBase("history/spirit_kingdom/users", "state");
    var state = playerStateBase.get(userName, "state");
    stateManager.clearEvolve(state);
    stateManager.applyEvolve(state, "position");
    var evolve = new BC.BC_Evolve();
    evolve.property = "position";
    evolve.speed = getSpeedVector(direction, state.moveSpeed);
    evolve.duration = duration;
    evolve.time = Date.now();
    stateManager.addEvolve(state, evolve);
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