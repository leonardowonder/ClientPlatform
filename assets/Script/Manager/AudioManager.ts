const { ccclass } = cc._decorator;

import VoiceManager from './VoiceManager';

@ccclass
export default class AudioManager {
    private static s_pAudioManager: AudioManager = null;
    private m_nBackGroundMusicID: number = 0;
    private m_nBackGroundMusicPath: string = '';
    private m_nEffectID: number = 0;

    public getInstance() {
        if (AudioManager.s_pAudioManager == null) {
            AudioManager.s_pAudioManager = new AudioManager();
        }
        return AudioManager.s_pAudioManager;
    }

    //播放背景音乐
    public playerBackGroundMusic(musicPath) {
        this.m_nBackGroundMusicPath = musicPath;
        this.stopBackGroundMusic();
        this.m_nBackGroundMusicID = cc.audioEngine.play(cc.url.raw(musicPath), true, this.getBackGroundMusicValue());
        console.log(' AudioManager.backGroundMusicID : ' + this.m_nBackGroundMusicID);
    }

    //获得正在播放的背景声音的路径
    public getBackGroundMusicPath() {
        return this.m_nBackGroundMusicPath;
    }

    //停止背景音乐
    public stopBackGroundMusic() {
        cc.audioEngine.stop(this.m_nBackGroundMusicID);
        this.m_nBackGroundMusicID = 0;
    }

    //获得背景音乐音量大小
    public getBackGroundMusicValue() {
        var music = cc.sys.localStorage.getItem('BackGroundMusicValue');
        if (!music && music != 0) {
            music = 0.5;
        }
        return parseFloat(music);
    }

    //设置背景音乐音量大小
    public setBackGroundMusicValue(value) {
        cc.sys.localStorage.setItem('BackGroundMusicValue', value);
        cc.audioEngine.setVolume(this.m_nBackGroundMusicID, parseFloat(value));
    }

    //播放音效
    public playerEffect = (musicPath) => {
        let isCanPlay = VoiceManager.prototype.getInstance().canPlayNormalAudioEffect();
        if (false == isCanPlay) {
            return;
        }
        this.m_nEffectID = cc.audioEngine.play(cc.url.raw(musicPath), false, this.getEffectValue());
    }

    //设置音效音量大小
    public setEffectValue = (value) => {
        cc.sys.localStorage.setItem('EffectMusicValue', value);
        cc.audioEngine.setVolume(this.m_nEffectID, parseFloat(value));
    }

    //获取音效音量大小
    public getEffectValue = (): number => {
        var value = cc.sys.localStorage.getItem('EffectMusicValue');
        if (!value && value != 0) {
            value = 0.5;
        }
        return parseFloat(value);
    }

    public stopAll = () => {
        cc.audioEngine.stopAll();
    }

    public pauseAll = () => {
        cc.audioEngine.pauseAll();
    }

    public resumeAll = () => {
        cc.audioEngine.resumeAll();
    }
};
