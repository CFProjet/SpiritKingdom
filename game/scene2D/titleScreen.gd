extends Node2D

onready var connectionPopup = get_node("connectionPopup");

signal launchGame

func _ready():
	connectionPopup.connect("onConnected", self, "startGame");
	
func startGame(data):
	emit_signal("launchGame", data);
	queue_free();