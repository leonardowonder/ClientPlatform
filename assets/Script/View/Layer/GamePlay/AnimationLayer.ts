const { ccclass, property } = cc._decorator;

@ccclass
export default class AnimationLayer extends cc.Component {

    @property(cc.Layout)
    m_layout: cc.Layout = null;

    onLoad() {
        
    }
}