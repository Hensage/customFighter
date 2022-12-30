var attObj = require("./attack");
module.exports = class proj extends attObj{
	constructor(player,num,angle,buttons,pullback,hangTime,speed,size,damage,strength,launchAngle,recover,grounded,stuck=grounded,stun=recover){
        super(player,num,angle,buttons,pullback,hangTime,player.size[0],size,damage,strength,launchAngle,recover,grounded,stuck=grounded,stun=recover);
        this.speed=speed;
    }
    /*
    activate(){
        if (this.player.aniInterupt && this.player.grounded==this.grounded &&  this.player.attackStun==0 && this.player.animFrame == 0){
            if (this.player.buttons[this.buttons[0]]){
                if (this.buttons[1] == -1){
                    if (this.player.directions.indexOf(true)==-1){
                        this.runIt();
                        return true;
                    }
                }else{
                    if (this.player.directions[this.buttons[1]]==true){
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
        this.actFace = this.player.facing;
        this.player.attackStun=this.pullback+this.hangTime+this.recover;
		this.player.stuck = this.stuck;
        this.frame = 0;
		
    }
    */
    runIt(){
        this.startingX = this.player.position[0]+this.player.velocity[0];
        this.startingY = this.player.position[1]+this.player.velocity[1];
        super.runIt()
        this.player.attackStun = this.pullback+this.recover;
    }
    getCurrBox(){
        this.frame++;
        let boxes = [];
        if (this.frame<this.pullback){
            let ratio = this.frame/this.pullback;
            let numBalls = (this.distance*ratio)/this.size;
            for (let i = 0;i<numBalls;i++){
                let temX = ((i*this.size*this.actFace));
                let temY = ((i*this.size));
                //let tx = this.player.position[0] + (((temX*Math.cos(this.angle-(Math.PI))))-(temY*Math.sin(this.angle-(Math.PI))));
                //let ty = this.player.position[1] + (temX*Math.sin(this.angle-(Math.PI)))+(temY*Math.cos(this.angle-(Math.PI)));
                let tx = (this.player.position[0]+this.player.velocity[0]) + temX*Math.sin(this.angle-(Math.PI));
                let ty = (this.player.position[1]+this.player.velocity[1]) + temY*Math.cos(this.angle-(Math.PI));
                boxes.push({"position":[tx,ty],"size":this.size,"active":1,"moveToken":this.num});
            }
        }else if (this.frame-this.pullback<this.hangTime){
            let temX = (this.speed*(this.frame-this.pullback)*this.actFace);
            let temY = (this.speed*(this.frame-this.pullback));
            //let numBalls = (this.distance*ratio)/this.size;
            //let tx = this.player.position[0] + (((temX*Math.cos(this.angle))-(temY*Math.sin(this.angle))));
            //let ty = this.player.position[1] + (temX*Math.sin(this.angle))+(temY*Math.cos(this.angle));
            let tx =this.startingX + temX*Math.sin(this.angle);
            let ty = this.startingY + temY*Math.cos(this.angle);
            boxes.push({"position":[tx,ty],"size":this.size,"active":0,"moveToken":this.num});   
        }else if (this.frame>this.recover+this.pullback && this.frame>this.hangTime+this.pullback){
            this.activ=false;
        }
        if (this.frame==this.recover+this.pullback){
            this.player.animation="";
            this.player.currAtt=-1;
			this.player.aniInterupt=true;
            this.player.stuck = false;
            console.log("Attack allowed")
        }
        return boxes;
    }
}
var token = function() {
	return (Math.random().toString(36).substr(2)+Math.random().toString(36).substr(2));
};