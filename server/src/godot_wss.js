const WebSocket = require('ws')
const { GdBuffer } = require('@gd-com/utils')
const { v4 } = require('uuid')
const bolt = require("./bolt_bdd");

const packetSizeMax = 40000;

class GodotWss {
    constructor(server) {
        this.wss = null;
        this.eventList = {};
        this.clientList = {};
        this.streamingPacketData = {};
        this.streamCount = 0;

        this.init(server);
    }

    init(server) {
        // LAUNCH WSS
        this.wss = new WebSocket.Server({ server: server })

        // INIT CLIENT PROCESS
        this.wss.on('connection', ws => {
            let uuid = v4()
            // send is uuid
            let uuidPacket = new GdBuffer()
            uuidPacket.putU16(1)
            uuidPacket.putString(uuid)
            ws.send(uuidPacket.getBuffer())

            // STOCK CLIENT 
            this.clientList[uuid] = ws;
            ws["uuid"] = uuid;

            // REMOVE CLIENT
            ws.addEventListener("close", (ws) => {
                delete this.clientList[uuid];
            })

            ws.on('message', (message) => {
                let recieve = new GdBuffer(Buffer.from(message))
                let type = recieve.getU16();



                var dataStr;
                // STREAM DATA
                if (type == 100) {
                    // ADD STREAM PAQUET
                    var messageType = recieve.getU16();
                    var packetOrder = recieve.getU16();
                    var packetCount = recieve.getU16();
                    var uid = recieve.getString();
                    var strData = recieve.getString();
                    var finish = this.addStreamData(uid, strData, packetOrder, packetCount);

                    if (!finish)
                        return;
                    type = messageType;
                    dataStr = this.getStreamData(uid);
                } else
                    dataStr = recieve.getString();


                // CLIENT/SERVER COMMUNICATION
                if (type == 2) {
                    try {
                        var obj = JSON.parse(dataStr);
                    } catch (e) {
                        return;
                    }
                    if (obj && obj.tag && obj.data) {
                        var res = this.processEvent(obj.tag, obj.data, ws);
                        if (!obj.id)
                            return;
                        // CALLBACK PROCESS
                        if (res == null)
                            res = {};
                        var resTag = obj.tag + "_res_" + obj.id;
                        var data = { tag: resTag, data: res };
                        var resDataStr = JSON.stringify(data);
                        this.sendPacket(2, resDataStr, [ws]);
                    }
                }

                // CLIENT/CLIENT COMMUNICATION (BROADCAST)
                if (type == 3) {
                    try {
                        var obj = JSON.parse(dataStr);
                    } catch (e) {
                        return;
                    }
                    if (obj && obj.tag && obj.data) {

                        var data = { tag: obj.tag, data: obj.data, fromUID: uuid };
                        var resDataStr = JSON.stringify(data);
                        resDataStr = resDataStr.trimLeft();

                        if (obj.clientId) {
                            // SEND TO DEST
                            let client = this.clientList[obj.clientId];
                            if (client)
                                this.sendPacket(3, resDataStr, [client[key]]);
                        }
                        else {
                            // SEND TO ALL CLIENT
                            var clientTab = []
                            for (var key in this.clientList)
                                if (key != uuid || obj.toMeToo)
                                    clientTab.push(this.clientList[key]);
                            this.sendPacket(3, resDataStr, clientTab);
                        }
                    }
                }
            })
        })
    }

    sendclientTabEvent(tag, data, clientTab){
        var data = { tag: tag, data: res };
        var resDataStr = JSON.stringify(data);
        this.sendPacket(2, resDataStr, clientTab);
    }

    sendclientEvent(tag, data, wsClient){
        var data = { tag: tag, data: res };
        var resDataStr = JSON.stringify(data);
        this.sendPacket(2, resDataStr, [wsClient]);
    }


    sendPacket(type, dataStr, clientTab) {
        var strSize = dataStr.length;
        var paquetCount = Math.ceil(strSize / packetSizeMax);

        if (paquetCount < 2) {
            let buffer = new GdBuffer();
            buffer.putU16(type);
            buffer.putString(dataStr);
            let poolByte = buffer.getBuffer();
            for (var i = 0; i < clientTab.length; i++)
                clientTab[i].send(poolByte);
        }
        else {
            var uid = "stream_" + Date.now() + '' + (Math.floor(Math.random() * 10000000));
            this.streamingPacketData[uid] = { count: paquetCount + 1, i: 0, type: type, dataStr: dataStr, uid: uid, clientTab: clientTab };
            this.streamCount += 1;
            if (this.streamCount == 1)
                this.sendNextStreamPacket();
        }
    }

    sendNextStreamPacket() {
        for (streamKey in this.streamingPacketData) {
            var stream = this.streamingPacketData[streamKey];
            var startI = stream.i * packetSizeMax;
            var streamDataStr = stream.dataStr.substring(startI, startI + packetSizeMax);
            var buffer = new GdBuffer();
            buffer.putU16(100);
            buffer.putU16(stream.type);
            buffer.putU16(stream.i);
            buffer.putU16(stream.count);
            buffer.putString(stream.uid);
            buffer.putString(streamDataStr);
            stream.i += 1;
            let poolByte = buffer.getBuffer();
            for (var i = 0; i < stream.clientTab.length; i++)
                stream.clientTab[i].send(poolByte);
            if (stream.i == stream.count) {
                this.streamCount -= 1;
                delete this.streamingPacketData[streamKey];
            }
        }
        if (this.streamCount > 0)
            setTimeout(sendNextStreamPacket, 20);
    }

    addStreamData(uid, dataStr, packetOrder, packetCount) {
        var obj = bolt.getFlashData("streamPacket", uid);
        if (!obj) {
            obj = { count: packetCount, receive: 0 };
            bolt.setFlashData("streamPacket", uid, 1 * packetCount, obj);
        }
        obj.receive += 1;
        obj["p" + packetOrder] = dataStr;
    
        return (obj.receive == obj.count);
    }
    
    getStreamData(uid) {
        var dataObj = this.currentStreamingData[uid];
        var dataStr = "";
        var i = 0;
        do {
            var val = dataObj["p" + i];
            if (val)
                dataStr += val;
            i++;
        }
        while (val);
        bolt.removeFlashData("streamPacket", uid);
        return dataStr;
    }
    
    /**Tag identify client event, Callback receive data from client and must return the server response to client */
    addEvent(tag, callback) {
        if (this.eventList[tag]) {
            console.error("Event tag already exist, it must be unique");
            return;
        }
    
        this.eventList[tag] = callback;
    }
    
    /** Delete an existing tag */
    removeEvent(tag) {
        delete this.eventList[tag];
    }
    
    /** Return the server response as object {} */
    processEvent(tag, data, ws){
        var res = null;
    
        let event = this.eventList[tag];
        if (event)
            res = event(data, ws);
    
        return res;
    }
}

function createNew(server){
    return new GodotWss(server);
}

exports.new = createNew;