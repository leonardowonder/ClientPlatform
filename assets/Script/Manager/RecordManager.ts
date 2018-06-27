import * as _ from 'lodash';

import clientDefine, { clientEventDefine, localStorageKey } from '../clientDefine';
import PlayerData from '../PlayerData';

class RecordManager {
    private m_beenInit: boolean = false;

    private m_allRecords: any[] = [];

    getInstance() {
        if (!this.m_beenInit) {
            this._init();
        }

        return this;
    }

    clearAll() {
        this.m_allRecords.length = 0;
    }

    getMaxSerialNum() {
        let ret = 0;
        if (this.m_allRecords.length > 0) {
            ret = this.m_allRecords[0].sieralNum;
        }

        return ret;
    }

    updateRecords(recordList) {
        _.reverse(recordList);
        this.m_allRecords = _.concat(recordList, this.m_allRecords);

        this._saveRecordToFile();
    }

    getRecordListByRecordType(recordType) {
        let list = [];
        if (this.m_allRecords.length > 0) {
            list = _.filter(this.m_allRecords, function (record) {
                let ret = false;
                if (recordType == clientDefine.gameType.mtt) {
                    ret = (record.mtt == 1);
                }
                else if (recordType == clientDefine.gameType.normal) {
                    ret = ((record.mtt == 0) && ((record.level >> 4) == 0));
                }
                else if (recordType == clientDefine.gameType.fast) {
                    ret = ((record.mtt == 0) && ((record.level >> 4) > 0));
                }
                else {
                    cc.warn('RecordManager getRecordListByRecordType recordType err, recordType =', recordType);
                }

                return ret;
            })
        }
        return list;
    }

    _init() {
        this._registEvents();
        this._loadFile();

        this.m_beenInit = true;
    }

    _registEvents() {
        cc.systemEvent.on(clientEventDefine.CUSTOM_EVENT_PLAYER_LOG_OUT, this._onPlayerLogOut, this)
    }

    _onPlayerLogOut() {
        this.m_beenInit = false;
    }

    _loadFile() {
        let str = cc.sys.localStorage.getItem(localStorageKey.MainRecordList + '_' + PlayerData.prototype.getInstance().getPlaterData().uid);

        this.m_allRecords = JSON.parse(str);
        if (this.m_allRecords == null) {
            cc.warn('RecordManager no record cache');
            this.m_allRecords = [];
        }
    }

    _saveRecordToFile() {
        let str = JSON.stringify(this.m_allRecords);

        cc.sys.localStorage.setItem(localStorageKey.MainRecordList + '_' + PlayerData.prototype.getInstance().getPlaterData().uid, str);
    }
}

export default new RecordManager();