var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec2 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'uniform vec2 offset;', 
'uniform float angle;', 
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  float cosAngle = cos(angle);',
'  float sinAngle = sin(angle);',
'  mat2 rotationMatrix = mat2(cosAngle, -sinAngle, sinAngle, cosAngle);',
'  gl_Position = vec4(rotationMatrix * vertPosition + offset, 0.0, 1.0);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');

var InitDemo = function () {

    var canvas = document.getElementById("mycanvas");
    var gl = canvas.getContext("webgl");

    if (!gl) {
        console.log('WebGL not supported, falling back on experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderText);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    var triangleVertices = 
    [ 
        0.0, 0.5,    1.0, 1.0, 0.0,
        -0.5, -0.5,  0.7, 0.0, 1.0,
        0.5, -0.5,   0.1, 1.0, 0.6
    ];

    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(shaderProgram, 'vertColor');
    
    gl.vertexAttribPointer(
        positionAttribLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

    gl.vertexAttribPointer(
        colorAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    var offsetUniformLocation = gl.getUniformLocation(shaderProgram, 'offset');
    var angleUniformLocation = gl.getUniformLocation(shaderProgram, 'angle');

    function drawScene() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniform2f(offsetUniformLocation, parseFloat(xRange.value), parseFloat(yRange.value));
        gl.uniform1f(angleUniformLocation, parseFloat(rotationSlider.option("value")) * Math.PI / 180);

        gl.useProgram(shaderProgram);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    document.getElementById("xRange").addEventListener('input', drawScene);
    document.getElementById("yRange").addEventListener('input', drawScene);

    $("#rotationSlider").roundSlider({
        radius: 50,
        min: 0,
        max: 360,
        step: 1,
        value: 0,
        handleSize: "+12",
        handleShape: "round",
        sliderType: "min-range",
        circleShape: "full",
        startAngle: 90,
        drag: drawScene,
        change: drawScene
    });

    drawScene();
};
