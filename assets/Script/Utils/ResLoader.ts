import Singleton from './Singleton';

class ResLoader extends Singleton {
    loadRes(path: string = '', successCallback: Function, failCallback: Function, loadEndCallback: Function) {
        cc.loader.loadRes(path, (err, res) => {
            if (err != null) {
                cc.warn('ResLoader load fail err =', err);
                failCallback && failCallback();
            }
            else {
                successCallback && successCallback(res);
            }

            loadEndCallback && loadEndCallback();
        });
    }
}

export default new ResLoader();