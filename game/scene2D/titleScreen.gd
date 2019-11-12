extends Node2D

onready var connectionPopup = get_node("connectionPopup");

signal launchGame

func _ready():
	connectionPopup.connect("onConnected", self, "getPlayer");

func getPlayer():
	CServer.getPlayerState(funcref(self, "startGame"));

func startGame(data):
	if data.has("error"):
		print(data.errorStr);
		return;
	emit_signal("launchGame", data);
	queue_free();