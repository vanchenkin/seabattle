const config  = require('./config.js');

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

http.listen(config.port);

console.log('SeaBattle server started on :' + config.port);

function getRandom(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shipCellCount() {
	let cnt = 0;
	for(let i of config.ships)
		cnt+=i[0]*i[1];
	return cnt;
}

function makeEmptyArray(){
	let t = [];
	for(let i = 0; i < config.width; i++){
		let tmp = [];
		for(let j = 0; j < config.height; j++)
			tmp.push(config.state.EMPTY);
		t.push(tmp);
	}
	return t;
}

function generateShip(count){
	let ship = [];
	let ix = 0, jx = 0;
	let i = getRandom(0, config.height-1);
	let j = getRandom(0, config.width-1);
	let tmp = [];
	if(i >= count-1) tmp.push(0);
	if(j >= count-1) tmp.push(1);
	if(i <= config.height-count) tmp.push(2);
	if(j <= config.width-count) tmp.push(3);
	let dir = tmp[getRandom(0, tmp.length-1)];
	if(dir == 0){
		ix = -1;
		jx = 0;
	}
	if(dir == 1){
		ix = 0;
		jx = -1;
	}
	if(dir == 2){
		ix = 1;
		jx = 0;
	}
	if(dir == 3){
		ix = 0;
		jx = 1;
	}
	for(let kol = 0; kol < count; kol++){
		ship.push([i,j]);
		i += ix;
		j += jx;
	}
	return ship;
}

function generateRandomField(){
	let field = makeEmptyArray();
	let ships = [];
	let flag = false;
	while(!flag){
		ships = [];
		for(let i of config.ships)
			for(let j = 0; j < i[0]; j++)
				ships.push(generateShip(i[1]));
		let bad = false;
		for(let s1 = 0; s1 < ships.length; s1++)
			for(let s2 = s1+1; s2 < ships.length; s2++)
				for(let i of ships[s1])
					for(let j of ships[s2]){
						if(i == j) bad = true;
						if(i[0] == j[0] && Math.abs(i[1]-j[1]) < 2) bad = true;
						if(i[1] == j[1] && Math.abs(i[0]-j[0]) < 2) bad = true;
						if(i[0] == j[0]-1 && i[1] == j[1]-1) bad = true;
						if(i[0] == j[0]-1 && i[1] == j[1]+1) bad = true;
						if(i[0] == j[0]+1 && i[1] == j[1]-1) bad = true;
						if(i[0] == j[0]+1 && i[1] == j[1]+1) bad = true;
					}
		if(!bad) {
			flag = true;
			for(let i of ships){
				for(let j of i){
					field[j[0]][j[1]] = config.state.SHIP;
				}
			}
		}
	}
	for(let i = 0; i < field.length; i++)
		console.log(JSON.stringify(field[i]));
	console.log();
	return {
		ships: ships,
		field: field,
	};
}

function compare(a1,a2) {
	return JSON.stringify(a1)==JSON.stringify(a2);
}

function makeTurn(id, turn, x,y){
	if(games[id].field[1-turn].field[x][y] == config.state.SHOT || games[id].field[1-turn].field[x][y] == config.state.KILLED)
		io.to(games[id].user[turn]).emit('bad_shot');
	if(games[id].field[1-turn].field[x][y] == config.state.EMPTY){
		games[id].field[1-turn].field[x][y] = config.state.SHOT;
		games[id].turn = 1-games[id].turn;
		io.to(games[id].user[turn]).emit('turn', {
			x: x,
			y: y,
			type: "empty",
		});
		io.to(games[id].user[1-turn]).emit('turn', {
			x: x,
			y: y,
			type: "empty",
		});
	}else if(games[id].field[1-turn].field[x][y] == config.state.SHIP){
		games[id].field[1-turn].field[x][y] = config.state.KILLED;
		let ship = [];
		for(let i of games[id].field[1-turn].ships)
			if(i.find((el) => (compare(el, [x,y]))))
				ship = i;
		let b = true;
		for(let i of ship)
			if(games[id].field[1-turn].field[i[0]][i[1]] != config.state.KILLED)
				b = false;
		if(b){
			for(let i of ship)
				games[id].field[1-turn].field[i[0]][i[1]] = config.state.BLOWN;
			io.to(games[id].user[turn]).emit('turn', {
				ship: ship,
				type: "blown",
			});
			io.to(games[id].user[1-turn]).emit('turn', {
				ship: ship,
				type: "blown",
			});
		}else{
			io.to(games[id].user[turn]).emit('turn', {
				x: x,
				y: y,
				type: "killed",
			});
			io.to(games[id].user[1-turn]).emit('turn', {
				x: x,
				y: y,
				type: "killed",
			});
		}
	}
	let cnt0 = 0, cnt1 = 0;
	for(let i of games[id].field[0].field)
		for(let x of i)
			if(x == config.state.BLOWN)
				cnt0++;
	for(let i of games[id].field[1].field)
		for(let x of i)
			if(x == config.state.BLOWN)
				cnt1++;
	if(cnt0 == shipCellCount()){
		io.to(games[id].user[0]).emit('end', {
			type: 1,
			field: games[id].field[1].field,
		});
		io.to(games[id].user[1]).emit('end', {
			type: 1,
			field: games[id].field[0].field,
		});
	}else if(cnt1 == shipCellCount()){
		io.to(games[id].user[0]).emit('end', {
			type: 0,
			field: games[id].field[1].field,
		});
		io.to(games[id].user[1]).emit('end', {
			type: 0,
			field: games[id].field[0].field,
		});
	}
}

let games = {};
io.on('connection', function(socket) {
	console.log('user connected');
    socket.on('create', function(data) {
    	if(data){

    	}else{
    		if(socket.game_id) return;
	    	let id = getRandom(1000, 9999);
	    	while(games[id])
	    		id = getRandom(1000, 9999);
	        games[id] = {
	        	field: [generateRandomField(), generateRandomField()],
	        	user: [socket.id, null],
	        	turn: 0,
	        };
	        socket.game_id = id;
    	}
        socket.emit('create_response', {
        	'id': socket.game_id,
        	'field': games[socket.game_id].field[0].field,
        	'turn' : games[socket.game_id].turn,
        });
    });
    socket.on('join', function(id) {
    	if(socket.game_id && game[socket.game_id]) return;
    	if(games[id]){
    		socket.game_id = id;
    		games[id].user[1] = socket.id;
    		socket.emit('join_response', {
    			'error': false,
	        	'id': id,
	        	'field': games[id].field[1].field,
	        	'turn' : games[id].turn,
	        });
	        io.to(games[socket.game_id].user[0]).emit('start', { turn: games[socket.game_id].turn, type: 0});
	        io.to(games[socket.game_id].user[1]).emit('start', { turn: games[socket.game_id].turn, type: 1});
    	}else
    		socket.emit('join_response', {
    			'error': true,
	        });
    });
    socket.on('disconnect', function() {
    	if(socket.game_id && games[socket.game_id]){
    		if(socket.id != games[socket.game_id].user[0])
    			io.to(games[socket.game_id].user[0]).emit('canceled');
    		if(socket.id != games[socket.game_id].user[1])
    			io.to(games[socket.game_id].user[1]).emit('canceled');
        	delete games[socket.game_id];
    	}
    });
    socket.on('click', function(data) {
    	if(socket.game_id && games[socket.game_id]){
    		if(games[socket.game_id].user[0] == socket.id && games[socket.game_id].turn == 0){
    			makeTurn(socket.game_id, 0, data.x, data.y);
    		}else if(games[socket.game_id].user[1] == socket.id && games[socket.game_id].turn == 1){
    			makeTurn(socket.game_id, 1, data.x, data.y);
    		}
    	}
    });
});