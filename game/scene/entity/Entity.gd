extends KinematicBody

#Constantes
#Vitesse maximum de l'entite
const speedMax:int=200
#Angle maximum des escaliers
const angleMax:float=PI/2

#Variables
#Direction ou regarde l'entite
var direction:Vector3=Vector3()
#Vitesse de l'entite
var speed:int=0
#Fixe le personnage au sol dans un escalier
var snap:Vector3=Vector3(0,-1,0)
#Normal du sol
var normal:Vector3=Vector3(0,1,0)

func _ready():
	pass # Replace with function body.

func _physics_process(delta):
	
	#application des forces
	move_and_slide_with_snap(speed*direction,snap,normal,false,4,angleMax,true)
