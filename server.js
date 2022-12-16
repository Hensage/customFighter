// JavaScript Document
const tls = require('tls');
tls.DEFAULT_MAX_VERSION = 'TLSv1.2';
const express = require('express');
const { PassThrough } = require('stream');
const e = require('express');
var username;
var fs = require('fs');
const { time } = require('console');
const { response } = require('express');
var app = express();
const http = require('http').Server(app);
//var https = require('https');
var privateKey  = fs.readFileSync('sslcert/domain.key', 'utf8');
var certificate = fs.readFileSync('sslcert/domain.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
//var httpsServer = https.Server(credentials, app);
const io = require('socket.io')(http);

app.use(express.static('static'));
app.use(express.json());
const router = express.Router();
app.use('/', router);
var savedResponse;
router.get('/', (req, res) => {
	res.sendFile(__dirname + '/templates/board.html'); //Serves the file
});

var user = require("./myMods/user");
var match = require("./myMods/match");
var users = [];
var matches = [new match(io)];

io.on('connection', (socket) => { //WHEN PLAYER JOINS
	let temp = new user(socket);
	for (let i=0;i<matches.length;i++){
		if (!matches[i].isFull()){
			if (matches[i].addPlayer(temp)){
				console.log("ADDED")
				users.push(temp);
				break;
			}
		}
	}
	socket.on('disconnect', function() { //WHEN PLAYER DISCONNECTS
		var p = users.filter(obj => {
			return obj.sock.id === socket.id
	  	});
		if (p[0].dropMatch()){
			console.log("Player deleted")
			users.splice(users.indexOf(p[0]),1);
		}else{
			console.log("ERROR")
		}
	});
	socket.on('buttonPress',(d,b)=>{
		var p = users.filter(obj => {
			return obj.sock.id === socket.id
	  	});
		//console.log(users);
		p[0].setInputs(d,b);

	});
});


var token = function() {
	return (Math.random().toString(36).substr(2)+Math.random().toString(36).substr(2));
};

function shuffle(array) {
	let currentIndex = array.length,  randomIndex;
  
	// While there remain elements to shuffle.
	while (currentIndex != 0) {
  
	  // Pick a remaining element.
	  randomIndex = Math.floor(Math.random() * currentIndex);
	  currentIndex--;
	  
	  // And swap it with the current element.
	  [array[currentIndex], array[randomIndex]] = [
		array[randomIndex], array[currentIndex]];
	}
  
	return array;
  }
function SyncEmit(sock,event, data) {
	io.to(sock.id).emit(event,data)
	return new Promise((resolve, reject) => {
		sock.once(event+"R", (values) => {
			//console.log(values);
			resolve(values);
		});
	});
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//setInterval(update,100);
//Just network code. You can ignore.
http.listen(80, () => {
	console.log('listening on *:80');
  });