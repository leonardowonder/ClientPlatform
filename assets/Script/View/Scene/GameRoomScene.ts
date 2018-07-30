const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { EmChipType, eBetPool, EmBetAreaType, CardsInfo, GroupTypeInfo, eRoomState } from '../../Define/GamePlayDefine';

import GameController from '../../Controller/GamePlay/GameController';

import GameRoomLogic from '../../Logic/GamePlay/GameRoomLogic';

import RoomData from '../../Data/GamePlay/RoomData';

import { coinToChipType, betPoolToBetAreaType, goldenTypeToGroupType } from '../../Utils/GamePlay/GameUtils';

import SceneManager, { EmSceneID } from '../../Manager/CommonManager/SceneManager';
import PrefabManager, { EmPrefabEnum } from '../../Manager/CommonManager/PrefabManager';
import RoomDataManger from '../../Manager/DataManager/GamePlayDataManger/RoomDataManger';
import TableDataManager from '../../Manager/DataManager/GamePlayDataManger/TableDataManager';

import CardsContainer from '../Layer/GamePlay/CardsContainer';
import ChipSelectLayer from '../Layer/GamePlay/ChipSelectLayer';
import ChipsLayer from '../Layer/GamePlay/ChipsLayer';
import PlayerRootLayer from '../Layer/GamePlay/PlayerRootLayer';
import { eRoomPeerState } from '../../../resources/NewDDZ/script/Define/DDZDefine';

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
        this.updateContainer();

        this.updatePlayersView();
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

    onRoomBet(serverIdx: number, coin: number, betPoolType: eBetPool) {
        let clientIdx: number = TableDataManager.getInstance().svrIdxToClientIdx(serverIdx);
        let chipType: EmChipType = coinToChipType(coin);
        let areaType: EmBetAreaType = betPoolToBetAreaType(betPoolType);

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
        let clientIdx: number = TableDataManager.getInstance().svrIdxToClientIdx(serverIdx);

        this.m_playerRootLayer.refreshPlayerItem(clientIdx, serverIdx);
    }

    onPlayerStandUp(serverIdx: number) {
        let clientIdx: number = TableDataManager.getInstance().svrIdxToClientIdx(serverIdx);
        
        this.m_playerRootLayer.refreshPlayerItem(clientIdx, serverIdx);
    }
}
