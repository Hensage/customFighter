const maxSpeed = 20;
const accel = 10;
const airAccel = 2;
const groFrict = 0.5;
const airFrict = 0.9;
const airUpFrict = 0.9;
const gravity = 2;
const minSpeed = 0.5;
const jumpVel = 30;
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

		this.percentage = 1;
		this.hitCool = 0;

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
				if (this.attackStun==0){
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
				if (this.attackStun==0){
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
		if (this.attackStun!=0){this.attackStun--;this.stuck=false};
		if (this.hitCool!=0){this.hitCool--;};
		if (this.stuck){this.velocity[0] = 0;};

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
		}


		if (this.buttons[1]){
			if (this.directions[3]){
				this.attack2();
			}else{
				this.attack1();
			}
			this.attack3();
			
		}
	}
	updateBoxes(){
		for (let i =this.hitboxes.length-1;i>=0;i--){
			this.hitboxes[i].duration -= 1;
			if (this.hitboxes[i].duration == 0){
				this.hitboxes.splice(i,1);
			}
		}
	}
	isHit(hitbox){
		let tx = hitbox.position[0];
        let ty = hitbox.position[1];
		
        if (hitbox.attached){
            tx = hitbox.player.position[0]+hitbox.position[0];
            ty = hitbox.player.position[1]+hitbox.position[1];
        }
		//console.log("__X____")
		//console.log((this.position[0]+(this.size[0]/2))+"greater than "+(tx-hitbox.size)+".");
		//console.log((this.position[0]-(this.size[0]/2))+"less than "+(tx+hitbox.size)+".");
		//console.log("__Y____")
		//console.log((this.position[1]+(this.size[1]/2))+"greater than "+(ty-hitbox.size)+".");
		//console.log((this.position[1]-(this.size[1]/2))+"less than "+(ty+hitbox.size)+".");
		if (hitbox.hit!=true && this.hitCool==0){
			if (this.position[0]+(this.size[0]/2)>(tx-hitbox.size)&&this.position[0]-(this.size[0]/2)<(tx+hitbox.size)){
				if (this.position[1]+(this.size[1]/2)>(ty-hitbox.size)&&this.position[1]-(this.size[1]/2)<(ty+hitbox.size)){
					console.log("HIT");
					this.percentage *= (1+(hitbox.strength/1000));
					this.hitCool=5;
					this.attackStun=20;
					this.velocity[0]=((hitbox.strength*Math.sin(hitbox.direction*(Math.PI*2)/360)*this.percentage)+this.velocity[0])/2;
					this.velocity[1]=((-hitbox.strength*Math.cos(hitbox.direction*(Math.PI*2)/360)*this.percentage)+this.velocity[1])/2;
					return true;
				}
			}
			return false;
		}
    }
	attack1(){
		if (this.aniInterupt && this.grounded &&  this.attackStun==0 && this.animFrame == 0){
			this.animation = "attack1";
			this.aniInterupt = false;
			this.stuck = true;
			this.attackStun=20;
			this.animFrame = 1;
		}
		if (this.animation == "attack1"){
			if (this.animFrame == 5){
				this.hitboxes.push({"position":[0,-50],"attached":true,"size":10,"duration":4,"strength":46,"direction":45*this.facing});
				this.hitboxes.push({"position":[0,-30],"attached":true,"size":10,"duration":4,"strength":34,"direction":45*this.facing});
				this.hitboxes.push({"position":[0,-20],"attached":true,"size":10,"duration":4,"strength":22,"direction":45*this.facing});
			}
			else if (this.animFrame == 7){
				this.hitboxes.push({"position":[12*this.facing,-49],"attached":true,"size":10,"duration":4,"strength":46,"direction":45*this.facing});
				this.hitboxes.push({"position":[8*this.facing,-29],"attached":true,"size":10,"duration":4,"strength":34,"direction":45*this.facing});
				this.hitboxes.push({"position":[4*this.facing,-19],"attached":true,"size":10,"duration":4,"strength":22,"direction":45*this.facing});
			}
			else if (this.animFrame == 9){
				this.hitboxes.push({"position":[30*this.facing,-40],"attached":true,"size":10,"duration":4,"strength":46,"direction":45*this.facing});
				this.hitboxes.push({"position":[24*this.facing,-25],"attached":true,"size":10,"duration":4,"strength":34,"direction":45*this.facing});
				this.hitboxes.push({"position":[12*this.facing,-15],"attached":true,"size":10,"duration":4,"strength":22,"direction":45*this.facing});
			}
			else if (this.animFrame == 11){
				this.hitboxes.push({"position":[40*this.facing,-30],"attached":true,"size":10,"duration":4,"strength":46,"direction":45*this.facing});
				this.hitboxes.push({"position":[36*this.facing,-20],"attached":true,"size":10,"duration":4,"strength":34,"direction":45*this.facing});
				this.hitboxes.push({"position":[16*this.facing,-15],"attached":true,"size":10,"duration":4,"strength":22,"direction":45*this.facing});
			}
			else if (this.animFrame == 13){
				this.hitboxes.push({"position":[60*this.facing,-5],"attached":true,"size":10,"duration":4,"strength":46,"direction":45*this.facing});
				this.hitboxes.push({"position":[40*this.facing,-5],"attached":true,"size":10,"duration":4,"strength":34,"direction":45*this.facing});
				this.hitboxes.push({"position":[20*this.facing,-5],"attached":true,"size":10,"duration":4,"strength":22,"direction":45*this.facing});
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
			this.stuck = true;
			this.attackStun=10;
			this.animFrame = 1;
		}
		if (this.animation == "attack2"){
			if (this.animFrame == 2){
				this.hitboxes.push({"position":[0,(this.size[1]/2)-10],"attached":true,"size":10,"duration":6,"strength":23,"direction":15*this.facing});
			}
			else if (this.animFrame == 3){
				this.hitboxes.push({"position":[20*this.facing,(this.size[1]/2)-10],"attached":true,"size":10,"duration":4,"strength":23,"direction":15*this.facing});
			}
			else if (this.animFrame == 5){
				this.hitboxes.push({"position":[40*this.facing,(this.size[1]/2)-10],"attached":true,"size":10,"duration":2,"strength":23,"direction":15*this.facing});
			}
			else if (this.animFrame == 7){
				this.hitboxes.push({"position":[60*this.facing,(this.size[1]/2)-10],"attached":true,"size":10,"duration":2,"strength":23,"direction":15*this.facing});
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
			this.stuck = false;
			this.attackStun=15;
			this.animFrame = 1;
		}
		if (this.animation == "attack3"){
			if (this.animFrame == 2){
				this.hitboxes.push({"position":[10*this.facing,0],"attached":true,"size":10,"duration":4,"strength":22,"direction":80*this.facing});
			}
			else if (this.animFrame == 4){
				this.hitboxes.push({"position":[20*this.facing,0],"attached":true,"size":10,"duration":4,"strength":23,"direction":80*this.facing});
			}
			else if (this.animFrame == 8){
				this.hitboxes.push({"position":[-10*this.facing,0],"attached":true,"size":10,"duration":4,"strength":22,"direction":-80*this.facing});
			}
			else if (this.animFrame == 10){
				this.hitboxes.push({"position":[-20*this.facing,0],"attached":true,"size":10,"duration":4,"strength":23,"direction":-80*this.facing});
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
		this.updateBoxes();
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