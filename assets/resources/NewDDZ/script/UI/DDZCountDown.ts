const { ccclass, property } = cc._decorator;

@ccclass
export default class DDZCountDown extends cc.Component {
    @property(cc.Label)
    m_countDownLabel: cc.Label = null;

    private _curCountDown: number = -1;

    init(time: number, pos: cc.Vec2) {
        this.node.active = true;

        this.node.setPosition(pos);

        this.refresh(time);

        this.m_countDownLabel.string = this._curCountDown.toString();
    }

    hide() {
        this.node.active = false;
    }

    setCountDown(num: number) {
        this._curCountDown = num;
    }

    refresh(num: number) {
        this.setCountDown(num);

        this.startCountDown();
    }

    stopCountDown() {
        this.unschedule(this._countingDown);
    }

    startCountDown() {
        this.stopCountDown();

        this.schedule(this._countingDown, 1);
    }

    private _countingDown() {
        this._curCountDown--;
        
        if (this._curCountDown < 0) {
            this.stopCountDown();
            return;
        }

        this.m_countDownLabel.string = this._curCountDown.toString();
    }
}