import * as Socket from './socket/Socket';
import { IUpdate, IInput } from "./socket/Socket";
import { UP, DOWN, LEFT, RIGHT, TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT } from './InputSampler';

const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {
    id: string = null;
    velocity: cc.Vec2 = cc.v2(0);
    speed: number = 10;

    init(id) {
        if (id != Socket.getUserID()) {
            this.node.color = cc.color(255, 0, 0);
        }

        this.id = id;
    }

    setInputData(update: IUpdate) {
        let input = update.inputs[this.id];
        switch (input) {
            case UP:
                this.velocity = cc.v2(0, 1);
                break;
            case DOWN:
                this.velocity = cc.v2(0, -1);
                break;
            case LEFT:
                this.velocity = cc.v2(-1, 0);
                break;
            case RIGHT:
                this.velocity = cc.v2(1, 0);
                break;
            case TOP_LEFT:
                this.velocity = cc.v2(-0.5, 0.5);
                break;
            case TOP_RIGHT:
                this.velocity = cc.v2(0.5, 0.5);
                break;
            case BOTTOM_LEFT:
                this.velocity = cc.v2(-0.5, -0.5);
                break;
            case BOTTOM_RIGHT:
                this.velocity = cc.v2(0.5, -0.5);
                break;
            default:
                this.velocity = cc.v2(0);
        }

        this.velocity.x *= this.speed;
        this.velocity.y *= this.speed;
    }

    render() {
        this.node.position = this.node.position.addSelf(this.velocity);
    }
}