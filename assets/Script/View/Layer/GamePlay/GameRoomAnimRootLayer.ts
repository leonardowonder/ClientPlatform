const { ccclass, property } = cc._decorator;

import { eRoomState, Game_Bet_Time, EmBetAreaType } from '../../../Define/GamePlayDefine';

import RoomData from '../../../Data/GamePlay/RoomData';

import RoomDataManger from '../../../Manager/DataManager/GamePlayDataManger/RoomDataManger';
import PrefabManager, { EmPrefabEnum } from '../../../Manager/CommonManager/PrefabManager';

@ccclass
export default class GameRoomAnimRootLayer extends cc.Component {

    @property(cc.Vec2)
    m_countDownPos: cc.Vec2 = new cc.Vec2(0, 0);

    @property(cc.Node)
    m_betAreaFrames: cc.Node[] = [];
    
    @property(cc.Node)
    m_betAreaContentNodes: cc.Node[] = [];

    @property(cc.Color)
    m_winColor = new cc.Color();
    @property(cc.Color)
    m_normalColor = new cc.Color();

    startCountDown() {
        PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_GameRoomCountDownLayer, [Game_Bet_Time, this.m_countDownPos], this.node);
    }

    stopCountDown() {
        PrefabManager.getInstance().hidePrefab(EmPrefabEnum.Prefab_GameRoomCountDownLayer, [], this.node);
    }

    updateCountDown() {
        let roomInfo: RoomData = RoomDataManger.getInstance().getRoomData();

        let state: eRoomState = roomInfo.state;
        if (state == eRoomState.eRoomState_StartGame) {
            let time: number = roomInfo.stateTime;

            PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_GameRoomCountDownLayer, [time, this.m_countDownPos], this.node);
        }
        else {
            PrefabManager.getInstance().hidePrefab(EmPrefabEnum.Prefab_GameRoomCountDownLayer, [], this.node);
        }
    }

    showWaitNextGame() {
        let roomInfo: RoomData = RoomDataManger.getInstance().getRoomData();

        let state: eRoomState = roomInfo.state;
        if (state == eRoomState.eRoomState_GameEnd) {
            PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_WaitNextGameLayer, [], this.node);
        }
    }

    hideWatiNextGame() {
        PrefabManager.getInstance().hidePrefab(EmPrefabEnum.Prefab_WaitNextGameLayer, [], this.node);
    }

    playBetAreaWinAnim(type: EmBetAreaType) {
        let idx: number = this._getIdx(type);

        let targetFramNode: cc.Node = this.m_betAreaFrames[idx];
        let contentNode: cc.Node = this.m_betAreaContentNodes[idx];

        targetFramNode.runAction(cc.sequence(
            cc.fadeIn(0.5),
            cc.fadeOut(0.5)
        ));

        contentNode.runAction(cc.sequence(
            cc.callFunc(
                () => {
                    contentNode.color = this.m_winColor;
                }
            ),
            cc.delayTime(1),
            cc.callFunc(
                () => {
                    contentNode.color = this.m_normalColor;
                }
            )
        ));
    }

    private _getIdx(type: EmBetAreaType): number {
        let ret: number = 0;
        switch(type) {
            case EmBetAreaType.Type_Red: {
                ret = 0;
                break;
            }
            case EmBetAreaType.Type_Black: {
                ret = 1;
                break;
            }
            case EmBetAreaType.Type_Special: {
                ret = 2;
                break;
            }
            default: {
                cc.warn(`GameRoomCountDownLayer _getIdx invalid type = ${type}`);
                break;
            }
        }

        return ret;
    }
}
