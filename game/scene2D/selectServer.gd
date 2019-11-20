extends Node2D

onready var btnLocal = get_node("btn_server_local");
onready var btnWeb = get_node("btn_server_web");

signal onServerSelected

func selectServer(prod : bool):
	CServer.connectToServer(prod);
	queue_free();

func _on_serverWeb_gui_input(event: InputEvent):
	if event is InputEventMouseButton && event.is_pressed() && event.button_index == BUTTON_LEFT:
		selectServer(true);


func _on_serverLocal_gui_input(event : InputEvent):
	if event is InputEventMouseButton && event.is_pressed() && event.button_index == BUTTON_LEFT:
		selectServer(false);


func _on_btnWeb_mouse_entered():
	btnWeb.scale.x = 1.05;
	btnWeb.scale.y = 1.05;


func _on_btnWeb_mouse_exited():
	btnWeb.scale.x = 1;
	btnWeb.scale.y = 1;


func _on_btnLocal_mouse_entered():
	btnLocal.scale.x = 1.05;
	btnLocal.scale.y = 1.05;


func _on_btnLocal_mouse_exited():
	btnLocal.scale.x = 1;
	btnLocal.scale.y = 1;
