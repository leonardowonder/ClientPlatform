export function addNewNodeFunc(parentNode: cc.Node, prefab: cc.Prefab, pool: cc.NodePool): cc.Node {
    if (pool.size() < 1) {
        let newNode = cc.instantiate(prefab);
        pool.put(newNode);
    }

    let node = pool.get();

    parentNode.addChild(node);

    return node;
}