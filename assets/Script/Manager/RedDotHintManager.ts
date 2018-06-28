const { ccclass } = cc._decorator;

export let RedDotHintKey = {
    
}

export const RedDotHintRefreshKey = 'CUSTOM_EVENT_RED_HINT_REFRESH';

@ccclass
class RedDotHintManager {
    private m_beenInit: boolean = false;

    private m_getHintCntfuncMap: any = {};

    getInstance() {
        if (!this.m_beenInit) {
            this._init();
        }

        return this;
    }

    _init() {
        //do something
    }

    clearAllCnts() {
        this.m_getHintCntfuncMap = null;
    }

    clearCntByKey(key) {
        this.m_getHintCntfuncMap[key] = null;
    }

    setCntByKey(key: string, cnt: number) {
        this.m_getHintCntfuncMap[key] = cnt;
    }

    getCntByKey(key): number {
        let cnt = 0;
        if (this.m_getHintCntfuncMap[key] != null) {
            cnt = this.m_getHintCntfuncMap[key]
        }
        return cnt;
    }

    refreshRedDotHints() {
        let dispEvent = new cc.Event.EventCustom(RedDotHintRefreshKey, true);
        cc.systemEvent.dispatchEvent(dispEvent);
    }
}

export default new RedDotHintManager();