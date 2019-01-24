//LockStepServer

const io = require('socket.io')(7777);
let frameCache = [];
let curKeyFrameIdx = 0;

const FRAMES_IN_KEYFRAME = 1;

let allClientIDs = [];
let readyClients = [];
let startGameIfAllClientReady = () => {
	if (readyClients.length == allClientIDs.length) {
		let update = {
			curFrame: 0,
			nextFrame: FRAMES_IN_KEYFRAME,
			inputs: {}
		}
		allClientIDs.forEach(id => {
			update.inputs[id] = 0;
		});
		io.sockets.emit('game-ready', allClientIDs);
		io.sockets.emit('server-frame', update);
	}
}

//Update: {curFrame: number, nextFrame: number, ClientInput...}
let update = {
	curFrame: curKeyFrameIdx,
	nextFrame: curKeyFrameIdx + FRAMES_IN_KEYFRAME,
	inputs: {}
}
let frameReadyClients = [];
let checkFrameReady = () => {
	console.log('checkFrameReady:\n' + JSON.stringify(allClientIDs) + " frameReadyClients:" + JSON.stringify(frameReadyClients));
	if (frameReadyClients.length == allClientIDs.length) {
		frameCache.push(update);
		curKeyFrameIdx += FRAMES_IN_KEYFRAME;
		update.curFrame = curKeyFrameIdx;
		update.nextFrame = curKeyFrameIdx + FRAMES_IN_KEYFRAME;
		io.sockets.emit('server-frame', update);
		console.log('send server-frame:');
		console.log(JSON.stringify(update));
		update.inputs = {};
		frameReadyClients = [];
	}
}

io.on('connection', function(socket){
	console.log('server get a client connection:' + socket.id);
	allClientIDs.push(socket.id);

	socket.on('start-game', function() {
		if (readyClients.indexOf(socket.id) == -1) {
			readyClients.push(socket.id);
			socket.emit('client-ready');
		}
		startGameIfAllClientReady();
	});


	/** 
	clientCtrl: {curFrame: number, input: number}
	*/
	socket.on('client-input', function(ctrl) {
		console.log('get client input');
		if (frameReadyClients.indexOf(socket.id) == -1 && ctrl.curFrame == curKeyFrameIdx) {
			frameReadyClients.push(socket.id);
			update.inputs[socket.id] = ctrl.input;
			console.log(JSON.stringify(ctrl));
			checkFrameReady();
		}
	});


	socket.on('disconnect', function() {
		console.log('a client disconnect from server');
		allClientIDs.splice(allClientIDs.indexOf(socket.id), 1);
		readyClients.splice(readyClients.indexOf(socket.id), 1);
		frameReadyClients.splice(frameReadyClients.indexOf(socket.id), 1);
		curKeyFrameIdx = 0;
	});
});
