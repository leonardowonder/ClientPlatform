const { ccclass } = cc._decorator;

import ClientDefine from '../../../../../Script/Define/ClientDefine';
import { eMsgPort, eMsgType } from '../../../../../Script/Define/MessageIdentifer';
import Network from '../../../../../Script/Utils/Network';
import { eRoomPeerState } from '../../../Define/DDZDefine';
import UserData from '../../../../../Script/Data/UserData';
import DDZGameDataLogic from '../../Data/DDZGameDataLogic';
import GameLogic from './GameLogic';
import DDZPlayerData from '../../Data/DDZPlayerData';
import DDZLanguage from '../../Data/DDZLanguage';

let userData = UserData.getInstance();
let DDZDataMgrIns = DDZGameDataLogic.getInstance();
let GameLogicIns = GameLogic.getInstance();
let DDZPlayerDataLogic = DDZPlayerData.getInstance();

//net module
@ccclass
export default class TableSink extends cc.Component {

    _delegate = null;

    init(delegate) {
        this._delegate = delegate;
        cc.systemEvent.on(ClientDefine.netEventMsg, this.onMsg, this);
        cc.systemEvent.on("reconnect", this.reconnect, this);
        cc.systemEvent.on("reconnectFailed", this.reconnectedFailed, this);
    }

    //customEvent
    reconnect() {

    }

    reconnectedFailed() {

    }


    ///send
    sendEnterRoom() {
        var enterRoomMessage = {
            msgID: eMsgType.MSG_PLAYER_SIT_DOWN,
            idx: 100
        };
        Network.getInstance().sendMsg(enterRoomMessage,
            eMsgType.MSG_PLAYER_SIT_DOWN, eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZDataMgrIns._roomID)
    }

    sendApplyDismissRoom() {
        var deleteRoomMessage = {
            msgID: eMsgType.MSG_APPLY_DISMISS_VIP_ROOM,
            dstRoomID: DDZDataMgrIns._roomID,
            uid: userData.uid,
        };
        Network.getInstance().sendMsg(deleteRoomMessage,
            eMsgType.MSG_APPLY_DISMISS_VIP_ROOM,
            eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZDataMgrIns._roomID);
    }

    sendLeaveRoom() {
        var deleteRoomMessage = {
            msgID: eMsgType.MSG_PLAYER_LEAVE_ROOM,
        };
        Network.getInstance().sendMsg(deleteRoomMessage,
            eMsgType.MSG_PLAYER_LEAVE_ROOM, eMsgPort.ID_MSG_PORT_DOU_DI_ZHU,
            DDZDataMgrIns._roomID);
    }

    sendReady() {
        var enterRoomMessage = {
            dstRoomID: DDZDataMgrIns._roomID,
            msgID: eMsgType.MSG_PLAYER_SET_READY,
        };
        Network.getInstance().sendMsg(enterRoomMessage, eMsgType.MSG_PLAYER_SET_READY,
            eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZDataMgrIns._roomID);
    }

    sendOpenRoom() {
        var message = {
            msgID: eMsgType.MSG_PLAYER_OPEN_ROOM,
            dstRoomID: DDZDataMgrIns._roomID,
        };
        Network.getInstance().sendMsg(message, eMsgType.MSG_PLAYER_OPEN_ROOM,
            eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZDataMgrIns._roomID);

    }

    reqOutCard(localChairID, sendCardData, cardType) {
        console.log('sendCardData' + JSON.stringify(sendCardData) + ', cardType' +
            GameLogicIns.switchCardTypeToServerType(cardType));
    }








    //receive
    onMsg(event) {
        var jsonMessage = JSON.parse(event);
        DDZDataMgrIns.onMessage(event);
        DDZPlayerDataLogic.onMessage(event);
        if (jsonMessage.msgID == eMsgType.MSG_VIP_ROOM_DO_CLOSED) {
            // svr : { isDismiss : 0 , roomID : 2345 , eType : eroomType }  
            // if (this._DDZGameOver == null) {
            //     this.exitGame("房间已解散");
            // }
            this._delegate.exitGame(DDZLanguage.alreadyDismissRoom);
            return true;
        }
        if (jsonMessage.msgID == eMsgType.MSG_PLAYER_BASE_DATA) {
            cc.find("persistRootNode").getComponent('persistRootNode').closeWaitMasLayer();
            userData.setPlayerBaseData(jsonMessage);
            if (DDZPlayerDataLogic.getPlayerDataByUID(userData.uid) && DDZPlayerDataLogic.getPlayerDataByUID(userData.uid).uid > 0) {
                var enterRoomMessage = {
                    msgID: eMsgType.MSG_REQUEST_ROOM_INFO,
                };
                if (Network.getInstance().sendMsg(enterRoomMessage, eMsgType.MSG_REQUEST_ROOM_INFO, eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZDataMgrIns._roomID)) {
                    // MyUtils.cloneWaitMsgLayer(DDZLanguage.reEnterRoom, false);
                }
            } else {
                if (Network.getInstance().sendMsg(
                    {
                        msgID: eMsgType.MSG_ENTER_ROOM,
                        roomID: DDZDataMgrIns._roomID,
                        uid: userData.uid,
                    }, eMsgType.MSG_ENTER_ROOM, eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZDataMgrIns._roomID)) {
                    // MyUtils.cloneWaitMsgLayer(DDZLanguage.reEnterRoom, false);
                }
            }
            return true;
        } else if (jsonMessage.msgID == eMsgType.MSG_ENTER_ROOM) {
            cc.find("persistRootNode").getComponent('persistRootNode').closeWaitMasLayer();
            if (jsonMessage.ret != 0) {
                this._delegate.exitGame(DDZLanguage.donotFindRoom);
            }
            return true;
        } else if (jsonMessage.msgID == eMsgType.MSG_REQUEST_ROOM_INFO) {
            cc.find("persistRootNode").getComponent('persistRootNode').closeWaitMasLayer();
            if (jsonMessage.ret != 0) {
                this._delegate.exitGame();
            }
            return true;
        } else if (jsonMessage.msgID == eMsgType.MSG_ROOM_INFO) {
            cc.find("persistRootNode").getComponent('persistRootNode').closeWaitMasLayer();
            this.node.stopAllActions();
            // 房间的基本信息
            //this.showLayer();
            return true;
        } else if (jsonMessage.msgID == eMsgType.MSG_ROOM_PLAYER_INFO) {
            //this.showLayer();
            return true;
        } else if (jsonMessage.msgID == eMsgType.MSG_PLAYER_SET_READY) {
            // svr : { ret : 1 , curState : 23 } // 1 you are not in room , 2 you are not state waitNextGame, tell curState ;
            // var text = null;
            // if (jsonMessage.ret == 0) {
            // } else if (jsonMessage.ret == 1) {
            //     text = "您没有在该房间";
            // } else if (jsonMessage.ret != 201) {
            //     text = "准备失败,code = " + jsonMessage.ret;
            // }
            // if (text) {
            //    // MyUtils.clonePromptDialogLayer(text, jsonMessage.ret == 0);
            // }
            return true;
        } else if (jsonMessage.msgID == eMsgType.MSG_ROOM_PLAYER_READY) {
            // if (DDZGameData.players[jsonMessage.idx].uid == userData.uid && this._DDZOnceGameOver) {
            //     this._DDZOnceGameOver.active = false;
            //     this.m_pMyCardManager.node.getComponent('DDZMyHoldCardManager').removeAllHold();
            //     for (let idx = 0; idx < 3; idx++) {
            //         var card = this.m_pTitleBG.node.getChildByName("DZCard_" + (idx + 1)).getComponent('DDZCard');
            //         card.restore();
            //     }
            //     for (let i = 0; i < DDZGameData.seatCnt; i++) {
            //         this._users[this.getLocalIdxByServerIdx(DDZGameData.players[i].idx)].getComponent('DDZGameUser').onceGameOver();
            //         this._users[this.getLocalIdxByServerIdx(DDZGameData.players[i].idx)].getComponent('DDZGameUser').showOutCard([], 0, false, false);
            //     }
            // }
            this._delegate.setStateTag(jsonMessage.idx, 1);
            return true;
        } else if (jsonMessage.msgID == eMsgType.MSG_PLAYER_SIT_DOWN) {
            cc.find("persistRootNode").getComponent('persistRootNode').closeWaitMasLayer();
            var text = null;
            if (jsonMessage.ret == 0) {

            } else if (jsonMessage.ret == 1) {
                text = "该位置已经有人";
            } else if (jsonMessage.ret == 2) {
                text = "您已经加入过其他房间";
            } else if (jsonMessage.ret == 3) {
                text = "您没有在该房间";
            } else {
                text = "坐下失败,code = " + jsonMessage.ret;
            }
            if (text) {
                // MyUtils.clonePromptDialogLayer(text, jsonMessage.ret == 0);
            }
            return false;
        } else if (jsonMessage.msgID == eMsgType.MSG_ROOM_SIT_DOWN) {
            let userData = DDZPlayerDataLogic._players.get(jsonMessage.idx);
            if (userData.uid == userData.uid) {
                if (jsonMessage.state == eRoomPeerState.eRoomPeer_WaitNextGame) {
                    //auto sendReady
                    // var enterRoomMessage = {
                    //     dstRoomID: DDZGameData.roomID,
                    //     msgID: eMsgType.MSG_PLAYER_SET_READY,
                    // };
                    // Network.getInstance().sendMsg(enterRoomMessage), eMsgType.MSG_PLAYER_SET_READY, eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZGameData.roomID)
                }
                for (let idx = 0; idx < DDZDataMgrIns._seatCnt; idx++) {
                    let userData = DDZPlayerDataLogic._players.get(idx);
                    if (userData && userData.uid > 0) {
                        this._delegate.sitDown(userData, idx);
                    } else {
                        this._delegate.standUp(idx);
                    }
                }

            } else {
                //AudioManager.playerEffect("resources/ddz/sound/Player_Come_In.mp3");
                let userData = DDZPlayerDataLogic._players.get(jsonMessage.idx);
                this._delegate.sitDown(userData, jsonMessage.idx);
            }
            //this.updateShowNotStartButton();
            return true;
        } else if (jsonMessage.msgID == eMsgType.MSG_REQUEST_PLAYER_DATA) {
            for (let idx = 0; idx < DDZDataMgrIns._seatCnt; idx++) {
                let userData = DDZPlayerDataLogic._players.get(idx);
                if (userData.uid == jsonMessage.uid) {
                    this._delegate.setName(idx, jsonMessage.name);
                    this._delegate.setHead(idx, jsonMessage.headIcon);
                    break;
                }
            }
        } else if (jsonMessage.msgID == eMsgType.MSG_PLAYER_LEAVE_ROOM) {
            var errorText = null;
            if (jsonMessage.ret == 0) {
                this._delegate.exitGame("退出成功");
            } else if (jsonMessage.ret == 1) {
                errorText = "您没有在该房间";
            } else if (jsonMessage.ret == 200) {
                errorText = "没有找到该房间";
            } else if (jsonMessage.ret == 201) {
                errorText = "操作超时";
            } else if (jsonMessage.ret != 0) {
                errorText = "退出失败,code = " + jsonMessage.ret;
            }
            if (errorText) {
                // MyUtils.clonePromptDialogLayer(errorText, jsonMessage.ret == 0);
            }
            return true;
        } else if (jsonMessage.msgID == eMsgType.MSG_ROOM_STAND_UP) {
            this._delegate.standUp(jsonMessage.idx);
            return true;
        } else if (jsonMessage.msgID == eMsgType.MSG_PLAYER_OPEN_ROOM) {
            var errorText = null;
            if (jsonMessage.ret == 1) {
                errorText = "您不是房间的创建者";
            } else if (jsonMessage.ret == 2) {
                errorText = "您没有在该房间";
            } else if (jsonMessage.ret == 200) {
                errorText = "没有找到该房间";
            } else if (jsonMessage.ret == 201) {
                errorText = "操作超时";
            } else if (jsonMessage.ret != 0) {
                errorText = "开始失败,code = " + jsonMessage.ret;
            }
            if (errorText) {
                // MyUtils.clonePromptDialogLayer(errorText, jsonMessage.ret == 0);
            }
            return true;
        } else if (jsonMessage.msgID == eMsgType.MSG_ROOM_DO_OPEN) {
            this._delegate.openRoom();
            return true;
        }
    }

    onDestroy() {
        // if (cc.sys.isNative) {
        //     cc.eventManager.removeCustomListeners("onWXShare");
        // }
        cc.systemEvent.targetOff(this);
        DDZDataMgrIns.clearAllData();
    }
}