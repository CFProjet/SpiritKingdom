// GENERATED BY BOLT_CLASS_GENERATOR

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
       this.destination = {x : 0,   y : 0,   z : 0};
 }

}

class BC_Evolve {

   constructor(){
       this.propriety = "";
       this.newValue = null;
       this.speed = "";
       this.time = 0;
 }

}

class BC_PlayerState {

   constructor(){
       this.life = 1;
       this.lifeMax = 200;
       this.experience = 1;
       this.level = 1;
       this.moveSpeed = 600;
       this.position = {x : 0,   y : 0,   z : 0};
 }

}


exports.BC_EventGetPlayer = BC_EventGetPlayer
exports.BC_EventLogin = BC_EventLogin
exports.BC_EventMove = BC_EventMove
exports.BC_Evolve = BC_Evolve
exports.BC_PlayerState = BC_PlayerState