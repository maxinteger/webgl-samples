#WebGL

##Webgl Graphics Pipeline:

- Take vertex array data and place it into vertex buffer objects (VBOs).
- Stream the VBO data to the VS and send indice information using a call to either drawArrays with implicit index ordering or with drawElements and an index array.
- The VS runs, minimally setting the screen position of each vertex and optionally performing additional calculations, which are then passed on to the FS.
- Output data from the VS continues down the fixed portion of the pipeline.
- The GPU produces primitives using vertices and indices.
- The rasterizer discards any primitive part that lies outside of the viewport. Parts within the viewport are then broken up into pixel-sized fragments.
- Vertice values are then interpolated across each fragment.
- Fragments with these interpolated values are passed on to the FS.
- The FS minimally sets the color value, but can also do texture and lighting operations.
- Fragments can be discarded or passed on to the framebuffer, which stores a 2D image and optionally also uses a depth and stencil buffer. In this case, depth testing and stencil testing can discard some fragments from being rendered in the final image. This image is either passed on to the drawing buffer and shown to the user or alternatively saved to an offscreen buffer for later usage such as to save as texture data.


##The Drawing Buffers
- color buffer
- depth buffer
- stencil buffer

##Rendering primitives (point, line, triangle):

# Setup

```
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.1, 0.5, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
```

##Vertex data:
WebGL does not have fixed functionality but uses programmable shaders instead.

###VBO (Vertex Buffer Object)
vertex attributes:
- position
- color
- normal
- texture coordinates
- etc


###Create VBO

```
    var data = [1.0, 0.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 1.0, 1.0];

	var myBuffer = gl.createBuffer();					// create buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, myBuffer);			// bind buffer to target
	gl.bufferData(gl.ARRAY_BUFFER, data, STATIC_DRAW);	// set buffer - WebGL implicitly uses the currently bound buffer!!

	gl.deleteBuffer(myBuffer);							// delete buffer
```

Bind and bufferData targets:
- `gl.ELEMENT_ARRAY_BUFFER` for vertex indices
- `gl.ARRAY_BUFFER` for vertex attributes (position, color, ...)

bufferData usage (3th param):
- `STATIC_DRAW` - set the data once and never change
- `DYNAMIC_DRAW` - will use the data many times in the application but will respecify the contents to be used each time
- `STREAM_DRAW` - never changing the data, but it will be used at most a few times by the application


###Attributes and Uniforms
We can also pass uniform values to the shader which will be constant for each vertex

```
	// get shader variable location
	var vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
	// enable attribute
	gl.enableVertexAttribArray(vertexPositionAttribute);
	// bind buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, myBuffer);
	// variable position, size, type, stride, offset
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
```

##Shaders

Load and compile shader
```
	var vertexShader = gl.createShader(gl.VERTEX_SHADER),
		fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	//load source
	gl.shaderSource(vertexShader, vs_source);
	gl.shaderSource(fragmentShader, fs_source);

	// compile shader
	gl.compileShader(vertexShader);
	gl.compileShader(fragmentShader);

	// create shader program and attach shaders
	var glProgram = gl.createProgram();
	gl.attachShader(glProgram, vertexShader);
	gl.attachShader(glProgram, fragmentShader);

	// Linking program
	gl.linkProgram(glProgram);

	// use program
	gl.useProgram(glProgram);


	// clean
	gl.deleteShader(vertexShader);
	gl.deleteShader(vertexShader);
	gl.deleteProgram(glProgram);
```

Get shader parameters
`gl.getShaderParameter(shader, gl.COMPILE_STATUS)`

#View

##Model-View Matrix
The model-view matrix combines two transformations—the model-to-world coordinate transformation and the world-to-view coordinate transformation—into one matrix
Recall that the model-to-world transformation takes a model within its local coordinates and transforms it into its spot within the world

##Projection Matrix
The projection matrix can be orthogonal or perspective


## Draw
Drow active VBS(s)

```
	gl.drawArrays(gl.TRIANGLES, first, count);			// for `ARRAY_BUFFER`
	gl.drawElements(gl.TRIANGLES, count, type, offset); // for `ELEMENT_ARRAY_BUFFER`
```

where the first parameter can be:
- POINTS
- LINES
- LINE_STRIP
- LINE_LOOP
- TRIANGLES
- TRIANGLE_STRIP
- TRIANGLE_FAN


#Shaders

[full spec](http://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf)

The VS acts on one vertex at a time, and each vertex can have various attributes associated with it. The FS acts on a part of the rasterized image and can interpolate vertex data. It cannot change the position of the fragment or view the data of neighboring fragments. The VS can send data on to the FS.


## Vertex shader
The VS acts on every vertex and is responsible for setting the final vertex location
- final vertex position and optionally
- per vertex normal, texture, lighting, and color
- passing values on to the FS

Minimal version:
```
	attribute vec3 aVertexPosition;
    void main(void) {
    	gl_Position = aVertexPosition;
	}
```

### types
- vec3
- vec4

### qualifier:
- highp		- Hight precision

### variables

```
	attributes {type} {name}			// vertex attributum

	varying {qualifier} {type} {name}	// vertex shader output
```

### Entry point

```
	void main(void){			// main program
		gl_PointSize = 5.0 		// vertex point size
		gl_Position = vec4()	// vertex position
		vColor = vec4()			// vertex color
	}
```

##Fragment shader
The FS acts upon each pixel and sets the final color.
- setting the final color of each pixel and optionally
- performing texture lookups
- discarding fragments

Minimal version:
```
	void main(void) {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    }
```

### variables
```
	varying {qualifier} {type} {name}		// variable from vertex shader
```

### Entry point
```
	void main(void) {
        gl_FragColor = vec4(); 	// fragment color
     }
```

## GLSL Language
 - only van `main`
 - function names must start with character or _ but NOT gl_
 - no `char` and `string` type

### Primitive types
- `void`
- `bool`
- `int`
- `float`
- `vec[234]`, `ivec[234]`, `bvec[234]`  - float, integer and bool vector (1x2, 1x3, 1x4)
- `mat[234]` - float matrix (2x2, 3x3, 4x4)
- `sampler2D`, `samplerCube` - Handles to 2D or cube mapped textures
- User defined types: `struct myStruct { int num; vec3 vector; } `

### Qualifiers
The order of qualifiers is important. For variables it is:
   invariant, storage, precision for example: `invariant uniform highp mat4 m;`
For parameters, the order is:
   storage, parameter, precision For example: `void myFunc(const in lowp c){ ; }`

#### Storage Qualifiers
Storage qualifiers describe both the variable scope and relation to the WebGL program.
A variable might be declared with `attribute` storage as `attribute vec3 aColor;`.
- {none}        - The default for a variable is to have no storage qualifier.
- `const`	    - Constant throughout the program. Read only.
- `uniform`	    - Constant value across an entire primitive.
- `attribute`	- VS per vertex information from our WebGL application.
- `varying`	    - VS write, FS read.

#### Parameter Qualifiers
- {none}        - The default, which is the same thing as specifying the in
- `In`          - qualifier Parameters passed into a function
- `Out`	        - Parameters to be passed out of a function, but were not initialized
- `Inout`	    - Initialized parameter that will also be passed out of a function

#### Precision Qualifiers
- `highp`       - satisfies the minimum requirements for the vertex language
- `mediump`     - satisfies the minimum precision for the FS
- `lowp`        - is less than medium but still fully represents the values of a color channel.

#### Invariant Qualifier
- `invariant`   - It ensures that a variable can no longer be modified.


### Built-in Variables
- `gl_Position`
- `gl_PointSize`
- `gl_FragCoord`
- `gl_FrontFacing`
- `gl_PointCoord`
- `gl_FragColor`
- `gl_FragData[n]`

### Built-in Constants
```
const mediump int gl_MaxVertexAttribs = 8;
const mediump int gl_MaxVertexUniformVectors = 128;
const mediump int gl_MaxVaryingVectors = 8;
const mediump int gl_MaxVertexTextureImageUnits = 0;
const mediump int gl_MaxCombinedTextureImageUnits = 8;
const mediump int gl_MaxTextureImageUnits = 8;
const mediump int gl_MaxFragmentUniformVectors = 16;
const mediump int gl_MaxDrawBuffers = 1;
```


## Setup
1) Create the shaders:
```
	vertexShader = gl.createShader(GL.VERTEX_SHADER);
	fragmentShader = gl.createShader(GL.FRAGMENT_SHADER);
```

2) Set the source code of each shader:
```
     <script id="shader-vs" type="x-shader/x-vertex">
         ...
     </script>

    <script id="shader-fs" type="x-shader/x-fragment">
          ...
    </script>
```

```
    var vertex_source = document.getElementById('shader-vs').innerHTML
    var fragment_source = document.getElementById('shader-fs').innerHTML,

    gl.shaderSource(vertexShader, vertex_source);
    gl.shaderSource(fragmentShader, fragment_source);
```

3) Compile each shader and check for errors:
```
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert( "Error compiling vertex shader: " +
                                gl.getShaderInfoLog(vertexShader));
          }
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            alert( "Error compiling fragment shader: " +
                                gl.getShaderInfoLog(fragmentShader));
          }
```

4) Create a program:
```
    shaderProgram = gl.createProgram();
```

5) Attach our shaders to the program:
```
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
```

6) Link the program and check for errors:
```
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }
```

7) Tell WebGL to use our program:
```
    gl.useProgram(shaderProgram);
```

## Clean up
1) Detach the shaders from the program:
```
    gl.detachShader(shaderProgram, vertexShader);
    gl.detachShader(shaderProgram, fragmentShader);
```

2) Delete each shader:
```
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
```

3) Delete the program:
```
    gl.deleteProgram(shaderProgram);
```

#Texture

##Filteing
Filter parameters can either handle the stretching of a texture (TEXTURE_MAG_FILTER) or shrinking (TEXTURE_MIN_FILTER) to fit an image.

## Wrapping
Texture wrapping is the way we handle coordinates (s,t) that fall outside of our normal texture coordinate range of [0,1]

## Mipmap
To aid in accurate texture filtering, mipmaps are a precalculated optimized set of decreasingly sized versions of a texture.


```
// Create
var texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);

// Data storage
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)			// usually HTML images have the y-axis naturally point in the opposite direction from WebGL
gl.pixelStorei(UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)	// (r,g,b,a) => (r*a, g*a, b*a, a).
gl.pixelStorei(UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.{BROWSER_DEFAULT_WEBGL|NONE})

// Load image
texImage2D(gl.TEXTURE_2D /*target*/,
		   0 /* mipmaps level*/,
		   gl.RGBA /*internalformat*/,
		   gl.RGBA /*format*/,
		   gl.UNSIGNED_BYTE /*type*/,
		   source /*ImageData, HTMLImageElement, HTMLCanvasElement, or HTMLVideoElement*/);
// OR
texImage2D(gl.TEXTURE_2D /*target*/,
		   0 /* mipmaps level*/,
		   gl.RGBA /*internalformat*/,
		   128 /* width */,
		   128 /* height */,
		   0 /* border */,
		   gl.RGBA /*format*/,
		   gl.UNSIGNED_BYTE /*type*/,
		   pixels /*ArrayBufferView*/);

// Generate Mipmap
gl.generateMipmap(gl.TEXTURE_2D);	// throw error if you use Non-Power-Of-Two texture

// Texture filtering
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

// Texture wrapping
gl.texParameteri(gl.TEXTURE_2D /* target */,
 				 gl.{TEXTURE_WRAP_S|TEXTURE_WRAP_T} /* param name*/,
 				 gl.{REPEAT|CLAMP_TO_EDGE|MIRRORED_REPEAT} /* param */);

// get parameters value
gl.getTexParameter(gl.TEXTURE_2D, [parameter name])

// send to the shader
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0 /* refer to the TEXTURE0 */);


// Check
gl.isTexture(texture)

...

// Delete
gl.deleteTexture(texture);

```

#Light

Ambient, diffuse, and specular light are all different components of lighting. Ambient lighting is the global illumination in an environment. It hits a surface at all angles and is reflected back at all angles. Diffuse lighting and specular lighting reflection depend on the angle of the light to a surface. The difference between diffuse and specular reflection is that once light hits a surface, diffuse reflection occurs in all directions, whereas specular reflection occurs in a single direction.



#Libs
[gl-matrix.js](https://github.com/toji/gl-matrix)

[KickJS Shader Editor](http://www.kickjs.org/example/shader_editor/shader_editor.html)
[WebGL Playground](http://webglplayground.net/)
[SpiderGL MeShader](http://spidergl.org/meshade/)