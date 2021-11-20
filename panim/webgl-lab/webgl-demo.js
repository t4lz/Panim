/// Common utils.

Assert = (condition, msg) => {
    if (!condition) throw msg
}

/// State. 

var gl = null
var positionBuffer = null
var textureCoordBuffer = null
var indexBuffer = null
var texture = null

/// Shader programs.

const VERTEX_SHADER_SOURCE = `
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying highp vec2 vTextureCoord;
void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vTextureCoord = aTextureCoord;
}
`

const FRAGMENT_SHADER_PROGRAM = `
varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;
void main(void) {
  gl_FragColor = texture2D(uSampler, vTextureCoord);
}
`

let CompileShader = (type, source) => {
    let shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    Assert(gl.getShaderParameter(shader, gl.COMPILE_STATUS), "expected shader to compile.")
    return shader
}

let CompileShaderProgram = (vsSource, fsSource) => {
    let shaderProgram = gl.createProgram()

    // Add vertex shader.
    let vertexShader = CompileShader(gl.VERTEX_SHADER, vsSource)
    gl.attachShader(shaderProgram, vertexShader);

    // Add fragment shader.
    let fragmentShader = CompileShader(gl.FRAGMENT_SHADER, fsSource)
    gl.attachShader(shaderProgram, fragmentShader);

    gl.linkProgram(shaderProgram);
    Assert(gl.getProgramParameter(shaderProgram, gl.LINK_STATUS), "expected shader program to link.")
    return shaderProgram;
}

let GetProgramInfo = (shaderProgram) => {
    return {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
        }
    }
}

/// Buffer and texture data.

const TEXTURE_URL = "cubetexture.png"

const VERTEX_POSITIONS = [
    // Front face
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

    // Back face
    -1.0, -1.0, -1.0, -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,

    // Top face
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

    // Right face
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,

    // Left face
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
];

const VERTEX_TEXTURE_COORDS = [
    // Front
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Back
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Top
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Bottom
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Right
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Left
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
];

const VERTEX_INDICES = [
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // back
    8, 9, 10, 8, 10, 11, // top
    12, 13, 14, 12, 14, 15, // bottom
    16, 17, 18, 16, 18, 19, // right
    20, 21, 22, 20, 22, 23, // left
];

/// Populate buffer and texture data

let PopulateTexture = (url) => {
    if (!texture)
        texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)

    // Populate the texture with a single pixel until we have loaded the actual texture.
    let level = 0
    let internalFormat = gl.RGBA
    let srcFormat = gl.RGBA
    let srcType = gl.UNSIGNED_BYTE
    let opaqueBlue = new Uint8Array([0, 0, 255, 255])
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, 1, 1, 0, srcFormat, srcType, opaqueBlue)

    // Asynchronously, replace the dummy texture with the actual data when loaded.
    const image = new Image()
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    };
    image.src = url
}

let PopulatePositionBuffer = (positions) => {
    if (!positionBuffer)
        positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}

let PopulateTextureCoordBuffer = (textureCoords) => {
    if (!textureCoordBuffer)
        textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW)
}

let PopulateIndexBuffer = (indices) => {
    if (!indexBuffer)
        indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
}


































$(document).ready(() => {
    main()
})

//
// Start here
//
function main() {
    let canvas = $('#gl-canvas').get(0)
    gl = canvas.getContext('webgl')

    let shaderProgram = CompileShaderProgram(VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_PROGRAM);
    let programInfo = GetProgramInfo(shaderProgram)

    PopulateTexture(TEXTURE_URL)
    PopulatePositionBuffer(VERTEX_POSITIONS)
    PopulateTextureCoordBuffer(VERTEX_TEXTURE_COORDS)
    PopulateIndexBuffer(VERTEX_INDICES)

    Render(programInfo);

}



































var alpha = 0.0

function Render(programInfo) {
    alpha += 0.01

    // Clear canvas.
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create projection matrix.
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    let projectionMatrix = mat4.create()
    mat4.perspective(projectionMatrix, 0.75, aspect, 0.001, 100.0)

    // Create view matrix.
    let modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -10.0])
    mat4.rotate(modelViewMatrix, modelViewMatrix, alpha, [0, 1, 0])

    // Propagate the vertex positions.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)

    // Porpagate the texture coords.
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord)

    // Propagate the vertex indices.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

    // Propagate the matrices.
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    // Setup texture sampling.
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    // Setup the shader program.
    gl.useProgram(programInfo.program);

    // Finally, draw the elements.
    gl.drawElements(gl.TRIANGLES, VERTEX_INDICES.length, gl.UNSIGNED_SHORT, 0);

    // On to the next frame.
    requestAnimationFrame(() => Render(programInfo))
}