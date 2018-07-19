const { ccclass, property } = cc._decorator;

import NetSink from '../Module/Game/TableSink';

import TableMainUI from '../UI/TableMainUI';

@ccclass
export default class DDZButtonGroupController extends cc.Component {
    @property(TableMainUI)
    m_tableMainUI: TableMainUI = null;

    @property(cc.Button)
    m_discardButton: cc.Button = null;

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
        this.m_tableMainUI.clearAllProcess();
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

    updateMyTurnNode(canDiscard: boolean) {
        this.m_myTurnNode.active = true;
        this.m_callBankerNode.active = false;

        this.m_canDiscardNode.active = canDiscard;
        this.m_cannotDiscardNode.active = !canDiscard;
    }

    updateDiscardButton(canDiscard: boolean) {
        this.m_discardButton.interactable = canDiscard;
    }
}