extends Node

var webStorage = false;
var fileData = {_proofOfSave_ = true}
var waitTime = 0;

func _ready():
	set_process(false);
	# TO CHECK IF WE MUST USE WEBSTORAGE OR FILE_SYSTEM
	var javaScriptOK = JavaScript.eval("true");
	if javaScriptOK :
		webStorage = true;
		_loadWebStorage();
	else:
		_loadFileData();

func saveData(key : String, data):
	if data == null:
		fileData.erase(key);
		return;
	fileData[key] = data;
	set_process(true);
	waitTime = 1;
		
func getData(key : String):
	if fileData.has(key):
		return fileData[key];
	else:
		 return null;

func _save():
	waitTime = 0;
	set_process(false);
	if webStorage:
		_saveWebStorage();
	else:
		_saveFileData();

func _saveWebStorage():
	var dataStr = JSON.print(fileData);
	JavaScript.eval("localStorage.setItem('_data_', '" + dataStr +"');", true);

func _loadWebStorage():
	var dataStr = JavaScript.eval("localStorage.getItem('_data_');", true);
	if !dataStr:
		return;
	var jsonResult = JSON.parse(dataStr) as JSONParseResult;
	if jsonResult.error:
		print("Error JSON parse : " + jsonResult.error_string)
		print(dataStr);
		return;
		
	var data = jsonResult.result;
	if data.has("_proofOfSave_"):
		fileData = data;

func _saveFileData():
	var dataStr = JSON.print(fileData);
	var file = File.new();
	file.open("user://data.dat", File.WRITE)
	file.store_string(dataStr)
	file.close()

func _loadFileData():
	var file = File.new()
	file.open("user://data.dat", File.READ)
	var dataStr = file.get_as_text()
	file.close();
	var jsonResult = JSON.parse(dataStr) as JSONParseResult;
	if jsonResult.error:
		print("Error JSON parse : " + jsonResult.error_string)
		print(dataStr);
		return;
		
	var data = jsonResult.result;
	if data.has("_proofOfSave_"):
		fileData = data;

func _process(delta):
	waitTime = max(0,waitTime - delta);
	if waitTime <= 0:
		_save(); 