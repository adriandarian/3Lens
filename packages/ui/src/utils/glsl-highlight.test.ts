/**
 * GLSL Highlight Test Suite
 *
 * Tests for GLSL syntax highlighting.
 */

import { describe, it, expect } from 'vitest';
import { highlightGLSL, truncateShader } from './glsl-highlight';

describe('highlightGLSL', () => {
  describe('comments', () => {
    it('should highlight single-line comments', () => {
      const result = highlightGLSL('// comment');
      expect(result).toContain('glsl-comment');
      expect(result).toContain('// comment');
    });

    it('should highlight multi-line comments', () => {
      const result = highlightGLSL('/* multi\nline */');
      expect(result).toContain('glsl-comment');
      expect(result).toContain('/* multi\nline */');
    });

    it('should handle unclosed multi-line comment', () => {
      const result = highlightGLSL('/* unclosed');
      expect(result).toContain('glsl-comment');
    });
  });

  describe('preprocessor directives', () => {
    it('should highlight preprocessor directives', () => {
      const result = highlightGLSL('#define FOO 1');
      expect(result).toContain('glsl-preprocessor');
      expect(result).toContain('#define FOO 1');
    });

    it('should highlight #include', () => {
      const result = highlightGLSL('#include <common>');
      expect(result).toContain('glsl-preprocessor');
    });

    it('should highlight #version', () => {
      const result = highlightGLSL('#version 300 es');
      expect(result).toContain('glsl-preprocessor');
    });
  });

  describe('keywords', () => {
    it('should highlight type keywords', () => {
      const types = ['void', 'float', 'int', 'vec3', 'mat4', 'sampler2D'];
      for (const type of types) {
        const result = highlightGLSL(type);
        expect(result).toContain('glsl-keyword');
        expect(result).toContain(type);
      }
    });

    it('should highlight storage qualifiers', () => {
      const qualifiers = ['uniform', 'varying', 'attribute', 'in', 'out', 'const'];
      for (const q of qualifiers) {
        const result = highlightGLSL(q);
        expect(result).toContain('glsl-keyword');
      }
    });

    it('should highlight control flow', () => {
      const keywords = ['if', 'else', 'for', 'while', 'return', 'discard'];
      for (const kw of keywords) {
        const result = highlightGLSL(kw);
        expect(result).toContain('glsl-keyword');
      }
    });

    it('should highlight bool literals', () => {
      expect(highlightGLSL('true')).toContain('glsl-keyword');
      expect(highlightGLSL('false')).toContain('glsl-keyword');
    });
  });

  describe('builtins', () => {
    it('should highlight builtin functions', () => {
      const builtins = ['sin', 'cos', 'normalize', 'texture', 'mix', 'clamp'];
      for (const fn of builtins) {
        const result = highlightGLSL(fn);
        expect(result).toContain('glsl-builtin');
      }
    });

    it('should highlight main function', () => {
      const result = highlightGLSL('main');
      expect(result).toContain('glsl-builtin');
    });

    it('should highlight gl_ variables', () => {
      const glVars = ['gl_Position', 'gl_FragColor', 'gl_VertexID'];
      for (const v of glVars) {
        const result = highlightGLSL(v);
        expect(result).toContain('glsl-builtin-var');
      }
    });
  });

  describe('numbers', () => {
    it('should highlight integers', () => {
      const result = highlightGLSL('42');
      expect(result).toContain('glsl-number');
      expect(result).toContain('42');
    });

    it('should highlight floats', () => {
      const result = highlightGLSL('3.14');
      expect(result).toContain('glsl-number');
    });

    it('should highlight scientific notation', () => {
      const result = highlightGLSL('1.0e-5');
      expect(result).toContain('glsl-number');
    });

    it('should highlight hex numbers', () => {
      const result = highlightGLSL('0xFF');
      expect(result).toContain('glsl-number');
    });

    it('should highlight numbers with suffix', () => {
      expect(highlightGLSL('1u')).toContain('glsl-number');
      expect(highlightGLSL('1.0f')).toContain('glsl-number');
      expect(highlightGLSL('1.0lf')).toContain('glsl-number');
    });

    it('should highlight float starting with decimal', () => {
      const result = highlightGLSL('.5');
      expect(result).toContain('glsl-number');
    });
  });

  describe('strings', () => {
    it('should highlight strings', () => {
      const result = highlightGLSL('"hello"');
      expect(result).toContain('glsl-string');
    });

    it('should handle escaped characters', () => {
      const result = highlightGLSL('"line\\n"');
      expect(result).toContain('glsl-string');
    });
  });

  describe('identifiers', () => {
    it('should highlight custom identifiers', () => {
      const result = highlightGLSL('myVariable');
      expect(result).toContain('glsl-ident');
    });

    it('should highlight identifiers with underscores', () => {
      const result = highlightGLSL('my_var_name');
      expect(result).toContain('glsl-ident');
    });

    it('should highlight identifiers starting with underscore', () => {
      const result = highlightGLSL('_private');
      expect(result).toContain('glsl-ident');
    });
  });

  describe('punctuation', () => {
    it('should highlight operators', () => {
      const ops = ['+', '-', '*', '/', '=', '<', '>', '!'];
      for (const op of ops) {
        const result = highlightGLSL(op);
        expect(result).toContain('glsl-punct');
      }
    });

    it('should highlight brackets', () => {
      const brackets = ['(', ')', '[', ']', '{', '}'];
      for (const b of brackets) {
        const result = highlightGLSL(b);
        expect(result).toContain('glsl-punct');
      }
    });

    it('should highlight punctuation', () => {
      const punct = [';', ',', '.'];
      for (const p of punct) {
        const result = highlightGLSL(p);
        expect(result).toContain('glsl-punct');
      }
    });
  });

  describe('complete shader', () => {
    it('should highlight a complete vertex shader', () => {
      const shader = `#version 300 es
precision highp float;
uniform mat4 modelViewMatrix;
in vec3 position;
void main() {
  gl_Position = modelViewMatrix * vec4(position, 1.0);
}`;
      const result = highlightGLSL(shader);
      
      expect(result).toContain('glsl-preprocessor'); // #version
      expect(result).toContain('glsl-keyword'); // precision, highp, float, uniform, etc.
      expect(result).toContain('glsl-builtin'); // main
      expect(result).toContain('glsl-builtin-var'); // gl_Position
      expect(result).toContain('glsl-number'); // 300, 1.0
    });
  });
});

describe('truncateShader', () => {
  it('should not truncate short shaders', () => {
    const shader = 'line1\nline2\nline3';
    expect(truncateShader(shader, 5)).toBe(shader);
  });

  it('should truncate long shaders', () => {
    const lines = Array.from({ length: 30 }, (_, i) => `line${i + 1}`);
    const shader = lines.join('\n');
    
    const result = truncateShader(shader, 10);
    
    expect(result).toContain('line1');
    expect(result).toContain('line10');
    expect(result).not.toContain('line11');
    expect(result).toContain('20 more lines');
  });

  it('should use default maxLines of 20', () => {
    const lines = Array.from({ length: 30 }, (_, i) => `line${i + 1}`);
    const shader = lines.join('\n');
    
    const result = truncateShader(shader);
    
    expect(result).toContain('10 more lines');
  });
});
