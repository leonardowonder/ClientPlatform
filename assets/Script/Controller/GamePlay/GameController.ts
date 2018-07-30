import Singleton from '../../Utils/Singleton';

import StateMachine, { Transition, Method } from '../../Utils/StateMachine';

import { EmChipType, EmRecordType, CardsInfo, EmCampType, eRoomState, GroupTypeInfo, eBetPool } from '../../Define/GamePlayDefine';
import ClientEventDefine from '../../Define/ClientEventDefine';

import { goldenTypeToGroupType } from '../../Utils/GamePlay/GameUtils';

import RoomData, { TypeRecordInfo } from '../../Data/GamePlay/RoomData';

import GameRecordDataManager from '../../Manager/DataManager/GamePlayDataManger/GameRecordDataManager';
import CardDataManager from '../../Manager/DataManager/GamePlayDataManger/CardDataManager';
import RoomDataManger from '../../Manager/DataManager/GamePlayDataManger/RoomDataManger';

import GameRoomScene from '../../View/Scene/GameRoomScene';
import GameRoomData from '../../Data/GamePlay/GameRoomData';

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
            this.m_Basefsm.changeState('Restart');
        }
        else {
            this.m_Basefsm.changeState('Account');
        }
    }

    //state machine
    onGameStart() {
        this.m_Basefsm.changeState('Restart');

        this.distributeCards();
    }

    onGameResult(jsMsg) {
        this.m_Basefsm.changeState('Account');

        let winCardsInfo: CardsInfo = jsMsg.isRedWin ? jsMsg.red : jsMsg.black;

        this._addRecord(jsMsg.isRedWin, winCardsInfo);

        this._addCards(jsMsg.red, jsMsg.black);
    }

    //scene
    distributeCards() {
        this.m_gameRoomScene.distributeCards();
    }

    getCurChipType(): EmChipType {
        return this.m_gameRoomScene.getCurChipType();
    }

    getPlayerHeadWorldPos(clientIdx: number): cc.Vec2 {
        return this.m_gameRoomScene.getPlayerHeadWorldPos(clientIdx);
    }

    private _addRecord(isRedWin: boolean, winCardsInfo: CardsInfo) {
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

        this.m_gameRoomScene.flipCards(redCardsInfo, blackCardsInfo);
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