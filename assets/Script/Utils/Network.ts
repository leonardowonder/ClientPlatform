import Singleton from './Singleton';

import ClientDefine from '../Define/ClientDefine';

import { eMsgPort, eMsgType } from '../Define/MessageIdentifer';

class Network extends Singleton {

    protected mWebSocket: WebSocket = null;
    protected mDstIP: string;
    protected vMsgCallBack: any[] = [];
    protected nSessionID: number = 0;
    protected isRecievedHeatBet: boolean = false;
    protected nTimeoutHandleNum: number = -1;

    setSessionID(newSessionID: number) {
        this.nSessionID = newSessionID;
    }

    getSessionID() {
        return this.nSessionID;
    }

    connect(dstIP: string) {
        this.mDstIP = dstIP;
        this.doConnect();
    }

    doConnect() {
        if (this.mWebSocket && (this.mWebSocket.readyState == WebSocket.CONNECTING || WebSocket.OPEN == this.mWebSocket.readyState)) {
            cc.error('alredy doing reconnect , so need not connect state : ' + this.mWebSocket.readyState);
            return;
        }

        this.mWebSocket = new WebSocket(this.mDstIP);
        this.mWebSocket.onclose = this.onClose.bind(this);
        this.mWebSocket.onopen = this.onOpen.bind(this);;
        this.mWebSocket.onmessage = this.onMsg.bind(this);
        this.mWebSocket.onerror = this.onError.bind(this);
    }

    onClose(ev: any) {
        cc.log(' on closed  try again' + ev.data);
        let self = this;
        setTimeout(function () {
            cc.log('do reconnecting');
            self.doConnect();
        }, 2000);

        let pEvent = new cc.Event.EventCustom(ClientDefine.netEventClose, true);
        cc.systemEvent.dispatchEvent(pEvent);
    }

    close() {
        this.mWebSocket.close();
    }

    onOpen(ev: any) {
        cc.log(' on open ');
        let jsMsg = {};
        let self = this;
        this.sendMsg(jsMsg, eMsgType.MSG_VERIFY_CLIENT, eMsgPort.ID_MSG_PORT_GATE, 0, (jsm: any) => {
            let pEvent: any;
            if (jsm['nRet'] != 0) {
                cc.error('can not verify this client ret :' + jsm['nRet']);
                pEvent = new cc.Event.EventCustom(ClientDefine.netEventFialed, true);
                cc.systemEvent.dispatchEvent(pEvent);
                return;
            }

            // decide if need reconnect 
            if (self.getSessionID() == 0) // we need not reconnect 
            {
                self.setSessionID(jsm['nSessionID']);
                pEvent = new cc.Event.EventCustom(ClientDefine.netEventOpen, true);
                pEvent.detail = self.getSessionID();
                cc.systemEvent.dispatchEvent(pEvent);
                cc.log('verifyed session id = ' + jsm['nSessionID'] + ' ret =' + jsm['nRet']);
                return;
            }

            // we need do reconnect 
            let jsRec = {};
            jsRec['nSessionID'] = self.getSessionID();
            self.sendMsg(jsRec, eMsgType.MSG_RECONNECT, eMsgPort.ID_MSG_PORT_GATE, 0, (jsRet: any) => {
                let ret: number = jsRet['nRet'];
                self.setSessionID(jsRet['sessionID']);
                let ev: any = ClientDefine.netEventReconnectd;
                if (0 != ret) // reconnect ok 
                {
                    ev = ClientDefine.netEventReconnectdFailed;
                }
                let pEvent = new cc.Event.EventCustom(ev, true);
                pEvent.detail = self.getSessionID();
                cc.systemEvent.dispatchEvent(pEvent);
            });

            cc.log('verifyed session id = ' + jsm['nSessionID'] + ' ret =' + jsm['nRet'] + 'do reconnect');
        });

        if (-1 != this.nTimeoutHandleNum) {
            clearTimeout(this.nTimeoutHandleNum);
        }
        this.doSendHeatBet();
    }

    onMsg(ev: any) {
        //cc.log(' on msg ' + ev.data );
        if (ev.data == 'H') {
            //cc.log(' do read heat bet on msg ' + ev.data );
            this.isRecievedHeatBet = true;
            return;
        }

        console.log(' on msg ' + ev.data);
        let msg = JSON.parse(ev.data);
        if (msg == null) {
            cc.error('can not pase set msg : ' + ev.data);
            return;
        }

        let nMsgID: number = msg[ClientDefine.msgKey];
        // check call back 
        for (let idx = 0; idx < this.vMsgCallBack.length; ++idx) {
            if (this.vMsgCallBack[idx][0] != nMsgID) {
                continue;
            }
            this.vMsgCallBack[idx][1](msg);
            this.vMsgCallBack.splice(idx, 1);
            // return  ;
            break;
        }
        //console.log('dispath msg id ' + msg );
        /// dispatch event ;
        let pEvent = new cc.Event.EventCustom(ClientDefine.netEventMsg, true);
        pEvent.detail = {};
        pEvent.detail[ClientDefine.msgKey] = nMsgID;
        pEvent.detail[ClientDefine.msg] = msg;
        cc.systemEvent.dispatchEvent(pEvent);
    }

    onError(ev: any) {
        cc.log(' on error  ');
        let self = this;
        setTimeout(function () {
            cc.log('do reconnecting');
            self.doConnect();
        }, 2000);

        let pEvent = new cc.Event.EventCustom(ClientDefine.netEventFialed, true);
        cc.systemEvent.dispatchEvent(pEvent);
    }

    sendMsg(jsMsg: any, msgID: number, targetPort: number, targetID: number, callBack: Function = null): boolean {
        if (this.mWebSocket.readyState != WebSocket.OPEN) {
            cc.error('socket is not open , can not send msgid = ' + msgID);
            return false;
        }
        let jsPacket = {};
        jsMsg[ClientDefine.msgKey] = msgID;

        jsPacket['cSysIdentifer'] = targetPort;
        jsPacket['nTargetID'] = targetID;
        jsPacket['JS'] = JSON.stringify(jsMsg);
        this.mWebSocket.send(JSON.stringify(jsPacket));

        console.log('send msg : ' + JSON.stringify(jsPacket));
        if (callBack != null) // reg call back ;
        {
            let p: [number, Function];
            p = [msgID, callBack];
            this.vMsgCallBack.push(p);
        }
        return true;
    }

    doSendHeatBet() {
        // send heat bet ;
        if (this.mWebSocket.readyState != WebSocket.OPEN) {
            cc.error('socket is not open , can not send heat bet ');
            return;
        }

        let p = 'H';
        this.mWebSocket.send(p);
        this.isRecievedHeatBet = false;
        let self = this;
        this.nTimeoutHandleNum = setTimeout(function () {
            if (self.isRecievedHeatBet == false) {
                if (self.mWebSocket.readyState != WebSocket.OPEN) {
                    cc.log('already known disconnect so need not notify close');
                    return;
                }

                let js = { data: 'heat bet time out' };
                // do disconnected ;
                self.onClose(js);
            }
            else {
                self.doSendHeatBet();
            }
        }, ClientDefine.time_heat_bet * 1000);
    }
}

export default new Network();