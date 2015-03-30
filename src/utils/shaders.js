/**
 * Init Shader
 *
 * @param {WebGLRenderingContext}gl     WebGL context
 * @param {string}vsSrc                 Vertex shader source
 * @param {string}fsSrc                 Fragment shader source
 * @return {WebGLProgram}
 */
export function createShader(gl, vsSrc, fsSrc) {
    var vertexShader = getShader(gl, gl.VERTEX_SHADER, vsSrc),
        fragmentShader = getShader(gl, gl.FRAGMENT_SHADER, fsSrc),
        shaderProgram = gl.createProgram();

    // Create the shader program
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }

    gl.useProgram(shaderProgram);
    return shaderProgram;
}

/**
 *
 * @param {WebGLRenderingContext}gl     WebGL context
 * @param {number}type
 * @param {string}source
 * @returns {WebGLShader}
 */
function getShader(gl, type, source) {
    var shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}
