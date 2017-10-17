// SAT-Collision.js
function SAT_Collision(polygonA, polygonB) {// 以polygonA為基準
    // Get the normal vector on the edge of the polygon(left norm), return Array
    let normal_polygonA = polygonA.getNorm(),
        normal_polygonB = polygonB.getNorm();
    // merge normal_polygonA and normal_polygonB
    let normals = [];
    normals = normals.concat(normal_polygonA, normal_polygonB);
    // Get the vertex array of polygons, return Array
    let vertices_polygonA = polygonA.getVertices(),
        vertices_polygonB = polygonB.getVertices();

    let isSeparated = false;

    let MTV = new Vector(9000, 9000);
    // use polygonA normals to evaluate
    for (let i = 0; i < normals.length; i++) {
        let minMax_A = getMinMax_ProjectLength(vertices_polygonA, normals[i]),
            minMax_B = getMinMax_ProjectLength(vertices_polygonB, normals[i]);

        isSeparated = (minMax_B.min > minMax_A.max || minMax_A.min > minMax_B.max);
        if (isSeparated) break;

        // 在A物體的軸上跟在B物體軸上的運算overlap會差一個負號
        let d1 = minMax_A.max - minMax_B.min;
        let d2 = minMax_B.max - minMax_A.min;
        let overlap = d1 < d2 ? d1 : d2;
        if (Math.abs(overlap) < MTV.length()) {
            let n = normals[i].clone().norm();
            MTV = n.multiplyScalar(overlap);
        }
    }
    // 在最後判斷這個是以哪個物體的分離軸為準，如果dot值為負代表方向相反了
    // 因為D的意思是A-B的向量(以A為基準)
    // 當物體B撞到A時，要有一個反向的MTV將它推回去，這就代表他的方向一定不會是往A
    // 這就是為什麼用dot來判斷是否相反
    let D = new Vector(polygonB.pos.x - polygonA.pos.x,polygonB.pos.y - polygonA.pos.y);
    if(MTV.dot(D) < 0) MTV.multiplyScalar(-1);

    // isSeparated = true:Separated boxes, false:Collided boxes
    return { isCollided: !isSeparated, mtv: MTV };
}

function getMinMax(vertices, axis) {
    let min_DotProduct = vertices[0].dot(axis),
        max_DotProduct = vertices[0].dot(axis);
    let min_index = 0, max_index = 0;

    for (let i = 1; i < vertices.length; i++) {
        let temp = vertices[i].dot(axis);

        if (temp < min_DotProduct) {
            min_DotProduct = temp;
            min_index = i;
        }

        if (temp > max_DotProduct) {
            max_DotProduct = temp;
            max_index = i;
        }
    }

    let result = {
        min: min_DotProduct,
        max: max_DotProduct,
        minPoint: vertices[min_index],
        maxPoint: vertices[max_index]
    };
    return result;
}

function getMinMax_ProjectLength(vertices, axis) {
    let min_DotProduct = vertices[0].projectLengthOnto(axis),
        max_DotProduct = vertices[0].projectLengthOnto(axis);
    let min_index = 0, max_index = 0;

    for (let i = 1; i < vertices.length; i++) {
        let temp = vertices[i].projectLengthOnto(axis);

        if (temp < min_DotProduct) {
            min_DotProduct = temp;
            min_index = i;
        }

        if (temp > max_DotProduct) {
            max_DotProduct = temp;
            max_index = i;
        }
    }

    let result = {
        min: min_DotProduct,
        max: max_DotProduct,
        minPoint: vertices[min_index],
        maxPoint: vertices[max_index]
    };
    return result;
}