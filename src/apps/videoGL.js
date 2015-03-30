import {mat4} from '../../node_modules/gl-matrix/dist/gl-matrix.js';
import {default as _} from '../../node_modules/lodash/index.js';
import {createShader} from '../utils/shaders.js';


var RAD = Math.PI / 180;

var canvas,
    gl,

// Shader states
    paused = false,
    useTexture = false,
    useLighting = false,

    cubeVerticesBuffer,
    cubeVerticesTextureCoordBuffer,
    cubeVerticesNormalBuffer,
    cubeVerticesIndexBuffer,
    cubeRotation = 0.0,
    lastCubeUpdateTime = 0,

    cubeTexture,

    mvMatrix = mat4.create(),
    pMatrix = mat4.create(),

    shaderProgram,
    vertexPositionAttribute,
    vertexNormalAttribute,
    textureCoordAttribute,

    videoElement;

$(document).keyup(function(evt){
    switch(evt.keyCode){
        case 80: //'p'
            paused =!paused;
            break;
        case 84: //'t'
            useTexture =!useTexture;
            if(useTexture) {
                gl.uniform1i(shaderProgram.uDoTexturing, 1);
            } else {
                gl.uniform1i(shaderProgram.uDoTexturing, 0);
            }
            break;
        case 76: //'l'
            useLighting =!useLighting;
            break;
        default:
            break;
    }
});


$(function() {
    canvas = document.getElementById("glcanvas");

    videoElement = document.getElementById("video");

    initWebGL(canvas);      // Initialize the GL context
    initShader();
    initBuffers();
    initTextures();
    getMatrixUniforms();
    function animLoop(){
        //setupWebGL();
        //setupDynamicBuffers();
        //setMatrixUniforms();
        drawScene();
        !videoElement.paused ? requestAnimationFrame(animLoop, canvas) : _.noop;
    }

    videoElement.addEventListener("canplaythrough", function startVideo(){
        videoElement.play();
        animLoop()
    }, true);
});

var mousePos = {};
document.onmousemove = function(event){
    mousePos = {
        x: event.clientX - window.innerWidth / 2,
        y: event.clientY - window.innerHeight / 2
    }
};

function initWebGL() {
    try {
        gl = canvas.getContext("webgl");
    } catch(e) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
    }

    // Only continue if WebGL is available and working
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
}


function initShader() {
    shaderProgram = createShader(gl, require('../shaders/video-gl-vs.glsl'), require('../shaders/video-gl-fs.glsl'));
}

function initBuffers() {
    cubeVerticesBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);

    var width = videoElement.videoWidth / videoElement.videoHeight;
    var vertices = [-width, -1.0,  0.0, width, -1.0,  0.0, width,  1.0,  0.0, -width,  1.0,  0.0 ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVerticesNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer);

    var vertexNormals = [ 0.0,  0.0,  1.0, 0.0,  0.0,  1.0, 0.0,  0.0,  1.0, 0.0,  0.0,  1.0 ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);

    // Map the texture onto the cube's faces.
    cubeVerticesTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);

    var textureCoordinates = [ 0.0,  0.0, 1.0,  0.0, 1.0,  1.0, 0.0,  1.0 ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
    cubeVerticesIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);

    var cubeVertexIndices = [ 0,  1,  2,      0,  2,  3 ];

    // Now send the element array to GL
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);


    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);

    textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(textureCoordAttribute);

    vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(vertexNormalAttribute);
}

function initTextures() {
    cubeTexture = gl.createTexture();
    shaderProgram.uDoTexturing = gl.getUniformLocation(shaderProgram, "uDoTexturing");
    gl.uniform1i(shaderProgram.uDoTexturing, 1);
}

function updateTexture() {
    gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoElement);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    if (!gl.isTexture(cubeTexture)){
        console.log('Gaz van');
    }
    //gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function getMatrixUniforms(){
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function drawScene() {
    updateTexture();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(pMatrix, 45, canvas.width / canvas.height, 0.1, 100.0);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0, 0, -3.0]);

    //mvRotate(mousePos.x / 5, [0, 0, -1]);
    //mvRotate(mousePos.y / 5, [1, 0, 0]);
    //mvRotate(80 / 5, [0, 0, -1]);
    mat4.rotate(mvMatrix, mvMatrix, 80 / 5 * RAD , [0, 0, 1]);
    mat4.rotate(mvMatrix, mvMatrix, -250 / 5 * RAD , [1, 0, 0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
    gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer);
    gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);

    setMatrixUniforms();

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);


    var currentTime = (new Date).getTime();
    if (lastCubeUpdateTime) {
        var delta = currentTime - lastCubeUpdateTime;
        cubeRotation += (30 * delta) / 1000.0;
    }

    lastCubeUpdateTime = currentTime;
}
