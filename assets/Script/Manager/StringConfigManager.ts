import Singleton from '../Utils/Singleton';

class StringConfigManager extends Singleton {
    private m_config = null;

    _init() {
        super._init();
        cc.loader.loadRes('config/string_config', (err, res) => {
            if (err == null) {
                if (res.cfg) {
                    this.m_config = res.cfg;
                }
            }
            else {
                cc.error(err);
            }
        });
    }

    getStrByKey(key, lan = 'cn') {
        let ret = '';

        if (this.m_config == null) {
            return key;
        }

        if (this.m_config[key] && this.m_config[key][lan]) {
            ret = this.m_config[key][lan];
        }

        return ret;
    }
}

export default new StringConfigManager();