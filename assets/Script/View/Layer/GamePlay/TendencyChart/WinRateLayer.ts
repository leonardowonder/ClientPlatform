const { ccclass, property } = cc._decorator;

@ccclass
export default class RoadsRootLayer extends cc.Component {

    @property(cc.Node)
    m_redWinNode: cc.Node = null;

    @property(cc.Node)
    m_blackWinNode: cc.Node = null;

    @property(cc.Label)
    m_redWinLabel: cc.Label = null;

    @property(cc.Label)
    m_blackWinLabel: cc.Label = null;

    @property
    m_redMinLength: number = 250;

    @property
    m_blackMinLength: number = 300;

    @property
    m_100PercentLenght: number = 150;

    updateRateNode(redWinCnt: number, blackWinCnt: number) {
        let redWinRate: number = parseFloat((redWinCnt / (redWinCnt + blackWinCnt)).toFixed(2));
        let redWinAddLength: number = (this.m_100PercentLenght * redWinRate);

        this.m_redWinNode.setContentSize(redWinAddLength + this.m_redMinLength, this.m_redWinNode.height);
        this.m_blackWinNode.setContentSize(this.m_100PercentLenght - redWinAddLength + this.m_blackMinLength, this.m_redWinNode.height);

        this.m_redWinLabel.string = Math.floor(redWinRate * 100) + '%';
        this.m_blackWinLabel.string = (100 - Math.floor(redWinRate * 100)) + '%';
    }
}