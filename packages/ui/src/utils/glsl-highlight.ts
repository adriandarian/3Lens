/**
 * GLSL Syntax Highlighting
 */

import { escapeHtml } from './format';

const GLSL_KEYWORDS = new Set([
  // Storage qualifiers
  'const', 'uniform', 'attribute', 'varying', 'in', 'out', 'inout',
  'centroid', 'flat', 'smooth', 'noperspective', 'layout', 'patch',
  'sample', 'buffer', 'shared', 'coherent', 'volatile', 'restrict',
  'readonly', 'writeonly', 'precision', 'highp', 'mediump', 'lowp',
  // Control flow
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
  'break', 'continue', 'return', 'discard',
  // Types
  'void', 'bool', 'int', 'uint', 'float', 'double',
  'vec2', 'vec3', 'vec4', 'dvec2', 'dvec3', 'dvec4',
  'bvec2', 'bvec3', 'bvec4', 'ivec2', 'ivec3', 'ivec4', 'uvec2', 'uvec3', 'uvec4',
  'mat2', 'mat3', 'mat4', 'mat2x2', 'mat2x3', 'mat2x4',
  'mat3x2', 'mat3x3', 'mat3x4', 'mat4x2', 'mat4x3', 'mat4x4',
  'sampler1D', 'sampler2D', 'sampler3D', 'samplerCube',
  'sampler1DShadow', 'sampler2DShadow', 'samplerCubeShadow',
  'sampler1DArray', 'sampler2DArray', 'sampler1DArrayShadow', 'sampler2DArrayShadow',
  'isampler1D', 'isampler2D', 'isampler3D', 'isamplerCube',
  'usampler1D', 'usampler2D', 'usampler3D', 'usamplerCube',
  'struct', 'true', 'false',
]);

const GLSL_BUILTINS = new Set([
  // Math functions
  'radians', 'degrees', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
  'pow', 'exp', 'log', 'exp2', 'log2', 'sqrt', 'inversesqrt',
  'abs', 'sign', 'floor', 'trunc', 'round', 'roundEven', 'ceil', 'fract',
  'mod', 'modf', 'min', 'max', 'clamp', 'mix', 'step', 'smoothstep',
  'isnan', 'isinf', 'floatBitsToInt', 'floatBitsToUint', 'intBitsToFloat', 'uintBitsToFloat',
  // Geometric functions
  'length', 'distance', 'dot', 'cross', 'normalize', 'faceforward',
  'reflect', 'refract',
  // Matrix functions
  'matrixCompMult', 'outerProduct', 'transpose', 'determinant', 'inverse',
  // Vector relational
  'lessThan', 'lessThanEqual', 'greaterThan', 'greaterThanEqual',
  'equal', 'notEqual', 'any', 'all', 'not',
  // Texture functions
  'texture', 'textureProj', 'textureLod', 'textureOffset', 'texelFetch',
  'textureGrad', 'textureGather', 'textureSize', 'textureProjLod',
  'texture2D', 'texture2DProj', 'texture2DLod', 'textureCube', 'textureCubeLod',
  // Fragment processing
  'dFdx', 'dFdy', 'fwidth',
  // Noise (deprecated but common)
  'noise1', 'noise2', 'noise3', 'noise4',
  // Other
  'main',
]);

/**
 * Highlight GLSL source code with syntax highlighting
 */
export function highlightGLSL(source: string): string {
  let result = '';
  let i = 0;
  const len = source.length;

  while (i < len) {
    // Multi-line comment
    if (source[i] === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      const commentEnd = end === -1 ? len : end + 2;
      result += `<span class="glsl-comment">${escapeHtml(source.slice(i, commentEnd))}</span>`;
      i = commentEnd;
      continue;
    }

    // Single-line comment
    if (source[i] === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i);
      const commentEnd = end === -1 ? len : end;
      result += `<span class="glsl-comment">${escapeHtml(source.slice(i, commentEnd))}</span>`;
      i = commentEnd;
      continue;
    }

    // Preprocessor directive
    if (source[i] === '#') {
      const end = source.indexOf('\n', i);
      const directiveEnd = end === -1 ? len : end;
      result += `<span class="glsl-preprocessor">${escapeHtml(source.slice(i, directiveEnd))}</span>`;
      i = directiveEnd;
      continue;
    }

    // String (rare in GLSL but possible in some contexts)
    if (source[i] === '"') {
      let j = i + 1;
      while (j < len && source[j] !== '"' && source[j] !== '\n') {
        if (source[j] === '\\') j++;
        j++;
      }
      if (source[j] === '"') j++;
      result += `<span class="glsl-string">${escapeHtml(source.slice(i, j))}</span>`;
      i = j;
      continue;
    }

    // Number (int, float, hex)
    if (/[0-9]/.test(source[i]) || (source[i] === '.' && /[0-9]/.test(source[i + 1]))) {
      let j = i;
      // Hex number
      if (source[j] === '0' && (source[j + 1] === 'x' || source[j + 1] === 'X')) {
        j += 2;
        while (j < len && /[0-9a-fA-F]/.test(source[j])) j++;
      } else {
        // Decimal/float
        while (j < len && /[0-9]/.test(source[j])) j++;
        if (source[j] === '.' && /[0-9]/.test(source[j + 1])) {
          j++;
          while (j < len && /[0-9]/.test(source[j])) j++;
        }
        // Exponent
        if (source[j] === 'e' || source[j] === 'E') {
          j++;
          if (source[j] === '+' || source[j] === '-') j++;
          while (j < len && /[0-9]/.test(source[j])) j++;
        }
      }
      // Type suffix (u, f, lf)
      if (source[j] === 'u' || source[j] === 'U' || source[j] === 'f' || source[j] === 'F') {
        j++;
      } else if ((source[j] === 'l' || source[j] === 'L') && (source[j + 1] === 'f' || source[j + 1] === 'F')) {
        j += 2;
      }
      result += `<span class="glsl-number">${escapeHtml(source.slice(i, j))}</span>`;
      i = j;
      continue;
    }

    // Identifier or keyword
    if (/[a-zA-Z_]/.test(source[i])) {
      let j = i;
      while (j < len && /[a-zA-Z0-9_]/.test(source[j])) j++;
      const word = source.slice(i, j);
      
      if (GLSL_KEYWORDS.has(word)) {
        result += `<span class="glsl-keyword">${word}</span>`;
      } else if (GLSL_BUILTINS.has(word)) {
        result += `<span class="glsl-builtin">${word}</span>`;
      } else if (word.startsWith('gl_')) {
        result += `<span class="glsl-builtin-var">${word}</span>`;
      } else {
        result += `<span class="glsl-ident">${word}</span>`;
      }
      i = j;
      continue;
    }

    // Operators and punctuation
    if ('+-*/%=<>!&|^~?:;,.()[]{}#'.includes(source[i])) {
      result += `<span class="glsl-punct">${escapeHtml(source[i])}</span>`;
      i++;
      continue;
    }

    // Whitespace and other characters
    result += escapeHtml(source[i]);
    i++;
  }

  return result;
}

/**
 * Truncate shader source for preview
 */
export function truncateShader(source: string, maxLines = 20): string {
  const lines = source.split('\n');
  if (lines.length <= maxLines) return source;
  return lines.slice(0, maxLines).join('\n') + `\n\n// ... ${lines.length - maxLines} more lines`;
}

