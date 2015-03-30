/**
 *
 * @param {WebGLRenderingContext}gl WebGL context
 * @param {number}[size=1.0]        Size
 * @param {number}[divisions=10]    Divisions
 * @return
 */
export function createGrid(gl, size, divisions){
    size = (typeof size !== 'undefined') ? size : 1.0;
    divisions = (typeof divisions !== 'undefined') ? divisions : 10;

    var i,
        segmentSize = size / divisions,
        vertexPositionData = [];

    for(i=0; i <= divisions; ++i) {
        for(var j=0;j<=divisions;++j) {
            vertexPositionData.push(i * segmentSize);
            vertexPositionData.push(0.0);
            vertexPositionData.push(j * segmentSize);
        }
    }

    var indexData = [0];
    for(var row=0; row < divisions; ++row){
        if(row % 2 == 0) {
            for(i = 0;i <= divisions; ++i) {
                indexData.push( (row + (i !== 0 ? 0 : 1) )*(divisions+1) + i);
            }
        } else {
            for(i=0; i<= divisions;++i) {
                indexData.push( (row + (i !== 0 ? 1 : 2) )*(divisions+1) - (i + 1) );
            }
        }
    }
    var trianglesVerticeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, trianglesVerticeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    trianglesVerticeBuffer.itemSize = 3;
    trianglesVerticeBuffer.numItems = vertexPositionData.length / 3;

    var vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
    vertexIndexBuffer.itemSize = 3;
    vertexIndexBuffer.numItems = indexData.length;

    //FIXME: need more general solution
    return {
        vertexBuffer: trianglesVerticeBuffer,
        vertexIndexBuffer: vertexIndexBuffer
    }
}

/**
 *
 * @param {WebGLRenderingContext}gl WebGL context
 * @param {number}[size=1]          Size
 * @returns {{vertexBuffer: WebGLBuffer, vertexIndexBuffer: WebGLBuffer}}
 */
export function createSquare(gl, size){
    size = (typeof size !== 'undefined') ? size : 1.0;
    var vertexPositionData = [
        0.0, 0.0, 0.0,
        -size, -size, 0.0,
        size, -size, 0.0,
        size, size, 0.0,
        -size,size, 0.0
    ];

    var indexData = [0,1,2,0,2,3,0,3,4,0,4,1],
        trianglesVerticeBuffer = gl.createBuffer(),
        vertexIndexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, trianglesVerticeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    trianglesVerticeBuffer.itemSize = 3;
    trianglesVerticeBuffer.numItems = vertexPositionData.length / 3;

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
    vertexIndexBuffer.itemSize = 3;
    vertexIndexBuffer.numItems = indexData.length;

    //FIXME: need more general solution
    return {
        vertexBuffer: trianglesVerticeBuffer,
        vertexIndexBuffer: vertexIndexBuffer
    };
}