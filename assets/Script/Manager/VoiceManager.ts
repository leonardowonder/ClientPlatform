const { ccclass } = cc._decorator;


export enum GotyeMessageType {
    GotyeMessageTypeText,   ///< text message
    GotyeMessageTypeImage,  ///< image message
    GotyeMessageTypeAudio,  ///< audio message
    GotyeMessageTypeUserData,  ///< user data
    GotyeMessageTypeJudgeService,  ///< Judge Service
}
//gotye 
export enum GotyeStatusCode {
    GCLOUD_VOICE_SUCC = 0,
    //common base err
    GCLOUD_VOICE_PARAM_NULL = 0x1001,	//4097, some param is null
    GCLOUD_VOICE_NEED_SETAPPINFO = 0x1002,	//4098, you should call SetAppInfo first before call other api
    GCLOUD_VOICE_INIT_ERR = 0x1003,	//4099, Init Erro
    GCLOUD_VOICE_RECORDING_ERR = 0x1004,		//4100, now is recording, can't do other operator
    GCLOUD_VOICE_POLL_BUFF_ERR = 0x1005,	//4101, poll buffer is not enough or null 
    GCLOUD_VOICE_MODE_STATE_ERR = 0x1006,	//4102, call some api, but the mode is not correct, maybe you shoud call SetMode first and correct
    GCLOUD_VOICE_PARAM_INVALID = 0x1007,	//4103, some param is null or value is invalid for our request, used right param and make sure is value range is correct by our comment 
    GCLOUD_VOICE_OPENFILE_ERR = 0x1008, //4104, open a file err
    GCLOUD_VOICE_NEED_INIT = 0x1009, //4105, you should call Init before do this operator
    GCLOUD_VOICE_ENGINE_ERR = 0x100A, //4106, you have not get engine instance, this common in use c# api, but not get gcloudvoice instance first
    GCLOUD_VOICE_POLL_MSG_PARSE_ERR = 0x100B, //4107, this common in c# api, parse poll msg err
    GCLOUD_VOICE_POLL_MSG_NO = 0x100C, //4108, poll, no msg to update
    //realtime err
    GCLOUD_VOICE_REALTIME_STATE_ERR = 0x2001, //8193, call some realtime api, but state err, such as OpenMic but you have not Join Room first
    GCLOUD_VOICE_JOIN_ERR = 0x2002, //8194, join room failed
    GCLOUD_VOICE_QUIT_ROOMNAME_ERR = 0x2003,	//8195, quit room err, the quit roomname not equal join roomname
    GCLOUD_VOICE_OPENMIC_NOTANCHOR_ERR = 0x2004,//8196, open mic in bigroom,but not anchor role
    //message err
    GCLOUD_VOICE_AUTHKEY_ERR = 0x3001, //12289, apply authkey api error
    GCLOUD_VOICE_PATH_ACCESS_ERR = 0x3002, //12290, the path can not access ,may be path file not exists or deny to access
    GCLOUD_VOICE_PERMISSION_MIC_ERR = 0x3003,	//12291, you have not right to access micphone in android
    GCLOUD_VOICE_NEED_AUTHKEY = 0x3004,		//12292,you have not get authkey, call ApplyMessageKey first
    GCLOUD_VOICE_UPLOAD_ERR = 0x3005,	//12293, upload file err
    GCLOUD_VOICE_HTTP_BUSY = 0x3006,	//12294, http is busy,maybe the last upload/download not finish.
    GCLOUD_VOICE_DOWNLOAD_ERR = 0x3007,	//12295, download file err
    GCLOUD_VOICE_SPEAKER_ERR = 0x3008, //12296, open or close speaker tve error
    GCLOUD_VOICE_TVE_PLAYSOUND_ERR = 0x3009, //12297, tve play file error
    GCLOUD_VOICE_AUTHING = 0x300a, // 12298, Already in applying auth key processing
    GCLOUD_VOICE_INTERNAL_TVE_ERR = 0x5001,		//20481, internal TVE err, our used
    GCLOUD_VOICE_INTERNAL_VISIT_ERR = 0x5002,	//20482, internal Not TVE err, out used
    GCLOUD_VOICE_INTERNAL_USED = 0x5003, //20483, internal used, you should not get this err num
    GCLOUD_VOICE_BADSERVER = 0x06001, // 24577, bad server address,should be 'udp://capi.xxx.xxx.com'
    GCLOUD_VOICE_STTING = 0x07001, // 28673, Already in speach to text processing
}

export enum GCloudVoiceCompleteCode {
    GV_ON_JOINROOM_SUCC = 1,	//join room succ
    GV_ON_JOINROOM_TIMEOUT,  //join room timeout
    GV_ON_JOINROOM_SVR_ERR,  //communication with svr occur some err, such as err data recv from svr
    GV_ON_JOINROOM_UNKNOWN, //reserved, our internal unknow err

    GV_ON_NET_ERR,  //net err,may be can't connect to network

    GV_ON_QUITROOM_SUCC, //quitroom succ, if you have join room succ first, quit room will alway return succ

    GV_ON_MESSAGE_KEY_APPLIED_SUCC,  //apply message authkey succ
    GV_ON_MESSAGE_KEY_APPLIED_TIMEOUT,		//apply message authkey timeout
    GV_ON_MESSAGE_KEY_APPLIED_SVR_ERR,  //communication with svr occur some err, such as err data recv from svr
    GV_ON_MESSAGE_KEY_APPLIED_UNKNOWN,  //reserved,  our internal unknow err

    GV_ON_UPLOAD_RECORD_DONE,  //upload record file succ
    GV_ON_UPLOAD_RECORD_ERROR,  //upload record file occur error
    GV_ON_DOWNLOAD_RECORD_DONE,	//download record file succ
    GV_ON_DOWNLOAD_RECORD_ERROR,	//download record file occur error

    GV_ON_STT_SUCC, // speech to text successful
    GV_ON_STT_TIMEOUT, // speech to text with timeout
    GV_ON_STT_APIERR, // server's error

    GV_ON_PLAYFILE_DONE,  //the record file played end

    GV_ON_ROOM_OFFLINE, // Dropped from the room
    GV_ON_UNKNOWN,
}

import VoiceDefine from '../Define/VoiceDefine';
import PlayerData from './PlayerData';

@ccclass
export default class VoiceManager {
    private static s_pVoiceManager: VoiceManager = null;
    private m_bIsInit: boolean = false;
    private m_pDelegate: any = null;

    private vDownloadQuene : Array<string>[] = [];
    private vUploadQuene : string[] = [] ;
    private vPlayingQuene : string[] = [] ;

    private isRecording : boolean = false ;
    private isPlayering : boolean = false ; 

    public canPlayNormalAudioEffect() : boolean
    {
        return this.isRecording == false && this.isPlayering == false ;
    }

    public getInstance() {
        if (VoiceManager.s_pVoiceManager == null) {
            VoiceManager.s_pVoiceManager = new VoiceManager();
        }
        return VoiceManager.s_pVoiceManager;
    }

    public onAppShow()
    {
        this.isRecording = false ;
        this.isPlayering = false ;
    }

    //使用时再调用这个接口，因为调用该接口会提示授权
    public initVoiceSDK = function () {
        //南京麻将不加前缀
        //青儿前缀 : a_
        //23张前缀 : b_
        //365赢天下前缀 : c_
        //金龙十三道前缀 : d_
        if (cc.sys.isNative && !this.m_bIsInit) {
            cc.find('persistRootNode').on('OnPlayRecordedFile', this.OnPlayRecordedFile,this);
            cc.find('persistRootNode').on('OnDownloadFile', this.OnDownloadFile,this);
            cc.find('persistRootNode').on('OnUploadFile', this.OnUploadFile,this);
            cc.find('persistRootNode').on('OnApplyMessageKey', this.OnApplyMessageKey,this);
            var code = SetAppInfo('1283305356', '454ef32b5c8b28831283663fbb7f4642', 'd_' + PlayerData.getInstance().getPlaterData().uid.toString());
            this.m_bIsInit = code == GotyeStatusCode.GCLOUD_VOICE_SUCC;
            return code;
        }
    }
    //开始录音
    //filePath : 绝对路径 jsb.fileUtils.getWritablePath() + xxxx + '.mp3';
    public StartRecording(filePath: string) {
        if (cc.sys.isNative) {
            if (this.m_bIsInit) {
                this.isRecording = true ;
                return StartRecording(filePath);
            } else {
                // 未初始化
                return this.initVoiceSDK();
            }
        }
    }
    //停止录音
    public StopRecording() {
        if (cc.sys.isNative) {
            if (this.m_bIsInit) {
                this.isRecording = false ;

                if ( this.vPlayingQuene.length > 0 && this.isPlayering == false )
                {
                    this.PlayRecordedFile(this.vPlayingQuene[0]);
                }

                return StopRecording();
            } else {
                // 未初始化
                return this.initVoiceSDK();
            }
        }
    }

    public downloadAndPlayVoice( filePath : string , fileID :string )
    {
        let vF : string[] = [ filePath,fileID] ;
        this.vDownloadQuene.push(vF);
        if ( this.vDownloadQuene.length == 1 )
        {
            this.DownloadRecordedFile(fileID,filePath);
        }
    }

    //下载语音文件
    protected DownloadRecordedFile(fileID: string, downloadFilePath: string, msTimeout: number = 6000) {
        if (cc.sys.isNative) {
            if (this.m_bIsInit) {
                return DownloadRecordedFile(fileID, downloadFilePath, msTimeout);
            } else {
                // 未初始化
                return this.initVoiceSDK();
            }
        }
    }

    //下载语音回调
    private OnDownloadFile(event: cc.Event.EventCustom) {
        //{code : GCloudVoiceCompleteCode , filePath : '' , fileID : ''};
        // if (this.m_pDelegate && typeof this.m_pDelegate.OnDownloadFile === 'function') {
        //     this.m_pDelegate.OnDownloadFile(event.getUserData());
        // }
        var json = JSON.parse(event.getUserData());
        let pEvent = new cc.Event.EventCustom(VoiceDefine.OnDownloadFile,true) ;
        pEvent.detail = json
        cc.systemEvent.dispatchEvent(pEvent);
    
        if ( GCloudVoiceCompleteCode.GV_ON_DOWNLOAD_RECORD_DONE == json.code )
        {
            // try to player ;
            this.playLocalVoiceFile(json.filePath );
        }

        this.vDownloadQuene.shift();
        if ( this.vDownloadQuene.length > 0 )
        {
            let vFileItem : string[] = this.vDownloadQuene[0] ;
            this.DownloadRecordedFile(vFileItem[0],vFileItem[1]);
        }

        if ( GCloudVoiceCompleteCode.GV_ON_DOWNLOAD_RECORD_DONE != json.code )
        {
            cc.error( ' OnDownloadFile ' + json.code );
        }
    }

    public playLocalVoiceFile( filePath : string )
    {
        this.vPlayingQuene.push(filePath);
        if ( 1 == this.vPlayingQuene.length && this.isRecording == false )
        {
            this.PlayRecordedFile(filePath);
        }
    }
    //播放语音文件
    protected PlayRecordedFile(FilePath: string) {
        if (cc.sys.isNative) {
            if (this.m_bIsInit) {

                let pEvent = new cc.Event.EventCustom(VoiceDefine.OnStartPlayVoice,true) ;
                pEvent.detail = { file : FilePath } ;
                cc.systemEvent.dispatchEvent(pEvent);
                this.isPlayering = true ;
                return PlayRecordedFile(FilePath);
            } else {
                // 未初始化
                return this.initVoiceSDK();
            }
        }
    }

    // //在场景onDestroy的时候调用
    // public clearDelegate() {
    //     this.m_pDelegate = null;
    // }
    // //在场景onLoad的时候调用
    // public setDelegate(delegate: any) {
    //     this.m_pDelegate = delegate;
    // }
    //播放语音回调
    public OnPlayRecordedFile(event: cc.Event.EventCustom) {
        //{code : GCloudVoiceCompleteCode , filePath : ''};

        let pEvent = new cc.Event.EventCustom(VoiceDefine.OnPlayRecordedFile,true) ;
        pEvent.detail = JSON.parse(event.getUserData());
        cc.systemEvent.dispatchEvent(pEvent);

        // if (this.m_pDelegate && typeof this.m_pDelegate.OnPlayRecordedFile === 'function') {
        //     this.m_pDelegate.OnPlayRecordedFile(event.getUserData());
        // }
        this.isPlayering = false ;
        this.vPlayingQuene.shift();
        if ( this.vPlayingQuene.length > 0 && this.isRecording == false )
        {
            this.PlayRecordedFile(this.vPlayingQuene[0]);
        }

        if ( pEvent.detail.code != GCloudVoiceCompleteCode.GV_ON_PLAYFILE_DONE)
        {
            cc.error( ' OnPlayRecordedFile ' + pEvent.detail.code );
        }
    }

    public uploadVoiceFile( filePath: string )
    {
        //this.vUploadQuene.unshift(filePath);
        //if ( 1 == this.vUploadQuene.length )
        {
            //this.vUploadQuene.shift();
            this.UploadRecordedFile(filePath);
        }
    }
    //上传语音文件
    protected UploadRecordedFile(filePath: string, msTimeout: number = 6000) {
        if (cc.sys.isNative) {
            if (this.m_bIsInit) {
                return UploadRecordedFile(filePath, msTimeout);
            } else {
                // 未初始化
                return this.initVoiceSDK();
            }
        }
    }

    //上传语音回调
    private OnUploadFile(event: cc.Event.EventCustom) {
        //{code : GCloudVoiceCompleteCode , filePath : '' , fileID : ''};
        // if (this.m_pDelegate && typeof this.m_pDelegate.OnUploadFile === 'function') {
        //     this.m_pDelegate.OnUploadFile(event.getUserData());
        // }
        console.log('OnUploadFile : ' + event.getUserData());
        let pEvent = new cc.Event.EventCustom(VoiceDefine.OnUploadFile,true) ;
        pEvent.detail = JSON.parse(event.getUserData());
        cc.systemEvent.dispatchEvent(pEvent);

        //this.vUploadQuene.shift();
        //if ( this.vUploadQuene.length > 0 )
        //{
        //    this.UploadRecordedFile(this.vUploadQuene[0]);
        //}

        if ( pEvent.detail.code != GCloudVoiceCompleteCode.GV_ON_UPLOAD_RECORD_DONE)
        {
            cc.error( ' OnUploadFile ' + pEvent.detail.code );
        }
    }
    //初始化sdk回调
    private OnApplyMessageKey(event: cc.Event.EventCustom) {
        //{code : GCloudVoiceCompleteCode};
        // if (this.m_pDelegate && typeof this.m_pDelegate.OnApplyMessageKey === 'function') {
        //     this.m_pDelegate.OnApplyMessageKey(event.getUserData());
        // }
        let pEvent = new cc.Event.EventCustom(VoiceDefine.OnApplyMessageKey,true) ;
        pEvent.detail = JSON.parse(event.getUserData());
        cc.systemEvent.dispatchEvent(pEvent);
        if ( pEvent.detail.code )
        {
            cc.error( ' OnApplyMessageKey ' + pEvent.detail.code );
        }
    }
};

