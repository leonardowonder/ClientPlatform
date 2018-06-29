const { ccclass } = cc._decorator;

@ccclass
export default class TestPrefab3 extends cc.Component {
    init() {
        cc.log('wd debug TestPrefab3 init', arguments);
    }

    refresh() {
        cc.log('wd debug TestPrefab3 refresh', arguments);
    }

    hide() {
        cc.log('wd debug TestPrefab3 hide', arguments);
    }
}
