var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec2 vertTexCoord;',
'varying vec2 fragTexCoord;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main()',
'{',
'  fragTexCoord = vertTexCoord;',
'  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec2 fragTexCoord;',
'uniform sampler2D sampler;',
'',
'void main()',
'{',
'  gl_FragColor = texture2D(sampler, fragTexCoord);',
'}'
].join('\n');

// Fungsi untuk inisialisasi dan render di canvas
var InitDemo = function () {
	console.log('This is working');
	
	// Canvas 1 akan menampilkan kubus
	initCanvas('game-surface-1', 'cube');
	
	// Canvas 2 akan menampilkan kerucut
	initCanvas('game-surface-2', 'cone');

    // Canvas 2 akan menampilkan silinder
    initCanvas('game-surface-3', 'cylinder');

    // Canvas 4 akan menampilkan lathe
	initCanvas('game-surface-4', 'lathe');

};

function initCanvas(canvasId, shape) {
    var canvas = document.getElementById(canvasId);
    var gl = canvas.getContext('webgl');

    if (!gl) {
        console.log('WebGL not supported, falling back on experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }

    if (!gl) {
        alert('Your browser does not support WebGL');
    }

    gl.clearColor(0.65, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    // Create shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

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

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program));
        return;
    }

    // Memilih bentuk berdasarkan parameter
    var shapeVertices, shapeIndices;
    var textureImageId;
    if (shape === 'cube') {
        shapeVertices = [ // X, Y, Z           U, V
			// Top
			-1.0, 1.0, -1.0,   0, 0,
			-1.0, 1.0, 1.0,    0, 1,
			1.0, 1.0, 1.0,     1, 1,
			1.0, 1.0, -1.0,    1, 0,
	
			// Left
			-1.0, 1.0, 1.0,    0, 0,
			-1.0, -1.0, 1.0,   1, 0,
			-1.0, -1.0, -1.0,  1, 1,
			-1.0, 1.0, -1.0,   0, 1,
	
			// Right
			1.0, 1.0, 1.0,    1, 1,
			1.0, -1.0, 1.0,   0, 1,
			1.0, -1.0, -1.0,  0, 0,
			1.0, 1.0, -1.0,   1, 0,
	
			// Front
			1.0, 1.0, 1.0,    1, 1,
			1.0, -1.0, 1.0,    1, 0,
			-1.0, -1.0, 1.0,    0, 0,
			-1.0, 1.0, 1.0,    0, 1,
	
			// Back
			1.0, 1.0, -1.0,    0, 0,
			1.0, -1.0, -1.0,    0, 1,
			-1.0, -1.0, -1.0,    1, 1,
			-1.0, 1.0, -1.0,    1, 0,
	
			// Bottom
			-1.0, -1.0, -1.0,   1, 1,
			-1.0, -1.0, 1.0,    1, 0,
			1.0, -1.0, 1.0,     0, 0,
			1.0, -1.0, -1.0,    0, 1,
		];
		shapeIndices = [
			// Top
			0, 1, 2,
			0, 2, 3,
	
			// Left
			5, 4, 6,
			6, 4, 7,
	
			// Right
			8, 9, 10,
			8, 10, 11,
	
			// Front
			13, 12, 14,
			15, 14, 12,
	
			// Back
			16, 17, 18,
			16, 18, 19,
	
			// Bottom
			21, 20, 22,
			22, 20, 23
		];
        textureImageId = 'crate-image'; // ID for crate.png
    } else if (shape === 'cone') {
        shapeVertices = getConeVertices(1.0, 2.0, 30); // Function to create cone vertices
        shapeIndices = getConeIndices(30); // Function to create cone indices
        textureImageId = 'cone-image'; // ID for conetext.png
    }else if (shape === 'cylinder') {
        shapeVertices = getCylinderVertices(1.0, 2.0, 30); // Function to create cylinder vertices
        shapeIndices = getCylinderIndices(30); // Function to create cylinder indices
        textureImageId = 'can-image'; // ID for can.png
    }else if (shape === 'lathe') {
        // Define the profile for the lathe geometry (e.g., a vase shape)
        var profile = [
            [0.5, 0.0], // Bottom point
            [0.5, 0.5], // Narrowing
            [1.0, 1.0], // Widening
            [0.75, 1.5], // Curve inward
            [0.5, 2.0], // Narrowing again
        ];
        shapeVertices = getLatheVertices(profile, 30); // 30 segments
        shapeIndices = getLatheIndices(profile, 30);
        textureImageId = 'lathe-image'; // ID for the lathe texture image
    }


    // Create buffer
    var vertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shapeVertices), gl.STATIC_DRAW);

    var indexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shapeIndices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
    gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(texCoordAttribLocation, 2, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(texCoordAttribLocation);

    // Create texture
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById(textureImageId));
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.useProgram(program);
    
    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);

    // Main render loop
    var identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    var angle = 0;
    var loop = function () {
        angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
        mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 1, 0]);
        mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.activeTexture(gl.TEXTURE0);

        gl.drawElements(gl.TRIANGLES, shapeIndices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}


// Function to generate cone vertices
function getConeVertices(radius, height, segments) {
	var vertices = [];
	// Base circle vertices
	for (var i = 0; i <= segments; i++) {
		var theta = i / segments * 2 * Math.PI;
		var x = radius * Math.cos(theta);
		var z = radius * Math.sin(theta);
		vertices.push(x, 0, z, i / segments, 0); // Vertex position and texture coordinate
	}
	// Cone tip vertex
	vertices.push(0, height, 0, 0.5, 1); // Tip vertex
	return vertices;
}

// Function to generate cone indices
function getConeIndices(segments) {
	var indices = [];
	for (var i = 0; i < segments; i++) {
		// Triangles between the base and the tip
		indices.push(i, i + 1, segments + 1);
	}
	return indices;
}


// Function to generate cylinder vertices
function getCylinderVertices(radius, height, segments) {
    var vertices = [];
    var angleStep = (2 * Math.PI) / segments;

    for (var i = 0; i <= segments; i++) {
        var theta = i * angleStep;
        var x = radius * Math.cos(theta);
        var z = radius * Math.sin(theta);

        // Top circle vertex (U, V for texture)
        vertices.push(x, height, z, i / segments, 0);

        // Bottom circle vertex (U, V for texture)
        vertices.push(x, 0, z, i / segments, 1);
    }
    return vertices;
}

// Function to generate cylinder indices
function getCylinderIndices(segments) {
    var indices = [];
    for (var i = 0; i < segments; i++) {
        // Define top and bottom vertices
        var topLeft = i * 2;
        var topRight = (i + 1) * 2;
        var bottomLeft = topLeft + 1;
        var bottomRight = topRight + 1;

        // First triangle
        indices.push(topLeft, bottomLeft, topRight);

        // Second triangle
        indices.push(topRight, bottomLeft, bottomRight);
    }
    return indices;
}

// Function to generate lathe vertices
function getLatheVertices(profile, segments) {
    var vertices = [];
    var angleStep = (2 * Math.PI) / segments;

    for (var i = 0; i <= segments; i++) {
        var theta = i * angleStep;

        // For each point in the profile curve, rotate it around the Y-axis
        for (var j = 0; j < profile.length; j++) {
            var x = profile[j][0] * Math.cos(theta);
            var z = profile[j][0] * Math.sin(theta);
            var y = profile[j][1];

            // Push vertex (X, Y, Z) and texture coordinates (U, V)
            vertices.push(x, y, z, i / segments, j / (profile.length - 1));
        }
    }
    return vertices;
}

// Function to generate lathe indices
function getLatheIndices(profile, segments) {
    var indices = [];

    for (var i = 0; i < segments; i++) {
        for (var j = 0; j < profile.length - 1; j++) {
            var first = i * profile.length + j;
            var second = first + profile.length;

            // First triangle
            indices.push(first, second, first + 1);

            // Second triangle
            indices.push(second, second + 1, first + 1);
        }
    }

    return indices;
}
