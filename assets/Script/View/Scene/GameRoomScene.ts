const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { EmChipType, EmBetAreaType, GroupTypeInfo, eRoomState, Game_Room_Max_Coin_Idx, Game_Room_Max_Win_Rate_Idx, Game_Room_Players_Max_Count } from '../../Define/GamePlayDefine';
import { CardsInfo, WinInfo, ResultMessegeInfo, BetMessageInfo, UpdateBankerMessageInfo } from '../../Define/GameMessegeDefine';
import ClientEventDefine from '../../Define/ClientEventDefine';

import GameController from '../../Controller/GamePlay/GameController';

import GameRoomLogic from '../../Logic/GamePlay/GameRoomLogic';

import RoomData from '../../Data/GamePlay/RoomData';
import UserData, { UserInfo } from '../../Data/UserData';
import BankerData from '../../Data/GamePlay/BankerData';

import { coinToChipType, betPoolToBetAreaType, goldenTypeToGroupType } from '../../Utils/GamePlay/GameUtils';

import SceneManager, { EmSceneID } from '../../Manager/CommonManager/SceneManager';
import PrefabManager, { EmPrefabEnum } from '../../Manager/CommonManager/PrefabManager';
import RoomDataManger from '../../Manager/DataManager/GamePlayDataManger/RoomDataManger';
import BankerDataManager from '../../Manager/DataManager/GamePlayDataManger/BankerDataManager';

import CardsContainer from '../Layer/GamePlay/CardsContainer';
import ChipSelectLayer from '../Layer/GamePlay/ChipSelectLayer';
import ChipsLayer from '../Layer/GamePlay/ChipsLayer';
import PlayerRootLayer from '../Layer/GamePlay/PlayerRootLayer';
import GameRoomAnimRootLayer from '../Layer/GamePlay/GameRoomAnimRootLayer';
import BetPoolInfoLayer from '../Layer/GamePlay/BetPoolInfoLayer';
import BankerRootLayer from '../Layer/GamePlay/BankerRootLayer';

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

    @property(BetPoolInfoLayer)
    m_betPoolInfoLayer: BetPoolInfoLayer = null;
    
    @property(BankerRootLayer)
    m_bankerRootLayer: BankerRootLayer = null;

    onDestroy() {
        this._unregistEvents();
        GameRoomLogic.getInstance().unsetCurView();
        GameController.getInstance().unsetCurView();
    }

    onLoad() {
        this._registEvents();
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
        this._updatebankerRootInfo();
        this._updateCountDown();
        this._showWaitNextGame();
        this._updatePoolInfo();

        this.updateContainer();

        this.updatePlayersView();
    }

    onGameStart() {
        this.clearAllAnim();

        this.clearBetPoolInfo();

        this.m_animRootLayer.startCountDown();

        this.m_animRootLayer.hideWatiNextGame();

        this.m_animRootLayer.playGameStartEffect();
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
    getCurChipType(): EmChipType {
        return this.m_chipSelectLayer.getCurChipType();
    }

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

        this.m_betPoolInfoLayer.addPoolChip(jsMsg.coin, areaType);

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

    onUpdateBanker() {
        this._updatebankerRootInfo();
        this.m_bankerRootLayer.updateBankerInfo();
    }

    distributeCards() {
        _.forEach(this.m_containers, (container: CardsContainer) => {
            container && container.distributeCards();
        });
    }

    flipCards(resultMessegeInfo: ResultMessegeInfo) {
        let redCardsInfo: CardsInfo = resultMessegeInfo.red;
        let blackCardsInfo: CardsInfo = resultMessegeInfo.black;
        _.forEach(this.m_containers, (container: CardsContainer, idx: number) => {
            let targetInfo: CardsInfo = idx == 0 ? redCardsInfo : blackCardsInfo;
            let cards: number[] = targetInfo.cards;
            let groupInfo: GroupTypeInfo = new GroupTypeInfo(goldenTypeToGroupType(targetInfo.T), targetInfo.V);

            container && container.setCards(cards);
            container && container.flipCards();

            container && container.setCardType(groupInfo);
        });
    }

    playChipMoveAnim(ResultMessegeInfo: ResultMessegeInfo) {
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

    playPlayerResultAnim(resultMessegeInfo: ResultMessegeInfo) {
        let winInfos: WinInfo[] = resultMessegeInfo.result;
        if (winInfos && winInfos.length > 0) {
            _.forEach(winInfos, (info: WinInfo) => {
                let playerItem = this.m_playerRootLayer.getPlayerItem(info.idx);

                playerItem.refreshViewByServerIdx();

                playerItem.playResultAnim(info.offset);
            })
        }

        let selfOffset: number = resultMessegeInfo.selfOffset;
        if (selfOffset != 0) {
            let playerItem: PlayerItem = this.m_playerRootLayer.getPlayerItem(0);

            playerItem.refreshViewBySelfData();

            playerItem.playResultAnim(selfOffset);
        }

        let bestBetOffset: number = resultMessegeInfo.bestBetOffset;
        if (bestBetOffset != 0) {
            let playerItem: PlayerItem = this.m_playerRootLayer.getPlayerItem(Game_Room_Max_Win_Rate_Idx);

            playerItem.refreshViewByMaxWinRateInfo();

            playerItem.playResultAnim(bestBetOffset);
        }

        let richestOffset: number = resultMessegeInfo.richestOffset;
        if (richestOffset != 0) {
            let playerItem: PlayerItem = this.m_playerRootLayer.getPlayerItem(Game_Room_Max_Coin_Idx);

            playerItem.refreshViewByMaxCoinInfo();

            playerItem.playResultAnim(richestOffset);
        }
    }

    clearBetPoolInfo() {
        this.m_betPoolInfoLayer.reset();
    }

    playResultAnim(resultMessegeInfo: ResultMessegeInfo) {
        this.m_animRootLayer.playResultAnim(resultMessegeInfo);
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

    private _registEvents() {
        this._unregistEvents();
        cc.systemEvent.on(ClientEventDefine.CUSTOM_EVENT_BANKER_LIST_GET, this._updatebankerRootInfo, this);
        cc.systemEvent.on(ClientEventDefine.CUSTOM_EVENT_PLAYER_DATA_REQ_FINISHED, this._updatebankerRootInfo, this);
    }

    private _unregistEvents() {
        cc.systemEvent.targetOff(this);
    }

    private _updatebankerRootInfo() {
        let userData: UserInfo = UserData.getInstance().getUserData();

        let roomData: RoomData = RoomDataManger.getInstance().getRoomData();

        if (userData.uid == roomData.bankerID) {
            this.m_bankerRootLayer.showApplyQuitBankerButton();
        }
        else {
            let bankerList: BankerData[] = BankerDataManager.getInstance().getBankerList();
            let idx = _.findIndex(bankerList, (banker: BankerData) => {
                return userData.uid == banker.uid;
            });

            if (idx == -1) {
                this.m_bankerRootLayer.showApplyBanker();
            }
            else {
                this.m_bankerRootLayer.showCancelApplyBankerButton();
            }
        }
    }

    private _updateCountDown() {
        this.m_animRootLayer.updateCountDown();
    }

    private _showWaitNextGame() {
        this.m_animRootLayer.showWaitNextGame();
    }

    private _updatePoolInfo() {
        let roomInfo: RoomData = RoomDataManger.getInstance().getRoomData();

        this.m_betPoolInfoLayer.setPoolInfos(roomInfo.vBetPool);
    }
}
