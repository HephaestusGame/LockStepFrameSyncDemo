let io = require('socket.io-client');

export interface IInput {
    up: boolean,
    down: boolean,
    left: boolean,
    right: boolean
}

export interface IUpdate {
    curFrame: number,
    nextFrame: number,
    inputs: {[id: string]: number}
}

let socket = null;
let _close = false;

let gameReadyCallback = null;

export function setOnGameReadyCallback(callback) {
     gameReadyCallback = callback;
}

let frameData: {[frameIdx: number]: IUpdate} = {};
export function connect() {
    socket = io('http://localhost:7777');
    socket.on('connect', function() {
        cc.log('client connected!');
        socket.on('frame', function(msg) {
            console.log("Client get server frame:" + msg);
        });
    
        socket.on('client-ready',function() {
            console.log('client ' + socket.id + ' ready!');
        });
    
        socket.on('game-ready', function(allClientIDs) {
            if (gameReadyCallback) {
                gameReadyCallback(allClientIDs);
            }
        });
    
        socket.on('server-frame', function(update: IUpdate) {
            cc.log('get server-frame:');
            cc.log(JSON.stringify(update));
            frameData[update.curFrame] = update;
        });
    });
}



export function startGame() {
    socket.emit('start-game');
}

export function getUpdateDataByKeyFrameIdx(idx: number) {
    return frameData[idx];
}

export interface IClientCtrl {
    curFrame: number,
    input: number
}
export function sendClientInput(ctrl: IClientCtrl) {
    if (_close) {
        return;
    }
    cc.log("send sample data: " + JSON.stringify(ctrl));
    socket.emit('client-input', ctrl);
}

export function getUserID() {
    return socket.id;
}

export function close() {
    _close = true;
}

export function open() {
    _close = false;
}