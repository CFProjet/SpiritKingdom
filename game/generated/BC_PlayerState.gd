# GENERATED BY BOLT_CLASS_GENERATOR

class_name BC_PlayerState


var type = "";
var uniqueID = "uid";
var position = Vector3(0, 0, 0);
var groupes = [ ];
var effectDict = {};
var userName = "userName";
var creationTime = 0;
var life = 1;
var lifeMax = 200;
var experience = 1;
var level = 1;
var moveSpeed = 10;

func setData(data):
	self.type = data.type;
	self.uniqueID = data.uniqueID;
	self.position = Vector3();
	self.position.x = data.position.x;
	self.position.y = data.position.y;
	self.position.z = data.position.z;
	self.groupes = [];
	self.effectDict = {};
	self.userName = data.userName;
	self.creationTime = data.creationTime;
	self.life = data.life;
	self.lifeMax = data.lifeMax;
	self.experience = data.experience;
	self.level = data.level;
	self.moveSpeed = data.moveSpeed;
	return self;


func getData():
	var data = {};
	data.type = self.type;
	data.uniqueID = self.uniqueID;
	data.position = {};
	data.position.x = self.position.x;
	data.position.y = self.position.y;
	data.position.z = self.position.z;
	data.groupes = [];
	data.effectDict = {};
	data.userName = self.userName;
	data.creationTime = self.creationTime;
	data.life = self.life;
	data.lifeMax = self.lifeMax;
	data.experience = self.experience;
	data.level = self.level;
	data.moveSpeed = self.moveSpeed;
	return data;
