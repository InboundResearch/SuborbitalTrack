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

// inputs expected from the vertex shader
in vec3 model;
in vec3 normal;
in vec2 uv;

out vec4 fragmentColor;

vec3 multiplyColors (const in vec3 left, const in vec3 right) {
    vec3 result = vec3 (left.r * right.r, left.g * right.g, left.b * right.b);
    return result;
}

void main(void) {
    // figure out what color the surface is
    vec3 textureColor = texture(textureSampler, uv).rgb;
    vec3 surfaceColor = multiplyColors (textureColor, modelColor);

    // compute the ambient contribution to the surface lighting
    vec3 ambientColor = multiplyColors (ambientContribution * ambientLightColor, surfaceColor);

    // compute the diffuse contribution to the surface lighting
    vec3 normalVector = normalize (normal);
	float diffuseMultiplier = step (0.0, dot(normalVector, lightDirection)) * diffuseContribution;
    vec3 diffuseColor = multiplyColors (diffuseMultiplier * lightColor, surfaceColor);

    vec3 finalColor = clamp (ambientColor + diffuseColor, 0.0, 1.0);

    fragmentColor = vec4 (finalColor, outputAlpha);
}
