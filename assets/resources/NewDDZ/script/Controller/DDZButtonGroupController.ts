const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import NetSink from '../Module/Game/TableSink';

import TableMainUI from '../UI/TableMainUI';

@ccclass
export default class DDZButtonGroupController extends cc.Component {
    @property(TableMainUI)
    m_tableMainUI: TableMainUI = null;

    @property(cc.Button)
    m_discardButton: cc.Button = null;

    @property(cc.Button)
    m_tipButton: cc.Button = null;

    @property(cc.Button)
    m_donotOfferButton: cc.Button = null;

    @property(cc.Button)
    m_callButtons: cc.Button[] = [];

    @property(cc.Node)
    m_myTurnNode: cc.Node = null;
    @property(cc.Node)
    m_callBankerNode: cc.Node = null;
    @property(cc.Node)
    m_canDiscardNode: cc.Node = null;
    @property(cc.Node)
    m_cannotDiscardNode: cc.Node = null;
    
    onDiscardClick() {
        this.m_tableMainUI.sendMyCards();
    }

    onDonotDiscardClick() {
        NetSink.getInstance().requestNotDiscard();
    }

    onTipClick() {
        this.m_tableMainUI.showTip();
    }

    onClearClick() {
        this.m_tableMainUI.clearTable();
    }

    onCallBankerClick(event: cc.Event, coustEvent: string) {
        NetSink.getInstance().requestCallBanker(parseInt(coustEvent));
    }

    hideAll() {
        this.m_myTurnNode.active = false;
        this.m_callBankerNode.active = false;
    }

    showRobNode() {
        this.m_myTurnNode.active = false;
        this.m_callBankerNode.active = true;
    }

    updateMyTurnNode(canDiscard: boolean, mustOffer: boolean) {
        this.m_myTurnNode.active = true;
        this.m_callBankerNode.active = false;

        this.m_canDiscardNode.active = canDiscard;
        this.m_cannotDiscardNode.active = !canDiscard;

        this.m_donotOfferButton.interactable = !mustOffer;
    }

    updateDiscardButton(canDiscard: boolean) {
        this.m_discardButton.interactable = canDiscard;
    }

    updateTipButton(canTip: boolean) {
        this.m_tipButton.interactable = canTip;
    }

    updateRobEnable(times: number) {
        _.forEach(this.m_callButtons, (button: cc.Button, idx: number) => {
            button.interactable = idx + 1 > times;
        });
    }
}