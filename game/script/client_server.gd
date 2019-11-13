extends Node

const TAG_LOGIN = "TAG_LOGIN";
const TAG_GET_PLAYER = "TAG_GET_PLAYER";


var _onLoginCB = null;
var _loged = false;
var controlToken = null;
var userName = null;
var connected = false;

var serverURL : String = "192.168.1.100:7788";

signal onEventServer

func _ready():
	WS.connect("onConnected", self, "onConnectedToServer");
	WS.connect("onConnectionClosed", self, "onConnectionClosed");
	WS.connect("onServerDataReceived", self, "onEventServerReceived");
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
	
func onConnectionClosed():
	connected = false;

func getPlayerState(callback : FuncRef):
	var getPlayerObj = BC_EventGetPlayer.new();
	getPlayerObj.controlToken = controlToken;
	getPlayerObj.userName = userName;
	WS.sendServerData(TAG_GET_PLAYER, getPlayerObj.getData(), callback);

func getServerResponseError(objServer):
	if objServer is Object:
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
	