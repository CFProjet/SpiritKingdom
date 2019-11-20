extends Node2D

onready var closeSprite = get_node("btnClose");
onready var DoneBtn = get_node("doneBtn");

onready var errorTxt = get_node("error");
onready var pseudoTxt = get_node("pseudo");
onready var passwordTxt = get_node("password");

var alphaNum : String = "abcdefghijklmnopqrstuvwxyz0123456789_ABCDEFGHIJKLMNOPQRSTUVWXYZ";

signal onConnected
signal onClosePopup

func _ready():
	pass # Replace with function body.
	
func connection():
	errorTxt.visible = false;
	var pseudo = pseudoTxt.text;
	var password = passwordTxt.text;
	
	var errorStr = null;
	
	if !CServer.connected:
		errorStr = "No connection with server...";

	# CHECK PSEUDO LENGTH
	if errorStr == null:
		if pseudo.length() == 0:
			errorStr = "Entrez un pseudo";
		elif pseudo.length() < 4:
			errorStr = "Pseudo : Trop court";
		elif pseudo.length() > 15:
			errorStr = "Pseudo : Trop long";
	
	# CHECK VALIDE CHAR:
	if errorStr == null:
		var i = 0;
		while i < pseudo.length():
			var c = pseudo[i];
			if alphaNum.find(c) < 0:
				errorStr = "Pseudo : Invalide char ( " + c + " )";
				break;
			i += 1;


	
	# CHECK PASSWORD LENGTH
	if errorStr == null:
		if password.length() == 0:
			errorStr = "Entrez un password";			
		elif password.length() < 6:
			errorStr = "Password : Trop court";
	
	var hashPass = password.sha256_text();
	
	if errorStr:
		errorTxt.bbcode_text = "[center]" + errorStr;
		errorTxt.visible = true;
	else:
		CServer.login(pseudo, hashPass, funcref(self, "onLogin"));

func onLogin(serverObj):
	var errorStr = CServer.getServerResponseError(serverObj);
	if errorStr:
		errorTxt.bbcode_text = "[center]" + errorStr;
		errorTxt.visible = true;
	else:
		var controlToken = serverObj;
		emit_signal("onConnected");
		queue_free();

func onClickBtnDone(event : InputEvent):
	if event is InputEventMouseButton && event.is_pressed() && event.button_index == BUTTON_LEFT:
		connection();


func _on_btn_close_gui_input(event : InputEvent):
	if event is InputEventMouseButton && event.is_pressed() && event.button_index == BUTTON_LEFT:
		emit_signal("onClosePopup");
		queue_free();


func _on_btn_close_mouse_entered():
	closeSprite.modulate.a = 1;


func _on_btn_close_mouse_exited():
	closeSprite.modulate.a = 0.6;


func _on_doneBtn_mouse_entered():
	DoneBtn.scale.x = 1.05;
	DoneBtn.scale.y = 1.05;


func _on_DoneBtn_mouse_exited():
	DoneBtn.scale.x = 1;
	DoneBtn.scale.y = 1;


var focusedNode = null;
var backFocus = false;
# FOCUS WITH TAB
func _input(event : InputEvent):
	if event is InputEventKey && event.scancode == KEY_SHIFT:
		if event.is_pressed():
			backFocus = true;
		else:
			backFocus = false;
	if event is InputEventKey && event.is_pressed() && event.scancode == KEY_TAB:
		if backFocus:
			backFocus();			
		else:
			nextFocus();

func nextFocus():
	if focusedNode == pseudoTxt:
		passwordTxt.call_deferred("grab_focus");

func backFocus():
	if focusedNode == passwordTxt:
		pseudoTxt.call_deferred("grab_focus");

func _on_pseudo_focus_entered():
	focusedNode = pseudoTxt;


func _on_password_focus_entered():
	focusedNode = passwordTxt;
