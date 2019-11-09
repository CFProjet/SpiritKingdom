extends Node2D

onready var text = get_node("RichTextLabel");

func _process(delta):
	text.bbcode_text = "[right]" + CServer.getConnectionState();