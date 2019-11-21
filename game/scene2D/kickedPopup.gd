extends Node2D

onready var closeSprite = get_node("btnClose");

signal onClosePopup

func _on_btn_close_gui_input(event : InputEvent):
	if event is InputEventMouseButton && event.is_pressed() && event.button_index == BUTTON_LEFT:
		emit_signal("onClosePopup");
		queue_free();

func _on_btn_close_mouse_entered():
	closeSprite.modulate.a = 1;


func _on_btn_close_mouse_exited():
	closeSprite.modulate.a = 0.6;
