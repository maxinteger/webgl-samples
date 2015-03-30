
varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;

uniform sampler2D uSampler;
uniform int uDoTexturing;

void main(void) {
    highp vec4 texelColor = vec4(1.0, 0.1, 0.1, 1.0);
    if(uDoTexturing == 1){
        texelColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
    }

    gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
}