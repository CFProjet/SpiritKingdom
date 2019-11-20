extends Node

const TAG_LOGIN = "TAG_LOGIN";
const TAG_GET_PLAYER = "TAG_GET_PLAYER";
const TAG_MOVE_PLAYER = "TAG_MOVE_PLAYER";
const TAG_GET_TIMESTAMP = "TAG_GET_TIMESTAMP";


var _onLoginCB = null;
var _loged = false;
var controlToken = null;
var userName = null;
var connected = false;

var _initedTimeStamp = false;
var timeStamp setget, _getTimeStamp;
var _tstamp = 0;

var serverURL : String = "localhost:7788";
var serverPROD_URL : String = "dev-rocket.fr:7788";

signal onEventServer

func _ready():
	WS.connect("onConnected", self, "onConnectedToServer");
	WS.connect("onConnectionClosed", self, "onConnectionClosed");
	WS.connect("onServerDataReceived", self, "onEventServerReceived");
	# DISABLE AUTO RECONNECTION FOR NOW CAUSE IT MAKE THE GAME FREEZE
	#WS.auto_reconnect = true;

func connectToServer(prod : bool = false):
	if prod:
		WS.startConnection(serverPROD_URL);
	else:
		WS.startConnection(serverURL);

func getConnectionState():
	if !connected:
		return "disconnected";
	elif !_loged:
		return "connected to server";
	else:
		return "logged to server";

func onConnectedToServer():
	connected = true;
	_TstampStartRequete = _tstamp;
	WS.sendServerData(TAG_GET_TIMESTAMP, {}, funcref(self, "_setTstamp"));

var _TstampStartRequete;
func _setTstamp(time):
	var dt = _tstamp - _TstampStartRequete;
	_tstamp = time + dt * 0.5;


func onConnectionClosed():
	connected = false;

func _getTimeStamp():
	return _tstamp;

func getPlayerState(callback : FuncRef):
	var getPlayerObj = BC_EventGetPlayer.new();
	getPlayerObj.controlToken = controlToken;
	getPlayerObj.userName = userName;
	WS.sendServerData(TAG_GET_PLAYER, getPlayerObj.getData(), callback);

func movePlayer(direction : Vector3, duration):
	var movePlayerObj = BC_EventMove.new();
	movePlayerObj.controlToken = controlToken;
	movePlayerObj.userName = userName;
	movePlayerObj.direction = direction;
	movePlayerObj.duration = duration;
	WS.sendServerData(TAG_MOVE_PLAYER, movePlayerObj.getData());

func getServerResponseError(objServer):
	if typeof(objServer) == typeof({}):
		if objServer.has("error"):
			return objServer.errorStr;
	return null;

func login(userName_ : String, hashPass : String, callback : FuncRef):
	userName = userName_;
	var loginObj = BC_EventLogin.new();
	loginObj.userName = userName_;
	loginObj.hashPass = hashPass;
	_onLoginCB = callback;
	WS.sendServerData(TAG_LOGIN, loginObj.getData(), funcref(self, "onLogin"));

func onLogin(objServer):
	if !getServerResponseError(objServer):
		_loged = true;
		controlToken = objServer;
	_onLoginCB.call_func(objServer);
	
func onEventServerReceived(tag, dataObj):
	emit_signal("onEventServer", tag, dataObj);
	
func _process(delta):
	_tstamp += delta * 1000;
