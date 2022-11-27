#version 300 es

precision highp float;

uniform vec3 cameraPosition;
uniform float outputAlpha;
uniform sampler2D textureSampler;
uniform vec3 modelColor;
uniform vec3 ambientLightColor;
uniform float ambientContribution;
uniform vec3 lightDirection;
uniform vec3 lightColor;
uniform float diffuseContribution;
uniform float specularContribution;
uniform float specularExponent;

uniform vec4 sunPosition;

// inputs expected from the vertex shader
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

float sunVisible (const in vec4 sunPosition) {
    // compute an estimate of the visibility of the sun as a function of the earth as a blocker

    // the positions are reported in 4d space as a 3d location , with the 4th dimension as the
    // radius, start by projecting them for the current fragment

    vec4 earthPosition = vec4 (0.0, 0.0, 0.0, 1.0);
    vec3 sunDelta = v3 (sunPosition) - model;
    float sunDeltaLength = length (sunDelta);
    vec3 A = v3 (earthPosition);
    vec3 earthDelta = A - model;
    float earthDeltaLength = length (earthDelta);
    float projectionRatio = earthDeltaLength / sunDeltaLength;
    vec3 B = model + (sunDelta * projectionRatio);

    // compute the delta and radius values that we'll need
    float d = length (B - A);
    float rA = earthPosition.w;
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

void main(void) {
    float sunVisibility = sunVisible (sunPosition);

    // figure out what color the surface is
    vec3 textureColor = texture(textureSampler, uv).rgb;
    vec3 surfaceColor = multiplyColors (textureColor, modelColor);

    // compute the ambient contribution to the surface lighting
    vec3 ambientColor = multiplyColors (ambientContribution * ambientLightColor, surfaceColor);

    // compute the diffuse contribution to the surface lighting
    vec3 normalVector = normalize (normal);
	float diffuseMultiplier = clamp (dot(normalVector, lightDirection) * diffuseContribution, 0.0, 1.0);
    vec3 diffuseColor = multiplyColors ((sunVisibility * diffuseMultiplier) * lightColor, surfaceColor);

    // compute the specular contribution to the surface lighting
    vec3 reflection = reflect(-lightDirection, normalVector);
	vec3 viewVector = normalize (cameraPosition - model);
    float specularMultiplier = clamp(dot(reflection, viewVector), 0.0, 1.0);
    vec3 specularColor = lightColor * (pow(specularMultiplier, specularExponent) * sunVisibility * specularContribution);

    vec3 finalColor = clamp (ambientColor + diffuseColor + specularColor, 0.0, 1.0);

    fragmentColor = vec4 (finalColor, outputAlpha);
}
