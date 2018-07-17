const { ccclass, property } = cc._decorator;

@ccclass
export default class MessageBoxLayer extends cc.Component {
    @property(cc.Label)
    private m_pInfoLabel: cc.Label = null;

    @property(cc.Button)
    private m_cancelButton: cc.Button = null;
    @property(cc.Button)
    private m_confirmButton: cc.Button = null;

    private m_cancelCallBack: Function = null;
    private m_confirmCallBack: Function = null;

    hide() {
        this.node.active = false;
    }

    onCancelClick() {
        this.m_cancelCallBack && this.m_cancelCallBack();
        this.hide();
    }

    onConfirmClick() {
        this.m_confirmCallBack && this.m_confirmCallBack();
        this.hide();
    }

    init(string: string, comfirmCallBack: Function = null, cancelCallBack: Function = null) {
        this.node.active = true;

        this.m_pInfoLabel.string = string;

        this.m_confirmCallBack = comfirmCallBack;
        this.m_cancelCallBack = cancelCallBack;

        this.m_confirmButton.node.active = comfirmCallBack != null;
        this.m_cancelButton.node.active = cancelCallBack != null;
    }
}