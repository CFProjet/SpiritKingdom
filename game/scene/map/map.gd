extends Spatial

class_name Map

onready var debugText = get_node("debug");

const RAY_LENGTH = 1000
var playerPFB = preload("res://scene/entity/player_test.tscn");
var path : PoolVector3Array = []
var pathProgress = 0;
var server_entity_map : ServerEntityMap;
var entitys = {};


onready var timer_nextpath : Timer = $Timer


func _ready():
	server_entity_map = ServerEntityMap.new();
	server_entity_map.connect("onMapRefresh", self, "onEntityMapRefresh");
	add_child(server_entity_map);
	
	# DEBUG
	CServer.connect("onPingRefreshed", self, "refreshPing");

func refreshPing(ping):
	debugText.text = str(ping);

func addEntity(id, state):
	var newEntity = playerPFB.instance();
	newEntity.get_node("Viewport/name").text=str(id)
	add_child(newEntity);
	entitys[id] = {node = newEntity, state = state};
	
	# On initialise la position
	var pos = StateManager.getRealVal(state, "position");
	newEntity.translation = pos;

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
	
	
func _physics_process(delta):
	for k in entitys:
		var entity = entitys[k];
		var newPos = StateManager.getRealVal(entity.state, "position");
		entity.node.translation = newPos;
# CONTROL A LA SOURIS DE SON PERSONNAGE
func _input(event : InputEvent):
	if event is InputEventMouseButton && event.is_pressed() && event.button_index == BUTTON_LEFT:
		var tmp = get_3d_mouse_pos(event.position)
		if tmp.has("position"):
			changePath(tmp.position)


#RECUPERE LA POSITION 3D VISEE PAR LA SOURIS
func get_3d_mouse_pos(mouse_pos):
	var ray_from = $Camera.project_ray_origin(mouse_pos)
	var ray_to = ray_from + $Camera.project_ray_normal(mouse_pos) * RAY_LENGTH
	var space_state = get_world().direct_space_state
	var selection = space_state.intersect_ray(ray_from, ray_to)
	return selection

func changePath(target_pos : Vector3):
	if entitys.has(CServer.userName):
		var myPlayer = entitys[CServer.userName];
		var pos = StateManager.getRealVal(myPlayer.state, "position");
		pathProgress = 0;
		path = getOptimizedPath(pos, $Navigation.get_simple_path(pos, target_pos));
		sendMoveToServer();

func sendMoveToServer():
	if pathProgress < path.size():
		# GET MY PLAYER
		var myPlayer = entitys[CServer.userName];
		var pos = StateManager.getRealVal(myPlayer.state, "position");
		var speed = StateManager.getRealVal(myPlayer.state, "moveSpeed");
		
		# GET NEXT POINT TO REACH
		var target_pos = path[pathProgress];
		
		# SEND TO SERVER
		if pathProgress != 0:
			pos = path[pathProgress - 1];
			
		var direction = pos.direction_to(target_pos)
		var duration = 1000 * pos.distance_to(target_pos)/ speed;
		CServer.movePlayer(pos, direction, duration);
		
		# PREPARE NEW POINT
		duration -= CServer.getPingMoyen() * 0.5;
		duration *= 0.001;
		timer_nextpath.start(duration);
		
		# INCREMENTE FOR NEXT PROCESS
		pathProgress += 1;
		
func _on_Timer_timeout():
	sendMoveToServer();

func getOptimizedPath(origine : Vector3, path_ : PoolVector3Array):
	var size = path_.size();
	if size > 1:
		var opti : PoolVector3Array = [];
		var cur : Vector3 = origine;
		var next : Vector3 = path_[0];
		var direction: Vector3 = next.direction_to(cur);
		
		var i = 0;
		
		while i < size:
			next = path_[i];
			
			var dist = cur.distance_to(next);
			var nextDir = next.direction_to(cur);
				
			var diffAngle = direction.angle_to(nextDir);
				
			if dist > 0.2 && diffAngle > 0.02 :
				opti.append(next);
				direction = next.direction_to(cur);
				cur = next;
			elif i == size - 1 && dist > 0.5:
				if opti.size() == 0:
					opti.append(next);
				else:
					opti[opti.size() -1] = next;
			i += 1;
		return opti;
	return path_;
