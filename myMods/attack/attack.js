const e = require("express");

module.exports = class attack{
	constructor(player,num,angle,buttons,pullback,hangTime,distance,size,damage,strength,launchAngle,recover,grounded,stuck=grounded,stun=recover){
        this.player =player;
        this.num = num;
        this.buttons = buttons;
        this.angle = angle*Math.PI/180;
        this.pullback = pullback;
        this.hangTime = hangTime;
        this.distance = distance;
        this.damage = damage;
        this.strength = strength;
        this.stun = stun;
        this.size = size;
        this.launchAngle = launchAngle;
        this.actFace = this.player.facing;
        this.recover = recover;
        this.stuck = stuck;
        this.frame = 0;
        this.grounded = grounded
        this.cost = 0;
        this.activ =false;
    }
    activate(){
        if (this.player.aniInterupt && this.player.grounded==this.grounded &&  this.player.attackStun==0){
            if (this.player.buttons[this.buttons[0]]){
                if (this.buttons[1] == -1){
                    if (this.player.directions.indexOf(true)==-1){
                        this.runIt();
                        return true;
                    }
                }else{
                    let butt = this.buttons[1];
                    if (this.player.facing==-1){
                        if (butt==0){
                            butt=2;
                        }else if (butt ==2){
                            butt=0;
                        }
                    }
                    if (this.player.directions[butt]==true){
                        this.runIt();
                        return true;
                    }
                }
            }
        }
        return false;
    }
    runIt(){
        this.player.animation = "attacking";
        this.player.aniInterupt = false;
        this.moveToken = token();
        this.activ = true;
        this.actFace = this.player.facing;
        this.player.attackStun=this.pullback+this.hangTime+this.recover;
		this.player.stuck = this.stuck;
        this.frame = 0;
		
    }
    getCurrBox(){
        return [];
    }
    /*
    getCurrBox(){
        this.frame++;
        let boxes = [];
        if (this.frame<this.pullback){
            let ratio = this.frame/this.pullback;
            let numBalls = (this.distance*ratio)/this.size;
            for (let i = 0;i<numBalls;i++){
                let temX = ((i*this.size*this.player.facing));
                let temY = ((i*this.size));
                //let tx = this.player.position[0] + (((temX*Math.cos(this.angle-(Math.PI))))-(temY*Math.sin(this.angle-(Math.PI))));
                //let ty = this.player.position[1] + (temX*Math.sin(this.angle-(Math.PI)))+(temY*Math.cos(this.angle-(Math.PI)));
                let tx = (this.player.position[0]+this.player.velocity[0]) + temX*Math.sin(this.angle-(Math.PI));
                let ty = (this.player.position[1]+this.player.velocity[1]) + temY*Math.cos(this.angle-(Math.PI));
                boxes.push({"position":[tx,ty],"size":this.size,"active":1,"moveToken":this.num});
            }
        }else if (this.frame-this.pullback<this.hangTime){
            let ratio = (this.frame-this.pullback)/this.hangTime;
            let numBalls = (this.distance*ratio)/this.size;
            for (let i = 0;i<numBalls;i++){
                let temX = ((i*this.size*this.player.facing));
                let temY = ((i*this.size));
                //let tx = this.player.position[0] + (((temX*Math.cos(this.angle))-(temY*Math.sin(this.angle))));
                //let ty = this.player.position[1] + (temX*Math.sin(this.angle))+(temY*Math.cos(this.angle));
                let tx =(this.player.position[0]+this.player.velocity[0]) + temX*Math.sin(this.angle);
                let ty = (this.player.position[1]+this.player.velocity[1]) + temY*Math.cos(this.angle);
                boxes.push({"position":[tx,ty],"size":this.size,"active":0,"moveToken":this.num});   
            }
        }else if (this.frame-this.pullback-this.hangTime>this.recover){
            this.player.animation="";
            this.player.currAtt=-1;
			this.player.aniInterupt=true;
            this.player.stuck = false;
        }
        return boxes;
    }
    */
}
var token = function() {
	return (Math.random().toString(36).substr(2)+Math.random().toString(36).substr(2));
};