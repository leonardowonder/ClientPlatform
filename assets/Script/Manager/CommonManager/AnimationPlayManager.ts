import * as async from 'async';
import * as _ from 'lodash';

import Singleton from '../../Utils/Singleton';

export class Anim {
    public key: string;
    public animPlayCallback: Function;
    public playTime: number;
    public animStopCallback: Function;

    constructor(key: string, playCallback: Function, time: number, stopCallback: Function) {
        this.key = key;
        this.animPlayCallback = playCallback;
        this.playTime = time;
        this.animStopCallback = stopCallback;
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

    getCurAnim(): Anim {
        let anim = _.find(this.m_animList, (anim: Anim) => {
            return this.m_curAnimKey == anim.key;
        });

        return anim;
    }

    getCurAnimKey() {
        return this.m_curAnimKey;
    }

    isPlaying() {
        return this.m_isPlayingAnim;
    }

    stopPlay() {
        this.m_shouldPlay = false;

        let curAnim = this.getCurAnim();
        curAnim && curAnim.animStopCallback && curAnim.animStopCallback();
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
                    if (anim == null) {
                        cc.warn('AnimationPlayManager startPlay anim = null');
                        next();
                    }
                    else {
                        this.m_curAnimKey = anim.key;
    
                        anim.animPlayCallback && anim.animPlayCallback();
    
                        if (anim.playTime && anim.playTime > 0) {
                            setTimeout(() => {
                                anim.animStopCallback && anim.animStopCallback();
                                next();
                            }, anim.playTime);
                        }
                        else {
                            next();
                            cc.warn('AnimationPlayManager startPlay playTime =', anim.playTime, 'key =', anim.key);
                        }
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