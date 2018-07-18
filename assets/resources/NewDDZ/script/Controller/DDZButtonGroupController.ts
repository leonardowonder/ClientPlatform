const { ccclass, property } = cc._decorator;

@ccclass
export default class DDZButtonGroupController extends cc.Component {
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