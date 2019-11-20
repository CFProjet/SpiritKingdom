extends Spatial

class_name Map

const RAY_LENGTH=1000
var playerPFB = preload("res://scene/entity/player_test.tscn");
var path=[]
var server_entity_map : ServerEntityMap;
var entitys = {};
onready var timer_nextpath:Timer=$Timer
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
func _physics_process(delta):
	for k in entitys:
		var entity = entitys[k];
		var newPos = StateManager.getRealVal(entity.state, "position");
		entity.node.translation=newPos
# CONTROL A LA SOURIS DE SON PERSONNAGE
func _input(event : InputEvent):
	if event is InputEventMouseButton && event.is_pressed() && event.button_index == BUTTON_LEFT:
		var tmp=get_3d_mouse_pos(event.position)
		if tmp.has("position"):
			
			move(tmp.position)
#RECUPERE LA POSITION 3D VISEE PAR LA SOURIS
func get_3d_mouse_pos(mouse_pos):
	var ray_from = $Camera.project_ray_origin(mouse_pos)
	var ray_to = ray_from + $Camera.project_ray_normal(mouse_pos) * RAY_LENGTH
	var space_state = get_world().direct_space_state
	var selection=space_state.intersect_ray(ray_from, ray_to)
	return selection

func move(target_pos:Vector3):
	if entitys.has(CServer.userName):
		var myPlayer = entitys[CServer.userName];
		var pos = StateManager.getRealVal(myPlayer.state, "position");
		var speed = StateManager.getRealVal(myPlayer.state, "moveSpeed");
		path=($Navigation.get_simple_path(pos,target_pos))
		
		if path.size()>1:
			print("full"+str(path.size()))
			print(path)
			path.remove(0)
			target_pos=path[0]
			path.remove(0)
			print("1 pos"+str(path.size()))
			print(path)
		#clickPos=$Navigation.get_closest_point_to_segment(pos,clickPos)
		var direction=pos.direction_to(target_pos)
		# * 1000 CAR EN MILLISECONDE
		var duration = 1000 * pos.distance_to(target_pos)/ speed;
		CServer.movePlayer(direction, duration);
		if path.size()>0:
			timer_nextpath.start(duration/1000)


func _on_Timer_timeout():
	print("time out"+str(path.size()))
	print(path)
	if path.size()>0:
		move(path[-1])
