const { ccclass, property } = cc._decorator;

import SceneManager, { EmSceneID } from '../../Manager/CommonManager/SceneManager';

// import * as async from 'async';

@ccclass
export default class MainUIScene extends cc.Component {

    // @property(cc.Node)
    // m_node: cc.Node = null;

    onDestroy() {
    }

    onLoad() {
        
    }

    onRedBlackClick() {
        SceneManager.getInstance().changeScene(EmSceneID.SceneID_GameRoomScene); 
    }
}
