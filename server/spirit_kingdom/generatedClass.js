// GENERATED BY BOLT_CLASS_GENERATOR

class BC_Destructible {

   constructor(){
       this.type = "";
       this.uniqueID = "uid";
       this.position = {x : 0,   y : 0,   z : 0};
       this.groupes = [];
       this.effectDict = {};
 }

}

class BC_Effect {

   constructor(){
       this.name = "";
       this.property = "";
       this.speed = "";
       this.creationTime = 0;
       this.duration = 0;
 }

}

class BC_EffectArea {

   constructor(){
       this.type = "";
       this.uniqueID = "uid";
       this.position = {x : 0,   y : 0,   z : 0};
       this.groupes = [];
       this.groupesTarget = {};
       this.effectTab = [];
       this.move = null;
       this.pin = null;
       this.triggerOnce = false;
       this.triggered = false;
       this.cibleCount = 0;
       this.creationTime = 10;
       this.duration = 10;
 }

}

class BC_Entity {

   constructor(){
       this.type = "";
       this.uniqueID = "uid";
       this.position = {x : 0,   y : 0,   z : 0};
       this.groupes = [];
 }

}

class BC_EventGetPlayer {

   constructor(){
       this.controlToken = "token";
       this.userName = "user";
 }

}

class BC_EventLogin {

   constructor(){
       this.userName = "exemplePseudo";
       this.hashPass = "exemplepass";
 }

}

class BC_EventMove {

   constructor(){
       this.controlToken = "token";
       this.userName = "userName";
       this.origin = {x : 0,   y : 0,   z : 0};
       this.direction = {x : 0,   y : 0,   z : 0};
       this.duration = 0;
 }

}

class BC_PlayerState {

   constructor(){
       this.type = "";
       this.uniqueID = "uid";
       this.position = {x : 0,   y : 0,   z : 0};
       this.groupes = [];
       this.effectDict = {};
       this.userName = "userName";
       this.creationTime = 0;
       this.life = 1;
       this.lifeMax = 200;
       this.experience = 1;
       this.level = 1;
       this.moveSpeed = 10;
 }

}


exports.BC_Destructible = BC_Destructible
exports.BC_Effect = BC_Effect
exports.BC_EffectArea = BC_EffectArea
exports.BC_Entity = BC_Entity
exports.BC_EventGetPlayer = BC_EventGetPlayer
exports.BC_EventLogin = BC_EventLogin
exports.BC_EventMove = BC_EventMove
exports.BC_PlayerState = BC_PlayerState