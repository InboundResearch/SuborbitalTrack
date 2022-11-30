#version 300 es

precision highp float;

uniform float outputAlpha;

uniform sampler2D dayTxSampler;
uniform sampler2D nightTxSampler;

uniform vec2 sunRaDec;

in vec3 model;
in vec3 normal;
in vec2 uv;

out vec4 fragmentColor;

#define PI 3.14159265358979323846
#define INFLECTION_PT 0.7886751345948128

vec3 multiplyColors (const in vec3 left, const in vec3 right) {
    vec3 result = vec3 (left.r * right.r, left.g * right.g, left.b * right.b);
    return result;
}

vec3 screenColor (const in vec3 left, const in vec3 right) {
    const vec3 one = vec3 (1.0, 1.0, 1.0);
    vec3 result = one - (multiplyColors (one - left, one - right));
    return result;
}

vec3 smoothmix (const in vec3 a, const in vec3 b, const in float t) {
    return mix (a, b, smoothstep (0.0, 1.0, t));
}

vec3 raDecToVec3(const in vec2 raDec) {
    float ra = raDec.x;  // 𝜃 theta
    float dec = raDec.y; // 𝜙 phi
    float cosDec = cos(dec);
    return vec3 (cos(ra) * cosDec, sin(ra) * cosDec, sin(dec));
}


vec3 debugRedBlue(const in float value) {
    return vec3(max(value, 0.0), 0.0, max(-value, 0.0));
}

void main(void) {
    // convert the uv to right ascension and declination, (0, 0) top left, (1, 1) bottom right,
    // then to a ground normal vector
    vec2 groundRaDec = (uv - vec2(0.5, 0.5)) * vec2 (2.0, -1.0) * PI;
    vec3 groundNormal = raDecToVec3(groundRaDec);

    // convert the sun position to a vector
    vec3 sun = raDecToVec3(sunRaDec);

    // compute the cosine of the angle between the ground and the sun
    float sunVisibility = max(pow(1.0 - dot(sun, groundNormal), 1.0e1), 0.0);

    // get the texture map day color. The maps we are using (from Blue Marble at
    // http://visibleearth.nasa.gov/view_cat.php?categoryID=1484&p=1) are very saturated, so we
    // screen in a bit of a hazy blue based on images from EPIC (http://epic.gsfc.nasa.gov/)
    vec3 dayTxColor = texture(dayTxSampler, uv).rgb;
    vec3 hazyBlue = vec3(0.1, 0.15, 0.3);
    dayTxColor = screenColor (dayTxColor, hazyBlue);

    // get the texture map night color, scaled to black as the view angle fades away
    vec3 nightTxColor = texture(nightTxSampler, uv).rgb;

    // the two colors are blended by the daytime scale
    vec3 groundColor = smoothmix (dayTxColor, nightTxColor, sunVisibility);

    groundColor = screenColor (groundColor, vec3(0.1, 0.1, 0.1));

    // add a grid, a little spike function on the grid boundaries
    // a sin function that repeats on the boundaries is: sin((x*2 * pi) + (pi/2))
    float gridScale = 18.0;
    float lineScale = 1.0e3;
    float gX = pow((sin((uv.x * gridScale * 2.0 * PI) + (PI / 2.0)) + 1.0) / 2.0, lineScale);
    float gY = pow((sin((uv.y * 0.5 * gridScale * 2.0 * PI) + (PI / 2.0)) + 1.0) / 2.0, lineScale);
    groundColor = smoothmix (groundColor, vec3(1.0, 0.66, 0.0), max (gX, gY) * 0.4);

    //groundColor = debugRedBlue(abs(groundRaDec.x - sunRaDec.x) / (2.0 * PI));
    fragmentColor = vec4 (groundColor, outputAlpha);
}
