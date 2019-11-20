extends Spatial

var mapTestPFB = preload("res://scene/map/test.tscn");
var titleScenePFB = preload("res://scene2D/titleScreen.tscn");

onready var world = get_node("World");
onready var ui = get_node("UI");

func _ready():
	buildTitle();

func refreshPlayerWorld(playerState):
	var data = BC_PlayerState.new().setData(playerState);
	buildScene(mapTestPFB, data);
	
func clearWorld():
	var children = world.get_children();
	for c in children:
		c.queue_free();

func buildScene(scenePFB, playerState : BC_PlayerState):
	# CLEAR CURRENT MAP
	clearWorld();
	
	var scene = mapTestPFB.instance();
	scene.setPlayerPosition(playerState);
	world.add_child(scene);


func buildTitle():
	clearWorld();
	var title = titleScenePFB.instance();
	title.connect("launchGame", self, "refreshPlayerWorld");
	ui.add_child(title);
	
