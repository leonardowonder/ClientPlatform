class FVMask {
    MASK_ (flag) {
        return 0X01 << (flag);
    }

	HasAny (flag, mask) {
		return ((flag & mask) != 0);
	}
	
	HasAll (flag, mask) {
		return ((flag & mask) == mask);
	}

	Add (flag, mask) {
        flag |= mask;
        return flag;
	}

	Del (flag, mask) {
        flag &= ~ mask;
        return flag;
	}

	Remove(flag, mask) {
		return (flag & (~ mask));
	}
};

export default new FVMask();
