import Singleton from '../../Utils/Singleton';

import * as _ from 'lodash';

import StateMachine, { Transition, Method } from '../../Utils/StateMachine';

import { EmChipType, EmRecordType, EmCampType, eRoomState, GroupTypeInfo, eBetPool } from '../../Define/GamePlayDefine';
import { CardsInfo, WinInfo, ResultMessegeInfo, BetMessageInfo } from '../../Define/GameMessegeDefine';
import ClientEventDefine from '../../Define/ClientEventDefine';

import { goldenTypeToGroupType } from '../../Utils/GamePlay/GameUtils';

import RoomData, { TypeRecordInfo } from '../../Data/GamePlay/RoomData';

import GameRecordDataManager from '../../Manager/DataManager/GamePlayDataManger/GameRecordDataManager';
import CardDataManager from '../../Manager/DataManager/GamePlayDataManger/CardDataManager';
import RoomDataManger from '../../Manager/DataManager/GamePlayDataManger/RoomDataManger';

import GameRoomScene from '../../View/Scene/GameRoomScene';
import GameRoomData from '../../Data/GamePlay/GameRoomData';
import GamePlayerData from '../../Data/GamePlay/GamePlayerData';
import GamePlayerDataManager from '../../Manager/DataManager/GamePlayDataManger/GamePlayerDataManager';
import UserData, { UserInfo } from '../../Data/UserData';

class GameController extends Singleton {
    private m_gameRoomScene: GameRoomScene = null;

    private m_Basefsm: StateMachine = null;

    init() {
        super.init();

        this.clearAll();

        this.m_Basefsm = new StateMachine(
            'GameStateStart',
            [
                new Transition('Account', ['GameStateStart'], 'GameStateAccount'),
                new Transition('Restart', ['GameStateAccount'], 'GameStateStart')
            ],
            [
                new Method('onAccountFromGameStateStart', function () { cc.log('GameController change state onAccountFromGameStateStart'); }),
                new Method('onRestartFromGameStateAccount', function () { cc.log('GameController change state onRestartFromGameStateAccount'); })
            ]
        );
    }

    getBaseFsm(): StateMachine {
        return this.m_Basefsm;
    }

    clearAll() {
        this.m_gameRoomScene = null;
        this.m_Basefsm = null;
        this.m_gameRoomScene = null;
    }

    setCurView(scene: GameRoomScene) {
        this.m_gameRoomScene = scene;
    }

    unsetCurView() {
        this.clearAll();
    }

    onGetRoomInfo(roomInfo: RoomData) {
        let roomData: RoomData = roomInfo;

        let state: eRoomState = roomData.state;

        if (state == eRoomState.eRoomState_StartGame) {
            this.m_Basefsm && this.m_Basefsm.changeState('Restart');
        }
        else {
            this.m_Basefsm && this.m_Basefsm.changeState('Account');
        }
    }

    onRoomBet(jsMsg: BetMessageInfo) {
        let userData = UserData.getInstance().getUserData();

        let betCoin: number = jsMsg.coin;
        if (userData.uid == jsMsg.uid) {
            userData.coin -= betCoin;
        }

        let roomInfo: RoomData = RoomDataManger.getInstance().getRoomData();
        if (jsMsg.uid == roomInfo.bestBetUID) {
            roomInfo.bestBetCoin -= betCoin;
        }

        if (jsMsg.uid == roomInfo.richestUID) {
            roomInfo.richestCoin -= betCoin;
        }

        let playerData: GamePlayerData = GamePlayerDataManager.getInstance().getPlayerDataByServerIdx(jsMsg.idx);

        if (playerData && playerData.isValid()) {
            playerData.chips -= betCoin;
        }
    }

    //state machine
    onGameStart() {
        this.m_Basefsm.changeState('Restart');

        this.m_gameRoomScene && this.m_gameRoomScene.onGameStart();

        this.distributeCards();
    }

    onGameResult(jsMsg: ResultMessegeInfo) {
        this.m_Basefsm.changeState('Account');

        this._updateWinCardsInfo(jsMsg);

        this._updateChips(jsMsg);

        this.m_gameRoomScene && this.m_gameRoomScene.onGameResult(jsMsg);
    }

    //scene
    distributeCards() {
        this.m_gameRoomScene && this.m_gameRoomScene.distributeCards();
    }

    getCurChipType(): EmChipType {
        let ret: EmChipType = EmChipType.Type_None;
        if (this.m_gameRoomScene) {
            ret = this.m_gameRoomScene.getCurChipType();
        }
        return ret;
    }

    getPlayerHeadWorldPos(clientIdx: number): cc.Vec2 {
        return this.m_gameRoomScene.getPlayerHeadWorldPos(clientIdx);
    }

    private _updateWinCardsInfo(jsMsg: ResultMessegeInfo) {
        let winCardsInfo: CardsInfo = jsMsg.isRedWin ? jsMsg.red : jsMsg.black;

        this._addRecord(jsMsg.isRedWin, winCardsInfo);
        this._addCards(jsMsg.red, jsMsg.black);
    }

    private _updateChips(jsMsg: ResultMessegeInfo) {
        this._updateSpecialPlayerChips(jsMsg);

        this._updateSitPlayerChips(jsMsg);

        this._updateSelfChip(jsMsg);

        this._updateBankerChip(jsMsg);
    }

    private _updateSpecialPlayerChips(jsMsg: ResultMessegeInfo) {
        let maxCoinOffset: number = jsMsg.richestOffset;
        let maxWinRateOffset: number = jsMsg.bestBetOffset;

        let roomData: RoomData = RoomDataManger.getInstance().getRoomData();
        if (maxCoinOffset > 0 && roomData.richestUID != null && roomData.richestUID > 0) {
            roomData.richestCoin += maxCoinOffset;
        }

        if (maxWinRateOffset > 0 && roomData.bestBetUID != null && roomData.bestBetUID > 0) {
            roomData.bestBetCoin += maxWinRateOffset;
        }
    }

    private _updateSitPlayerChips(jsMsg: ResultMessegeInfo) {
        let winInfos: WinInfo[] = jsMsg.result;
        if (winInfos && winInfos.length > 0) {
            _.forEach(winInfos, (info: WinInfo) => {
                if (info.offset > 0) {
                    let playerData: GamePlayerData = GamePlayerDataManager.getInstance().getPlayerDataByServerIdx(info.idx);
                    if (playerData && playerData.isValid()) {
                        playerData.chips += info.offset;
                    }
                }
            })
        }
    }

    private _updateSelfChip(jsMsg: ResultMessegeInfo) {
        let offset: number = jsMsg.selfOffset;

        if (offset > 0) {
            let userData: UserInfo = UserData.getInstance().getUserData();

            userData.coin += offset;
        }
    }

    private _updateBankerChip(jsMsg: ResultMessegeInfo) {
        let roomData: RoomData = RoomDataManger.getInstance().getRoomData();
        if (roomData.bankerID > 0) {    
            roomData.bankerCoin += jsMsg.bankerOffset;
        }
    }

    private _addRecord(isRedWin: number, winCardsInfo: CardsInfo) {
        let recordType: EmRecordType = isRedWin ? EmRecordType.Type_Red : EmRecordType.Type_Black;

        let roomData: RoomData = RoomDataManger.getInstance().getRoomData();
        roomData.addTypeRecord(new TypeRecordInfo(winCardsInfo.T, winCardsInfo.V));

        let winRecrod: eBetPool = isRedWin ? eBetPool.eBet_Red : eBetPool.eBet_Black
        roomData.addWinRecrod(winRecrod);

        GameRecordDataManager.getInstance().addRecord(recordType);

        this._dispatchNewRecordEvent(recordType);
        this._dispatchWinTypeEvent(winCardsInfo);
    }

    private _addCards(redCardsInfo: CardsInfo, blackCardsInfo: CardsInfo) {
        CardDataManager.getInstance().udpateCardData(EmCampType.Type_Red, redCardsInfo.cards);
        CardDataManager.getInstance().udpateCardData(EmCampType.Type_Black, blackCardsInfo.cards);
    }

    private _dispatchNewRecordEvent(recordType: EmRecordType) {
        let dispEvent: cc.Event.EventCustom = new cc.Event.EventCustom(ClientEventDefine.CUSTOM_EVENT_NEW_RECORD_ADDED, true);
        dispEvent.detail = recordType;

        cc.systemEvent.dispatchEvent(dispEvent);
    }

    private _dispatchWinTypeEvent(winCardsInfo: CardsInfo) {
        let dispEvent: cc.Event.EventCustom = new cc.Event.EventCustom(ClientEventDefine.CUSTOM_EVENT_NEW_WIN_TYPE_ADDED, true);

        let groupTypeInfo: GroupTypeInfo = new GroupTypeInfo(goldenTypeToGroupType(winCardsInfo.T), winCardsInfo.V);

        dispEvent.detail = groupTypeInfo;

        cc.systemEvent.dispatchEvent(dispEvent);
    }
};

export default new GameController();