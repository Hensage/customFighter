const maxSpeed = 20;
const accel = 10;
const airAccel = 2;
const groFrict = 0.5;
const airFrict = 0.9;
const airUpFrict = 0.9;
const gravity = 2;
const minSpeed = 0.5;
const jumpVel = 60;

var attObj = require("./attack/attack");
var pokeAtt = require("./attack/poke");
var swingAtt = require("./attack/swing");
var projAtt = require("./attack/proj");
module.exports = class user{
	constructor(sock){
		this.sock =sock; //Players socket id
		this.health = 50;
		this.timeCheck = new Date();
		this.textState = 0;
		this.match = null;
		this.position = [200,0];
		this.velocity = [0,0];
		this.animation = "";
		this.size = [50,50];
		this.aniInterupt = true;
		this.animFrame = 0;

		this.percentage = 0;
		this.hitCool = 0;
		this.lastHit = null;

		this.attacks=  [new pokeAtt(this,0,90,[1,-1],10,10,100,10,14,50,45,20,true),
						new pokeAtt(this,1,45,[1,3],4,5,50,8,7,20,10,6,true),
						new pokeAtt(this,2,90,[1,-1],4,5,40,40,6,20,80,6,false),
						new pokeAtt(this,3,0,[1,3],10,10,50,10,14,20,170,20,false),
						new swingAtt(this,0,90,[1,2],20,10,180,100,10,14,50,45,20,true),
						new swingAtt(this,0,-45,[1,2],10,10,90,100,10,14,50,45,20,false),
						new projAtt(this,0,135,[2,-1],10,100,20,10,14,50,45,20,true)];
		this.currAtt = -1;

		this.facing=-1;
		this.attackStun = 0;
		this.stuck = false;
		this.hitboxes = [];
		this.grounded = true;
		this.directions = [false,false,false,false];
		this.buttons = [false,false,false,false];
	}
	enterMatch(match){
		this.match = match;
	}
	dropMatch(){
		if (this.isPlaying()){
			return this.match.remPlayer(this);
		}else{
			console.log("go")
		}
		return false
	}
	isPlaying(){
		if (this.match != null){
			return true;
		}
		return false;
	}
	getPlayerNum(){
		if (this.match.users[0].sock.id == this.sock.id){
			return 0;
		}
		return 1;
	}
	setInputs(d,b){
		//console.log(d);
		this.directions = d;
		this.buttons = b;
	}
	velocityCal(){
		if (!this.stuck){
			//Button inputs
			if (this.directions[0]){
				if (this.grounded){
					this.velocity[0] -= accel;
				}else{
					this.velocity[0] -= airAccel
				}
				if (this.attackStun==0 && this.grounded){
					this.facing=-1;
				}
			}
			if (this.directions[2]){
				if (this.grounded){
					this.velocity[0] += accel;
				}
				else{
					this.velocity[0] += airAccel
				}
				if (this.attackStun==0  && this.grounded){
					this.facing=1;
				}
			}
		}
		// Friction
		if (this.grounded){
			this.velocity[0]*=groFrict
			if (this.velocity[1]>0){
				this.velocity[1]=0
			}
		}else{
			this.velocity[1]+=gravity;
			this.velocity[0]*=airFrict
			this.velocity[1]*=airUpFrict
		}
		//Min and max velocity
		if (Math.abs(this.velocity) < minSpeed){
			this.velocity = 0;
		}
		/*
		if (this.velocity[0] > maxSpeed){
			this.velocity[0] = maxSpeed;
		}
		if (this.velocity[0] < -maxSpeed){
			this.velocity[0] = -maxSpeed;
		}
		if (this.velocity[1] > maxSpeed){
			this.velocity[1] = maxSpeed;
		}
		if (this.velocity[1] < -maxSpeed){
			this.velocity[1] = -maxSpeed;
		}
		*/
	}
	checkGrounded(stage){
		this.grounded = false;
		let newPos = [this.position[0]+this.velocity[0],this.position[1]+this.velocity[1]];
		for (let oIndex = 0;oIndex<stage.length;oIndex++){
			let object =stage[oIndex];
			if (newPos[0]>object[0] && newPos[0]<object[2]){
				if (this.position[1]+(this.size[1]/2)<=object[1] && newPos[1]+(this.size[1]/2)>=object[1]){
					this.velocity[1] = object[1]-(this.position[1]+(this.size[1]/2));
					this.grounded=true
					break;
				}
			}
		}
	}
	action(){
		if (this.buttons[0] && this.grounded && this.attackStun==0){
			this.velocity[1] -= jumpVel;
		}
		if (this.attackStun!=0){this.attackStun--;};
		if (this.hitCool!=0){this.hitCool--;};
		if (this.stuck){this.velocity[0] = 0;};

		for (let i =0;i<this.attacks.length;i++){
			if (this.attacks[i].activate()){
				this.currAtt = i;
				break;
			}
		}
		this.hitboxes=[];
		for (let i=0;i<this.attacks.length;i++){
			if (this.attacks[i].activ){
				let boxs = this.attacks[i].getCurrBox();
				for (let i=0;i<boxs.length;i++){
					this.hitboxes.push(boxs[i]);
				}
			}
		}
		/*
		if (this.animFrame>0){
			this.animFrame++;
			if (this.animation == "attack1"){
				this.attack1();
			}else if (this.animation == "attack2"){
				this.attack2();
			}
			else if (this.animation == "attack3"){
				this.attack3();
			}
			else if (this.animation == "attack4"){
				this.attack4();
			}
		}


		if (this.buttons[1]){
			if (this.directions[3]){
				this.attack2();
			}else{
				this.attack1();
			}
			this.attack3();	
		}
		if (this.buttons[2]){
			this.attack4();
		}
		*/
	}
	updateBoxes(){
		for (let i =this.hitboxes.length-1;i>=0;i--){
			this.hitboxes[i].duration -= 1;
			if (this.hitboxes[i].duration == 0){
				this.hitboxes.splice(i,1);
			}
		}
	}
	isHit(hitbox,attack){
		let tx = hitbox.position[0];
        let ty = hitbox.position[1];
		//console.log("__X____")
		//console.log((this.position[0]+(this.size[0]/2))+"greater than "+(tx-hitbox.size)+".");
		//console.log((this.position[0]-(this.size[0]/2))+"less than "+(tx+hitbox.size)+".");
		//console.log("__Y____")
		//console.log((this.position[1]+(this.size[1]/2))+"greater than "+(ty-hitbox.size)+".");
		//console.log((this.position[1]-(this.size[1]/2))+"less than "+(ty+hitbox.size)+".");
		if (this.hitCool==0 && (attack.moveToken != this.lastHit) && hitbox.active==0){
			if (this.position[0]+(this.size[0]/2)>(tx-hitbox.size)&&this.position[0]-(this.size[0]/2)<(tx+hitbox.size)){
				if (this.position[1]+(this.size[1]/2)>(ty-hitbox.size)&&this.position[1]-(this.size[1]/2)<(ty+hitbox.size)){
					console.log("HIT");
					this.lastHit = attack.moveToken;
					this.percentage += attack.damage;
					this.hitCool=5;
					this.attackStun=attack.stun;
					this.velocity[0]=((attack.strength*Math.sin(attack.launchAngle*(Math.PI*2)/360)*(1+((this.percentage**1.2)/100))*attack.actFace)+this.velocity[0])/2;
					this.velocity[1]=((-attack.strength*Math.cos(attack.launchAngle*(Math.PI*2)/360)*(1+((this.percentage**1.2)/100)))+this.velocity[1])/2;
					if (attack.launchAngle>90 && this.grounded){
						this.velocity[1]=((attack.strength*Math.cos(attack.launchAngle*(Math.PI*2)/360)*(1+((this.percentage**1.2)/100)))+this.velocity[1])/2;
					}
					return true;
				}
			}
			return false;
		}
    }
	attack1(){
		if (this.aniInterupt && this.grounded &&  this.attackStun==0 && this.animFrame == 0){
			this.animation = "attack1";
			this.moveToken = token();
			this.aniInterupt = false;
			this.stuck = true;
			this.attackStun=20;
			this.animFrame = 1;
		}
		if (this.animation == "attack1"){
			if (this.animFrame == 5){
				this.hitboxes.push({"position":[0,-50],"attached":true,"size":10,"duration":4,"strength":46,"direction":45*this.facing,"moveToken":this.moveToken});
				this.hitboxes.push({"position":[0,-30],"attached":true,"size":10,"duration":4,"strength":34,"direction":45*this.facing,"moveToken":this.moveToken});
				this.hitboxes.push({"position":[0,-20],"attached":true,"size":10,"duration":4,"strength":22,"direction":45*this.facing,"moveToken":this.moveToken});
			}
			else if (this.animFrame == 7){
				this.hitboxes.push({"position":[12*this.facing,-49],"attached":true,"size":10,"duration":4,"strength":46,"direction":45*this.facing,"moveToken":this.moveToken});
				this.hitboxes.push({"position":[8*this.facing,-29],"attached":true,"size":10,"duration":4,"strength":34,"direction":45*this.facing,"moveToken":this.moveToken});
				this.hitboxes.push({"position":[4*this.facing,-19],"attached":true,"size":10,"duration":4,"strength":22,"direction":45*this.facing,"moveToken":this.moveToken});
			}
			else if (this.animFrame == 9){
				this.hitboxes.push({"position":[30*this.facing,-40],"attached":true,"size":10,"duration":4,"strength":46,"direction":45*this.facing,"moveToken":this.moveToken});
				this.hitboxes.push({"position":[24*this.facing,-25],"attached":true,"size":10,"duration":4,"strength":34,"direction":45*this.facing,"moveToken":this.moveToken});
				this.hitboxes.push({"position":[12*this.facing,-15],"attached":true,"size":10,"duration":4,"strength":22,"direction":45*this.facing,"moveToken":this.moveToken});
			}
			else if (this.animFrame == 11){
				this.hitboxes.push({"position":[40*this.facing,-30],"attached":true,"size":10,"duration":4,"strength":46,"direction":45*this.facing,"moveToken":this.moveToken});
				this.hitboxes.push({"position":[36*this.facing,-20],"attached":true,"size":10,"duration":4,"strength":34,"direction":45*this.facing,"moveToken":this.moveToken});
				this.hitboxes.push({"position":[16*this.facing,-15],"attached":true,"size":10,"duration":4,"strength":22,"direction":45*this.facing,"moveToken":this.moveToken});
			}
			else if (this.animFrame == 13){
				this.hitboxes.push({"position":[60*this.facing,-5],"attached":true,"size":10,"duration":4,"strength":46,"direction":45*this.facing,"moveToken":this.moveToken});
				this.hitboxes.push({"position":[40*this.facing,-5],"attached":true,"size":10,"duration":4,"strength":34,"direction":45*this.facing,"moveToken":this.moveToken});
				this.hitboxes.push({"position":[20*this.facing,-5],"attached":true,"size":10,"duration":4,"strength":22,"direction":45*this.facing,"moveToken":this.moveToken});
			}
			else if (this.animFrame == 20){
				console.log("RESET")
				this.animation="";
				this.aniInterupt=true;
				this.animFrame=0;
			}
		}
	}
	attack2(){
		if (this.aniInterupt && this.grounded &&  this.attackStun==0 && this.animFrame == 0){
			this.animation = "attack2";
			this.aniInterupt = false;
			this.moveToken = token();
			this.stuck = true;
			this.attackStun=10;
			this.animFrame = 1;
		}
		if (this.animation == "attack2"){
			if (this.animFrame == 2){
				this.hitboxes.push({"position":[0,(this.size[1]/2)-10],"attached":true,"size":10,"duration":6,"strength":23,"direction":15*this.facing,"moveToken":this.moveToken});
			}
			else if (this.animFrame == 3){
				this.hitboxes.push({"position":[20*this.facing,(this.size[1]/2)-10],"attached":true,"size":10,"duration":4,"strength":23,"direction":15*this.facing,"moveToken":this.moveToken});
			}
			else if (this.animFrame == 5){
				this.hitboxes.push({"position":[40*this.facing,(this.size[1]/2)-10],"attached":true,"size":10,"duration":2,"strength":23,"direction":15*this.facing,"moveToken":this.moveToken});
			}
			else if (this.animFrame == 7){
				this.hitboxes.push({"position":[60*this.facing,(this.size[1]/2)-10],"attached":true,"size":10,"duration":2,"strength":23,"direction":15*this.facing,"moveToken":this.moveToken});
			}
			else if (this.animFrame == 10){
				console.log("RESET")
				this.animation="";
				this.aniInterupt=true;
				this.animFrame=0;
			}
		}
	}
	attack3(){
		if (this.aniInterupt && !this.grounded &&  this.attackStun==0 && this.animFrame == 0){
			this.animation = "attack3";
			this.aniInterupt = false;
			this.moveToken = token();
			this.stuck = false;
			this.attackStun=15;
			this.animFrame = 1;
		}
		if (this.animation == "attack3"){
			if (this.animFrame == 2){
				this.hitboxes.push({"position":[10*this.facing,0],"attached":true,"size":10,"duration":4,"strength":22,"direction":80*this.facing,"moveToken":this.moveToken,"multi":true});
			}
			else if (this.animFrame == 4){
				this.hitboxes.push({"position":[20*this.facing,0],"attached":true,"size":10,"duration":4,"strength":23,"direction":80*this.facing,"moveToken":this.moveToken,"multi":true});
			}
			else if (this.animFrame == 8){
				this.hitboxes.push({"position":[-10*this.facing,0],"attached":true,"size":10,"duration":4,"strength":22,"direction":-80*this.facing,"moveToken":this.moveToken,"multi":true});
			}
			else if (this.animFrame == 10){
				this.hitboxes.push({"position":[-20*this.facing,0],"attached":true,"size":10,"duration":4,"strength":23,"direction":-80*this.facing,"moveToken":this.moveToken,"multi":true});
			}
			else if (this.animFrame == 15){
				console.log("RESET")
				this.animation="";
				this.stuck = false;
				this.aniInterupt=true;
				this.animFrame=0;
			}
		}
	}
	attack4(){
		if (this.aniInterupt && !this.grounded &&  this.attackStun==0 && this.animFrame == 0){
			this.animation = "attack4";
			this.aniInterupt = false;
			this.moveToken = token();
			this.stuck = false;
			this.attackStun=15;
			this.animFrame = 1;
		}
		if (this.animation == "attack3"){
			if (this.animFrame == 2){
				this.hitboxes.push({"position":[10*this.facing,0],"attached":false,"size":10,"duration":4,"strength":22,"direction":80*this.facing,"moveToken":this.moveToken,"multi":true});
			}
			else if (this.animFrame == 4){
				this.hitboxes.push({"position":[20*this.facing,0],"attached":true,"size":10,"duration":4,"strength":23,"direction":80*this.facing,"moveToken":this.moveToken,"multi":true});
			}
			else if (this.animFrame == 8){
				this.hitboxes.push({"position":[-10*this.facing,0],"attached":true,"size":10,"duration":4,"strength":22,"direction":-80*this.facing,"moveToken":this.moveToken,"multi":true});
			}
			else if (this.animFrame == 10){
				this.hitboxes.push({"position":[-20*this.facing,0],"attached":true,"size":10,"duration":4,"strength":23,"direction":-80*this.facing,"moveToken":this.moveToken,"multi":true});
			}
			else if (this.animFrame == 15){
				console.log("RESET")
				this.animation="";
				this.stuck = false;
				this.aniInterupt=true;
				this.animFrame=0;
			}
		}
	}
	move(stage){
		//this.updateBoxes();
		this.velocityCal();
		this.action();
		this.checkGrounded(stage);
		//Position Update
		this.position[0] += this.velocity[0];
		this.position[1] += this.velocity[1];
		if (this.position[1]>1500){
			this.position[0]=400;
			this.position[1]=0;
			this.percentage=1;
		}
	}
}
var token = function() {
	return (Math.random().toString(36).substr(2)+Math.random().toString(36).substr(2));
};