#version 300 es

precision highp float;

uniform float outputAlpha;

uniform vec3 lightDirection;
uniform vec3 cameraPosition;

uniform sampler2D dayTxSampler;
uniform sampler2D nightTxSampler;
uniform sampler2D specularMapTxSampler;

uniform vec4 sunPosition;
uniform vec4 moonPosition;

in vec3 model;
in vec3 normal;
in vec2 uv;

out vec4 fragmentColor;

#define PI 3.14159265358979323846
#define INFLECTION_PT 0.7886751345948128

vec3 v3 (const in vec4 v4) {
    return vec3 (v4.x, v4.y, v4.z);
}

float linearStep (const float edge0, const float edge1, const float x) {
    return clamp ((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

float hermite (const float x) {
    return x * x * (3.0 - (2.0 * x));
}

float mystep (const float edge0, const float edge1, const float x) {
    float y = linearStep (edge0, edge1, x);
    return (y < INFLECTION_PT) ? (hermite (INFLECTION_PT) * y / INFLECTION_PT) : hermite(y);
}

float sunVisible (const in vec4 moonPosition, const in vec4 sunPosition) {
    // compute an estimate of the visibility of the sun as a function of the moon as a blocker

    // the positions are reported in 4d space as a 3d location , with the 4th dimension as the
    // radius, start by projecting them for the current fragment

    vec3 sunDelta = v3 (sunPosition) - model;
    float sunDeltaLength = length (sunDelta);
    vec3 A = v3 (moonPosition);
    vec3 moonDelta = A - model;
    float moonDeltaLength = length (moonDelta);
    float projectionRatio = moonDeltaLength / sunDeltaLength;
    vec3 B = model + (sunDelta * projectionRatio);

    // compute the delta and radius values that we'll need
    float d = length (B - A);
    float rA = moonPosition.w;
    float rB = sunPosition.w * projectionRatio;

    // we'll need the areas of the two circles
    float aArea = rA * rA * PI;
    float bArea = rB * rB * PI;

    // compute my approximation to the intersection of two circles
    float baseline = max (0.0, (bArea - aArea) / bArea);
    return baseline + (mystep(abs (rA - rB), rA + rB, d) * (1.0 - baseline));
}

vec3 multiplyColors (const in vec3 left, const in vec3 right) {
    vec3 result = vec3 (left.r * right.r, left.g * right.g, left.b * right.b);
    return result;
}

vec3 screenColor (const in vec3 left, const in vec3 right) {
    vec3 one = vec3 (1.0, 1.0, 1.0);
    vec3 result = one - (multiplyColors (one - left, one - right));
    return result;
}

vec3 smoothmix (const in vec3 a, const in vec3 b, const in float t) {
    return mix (a, b, smoothstep (0.0, 1.0, t));
}

void main(void) {
    // compute the core vectors we'll need
	vec3 viewVector = normalize (cameraPosition - model);
    vec3 normalVector = normalize (normal);

    // standard cosines we'll need
	float cosLightNormalAngle = dot(normalVector, lightDirection);
	float cosViewNormalAngle = dot(normalVector, viewVector);

    // the mapping from day to night
    float sunVisibility = sunVisible (moonPosition, sunPosition);
    float daytimeScale = clamp((cosLightNormalAngle + 0.2) * 2.5, 0.0, 1.0);
    daytimeScale *= daytimeScale;

    // get the texture map day color. The maps we are using (from Blue Marble at
    // http://visibleearth.nasa.gov/view_cat.php?categoryID=1484&p=1) are very saturated, so we
    // screen in a bit of a hazy blue based on images from EPIC (http://epic.gsfc.nasa.gov/)
    vec3 dayTxColor = texture(dayTxSampler, uv).rgb;
    //vec3 hazyBlue = vec3(0.04, 0.07, 0.12);
    //vec3 hazyBlue = vec3(0.07, 0.10, 0.25);
    vec3 hazyBlue = vec3(0.06, 0.09, 0.18);
    dayTxColor = screenColor (dayTxColor, hazyBlue) * sunVisibility;

    // get the texture map night color, scaled to black as the view angle fades away
    vec3 nightTxColor = texture(nightTxSampler, uv).rgb;
    nightTxColor = nightTxColor * cosViewNormalAngle;

    // the two colors are blended by the daytime scale
    vec3 groundColor = smoothmix (nightTxColor, dayTxColor, sqrt (daytimeScale));

    // compute the specular contribution
    float specularExp = 8.0;
    vec3 reflection = reflect(-lightDirection, normalVector);
    float specularMultiplier = clamp(dot(reflection, viewVector), 0.0, 1.0);
    float specularMapTxValue = texture(specularMapTxSampler, uv).r;
    vec3 specularColor = vec3(1.0, 0.9, 0.8) * (pow(specularMultiplier, specularExp) * 0.3 * specularMapTxValue * sunVisibility);

    vec3 finalColor = clamp (groundColor + specularColor, 0.0, 1.0);

    fragmentColor = vec4 (finalColor, outputAlpha);
}

// blue marble image 43, 61, 71 (24, 34, 85)
// mine (hb) 32, 52, 38
// mine, uncorrected 22, 36, 8 (2, 5, 20)
