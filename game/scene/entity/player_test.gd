extends Area


var hauteur=Vector3(0,1,0)

func get_direction(pos:Vector3,clickpos:Vector3):
	var position:Vector3 = _intersect_pos(pos,clickpos)
	return pos.direction_to(position)

func get_distance(pos:Vector3,clickpos:Vector3):
	var position:Vector3 = _intersect_pos(pos,clickpos)
	return pos.distance_to(position)

func _intersect_pos(pos:Vector3,clickpos:Vector3)->Vector3:
	var position:Vector3
	var space_state = get_world().direct_space_state
	var result:Dictionary=space_state.intersect_ray(pos, clickpos, [self])
	if result.has("position"):
		position=result.position
	else:
		position=clickpos
	return position-(clickpos-pos).normalized()
