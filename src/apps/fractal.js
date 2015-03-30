import {createShader} from '../utils/shaders.js';
import {createSquare} from '../geoms/grid.js';

var gl,
    canvas,
    shaderProgram,
    grid,
    vertexPositionAttribute;

$(function() {
    canvas = document.getElementById("glcanvas");

    initWebGL(canvas);      // Initialize the GL context

    initShader();
    initBuffers();
    function animLoop(){
        //setupWebGL();
        //setupDynamicBuffers();
        //setMatrixUniforms();
        drawScene();
        //!videoElement.paused ? requestAnimationFrame(animLoop, canvas) : _.noop;
    }

    animLoop();
});


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
    shaderProgram = createShader(gl, require('../shaders/fractal-vs.glsl'), require('../shaders/fractal-fs.glsl'));

    //assign to buffers
    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
}

function initBuffers() {
    grid = createSquare(gl, 1.0);
}

function drawScene(){
    gl.bindBuffer(gl.ARRAY_BUFFER, grid.vertexBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, grid.vertexIndexBuffer);
    gl.drawElements(gl.TRIANGLE_STRIP, grid.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}