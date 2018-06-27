const { ccclass, property } = cc._decorator;

import { clientEventDefine } from '../clientDefine';
import RedDotHintManager, { RedDotHintKey } from '../Manager/RedDotHintManager';

@ccclass
export default class RedDotHintComponent extends cc.Component {

    @property(cc.Node)
    m_hintNode: cc.Node = null;

    @property(cc.Label)
    m_hintCountLabel: cc.Label = null;

    @property
    m_key: string = '';

    onLoad() {
        cc.systemEvent.on(clientEventDefine.CUSTOM_EVENT_RED_HINT_REFRESH, this.refreshRedDotHint, this);
    }

    onEnable() {
        // this.refreshRedDotHint();
    }

    onDestroy() {
        cc.systemEvent.off(clientEventDefine.CUSTOM_EVENT_RED_HINT_REFRESH, this.refreshRedDotHint, this);
    }

    refreshRedDotHint(event: cc.Event.EventCustom = null) {
        let cnt = RedDotHintManager.getInstance().getCntByKey(this.m_key);

        cnt = cnt == null ? 0 : cnt;
        this.m_hintNode.active = cnt > 0;

        if (this.m_hintCountLabel) {
            this.m_hintCountLabel.string = cnt.toString();
        }
    }
}
