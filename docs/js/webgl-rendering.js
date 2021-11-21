/// State. 

var gl = null
var positionBuffer = null
var textureCoordBuffer = null
var indexBuffer = null
var indexBufferSize = null
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

/// Populate buffer and texture data.

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
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    };
    image.src = url
}

let PopulatePositionBuffer = (positions) => {
    if (!positionBuffer)
        positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
}

let PopulateTextureCoordBuffer = (textureCoords) => {
    if (!textureCoordBuffer)
        textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.DYNAMIC_DRAW)
}

let PopulateIndexBuffer = (indices) => {
    if (!indexBuffer)
        indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
    indexBufferSize = indices.length
}

/// Conversions.

let LandmarksToPositionArray = (landmarks) => {
    Assert(landmarks.length > 0, "Expect at least one face.")
    return landmarks[0].scaledMesh.flat()
}

/// Rendering.

let Render = (programInfo) => {

    // Clear canvas.
    gl.clearColor(0.8, 0.8, 0.8, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create projection matrix.
    let projectionMatrix = mat4.create()
    mat4.ortho(projectionMatrix, 0, VIDEO_SIZE, VIDEO_SIZE, 0, -10000, 10000)

    // Create view matrix.
    let modelViewMatrix = mat4.create();

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
    gl.drawElements(gl.TRIANGLES, indexBufferSize, gl.UNSIGNED_SHORT, 0);

    // On to the next frame.
    requestAnimationFrame(() => Render(programInfo))
}

/// UI.

let GetCanvasOther = () => $('#canvas-other')

/// Initialization.

function InitWebGLStuff() {
    let canvas = GetCanvasOther().get(0)
    gl = canvas.getContext('webgl')

    // Compile, link, and describe the shader program.
    let shaderProgram = CompileShaderProgram(VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_PROGRAM);
    let programInfo = GetProgramInfo(shaderProgram)

    PopulateTexture(FACE_MESH_TEXTURE_URL)
    PopulateTextureCoordBuffer(FACE_MESH_TEXTURE_COORDS)
    PopulateIndexBuffer(FACE_MESH_INDICES)
    PopulatePositionBuffer(FACE_MESH_POSITIONS)

    // Start rendering.
    Render(programInfo);
}