const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { EmChipType, EmBetAreaType, GroupTypeInfo, eRoomState, Game_Room_Max_Coin_Idx, Game_Room_Max_Win_Rate_Idx, Game_Room_Players_Max_Count } from '../../Define/GamePlayDefine';
import { CardsInfo, WinInfo, ResultMessegeInfo, BetMessageInfo } from '../../Define/GameMessegeDefine';

import GameController from '../../Controller/GamePlay/GameController';

import GameRoomLogic from '../../Logic/GamePlay/GameRoomLogic';

import RoomData from '../../Data/GamePlay/RoomData';
import UserData, { UserInfo } from '../../Data/UserData';

import { coinToChipType, betPoolToBetAreaType, goldenTypeToGroupType, judgeSpecialType } from '../../Utils/GamePlay/GameUtils';

import SceneManager, { EmSceneID } from '../../Manager/CommonManager/SceneManager';
import PrefabManager, { EmPrefabEnum } from '../../Manager/CommonManager/PrefabManager';
import RoomDataManger from '../../Manager/DataManager/GamePlayDataManger/RoomDataManger';

import CardsContainer from '../Layer/GamePlay/CardsContainer';
import ChipSelectLayer from '../Layer/GamePlay/ChipSelectLayer';
import ChipsLayer from '../Layer/GamePlay/ChipsLayer';
import PlayerRootLayer from '../Layer/GamePlay/PlayerRootLayer';
import GameRoomAnimRootLayer from '../Layer/GamePlay/GameRoomAnimRootLayer';

import PlayerItem from '../Layer/GamePlay/PlayerItem';

@ccclass
export default class GameRoomScene extends cc.Component {

    @property(CardsContainer)
    m_containers: CardsContainer[] = [];

    @property(ChipsLayer)
    m_chipsLayer: ChipsLayer = null;

    @property(ChipSelectLayer)
    m_chipSelectLayer: ChipSelectLayer = null;

    @property(PlayerRootLayer)
    m_playerRootLayer: PlayerRootLayer = null;

    @property(GameRoomAnimRootLayer)
    m_animRootLayer: GameRoomAnimRootLayer = null;

    onDestroy() {
        GameRoomLogic.getInstance().unsetCurView();
        GameController.getInstance().unsetCurView();
    }

    onLoad() {
        GameRoomLogic.getInstance().setCurView(this);
        GameController.getInstance().setCurView(this);
    }

    start() {
        this.refresh();
    }

    refresh() {
        this.updateRoomView();
    }

    updateRoomView() {
        this._updateCountDown();
        this._showWaitNextGame();

        this.updateContainer();

        this.updatePlayersView();
    }

    onGameStart() {
        this.clearAllAnim();

        this.m_animRootLayer.startCountDown();

        this.m_animRootLayer.hideWatiNextGame();
    }

    onGameResult(jsMsg: ResultMessegeInfo) {
        this.m_animRootLayer.stopCountDown();
        this.playResultAnim(jsMsg);
    }

    clearAllAnim() {
        this.m_playerRootLayer.clearAllAnim();
    }

    //callback
    onTendencyChartClick() {
        PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_TendencyChart);
    }

    onBackClick() {
        GameRoomLogic.getInstance().requestLeaveRoom();
    }

    //interface
    exitGame() {
        SceneManager.getInstance().changeScene(EmSceneID.SceneID_MainScene);
    }

    onGetRoomInfo() {
        // cc.log('wd debug onGetRoomInfo roomdata =', RoomDataManger.getInstance().getRoomData());
    }

    onRoomBet(jsMsg: BetMessageInfo) {
        let clientIdx: number = jsMsg.idx;
        let chipType: EmChipType = coinToChipType(jsMsg.coin);
        let areaType: EmBetAreaType = betPoolToBetAreaType(jsMsg.poolType);

        let msgUid = jsMsg.uid;

        let userData: UserInfo = UserData.getInstance().getUserData();

        let roomdata: RoomData = RoomDataManger.getInstance().getRoomData();
        if (msgUid == roomdata.bestBetUID) {
            clientIdx = Game_Room_Max_Win_Rate_Idx;
        }

        if (msgUid == roomdata.richestUID) {
            clientIdx = Game_Room_Max_Coin_Idx;
        }

        if (userData.uid == msgUid) {
            clientIdx = 0;
        }

        this.m_playerRootLayer.updateAllPlayerDatas();

        this.m_chipsLayer.playChipMoveFromHeadToPoolAction(clientIdx, chipType, areaType);
    }

    distributeCards() {
        _.forEach(this.m_containers, (container: CardsContainer) => {
            container && container.distributeCards();
        });
    }

    flipCards(redCardsInfo: CardsInfo, blackCardsInfo: CardsInfo) {
        _.forEach(this.m_containers, (container: CardsContainer, idx: number) => {
            let targetInfo: CardsInfo = idx == 0 ? redCardsInfo : blackCardsInfo;
            let cards: number[] = targetInfo.cards;
            let groupInfo: GroupTypeInfo = new GroupTypeInfo(goldenTypeToGroupType(targetInfo.T), targetInfo.V);

            container && container.setCards(cards);
            container && container.flipCards();

            container && container.setCardType(groupInfo);
        });
    }

    getCurChipType(): EmChipType {
        return this.m_chipSelectLayer.getCurChipType();
    }


    playResultAnim(ResultMessegeInfo: ResultMessegeInfo) {
        this._playPoolHighLightAnim(ResultMessegeInfo);
        this._playChipMoveAnim(ResultMessegeInfo);
        this._playPlayerResultAnim(ResultMessegeInfo);
    }

    getPlayerHeadWorldPos(clientIdx: number): cc.Vec2 {
        return this.m_playerRootLayer.getPlayerHeadWorldPos(clientIdx);
    }

    updateContainer() {
        let roomInfo: RoomData = RoomDataManger.getInstance().getRoomData();

        let state: eRoomState = roomInfo.state;
        if (state == eRoomState.eRoomState_StartGame) {
            this.distributeCards();
        }
    }

    updatePlayersView() {
        this.m_playerRootLayer.updateAllPlayerDatas();
    }

    updatePlayerData(serverIdx: number) {
        // let clientIdx: number = TableDataManager.getInstance().svrIdxToClientIdx(serverIdx);

        this.m_playerRootLayer.refreshPlayerItem(serverIdx);
    }

    onPlayerStandUp(serverIdx: number) {
        // let clientIdx: number = TableDataManager.getInstance().svrIdxToClientIdx(serverIdx);

        this.m_playerRootLayer.refreshPlayerItem(serverIdx);
    }

    private _playPoolHighLightAnim(resultMessegeInfo: ResultMessegeInfo) {
        let type: EmBetAreaType = resultMessegeInfo.isRedWin ? EmBetAreaType.Type_Red : EmBetAreaType.Type_Black;

        this.m_animRootLayer.playBetAreaWinAnim(type);

        let targetCardsInfo: CardsInfo = resultMessegeInfo.isRedWin ? resultMessegeInfo.red : resultMessegeInfo.black;

        let groupInfo: GroupTypeInfo = new GroupTypeInfo(goldenTypeToGroupType(targetCardsInfo.T), targetCardsInfo.V);
        if (judgeSpecialType(groupInfo)) {
            this.m_animRootLayer.playBetAreaWinAnim(EmBetAreaType.Type_Special);
        }
    }

    private _playChipMoveAnim(ResultMessegeInfo: ResultMessegeInfo) {
        let idxList: number[] = [Game_Room_Players_Max_Count];

        if (ResultMessegeInfo.bestBetOffset && ResultMessegeInfo.bestBetOffset > 0) {
            idxList.push(Game_Room_Max_Win_Rate_Idx);
        }

        if (ResultMessegeInfo.richestOffset && ResultMessegeInfo.richestOffset > 0) {
            idxList.push(Game_Room_Max_Coin_Idx);
        }

        if (ResultMessegeInfo.result && ResultMessegeInfo.result.length > 0) {
            _.forEach(ResultMessegeInfo.result, (info: WinInfo) => {
                idxList.push(info.idx);
            });
        }

        this.m_chipsLayer.playChipMoveFromPoolToPlayerAction(EmBetAreaType.Type_Red, idxList);
        this.m_chipsLayer.playChipMoveFromPoolToPlayerAction(EmBetAreaType.Type_Black, idxList);
        this.m_chipsLayer.playChipMoveFromPoolToPlayerAction(EmBetAreaType.Type_Special, idxList);
    }

    private _playPlayerResultAnim(resultMessegeInfo: ResultMessegeInfo) {
        let winInfos: WinInfo[] = resultMessegeInfo.result;
        if (winInfos && winInfos.length > 0) {
            _.forEach(winInfos, (info: WinInfo) => {
                let playerItem = this.m_playerRootLayer.getPlayerItem(info.idx);

                playerItem.refreshViewByServerIdx();

                playerItem.setResult(info.offset);
            })
        }

        let selfOffset: number = resultMessegeInfo.selfOffset;
        if (selfOffset != 0) {
            let playerItem: PlayerItem = this.m_playerRootLayer.getPlayerItem(0);

            playerItem.refreshViewBySelfData();

            playerItem.setResult(selfOffset);
        }

        let bestBetOffset: number = resultMessegeInfo.bestBetOffset;
        if (bestBetOffset != 0) {
            let playerItem: PlayerItem = this.m_playerRootLayer.getPlayerItem(Game_Room_Max_Win_Rate_Idx);

            playerItem.refreshViewByMaxWinRateInfo();

            playerItem.setResult(bestBetOffset);
        }

        let richestOffset: number = resultMessegeInfo.richestOffset;
        if (richestOffset != 0) {
            let playerItem: PlayerItem = this.m_playerRootLayer.getPlayerItem(Game_Room_Max_Coin_Idx);

            playerItem.refreshViewByMaxCoinInfo();

            playerItem.setResult(richestOffset);
        }
    }

    private _updateCountDown() {
        this.m_animRootLayer.updateCountDown();
    }

    private _showWaitNextGame() {
        this.m_animRootLayer.showWaitNextGame();
    }
}
