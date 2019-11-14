extends Spatial

class_name Map

const RAY_LENGTH=1000
var playerPFB = preload("res://scene/entity/player_test.tscn");

var server_entity_map : ServerEntityMap;
var entitys = {};
func _ready():
	server_entity_map = ServerEntityMap.new();
	server_entity_map.connect("onMapRefresh", self, "onEntityMapRefresh");
	add_child(server_entity_map);

func addEntity(id, state):
	var newEntity = playerPFB.instance();
	newEntity.get_node("Viewport/name").text=str(id)
	add_child(newEntity);
	entitys[id] = {node = newEntity, state = state};
	
	# On initialise la position
	var pos = StateManager.getRealVal(state, "position");
	newEntity.translation= pos;

func onEntityMapRefresh(entityTab):
	# POUR RAFRAICHIR LES ENTITYS ENVIRONNANTE
	# POUR TOUTE LES ENTYTY ENVIRONNENTE ENVOYER PAR LE SERVER
	for k in entityTab:
		var state = entityTab[k];
		# Si l'entity est déjà affiché, je met seulement a jour l'etat
		if entitys.has(k):
			entitys[k].state = state;
		# Sinon je la créer et la stock dans players
		else:
			addEntity(k, state);

func setPlayerPosition(myState : BC_PlayerState):
	# POUR INITILISER LA POSITION DU PLAYER
	addEntity(CServer.userName, myState);
func _process(delta):
	for k in entitys:
		var entity = entitys[k];
		var newPos = StateManager.getRealVal(entity.state, "position");
		entity.node.translation=newPos
# CONTROL A LA SOURIS DE SON PERSONNAGE
func _input(event : InputEvent):
	if event is InputEventMouseButton && event.is_pressed() && event.button_index == BUTTON_LEFT:
		var tmp=get_3d_mouse_pos(event.position)
		if tmp.has("position"):
			var clickPos = tmp.position
			if entitys.has(CServer.userName):
				var myPlayer = entitys[CServer.userName];
				var pos = StateManager.getRealVal(myPlayer.state, "position");
				var speed = StateManager.getRealVal(myPlayer.state, "moveSpeed");
				var direction = pos.direction_to(clickPos);
				# * 1000 CAR EN MILLISECONDE
				var duration = 1000 * clickPos.distance_to(pos) / speed;
				CServer.movePlayer(direction, duration);
#RECUPERE LA POSITION 3D VISEE PAR LA SOURIS
func get_3d_mouse_pos(mouse_pos):
	var ray_from = $Camera.project_ray_origin(mouse_pos)
	var ray_to = ray_from + $Camera.project_ray_normal(mouse_pos) * RAY_LENGTH
	var space_state = get_world().direct_space_state
	var selection=space_state.intersect_ray(ray_from, ray_to)
	return selection
