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
    m_continueNode: cc.Node = null;

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

    onContinueClick() {
        this.m_tableMainUI.continuePlay();
        this.hideAll();
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

    reset() {
        this.updateRobEnable(0);
        this.hideAll();
    }

    hideAll() {
        this.m_myTurnNode.active = false;
        this.m_callBankerNode.active = false;
        this.m_continueNode.active = false;
    }

    showRobNode() {
        this.m_myTurnNode.active = false;
        this.m_callBankerNode.active = true;
        this.m_continueNode.active = false;
    }

    showContinueNode() {
        this.m_myTurnNode.active = false;
        this.m_callBankerNode.active = false;
        this.m_continueNode.active = true;
    }

    updateMyTurnNode(canDiscard: boolean, mustOffer: boolean) {
        this.m_myTurnNode.active = true;
        this.m_callBankerNode.active = false;
        this.m_continueNode.active = false;

        this.m_canDiscardNode.active = canDiscard;
        this.m_cannotDiscardNode.active = !canDiscard;

        // this.m_donotOfferButton.interactable = !mustOffer;
        this.m_donotOfferButton.node.active = !mustOffer;
    }

    updateDiscardButton(canDiscard: boolean) {
        // this.m_discardButton.node.active = canDiscard;
        this.m_discardButton.interactable = canDiscard;
    }

    updateTipButton(canTip: boolean) {
        this.m_tipButton.node.active = canTip;
        // this.m_tipButton.interactable = canTip;
    }

    updateRobEnable(baseScore: number) {
        _.forEach(this.m_callButtons, (button: cc.Button, idx: number) => {
            button.interactable = idx + 1 > baseScore;
        });
    }
}