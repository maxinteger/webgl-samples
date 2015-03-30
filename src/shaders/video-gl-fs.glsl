
varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;

uniform sampler2D uSampler;
uniform int uDoTexturing;

highp vec2 center = vec2(320.0, 180.0);
highp vec2 texSize = vec2(640.0, 360.0);
highp float angle = 2.0;
highp float scale = 5.0;

highp float pattern() {
    highp float s = sin(angle), c = cos(angle);
    highp vec2 tex = vTextureCoord * texSize - center;
    highp vec2 point = vec2(
        c * tex.x - s * tex.y,
        s * tex.x + c * tex.y
    ) * scale;
    return (sin(point.x) * sin(point.y)) * 4.0;
}


void main(void) {
    highp vec4 color = vec4(1.0, 0.1, 0.1, 1.0);
    if(uDoTexturing == 1){
        highp float amount = 1.0;

        color = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));

        // http://evanw.github.io/glfx.js/demo/#sepia
        highp float r = color.r;
        highp float g = color.g;
        highp float b = color.b;

        color.r = min(1.0, (r * (1.0 - (0.607 * amount))) + (g * (0.769 * amount)) + (b * (0.189 * amount)));
        color.g = min(1.0, (r * 0.349 * amount) + (g * (1.0 - (0.314 * amount))) + (b * 0.168 * amount));
        color.b = min(1.0, (r * 0.272 * amount) + (g * 0.534 * amount) + (b * (1.0 - (0.869 * amount))));

    } else {
        color = texture2D(uSampler, vTextureCoord);
        highp float average = (color.r + color.g + color.b) / 3.0;
        color = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);
    }

    gl_FragColor = vec4(color.rgb * vLighting, color.a);
}