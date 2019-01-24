import * as Socket from './socket/Socket';
import InputSampler from './InputSampler';
import Player from './Player';

const {ccclass, property} = cc._decorator;

@ccclass
export default class MainScene extends cc.Component {
    @property(cc.Node)
    startBtn: cc.Node = null;

    @property(cc.Prefab)
    playerPF: cc.Prefab = null;

    clientCurFrame: number = 0;
    nextKeyFrame: number = 0;
    curUpdateData: Socket.IUpdate = null;
    inputSampler: InputSampler = null;

    playersScripts: Player[] = [];

    ready = false;
    onLoad() {
        Socket.connect();
        this.inputSampler = this.node.getComponent(InputSampler);
    }

    startGame() {
        this.startBtn.active = false;
        Socket.setOnGameReadyCallback(this.onAllClientsReady.bind(this));
        Socket.startGame();
    }   

    onAllClientsReady(allClientsIDs) {
        cc.log(allClientsIDs);
        allClientsIDs.forEach( id => {
            let playerNode = cc.instantiate(this.playerPF);
            let playerScript = playerNode.getComponent(Player);
            playerScript.init(id);
            this.playersScripts.push(playerScript);
            this.node.addChild(playerNode);
        });

        this.ready = true;
    }

    update(dt) {
        if (!this.ready) {
            return;
        }

        if (this.clientCurFrame == this.nextKeyFrame) {
            let updateData = Socket.getUpdateDataByKeyFrameIdx(this.clientCurFrame);

            if (updateData) {
                this.nextKeyFrame = updateData.nextFrame;
                this.curUpdateData = updateData;

                this.inputSampler.sendSampleData(this.curUpdateData.curFrame);
                this.playersScripts.forEach(playerScript => {
                    playerScript.setInputData(updateData);
                });
                this.useUpdateDataToRender();
            }
        } else {
            this.useUpdateDataToRender();
        }
    }

    useUpdateDataToRender() {
        this.clientCurFrame++;
        this.playersScripts.forEach(playerScript => {
            playerScript.render();
        });
    }
}
