const { ccclass } = cc._decorator;

@ccclass
export default class TestPrefab extends cc.Component {
    init() {
        cc.log('wd debug TestPrefab init', arguments);
    }

    refresh() {
        cc.log('wd debug TestPrefab refresh', arguments);
    }

    hide() {
        cc.log('wd debug TestPrefab hide', arguments);
    }
}
