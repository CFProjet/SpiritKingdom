extends Node

const TAG_LOGIN = "TAG_LOGIN";


var _onLoginCB = null;
var _loged = false;
var connected = false;

var serverURL : String = "192.168.1.100:7788";

func _ready():
	WS.connect("onConnected", self, "onConnectedToServer");
	WS.connect("onConnectionClosed", self, "onConnectionClosed");
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
	

func login(userName : String, hashPass : String, callback : FuncRef):
	var loginObj = BC_Login.new();
	loginObj.userName = userName;
	loginObj.hashPass = hashPass;
	_onLoginCB = callback;
	WS.sendServerData(TAG_LOGIN, loginObj.getData(), funcref(self, "onLogin"));

func onLogin(objServer):
	if !objServer.has("error"):
		_loged = true;
	_onLoginCB.call_func(objServer);