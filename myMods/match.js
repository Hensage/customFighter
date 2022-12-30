
module.exports = class match{
	constructor(sock){
		this.sock = sock;
		this.startTime = new Date();
		this.gameState = 0;
		this.players = [];
		this.stage = [[0,500,600,550]];
		this.frame();
	}
	getUsersCount(){
		let i = 0;
		for (let z=0;z<this.players.length;i++){
			if (this.players[z]!=0){
				i++
			}
		}
		return i;
	}
	isFull(){
		return this.players.length==2;
	}
	addPlayer(p){
		p.enterMatch(this);
		this.players.push(p);
		return true;
	}
	remPlayer(p){
		console.log("YO")
		for (let z=0;z<this.players.length;z++){
			if (this.players[z]==p){
				this.players.splice(z,1);
				return true;
			}
		}
		return false;
	}
	frame(){
		let pPos = [];
		let boxes = [];
		for (let i=0;i<this.players.length;i++){
			this.players[i].move(this.stage);
			pPos.push([this.players[i].position,this.players[i].facing,this.players[i].percentage,this.players[i].velocity]);
			for (let z =this.players[i].hitboxes.length-1;z>=0;z--){
				let temp = this.players[i].hitboxes[z];
				temp["player"] = {"num":i,"position":this.players[i].position};
				for (let target=0;target<this.players.length;target++){
					if (target!=i){
						if (this.players[target].isHit(temp,this.players[i].attacks[temp.moveToken])){
							temp['hit']=true;
						}
					}
				}
				boxes.push(temp);
			}
		}
		this.sock.emit('update',pPos,boxes,this.stage);
		setTimeout(this.frame.bind(this),20);
	}
}