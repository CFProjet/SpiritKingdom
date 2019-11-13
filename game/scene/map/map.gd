extends Spatial

class_name Map

var server_entity_map : ServerEntityMap;

func _ready():
	server_entity_map = ServerEntityMap.new();
	server_entity_map.connect("onMapRefresh", self, "onEntityMapRefresh");
	add_child(server_entity_map);
	

func onEntityMapRefresh(entityTab):
	# POUR RAFRAICHIR LES ENTITYS ENVIRONNANTE
	get_node("test2D").refreshEntity(entityTab);

func setPlayerPosition(myState : BC_PlayerState):
	# POUR INITILISER LA POSITION DU PLAYER
	get_node("test2D").addEntity(CServer.userName, myState);
