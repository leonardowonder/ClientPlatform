const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { EmChipType } from '../../Define/GamePlayDefine';

import GameController from '../../Controller/GamePlay/GameController';

import GameRoomLogic from '../../Logic/GamePlay/GameRoomLogic';

import RoomData from '../../Data/GamePlay/RoomData';

import SceneManager, { EmSceneID } from '../../Manager/CommonManager/SceneManager';
import PrefabManager, { EmPrefabEnum } from '../../Manager/CommonManager/PrefabManager';
import RoomDataManger from '../../Manager/DataManager/GamePlayDataManger/RoomDataManger';

import CardsContainer from '../Layer/GamePlay/CardsContainer';
import ChipSelectLayer from '../Layer/GamePlay/ChipSelectLayer';
import ChipsLayer from '../Layer/GamePlay/ChipsLayer';
import PlayerRootLayer from '../Layer/GamePlay/PlayerRootLayer';

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
        let roomInfo: RoomData = RoomDataManger.getInstance().getRoomData();
    }

    //callback
    onTendencyChartClick() {
        PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_TendencyChart);
    }

    onBackClick() {
        SceneManager.getInstance().changeScene(EmSceneID.SceneID_MainScene); 
    }

    //interface
    distributeCards() {
        _.forEach(this.m_containers, (container: CardsContainer) => {
            container && container.distributeCards();

            container && container.setCards([25, 40, 66]);
        })
    }

    flipCards() {
        _.forEach(this.m_containers, (container: CardsContainer) => {
            container && container.flipCards();
        })
    }

    getCurChipType(): EmChipType {
        return this.m_chipSelectLayer.getCurChipType();
    }

    getPlayerHeadWorldPos(clientIdx: number): cc.Vec2 {
        return this.m_playerRootLayer.getPlayerHeadWorldPos(clientIdx);
    }
}
