const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { EmChipType, EmBetAreaType, Game_Room_Seat_Max_Count } from '../../../Define/GamePlayDefine';

import { addNewNodeFunc } from '../../../Utils/NodePoolUtils';
import MathUtils from '../../../Utils/MathUtils';

import GameController from '../../../Controller/GamePlay/GameController';
import TableDataManager from '../../../Manager/DataManager/GamePlayDataManger/TableDataManager';

import Chip from '../../../Component/GamePlay/Common/Chip';

let gameController = GameController.getInstance();
let tableDataManager = TableDataManager.getInstance();

@ccclass
export default class ChipsLayer extends cc.Component {

    @property(cc.Node)
    m_betAreas: cc.Node[] = [];

    @property(cc.Prefab)
    m_chipPrefab: cc.Prefab = null;

    _nodePool: cc.NodePool = null;

    onLoad() {
        this._registEvents();
        this._initNodePool();
    }

    onAreaTouch(event: cc.Event.EventCustom) {
        let node = event.target;

        let newChip: cc.Node = this._getChip(node);
        let fromPos: cc.Vec2 = this._getPlayerHeadPosByClientIdx(tableDataManager.getSelfClientIdx(), node);
        let toPos: cc.Vec2 = this._getRandomTargetPos(newChip, node);

        this._updateChip(newChip, this._getSelfChipType());
        this._playChipMoveForwardAction(newChip, fromPos, toPos);
    }

    playChipMoveFromHeadToPoolAction(clientIdx: number, chipType: EmChipType, areaType: EmBetAreaType) {
        let node = this._getAreaNodeByType(areaType);
        let newChip: cc.Node = this._getChip(node);
        let fromPos: cc.Vec2 = this._getPlayerHeadPosByClientIdx(clientIdx, node);

        let toPos: cc.Vec2 = this._getRandomTargetPos(newChip, node);

        this._updateChip(newChip, chipType);
        this._playChipMoveForwardAction(newChip, fromPos, toPos);
    }

    foo() {
        this.playChipMoveFromPoolToPlayerAction(EmBetAreaType.Type_Black, [0, 2, 5, 10])
    }

    playChipMoveFromPoolToPlayerAction(areaType: EmBetAreaType, clientIdxList: number[]) {
        let areaNode = this._getAreaNodeByType(areaType);
        let chips = areaNode.children;

        let winCnt: number = clientIdxList.length;

        let chipMinCntToOnePos: number = Math.floor(chips.length / winCnt);

        let curChipIdx: number = 0;

        while (curChipIdx < chips.length) {
            let chip = chips[curChipIdx];

            let targetClicentListIdx = Math.floor(curChipIdx / chipMinCntToOnePos);

            let toPos: cc.Vec2 = null;

            if (targetClicentListIdx < clientIdxList.length) {
                toPos = this._getPlayerHeadPosByClientIdx(clientIdxList[targetClicentListIdx], areaNode);
            }
            else {
                toPos = this._getPlayerHeadPosByClientIdx(clientIdxList[clientIdxList.length - 1], areaNode);
            }

            this._playChipMoveBackAction(chip, chip.getPosition(), toPos, Math.random() * 0.5, () => {
                this._nodePool.put(chip);
            });

            curChipIdx++;
        }
    }

    private _registEvents() {
        _.forEach(this.m_betAreas, (node: cc.Node) => {
            node.on(cc.Node.EventType.TOUCH_START, this.onAreaTouch, this);
        });
    }

    private _initNodePool() {
        this._nodePool = new cc.NodePool(Chip);

        this._putChips(50);
    }

    private _getAreaNodeByType(type: EmBetAreaType): cc.Node {
        let targetAreaIdx: number = this._getAreaIdxByType(type);

        let node = this.m_betAreas[targetAreaIdx];

        return node;
    }

    private _getAreaIdxByType(type: EmBetAreaType): number {
        let idx: number = 0;
        switch (type) {
            case EmBetAreaType.Type_Red: {
                break;
            }
            case EmBetAreaType.Type_Black: {
                idx = 1;
                break;
            }
            case EmBetAreaType.Type_Red: {
                idx = 2;
                break;
            }
            default: {
                cc.warn(`ChipsLayer _getAreaIdxByType invalid type = ${type}`);
            }
        }

        return idx;
    }

    private _putChips(num: number) {
        while (num--) {
            let chipNode: cc.Node = cc.instantiate(this.m_chipPrefab);

            this._nodePool.put(chipNode);
        }
    }

    private _getChip(parentNode: cc.Node): cc.Node {
        let node: cc.Node = addNewNodeFunc(parentNode, this.m_chipPrefab, this._nodePool);

        return node;
    }

    private _getSelfChipType(): EmChipType {
        let type: EmChipType = gameController.getCurChipType();

        return type;
    }

    private _updateChip(chip: cc.Node, type: EmChipType) {
        let comp: Chip = chip.getComponent(Chip);
        if (comp) {
            comp.setType(type);
        }
    }

    private _getPlayerHeadPosByClientIdx(idx: number, parentNode: cc.Node): cc.Vec2 {
        let selfHeadWorldPos: cc.Vec2 = gameController.getPlayerHeadWorldPos(idx);

        let nodePos: cc.Vec2 = parentNode.convertToNodeSpace(selfHeadWorldPos);
        return nodePos;
    }

    private _getRandomTargetPos(chipNode: cc.Node, node: cc.Node): cc.Vec2 {
        let width: number = node.width;
        let height: number = node.height;

        let randomX = MathUtils.getInstance().getRandomBetween(0 + chipNode.width / 2, width - chipNode.width / 2);
        let randomY = MathUtils.getInstance().getRandomBetween(0 + chipNode.height / 2, height - chipNode.height / 2);

        return new cc.Vec2(randomX, randomY);
    }

    private _playChipMoveForwardAction(chip: cc.Node, fromPos: cc.Vec2, toPos: cc.Vec2) {
        chip.setPosition(fromPos);

        let moveAction = cc.moveTo(0.5, toPos).easing(cc.easeIn(3.0));

        chip.runAction(moveAction);
    }

    private _playChipMoveBackAction(chip: cc.Node, fromPos: cc.Vec2, toPos: cc.Vec2, duration: number = 0.5, callback: Function = null) {
        chip.setPosition(fromPos);

        let moveAction = cc.moveTo(duration, toPos).easing(cc.easeOut(2.0));

        let callbackAction = cc.callFunc(() => {
            callback && callback();
        })

        let seq = cc.sequence(moveAction, callbackAction);

        chip.runAction(seq);
    }
}