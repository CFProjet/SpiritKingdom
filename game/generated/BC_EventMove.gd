# GENERATED BY BOLT_CLASS_GENERATOR

class_name BC_EventMove


var controlToken = "token";
var userName = "userName";
var direction = Vector3(0, 0, 0);
var duration = 0;

func setData(data):
	self.controlToken = data.controlToken;
	self.userName = data.userName;
	self.direction = Vector3();
	self.direction.x = data.direction.x;
	self.direction.y = data.direction.y;
	self.direction.z = data.direction.z;
	self.duration = data.duration;
	return self;


func getData():
	var data = {};
	data.controlToken = self.controlToken;
	data.userName = self.userName;
	data.direction = {};
	data.direction.x = self.direction.x;
	data.direction.y = self.direction.y;
	data.direction.z = self.direction.z;
	data.duration = self.duration;
	return data;