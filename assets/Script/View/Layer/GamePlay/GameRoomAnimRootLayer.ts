const { ccclass, property } = cc._decorator;

import { eRoomState, Game_Bet_Time, EmBetAreaType, GamePlayAnimKeyMap, GroupTypeInfo } from '../../../Define/GamePlayDefine';
import { ResultMessegeInfo, CardsInfo } from '../../../Define/GameMessegeDefine';

import { judgeSpecialType, goldenTypeToGroupType } from '../../../Utils/GamePlay/GameUtils';

import RoomData from '../../../Data/GamePlay/RoomData';

import RoomDataManger from '../../../Manager/DataManager/GamePlayDataManger/RoomDataManger';
import PrefabManager, { EmPrefabEnum } from '../../../Manager/CommonManager/PrefabManager';
import AnimationPlayManager, { Anim } from '../../../Manager/CommonManager/AnimationPlayManager';

import GameRoomScene from '../../Scene/GameRoomScene';

@ccclass
export default class GameRoomAnimRootLayer extends cc.Component {

    @property(GameRoomScene)
    m_gameRoomScene: GameRoomScene = null;

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

    stopAllAnim() {
        AnimationPlayManager.getInstance().stopPlay();
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
        if (this.m_betAreaFrames == null || this.m_betAreaContentNodes) {
            return;
        }

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

    showStartBetEffect() {
        PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_EffectStartBet, [], this.node);
    }

    showStopBetEffect() {
        PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_EffectStopBet, [], this.node);
    }

    showVSEffect() {
        PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_EffectVS, [], this.node);
    }

    showStarEffect(type: EmBetAreaType) {
        let idx: number = this._getIdx(type);

        let contentNode: cc.Node = this.m_betAreaContentNodes[idx];
        let pos = contentNode.getPosition();

        if (type != EmBetAreaType.Type_Special) {
            PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_EffectStar, [pos], this.node);
        }
        else {
            let starPosLeft: cc.Vec2 = new cc.Vec2(-200, pos.y);
            let starPosRight: cc.Vec2 = new cc.Vec2(200, pos.y);

            PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_EffectStar, [starPosLeft], this.node);
            PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_EffectStar, [starPosRight], this.node);
        }

    }

    playPoolHighLightAnim(resultMessegeInfo: ResultMessegeInfo) {
        let type: EmBetAreaType = resultMessegeInfo.isRedWin ? EmBetAreaType.Type_Red : EmBetAreaType.Type_Black;

        this.playBetAreaWinAnim(type);
        this.showStarEffect(type);

        let targetCardsInfo: CardsInfo = resultMessegeInfo.isRedWin ? resultMessegeInfo.red : resultMessegeInfo.black;

        let groupInfo: GroupTypeInfo = new GroupTypeInfo(goldenTypeToGroupType(targetCardsInfo.T), targetCardsInfo.V);
        if (judgeSpecialType(groupInfo)) {
            this.playBetAreaWinAnim(EmBetAreaType.Type_Special);
            this.showStarEffect(EmBetAreaType.Type_Special);
        }
    }

    playGameStartEffect() {
        let vsAim = new Anim(GamePlayAnimKeyMap.Key_VS, this.showVSEffect.bind(this), 1000, null);
        let startBetAnim = new Anim(GamePlayAnimKeyMap.Key_StartBet, this.showStartBetEffect.bind(this), 1000, () => {
            AnimationPlayManager.getInstance().clearAnimList();
        });

        AnimationPlayManager.getInstance().addAnim(vsAim);
        AnimationPlayManager.getInstance().addAnim(startBetAnim);

        AnimationPlayManager.getInstance().startPlay();
    }

    playResultAnim(resultMessegeInfo: ResultMessegeInfo) {
        let stopBetAnim = new Anim(GamePlayAnimKeyMap.Key_StoptBet,
            this.showStopBetEffect.bind(this), 500, null);
        let flipCardAnim = new Anim(GamePlayAnimKeyMap.Key_FlipCards,
            this.m_gameRoomScene.flipCards.bind(this.m_gameRoomScene, resultMessegeInfo), 1500, null);
        let poolWinAnim = new Anim(GamePlayAnimKeyMap.Key_PoolWinAnim,
            this.playPoolHighLightAnim.bind(this, resultMessegeInfo), 2500,
            this.m_gameRoomScene.clearBetPoolInfo.bind(this.m_gameRoomScene));
        let chipMoveAnim = new Anim(GamePlayAnimKeyMap.Key_ChipMoveToHeadAnim,
            this.m_gameRoomScene.playChipMoveAnim.bind(this.m_gameRoomScene, resultMessegeInfo), 1000,
            this.m_gameRoomScene.onUpdateBanker.bind(this.m_gameRoomScene));
        let offsetAnim = new Anim(GamePlayAnimKeyMap.Key_OffsetAnim,
            this.m_gameRoomScene.playPlayerResultAnim.bind(this.m_gameRoomScene, resultMessegeInfo), 1500, () => {
                AnimationPlayManager.getInstance().clearAnimList();
            });

        AnimationPlayManager.getInstance().addAnim(stopBetAnim);
        AnimationPlayManager.getInstance().addAnim(flipCardAnim);
        AnimationPlayManager.getInstance().addAnim(poolWinAnim);
        AnimationPlayManager.getInstance().addAnim(chipMoveAnim);
        AnimationPlayManager.getInstance().addAnim(offsetAnim);

        AnimationPlayManager.getInstance().startPlay();
    }

    private _getIdx(type: EmBetAreaType): number {
        let ret: number = 0;
        switch (type) {
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
