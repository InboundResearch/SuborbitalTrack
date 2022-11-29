#version 300 es

in vec3 inputPosition;
in vec3 inputNormal;
in vec2 inputTexture;
in vec4 inputColor;
in mat4 inputModelMatrix;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

out vec3 normal;
out vec2 uv;
out vec4 color;
out vec3 model;

void main(void) {
    vec4 vertexPosition = vec4(inputPosition, 1.0);
    mat4 composedModelMatrix = inputModelMatrix * modelMatrix;
    vec4 modelPosition = composedModelMatrix * vertexPosition;
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    model = modelPosition.xyz;
    mat4 normalMatrix = transpose (inverse (composedModelMatrix));
    normal = (normalMatrix * vec4 (inputNormal, 0.0)).xyz;
    uv = inputTexture;
    color = inputColor;
}
