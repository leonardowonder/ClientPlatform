const { ccclass } = cc._decorator;

@ccclass
export default class TestPrefab2 extends cc.Component {
    init() {
        cc.log('wd debug TestPrefab2 init', arguments);
    }

    refresh() {
        cc.log('wd debug TestPrefab2 refresh', arguments);
    }

    hide() {
        cc.log('wd debug TestPrefab2 hide', arguments);
    }
}
