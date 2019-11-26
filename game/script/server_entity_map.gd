extends Node

class_name ServerEntityMap

var entityMap = {};

signal onMapRefresh

func _ready():
	CServer.connect("onEventServer", self, "onEventServer");

func onEventServer(tag, data):
	if tag == "TAG_MAP_REFRESH":
		entityMap = data;
		emit_signal("onMapRefresh", entityMap);
