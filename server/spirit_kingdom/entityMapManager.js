
//  ENTITY MAP MANAGER
//
/* Cette classe a pour but d'organiser la diffusion des events des joueurs en fonction de leur position dans l'univers du jeux
, on y stocke les clientWs et on les attribue à des zones géographique, ensuite selon les event/changement, on transmet les messages de mises à jour aux joueur
proches  */


var eventMap = {};
var chunkSize = 1000;
var chunkPropagation = 1;

var clientTab = {};

var WSSGodot;

function init(wssGodot){
    WSSGodot = wssGodot;
}

function connectClient(userName, clientWs, localisationID, state){
    var c = clientTab[userName];
    var newConnection =  false;
    if (!c){
        c = {type : "user", ws : clientWs, userName : userName, localisationID : localisationID, state : state};
        clientTab[userName] = c;
        clientWs.addEventListener("close", ()=>{
            var id = clientTab[userName].localisationID;
            delete clientTab[userName];
            delete eventMap[id][userName];
        });
        newConnection = true;
    }
    c.state = state;
    return newConnection ? null : c.localisationID;
}

function changeUserToChunk(userName, localisationID, lastLocalisation){
    // REFRESH CLIENTAB LOCALISATION
    clientTab[userName].localisationID = localisationID;
    
    // REMOVE USER ON LAST CHUNK
    if (lastLocalisation){
         var lastChunk = eventMap[lastLocalisation];
        if (lastChunk){
            delete lastChunk[userName];
        }
    }

    // ADD USER TO NEW CHUNK
    var chunk = eventMap[localisationID];
    if (!chunk){
        chunk = {};
        eventMap[localisationID] = chunk;
    }
    chunk[userName] = clientTab[userName];
}

function refreshPlayerPosition(userName, localisation, state, clientWs){
    var localisationID = getLocalisationId(localisation);
    var lastLocalisation = connectClient(userName, clientWs, localisationID, state);
    if (lastLocalisation != localisationID){
        changeUserToChunk(userName, localisationID, lastLocalisation);
    }
    emitRefreshMap(localisation);
}

function emitRefreshMap(localisation){
    var wsTab = [];
    var entityTab = {};
    if (chunkPropagation <= 0){
        var localisationID = getLocalisationId(localisation);
        let chunk = eventMap[localisationID];
        if (chunk){
            for (k in chunk){
                var entity = chunk[k];
                if (entity.type == "user")
                    wsTab.push(entity.ws);
                entityTab[k] = entity.state;
            }
        }
    }else{
        for (var dx = -chunkPropagation; dx < chunkPropagation; dx++){
            for (var dy = -chunkPropagation; dy < chunkPropagation; dy++){
                for (var dz = -chunkPropagation; dz < chunkPropagation; dz++){
                    var localisationID = getLocalisationId(localisation, dx, dy, dz);
                    let chunk = eventMap[localisationID];
                    if (chunk){
                        for (k in chunk){
                            var entity = chunk[k];
                            if (entity.type == "user")
                                wsTab.push(entity.ws);
                            entityTab[k] = entity.state;
                        }
                    }
                }
            }
        }
    }

    // SEND MAP TO ALL NEAR CLIENTS
    WSSGodot.sendclientTabEvent("TAG_MAP_REFRESH", entityTab, wsTab);
}

function getLocalisationId(localisation, dx, dy, dz){
    var x = Math.round(localisation.x / chunkSize) + (dx ? dx : 0);
    var y = Math.round(localisation.y / chunkSize) + (dy ? dy : 0);;
    var z = Math.round(localisation.z / chunkSize) + (dz ? dz : 0);;
    var id = "l" + x + '_' + y + "_" + z;
    return id; 
}


exports.init = init;
exports.refreshPlayerPosition = refreshPlayerPosition;