extends Node

#TO BUILD AS SINGLETON WITH AUTOLOAD PARAMETER

var ws_client = null
var myUID = null;
var connected = false;

var _url = null;
var auto_reconnect = false;
var auto_reco_time = 0;

var dicoCB = {};

signal onConnected
signal onConnectionError
signal onConnectionClosed
signal onServerDataReceived;
signal onClientDataReceived;


var streamingPacketData = {};
const packetSizeMax = 40000;

func _ready():
	set_process(false);
	randomize();

func startConnection(url):
	_url = url;
	ws_client = WebSocketClient.new();
	ws_client.connect("connection_established", self, "_connection_established")
	ws_client.connect("connection_closed", self, "_connection_closed")
	ws_client.connect("connection_error", self, "_connection_error")
	
	print("Connecting to " + url)
	var protocol = PoolStringArray();
	protocol.append("HTTPS");
	var error = ws_client.connect_to_url(url, protocol);
	if error != OK:
		print("Websocket connection error, check your internet connection");
		print(error);
		ws_client.disconnect_from_host();		
	set_process(true);

func sendServerData(tag : String, objData, callback :FuncRef = null):
	if !connected:
		print("Error sendServerData, no connection"); 
	var data = {tag = tag, data = objData}
	
	if callback:
		var id = _getTagId(tag);
		_setCB(tag, id, callback);
		data["id"] = id;
	var dataStr = JSON.print(data);
	_sendPacket0(2, dataStr);
	
func broadcastData(tag: String, objData, toMeToo  : bool = false):
	if !connected:
		print("Error broadcastData, no connection"); 
	var data = {tag = tag, data = objData, toMeToo = toMeToo}
	
	var dataStr = JSON.print(data);
	_sendPacket0(3, dataStr);

func sendClientData(tag : String, objData, clientID : int):
	if !connected:
		print("Error sendClientData, no connection"); 
	var data = {tag = tag, data = objData, clientID = clientID}
	
	var dataStr = JSON.print(data);
	_sendPacket0(3, dataStr);


func _connection_established(protocol):
	print("Connection Established With Protocol: ", protocol)
	connected = true;
	emit_signal("onConnected");

func _connection_closed():
	print("Connection Closed")
	connected = false;
	emit_signal("onConnectionClosed");

func _connection_error():
	print("Connection Error")
	connected = false;
	emit_signal("onConnectionError");

func try_reconnection():
	print("reconnection try to " + _url);
	var protocol = PoolStringArray();
	protocol.append("HTTPS");
	var error = ws_client.connect_to_url(_url, protocol);
	if error != OK:
		print("Websocket connection error, check your internet connection");
		print(error);

func _process(delta):
	# AUTO RECONNECTION
	if !connected && ws_client != null && auto_reconnect:
		auto_reco_time += delta;
		if auto_reco_time > 3:
			auto_reco_time = 0;
			try_reconnection();
	
	if ws_client == null:
		return;
	
	if ws_client.get_connection_status() == ws_client.CONNECTION_CONNECTING || ws_client.get_connection_status() == ws_client.CONNECTION_CONNECTED:
		ws_client.poll();

	if ws_client.get_peer(1).is_connected_to_host():
		if ws_client.get_peer(1).get_available_packet_count() > 0 :
			var packet = ws_client.get_peer(1).get_packet()
			var buffer = StreamPeerBuffer.new()
			buffer.set_data_array(packet)
			
			var type = buffer.get_u16()
			var dataStr;
			
			if type == 100:
				var messageType = buffer.get_u16();
				var packetOrder = buffer.get_u16();
				var packetCount = buffer.get_u16();
				var uid = buffer.get_string();
				var strData = buffer.get_string();
				var finish = addStreamData(uid, strData, packetOrder, packetCount);
				if !finish:
					return;
				type = messageType;
				dataStr = getStreamData(uid);
			else:
				dataStr = buffer.get_string();
			
			
#           MY UID
			if type == 1:
				myUID = dataStr;
#				print("WebSocket client id : " + dataStr);
#           SERVER COMMUNICATION
			if type == 2:
				_serverPacketReceived(dataStr);
#           CLIENT/CLIENT COMMUNICATION
			if type == 3:
				_clientPacketReceived(dataStr);
	_processStreamPacket();



var currentStreamingData = {};

func addStreamData(uid: String, dataStr : String, packetOrder: int, packetCount: int):
	var obj;
	if !currentStreamingData.has(uid):
		obj = {count = packetCount, receive = 0};
		currentStreamingData[uid] = obj;
	else:
		obj = currentStreamingData[uid];
	obj.receive += 1;
	obj["p" + str(packetOrder)] = dataStr;
	if obj.receive == obj.count:
		return true;
	else: 
		return false;

func getStreamData(uid : String):
	var dataObj = currentStreamingData[uid];
	var dataStr = "";
	var i = 0;
	while dataObj.has("p" + str(i)):
		dataStr += dataObj["p" + str(i)];
		i += 1;
	currentStreamingData.erase(uid);
	return dataStr;

func _clientPacketReceived(dataStr):
	print("client data received");
	# Packet parsing
	var jsonResult = JSON.parse(dataStr) as JSONParseResult;
	if jsonResult.error:
		print("Error JSON parse : " + jsonResult.error_string)
		print(dataStr);
		return;

	var data = jsonResult.result;
	if (!data.has("tag") || !data.has("fromUID")):
		return;
	var tag = data.tag;
	var from = data.fromUID;
	var objData = null;
	if (data.has("data")):
		objData = data.data;
	emit_signal("onClientDataReceived", tag, objData);

func _serverPacketReceived(dataStr):
	# Packet parsing
	var jsonResult = JSON.parse(dataStr) as JSONParseResult;
	if jsonResult.error:
		print("Error JSON parse : " + jsonResult.error_string)
		print(dataStr);
		return;
	var data = jsonResult.result;
	var tag = data.tag;
	var objData = data.data;
	var isCallback = _launchCallback(tag, objData);
	if isCallback == false:
		emit_signal("onServerDataReceived", tag, objData);

func _launchCallback(tag, objData):
	if !dicoCB.has(tag):
		return false;
	var callBack = dicoCB[tag] as FuncRef;
	callBack.call_func(objData);
	dicoCB.erase(tag);
	return true;

func _getTagId(tag):
	var i = 1;
	while (dicoCB.has(tag + "_res_" + str(i))):
		i += 1;
	return i

func _setCB(tag, id, cb):
	dicoCB[tag +"_res_" + str(id)] = cb;
	

func _sendPacket0(type : int, dataStr : String):
	var strSize = dataStr.length();
	var paquetCount = ceil(strSize / packetSizeMax);

	if paquetCount < 2:
#	NO STREAM NEEDED
		var buffer = StreamPeerBuffer.new();
		buffer.put_u16(type);
		buffer.put_string(dataStr);
		_sendPacket(buffer.get_data_array());
	else:
#	STREAM NEEDED
		var uid = "stream_" + str(floor(rand_range(0,10000000))) + str(floor(rand_range(0,10000000))) + str(floor(rand_range(0,10000000)));
		streamingPacketData[uid] = {count = paquetCount + 1, i = 0, type = type, dataStr = dataStr, uid = uid};
		
func _processStreamPacket():
	if streamingPacketData == null:
		return;
	for streamKey in streamingPacketData:
		# STREAM PROGRESS
		var stream = streamingPacketData[streamKey];
		var streamDataStr = stream.dataStr.substr(stream.i * packetSizeMax, packetSizeMax);
		var buffer = StreamPeerBuffer.new();
		buffer.put_u16(100);
		buffer.put_u16(stream.type);
		buffer.put_u16(stream.i);
		buffer.put_u16(stream.count);
		buffer.put_string(stream.uid);
		buffer.put_string(streamDataStr);
		stream.i += 1;
		_sendPacket(buffer.get_data_array());
		if stream.i == stream.count:
			streamingPacketData.erase(streamKey);

func _sendPacket(data):
	var error = ws_client.get_peer(1).put_packet(data);
	if error :
		print("error  " + str(error));
