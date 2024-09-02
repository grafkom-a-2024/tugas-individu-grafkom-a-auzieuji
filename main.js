var vertexShaderText =
[
'precision mediump float;',
'',
'attribute vec2 vertPosition;',
'',
'void main()',
'{',
    'gl_Position = vec4(vertPosition, 0.0, 1.0);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'void main()',
'{',
    'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);',
'}'
].join('\n');

var InitDemo = function () {

    // Inisialisasi WebGL
    var canvas = document.getElementById("mycanvas");
    var gl = canvas.getContext("webgl");

    // Mewarnai Canvas
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Buat file .c di GPU
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource (vertexShader, vertexShaderText);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource (fragmentShader, fragmentShaderText);

    // Compile .c jadi .o     
    gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}

	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}


    // Siapkan wadah untuk .exe 
    var shaderProgram = gl.createProgram();

    // Masukkan .o ke dalam wadah .exe
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    // Sambungkan agar .o jadi executable
    gl.linkProgram(shaderProgram);

    //Buat Segitiga
    var triangleVertices =
    [ // X, Y
        0.0, 0.5,
        -0.5, -0.5,
        0.5, -0.5
    ];

    var triangleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
    gl.vertexAttribPointer(
        positionAttribLocation,
        2,  //jumlah elemen per atribut
        gl.FLOAT,
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT, // ukuran vertex
        0 // offset
    );

    gl.enableVertexAttribArray(positionAttribLocation);

    // Execute Program
    gl.useProgram(shaderProgram);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Buat Titik
    //gl.drawArrays(gl.POINTS, 0, 1);
};