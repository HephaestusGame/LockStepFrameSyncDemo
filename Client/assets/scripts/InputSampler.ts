import * as Socket from './socket/Socket';

const {ccclass, property} = cc._decorator;


export const UP = 1 << 3;
export const DOWN = 1 << 2;
export const LEFT = 1 << 1;
export const RIGHT = 1;
export const TOP_LEFT = UP + LEFT;
export const TOP_RIGHT = UP + RIGHT;
export const BOTTOM_LEFT = DOWN + LEFT;
export const BOTTOM_RIGHT = DOWN + RIGHT;

const DIRECTION_ARR = [UP,DOWN, LEFT, RIGHT, TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT];
@ccclass
export default class InputSampler extends cc.Component {
    inputState: number = 0;
    recordState: number = 0;

    onLoad() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown.bind(this));
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp.bind(this));
    }
    
    sendSampleData(keyFrame: number) {
        if (DIRECTION_ARR.indexOf(this.recordState) == -1) {
            Socket.sendClientInput({
                curFrame: keyFrame,
                input: 0
            });
        } else {
            Socket.sendClientInput({
                curFrame: keyFrame,
                input: this.recordState
            });
        }
    }

    onKeyDown(event) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                this.recordState = this.recordState | LEFT;
                break;
            case cc.macro.KEY.d:
                this.recordState = this.recordState | RIGHT;
                break;
            case cc.macro.KEY.w:
                this.recordState = this.recordState | UP;
                break;
            case cc.macro.KEY.s:
                this.recordState = this.recordState | DOWN;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                this.recordState = this.recordState & (~LEFT);
                break;
            case cc.macro.KEY.d:
                this.recordState = this.recordState & (~RIGHT);
                break;
            case cc.macro.KEY.w:
                this.recordState = this.recordState & (~UP);
                break;
            case cc.macro.KEY.s:
                this.recordState = this.recordState & (~DOWN);
                break;
        }
    }
}
