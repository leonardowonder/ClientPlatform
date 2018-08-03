import { DDZCardType } from '../../resources/NewDDZ/script/Module/DDZGameDefine';

import { EmSexType } from '../Define/ClientDefine';

import MathUtils from './MathUtils';

import PlayerDataManager from '../Manager/DataManager/PlayerDataManager';

const rootPath = 'resources/music';

export function getCallBankerVoicePath(times: number, gamePlayer: any): string {
    let isMan: boolean = true;
    let player = PlayerDataManager.getInstance().getPlayerData(gamePlayer.uid);
    if (player) {
        isMan = player.sex == EmSexType.Type_Male;
    }

    let folder: string = isMan ? '/male_voice' : '/female_voice';
    let voicePath: string = '';
    switch (times) {
        case 0: {
            voicePath = isMan ? '/man_not_call.mp3' : '/female_not_call.mp3';
            break;
        }
        case 1: {
            voicePath = isMan ? '/man_1_point.mp3' : '/female_1_point.mp3';
            break;
        }
        case 2: {
            voicePath = isMan ? '/man_2_point.mp3' : '/female_2_point.mp3';
            break;
        }
        case 3: {
            voicePath = isMan ? '/man_3_point.mp3' : '/female_3_point.mp3';
            break;
        }
        default: {
            break;
        }
    }

    let ret: string = rootPath + folder + voicePath;
    return ret;
}

function valueToNumber(value: number) {
    let num: number = 0;
    switch (value) {
        case 14: {
            num = 1;
            break;
        }
        case 16: {
            num = 2;
            break;
        }
        case 18: {
            num = 14;
            break;
        }
        case 19: {
            num = 15;
            break;
        }
        default: {
            num = value;
            break;
        }
    }

    return num;
}

export function getDiscardVoicePath(type: DDZCardType, value: number, gamePlayer: any): string {
    let isMan: boolean = true;
    let player = PlayerDataManager.getInstance().getPlayerData(gamePlayer.uid);
    if (player) {
        isMan = player.sex == EmSexType.Type_Male;
    }

    let folder: string = isMan ? '/Man' : '/Woman';
    let voicePath: string = '';
    switch (type) {
        case DDZCardType.Type_Single: {
            voicePath = isMan ? `/Man_${valueToNumber(value)}.mp3` : `/Woman_${valueToNumber(value)}.mp3`;
            break;
        }
        case DDZCardType.Type_DuiZi: {
            voicePath = isMan ? `/Man_dui${valueToNumber(value)}.mp3` : `/Woman_dui${valueToNumber(value)}.mp3`;
            break;
        }
        case DDZCardType.Type_SanZhang_0: {
            voicePath = isMan ? `/Man_tuple${valueToNumber(value)}.mp3` : `/Woman_tuple${valueToNumber(value)}.mp3`;
            break;
        }
        case DDZCardType.Type_SanZhang_1: {
            voicePath = isMan ? `/Man_sandaiyi.mp3` : `/Woman_sandaiyi.mp3`;
            break;
        }
        case DDZCardType.Type_SanZhang_2: {
            voicePath = isMan ? `/Man_sandaiyidui.mp3` : `/Woman_sandaiyidui.mp3`;
            break;
        }
        case DDZCardType.Type_ShunZi: {
            voicePath = isMan ? `/Man_shunzi.mp3` : `/Woman_shunzi.mp3`;
            break;
        }
        case DDZCardType.Type_LianDui: {
            voicePath = isMan ? `/Man_liandui.mp3` : `/Woman_liandui.mp3`;
            break;
        }
        case DDZCardType.Type_FeiJi_0:
        case DDZCardType.Type_FeiJi_1:
        case DDZCardType.Type_FeiJi_2: {
            voicePath = isMan ? `/Man_feiji.mp3` : `/Woman_feiji.mp3`;
            break;
        }
        case DDZCardType.Type_ZhaDan_1: {
            voicePath = isMan ? `/Man_sidaier.mp3` : `/Woman_sidaier.mp3`;
            break;
        }
        case DDZCardType.Type_ZhaDan_0: {
            voicePath = isMan ? `/Man_sidailiangdui.mp3` : `/Woman_sidailiangdui.mp3`;
            break;
        }
        case DDZCardType.Type_ZhaDan_0: {
            voicePath = isMan ? `/Man_zhadan.mp3` : `/Woman_zhadan.mp3`;
            break;
        }
        case DDZCardType.Type_JokerZhaDan: {
            voicePath = isMan ? `/Man_wangzha.mp3` : `/Woman_wangzha.mp3`;
            break;
        }
        default: {
            break;
        }
    }

    let ret: string = rootPath + folder + voicePath;
    return ret;
}

export function getCanotOfferVoicePath(gamePlayer: any): string {
    let isMan: boolean = true;
    let player = PlayerDataManager.getInstance().getPlayerData(gamePlayer.uid);
    if (player) {
        isMan = player.sex == EmSexType.Type_Male;
    }

    let folder: string = isMan ? '/Man' : '/Woman';

    let idx = MathUtils.getInstance().getRandomTenBetween(1, 4);
    let voicePath: string = isMan ? `/Man_buyao${idx}.mp3` : `/Woman_buyao${idx}.mp3`;

    let ret: string = rootPath + folder + voicePath;
    return ret;
}