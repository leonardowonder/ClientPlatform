const { ccclass, property } = cc._decorator;

import StringUtils from '../Utils/StringUtils';

@ccclass
export default class Loading extends cc.Component {
    @property(cc.Label)
    m_loadingLabel: cc.Label = null;

    @property
    m_intarval = 0.5;

    @property
    m_dotCount = 3;

    _initCount = 0;

    onDisable() {
        this.unschedule(this._loadingfunc);
    }

    onDestroy() {
        this.unschedule(this._loadingfunc);        
    }

    init() {
        this._startLoading();
    }

    hide() {      
        this.node.active = false;
    }

    private _loadingfunc() {
        let suffix = '';
        let docCnt = this._initCount++ % (this.m_dotCount + 1);

        if (this._initCount > this.m_dotCount) {
            this._initCount = 0;
        }

        while(docCnt > 0) {
            suffix += '.';
            docCnt--;
        } 

        this.m_loadingLabel.string = StringUtils.getInstance().formatByKey('loading', suffix);
    }

    private _startLoading() {
        this.unschedule(this._loadingfunc);
        this.schedule(this._loadingfunc, this.m_intarval)
    }
}
