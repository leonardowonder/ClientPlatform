const { ccclass, property } = cc._decorator;

@ccclass
export default class StepSliderBar extends cc.Component {
    @property(cc.ProgressBar)
    private m_progressBar: cc.ProgressBar = null;

    @property(cc.Slider)
    private m_slider: cc.Slider = null;

    @property(cc.Node)
    private m_handle: cc.Node = null;

    @property(cc.Label)
    private m_label: cc.Label = null;

    @property
    private m_allowStep: boolean = true;

    private _data: number[] = [];

    _currentIndex: number = 0;
    _singleStepPercent: number = 0;

    _showLabelFunc: Function = null;

    onLoad() {

    }

    onDestroy() {
        // this._removeEventListener();
    }

    onEnable() {
        this._addEventListener();
    }

    onDisable() {
        this._removeEventListener();
    }

    start() {
        this._addEventListener();
    }

    _addEventListener() {
        if (this.m_allowStep) {
            this._removeEventListener();
            this.m_slider.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this, true);
            this.m_slider.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel, this, true);
            this.m_slider.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this, true);
        }
    }

    _removeEventListener() {
        if (this.m_allowStep) {
            this.m_slider.node.targetOff(this);
        }
    }

    getCurrentValue() {
        if (this._data && this._data.length > 0) {
            return this._data[this._currentIndex];
        }
    }

    getCurrentIndex() {
        return this._currentIndex;
    }

    setShowLabelFunc(func) {
        this._showLabelFunc = func;
    }

    setData(data, index = 0) {
        this._data = data;
        this._currentIndex = index;

        if (this._data && this._data.length > 1) {
            this._singleStepPercent =  1 / (this._data.length - 1);
            this.m_slider.progress = this._singleStepPercent * this._currentIndex;
            this.SliderCallBack(this.m_slider);
        }
        else {
            cc.warn('step slider bar set data error, data =', data);
        }
    }

    SliderCallBack(slider: cc.Slider) {
        this._currentIndex = Math.floor((slider.progress / this._singleStepPercent));

        let str = this._data[this._currentIndex].toString();
        if (this._showLabelFunc) {
            str = this._showLabelFunc(this._data[this._currentIndex])
        }
        
        this.m_label.string = str;
        this.m_progressBar.progress = slider.progress;
    }

    _relocateSliderHandle(target) {
        //to do by wd optimize algorithm
        for (let idx = 0; idx < 6; idx++) {
            if (idx * this._singleStepPercent <= this.m_slider.progress && this.m_slider.progress <= (idx + 1) * this._singleStepPercent) {
                if (this.m_slider.progress - idx * this._singleStepPercent < this._singleStepPercent / 2) {
                    this.m_slider.progress = idx * this._singleStepPercent;
                } else {
                    this.m_slider.progress = (idx + 1) * this._singleStepPercent;
                }
                this.SliderCallBack(this.m_slider);
                break;
            }
        }
    }

    touchStart(event: any) {

    }

    touchEnd(event: any) {
        this._relocateSliderHandle(event.target);
    }

    touchCancel(event: any) {
        this._relocateSliderHandle(event.target);
    }

    // update (dt) {},
}
