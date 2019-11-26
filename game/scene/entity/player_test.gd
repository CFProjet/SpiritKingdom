extends Area


var last_position=Vector3()
onready var animatree=$model_player/AnimationTree

func _process(delta):
	var diffpos=(translation-last_position)
	animatree["parameters/move/blend_position"]=0 if diffpos.length()==0 else 1
	last_position=translation
	print(diffpos)
	if diffpos.length()!=0:
		$model_player.global_transform.basis=(Transform().looking_at(-diffpos,Vector3(0,1,0)).basis)
