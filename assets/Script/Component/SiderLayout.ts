// Learn TypeScript:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/typescript/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class SiderLayout extends cc.Layout {

    onLoad() {

    }

    onDestroy() {

    }

    onEnable() {
        
    }

    onDisable() {

    }

    start() {

    }

    //to do by wd VERTICAL
    updatePosition() {
        let activeChildren = this.node.children.filter(function(node) {
            return node.active == true;
        });

        if (this.type == cc.Layout.Type.HORIZONTAL) {
            if (activeChildren) {
                if (activeChildren.length == 1) {
                    activeChildren[0].setPositionX(0);
                }
                else {
                    let childrenTotalWidth = 0;
                    activeChildren.forEach(function (node) {
                        childrenTotalWidth += node.width;
                    })
    
                    let spaceX = (this.node.width - childrenTotalWidth) / activeChildren.length;

                    this.spacingX = spaceX;
                    // this.paddingLeft = spaceX;
                    // this.paddingRight = spaceX;
                }
            }
        }

        super.updateLayout();
    }
}
