const { ccclass } = cc._decorator;

@ccclass
export default class MapItem extends cc.Component {

    //logic

    reuse() {
        cc.log('wd debug MapItem reuse');
    }

    unuse() {
        cc.log('wd debug MapItem unuse');
    }
}
