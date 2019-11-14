extends Node2D

var playerPFB = preload("res://scene2D/test/player2D.tscn");

var entitys = {};

func addEntity(id, state):
	var newEntity = playerPFB.instance();
	newEntity.get_node("name").bbcode_text = '[center]' + id;
	add_child(newEntity);
	entitys[id] = {node = newEntity, state = state};
	
	# On initialise la position
	var pos = StateManager.getRealVal(state, "position");
	newEntity.position.x = pos.x;
	newEntity.position.y = pos.y;

# ON RECOIT UNE MISE A JOUR SEULEMENT LORSQUE C'EST NECESSAIRE
func refreshEntity(entityTab):
	# POUR TOUTE LES ENTYTY ENVIRONNENTE ENVOYER PAR LE SERVER
	for k in entityTab:
		var state = entityTab[k];
		# Si l'entity est déjà affiché, je met seulement a jour l'etat
		if entitys.has(k):
			entitys[k].state = state;
		# Sinon je la créer et la stock dans players
		else:
			addEntity(k, state);
	
	# ON SUPPRIME LES ENTITYS DISPARUES
	for k in entitys:
		if !entityTab.has(k):
			entitys[k].node.queue_free();
			entitys.erase(k);






# ON MET A JOUR LES ENTITYS A CHAQUE TICK EN CALCULANT LES INTERPOLATION D'ETAT
func _process(delta):
	for k in entitys:
		var entity = entitys[k];
		var newPos = StateManager.getRealVal(entity.state, "position");
		entity.node.position.x = newPos.x;
		entity.node.position.y = newPos.y;
		


# CONTROL A LA SOURIS DE SON PERSONNAGE
func _on_input_gui_input(event : InputEvent):
	if event is InputEventMouseButton && event.is_pressed() && event.button_index == BUTTON_LEFT:
		var clickPos = Vector3(event.position.x, event.position.y, 0);
		if entitys.has(CServer.userName):
			var myPlayer = entitys[CServer.userName];
			var pos = StateManager.getRealVal(myPlayer.state, "position");
			var speed = StateManager.getRealVal(myPlayer.state, "moveSpeed");
			var direction = pos.direction_to(clickPos);
			# * 1000 CAR EN MILLISECONDE
			var duration = 1000 * clickPos.distance_to(pos) / speed;
			CServer.movePlayer(direction, duration);
