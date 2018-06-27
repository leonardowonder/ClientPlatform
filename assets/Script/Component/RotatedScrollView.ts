// Learn TypeScript:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/typescript/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class RotatedScrollView extends cc.Component {

    @property(cc.Node)
    pContent: cc.Node = null;

    @property(cc.Node)
    pContainer : cc.Node = null ;

    // LIFE-CYCLE CALLBACKS:
    @property(cc.Prefab)
    pItem : cc.Prefab = null ;

    onLoad ()
    {
        this.pContainer.on("size-changed",( event : cc.Event.EventCustom)=>{
            let nDeWit = this.node.getContentSize().width ;
            if ( nDeWit < this.pContainer.getContentSize().height )
            {
                nDeWit = this.pContainer.getContentSize().height;
            }
            this.pContent.setContentSize(cc.size(nDeWit,this.pContent.getContentSize().height));
        },this);
    }

    start () {
        // this.schedule(()=>{
        //     let p = cc.instantiate(this.pItem);
        //     this.addChildItem(p);
        // },1,15);
    }

    addChildItem( pChild : cc.Node )
    {
        pChild.x = 0 ;
        this.pContainer.addChild(pChild);
    }

    getChildItemByIdx( nIdx : number ) : cc.Node
    {
        if ( this.pContainer.childrenCount > nIdx && nIdx >= 0 )
        {
            return this.pContainer.children[nIdx];
        }
        return null ;
    }

    removeChildItem( pChild : cc.Node )
    {
        pChild.removeFromParent(true);
    }

    removeChildItemByIdx( nIdx : number )
    {
        if ( this.pContainer.childrenCount > nIdx && nIdx >= 0 )
        {
            this.pContainer.children[nIdx].removeFromParent(true);
        }
    }

    removeAllChildItem()
    {
        this.pContainer.removeAllChildren();
    }

    getAllChildren() : cc.Node[]
    {
        return this.pContainer.children ;
    }

    onClickClose( event : cc.Event.EventTouch )
    {
        this.node.active = false ;
    }
    // update (dt) {},
}
