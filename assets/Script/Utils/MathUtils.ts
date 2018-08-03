import Singleton from './Singleton';

class MatchUtils extends Singleton {

    getRandomBetween(x: number, y: number) {
        let min = Math.min(x, y);
        
        let num = Math.random() * Math.abs(x - y) + min;
        return num;
    }

    getRandomTenBetween(n: number, m: number) {
        let random = Math.floor(Math.random()*(m-n+1)+n);
        return random;
    }
}

export default new MatchUtils();