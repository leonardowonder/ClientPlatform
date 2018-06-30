import Singleton from '../../Utils/Singleton';

export let RedDotHintKey = {

}

export const RedDotHintRefreshKey = 'CUSTOM_EVENT_RED_HINT_REFRESH';

class RedDotHintManager extends Singleton {

    private m_getHintCntfuncMap: any = {};

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