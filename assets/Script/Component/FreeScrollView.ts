const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class FreeScrollView extends cc.ScrollView {
    _clampDelta(delta: cc.Vec2) {
        // var contentSize = this.content.getContentSize();
        // var scrollViewSize = this.node.getContentSize();
        // if (contentSize.width < scrollViewSize.width) {
        //     delta.x = 0;
        // }
        // if (contentSize.height < scrollViewSize.height) {
        //     delta.y = 0;
        // }

        return delta;
    }

    // _handleMoveLogic(touch) {
    //     cc.log('wd debug _handleMoveLogic', touch.getDelta())
    //     super._handleMoveLogic(touch);
    // }

    // _scrollChildren(deltaMove) {
    //     cc.log('wd debug _scrollChildren', deltaMove)
    //     super._scrollChildren(deltaMove);
    // }

    // _moveContent(deltaMove, canStartBounceBack) {
    //     cc.log('wd debug _moveContent', deltaMove, canStartBounceBack)
    //     super._moveContent(deltaMove, canStartBounceBack);
    // }

    // setContentPosition(position: cc.Vec2) {
    //     cc.log(position);
    //     super.setContentPosition(position);
    // }
}
