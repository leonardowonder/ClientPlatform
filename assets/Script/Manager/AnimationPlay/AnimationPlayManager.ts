import * as async from 'async';

import Singleton from '../../Utils/Singleton';

class Anim {
    public key: string;
    public animCallback: Function;
    public playTime: number;

    constructor(key: string, callback: Function, time: number) {
        this.key = key;
        this.animCallback = callback;
        this.playTime = time;
    }
}

class AnimationPlayManager extends Singleton {

    private m_animList: Anim[] = [];

    private m_isPlayingAnim: boolean = false;
    private m_shouldPlay: boolean = true;
    private m_curAnimKey: string = null;

    addAnim(anim: Anim) {
        this.m_animList.push(anim);
    }

    clearAnimList() {
        this.m_animList.length = 0;
    }

    getCurAnim() {
        return this.m_curAnimKey;
    }

    isPlaying() {
        return this.m_isPlayingAnim;
    }

    stopPlay() {
        this.m_shouldPlay = false;
    }

    startPlay() {
        if (this.m_animList.length < 1) {
            return;
        }

        this.m_isPlayingAnim = true;

        async.eachSeries(
            this.m_animList,
            (anim: Anim, next: Function) => {
                if (this.m_shouldPlay) {
                    this.m_curAnimKey = anim.key;

                    anim.animCallback && anim.animCallback();

                    if (anim.playTime && anim.playTime > 0) {
                        setTimeout(() => {
                            next();
                        }, anim.playTime);
                    }
                    else {
                        next();
                        cc.warn('AnimationPlayManager startPlay playTime =', anim.playTime, 'key =', anim.key);
                    }
                }
                else {
                    next('stop play now');
                }
            },
            () => {
                this.m_shouldPlay = true;
                this.m_curAnimKey = null;
                this.m_isPlayingAnim = false;
            }
        )
    }
}

export default new AnimationPlayManager();