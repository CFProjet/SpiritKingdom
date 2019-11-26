exports.getUniqueID = function(prefix){
    var uniqueID = "";
    if (prefix)
        uniqueID += prefix;
    uniqueID += Date.now() + '_' + Math.floor(Math.random() * 10000) + '_'  + Math.floor(Math.random() * 10000);
    return uniqueID;
 }