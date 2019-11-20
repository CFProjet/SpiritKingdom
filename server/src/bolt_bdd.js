var fs = require('fs');
var exitHandler = require("./exit_handler");

// Prepare exit to not close immediatly
process.stdin.resume();

// Save all dataBase before exit
exitHandler.onExit(() => {
    saveAllBase();
});


var boltDBUsed = {};
var flashDataBase = {};
var appRoot = "";

class BoltDataBase {
    constructor(directoryPath, dataBaseName, uid) {
        this.hasChanged = false;
        this.neverSaveMode = false;
        this.uid = uid;
        this._loaded = false;
        this._lastTimeDataBaseUsed = null;
        this._saveProcessing = false;
        this._directoryPath = directoryPath.toLowerCase();
        this._dataBaseName = dataBaseName.toLowerCase();
        if (appRoot)
            this.directoryPath = appRoot + '/' + this._directoryPath;
        this._filePath = directoryPath + '/' + dataBaseName + '.blt';
        this._dataBase = {};

        // Clean cache after timeOut and reload when dataBase is requested with set or get
        this.timeOut = 10000;
    }

    neverSave() {
        this.neverSaveMode = true;
    }

    stopUse() {
        boltDBUsed[this.uid].count -= 1;
    }

    _loadFromFile() {
        if (this._loaded)
            return;

        if (fs.existsSync(this._filePath)) {
            let data = fs.readFileSync(this._filePath, 'utf8')
            if (data.length > 1) {
                let dataObj = JSON.parse(data);
                this._dataBase = dataObj;
            }
        }
        this._loaded = true;


        var cleanCache = () => {
            let now = Date.now();
            if (this._saveProcessing == false && (now - this._lastTimeDataBaseUsed >= this.timeOut)) {
                this._loaded = false;
                this._dataBase = {};
                if (boltDBUsed[this.uid].count == 0)
                    delete boltDBUsed[this.uid];
            } else
                setTimeout(cleanCache, this.timeOut + 100);
        };
        setTimeout(cleanCache, this.timeOut + 100);
    }



    _saveDataOnFile() {
        if (this.neverSaveMode)
            return;
        if (this.hasChanged == false)
            return;
        let data = JSON.stringify(this._dataBase);
        if (fs.existsSync(this._directoryPath) != true)
        fs.mkdirSync(this._directoryPath, { recursive: true });
        fs.writeFileSync(this._filePath, data);
    }

    _saveLater() {
        if (this._saveProcessing)
            return;
        else {
            this._saveProcessing = true;
            setTimeout(() => {
                if (this._saveProcessing) {
                    this._saveProcessing = false;
                    this._saveDataOnFile();
                }
            }, 5000);
        }
    }

    _saveNowBeforeExit() {
        if (this._loaded) {
            this._saveDataOnFile();
            this._saveProcessing = false;
        }
    }

    _checkAndLoad() {
        this._lastTimeDataBaseUsed = Date.now();
        if (!this._loaded)
            this._loadFromFile();
    }


    deleteBase() {
        this._dataBase = {};
        this.hasChanged = false;
        fs.unlinkSync(this._filePath);
    }

    set(collectionName, key, value) {
        if(!key)
            return;
        this._checkAndLoad();
        var dataCollection = this._dataBase[collectionName];
        if (!dataCollection) {
            dataCollection = {}
            this._dataBase[collectionName] = dataCollection;
        }
        if (value == undefined)
            delete dataCollection[key];
        else
            dataCollection[key] = value;
        this.hasChanged = true;
        this._saveLater();
    };

    getCollection(collectionName) {
        this._checkAndLoad();
        var dataCollection = this._dataBase[collectionName];
        if (dataCollection)
            return dataCollection;
        else
            return {};
    };

    get(collectionName, key) {
        this._checkAndLoad();
        var value = null;
        var dataCollection = this._dataBase[collectionName];
        if (dataCollection)
            value = dataCollection[key];
        return value;
    };
}

let valideChar = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
var getDBID = (directoryPath, dataBaseName) => {
    let id = directoryPath + '/' + dataBaseName;
    let trueId = "";
    for (var i = 0; i < id.length; i++) {
        let char = id.charAt(i);
        if (valideChar.indexOf(char) < 0)
            trueId += '_';
        else
            trueId += char;
    }
    return trueId;
}

var saveAllBase = () => {
    for (var key in boltDBUsed)
        boltDBUsed[key].base._saveNowBeforeExit();
}

exports.saveAllBase = saveAllBase;


var flashrRefreshing = false;
var flashKeyCount = 0;

function setFlashData(family, key, timeDurationSeconde, value){
    var obj = flashDataBase[family];
    if (!obj){
        obj = {_countKey_FD : 0};
        flashDataBase[family] = obj;
        
    }
    flashKeyCount += 1;
    obj["_countKey_FD"] += 1;
    obj[key] = {data : value, timeToDelete : Date.now() + timeDurationSeconde * 1000};

    if (!flashrRefreshing){
        flashrRefreshing = true;
        setTimeout(refreshFlashData, 5000);
    }
}

function getFlashData(family, key){
    var obj = flashDataBase[family];
    if (!obj)
        return null;
    else
        return obj[key];
}

function removeFlashData(family, key){
    var familyObj = flashDataBase[family];
    if (familyObj){
        if (familyObj[key]){
            flashKeyCount -= 1;
            familyObj["_countKey_FD"] -= 1;
            delete familyObj[key];
        }
        if (familyObj["_countKey_FD"] == 0)
            delete flashDataBase[family];
    }
}


function removeFlashFamily(family){
    var familyObj = flashDataBase[family];
    if (familyObj){
        for (key in familyObj)
            flashKeyCount -= 1;
        delete flashDataBase[family];
    }
}


function refreshFlashData(){
    var now = Date.now();
    for (var famKey in flashDataBase){
        var family = flashDataBase[famKey];
        for (var valKey in family){
            var val = family[valKey];
            if (val.timeToDelete <= now){
                family["_countKey_FD"] -= 1;
                flashKeyCount -= 1;
                delete family[valKey]; 
            }
        }
        if (family["_countKey_FD"] == 0)
            delete flashDataBase[famKey];
    }
    if (flashKeyCount > 0){
        flashrRefreshing = true;
        setTimeout(refreshFlashData, 5000);
    }
}

exports.setAppRoot = (url)=>{appRoot = url};
exports.setFlashData = setFlashData;
exports.getFlashData = getFlashData;
exports.removeFlashData = removeFlashData;
exports.removeFlashFamily = removeFlashFamily;

exports.getDataBase = (directoryPath, dataBaseName) => {
    let id = getDBID(directoryPath, dataBaseName);
    let baseObj = boltDBUsed[id];
    if (!baseObj) {
        baseObj = {
            count: 1,
            base: new BoltDataBase(directoryPath, dataBaseName, id)
        }
        boltDBUsed[id] = baseObj;
    } else
        baseObj.count += 1;
    return baseObj.base;
};