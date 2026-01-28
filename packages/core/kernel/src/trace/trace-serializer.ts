/**
 * Trace Serializer
 *
 * Serialize and deserialize traces.
 *
 * @packageDocumentation
 */

import type { Trace } from '../schema/trace';
import { validateTraceHeader, isVersionCompatible } from '../schema/trace';

/**
 * Serialize a trace to JSON string
 */
export function serializeTrace(trace: Trace): string {
  return JSON.stringify(trace);
}

/**
 * Deserialize a trace from JSON string
 */
export function deserializeTrace(json: string): Trace {
  const trace = JSON.parse(json) as Trace;

  // Validate header
  const validation = validateTraceHeader(trace.header);
  if (!validation.valid) {
    throw new Error(`Invalid trace: ${validation.errors.join(', ')}`);
  }

  // Check version compatibility
  if (!isVersionCompatible(trace.header.version)) {
    throw new Error(
      `Incompatible trace version: ${trace.header.version}. ` +
        `This version of 3Lens requires trace version >= 1.0.0`
    );
  }

  return trace;
}

/**
 * Serialize trace to Blob for download
 */
export function traceToBlob(trace: Trace): Blob {
  const json = serializeTrace(trace);
  return new Blob([json], { type: 'application/json' });
}

/**
 * Read trace from File
 */
export async function traceFromFile(file: File): Promise<Trace> {
  const text = await file.text();
  return deserializeTrace(text);
}

/**
 * Download trace as file
 */
export function downloadTrace(trace: Trace, filename: string = 'trace.json'): void {
  const blob = traceToBlob(trace);
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Compress trace (basic structural compression)
 */
export function compressTrace(trace: Trace): Trace {
  // Build string tables
  const stringTable = new Map<string, number>();
  const entityIdTable = new Map<string, number>();

  function internString(s: string): number {
    if (!stringTable.has(s)) {
      stringTable.set(s, stringTable.size);
    }
    return stringTable.get(s)!;
  }

  function internEntityId(id: string): number {
    if (!entityIdTable.has(id)) {
      entityIdTable.set(id, entityIdTable.size);
    }
    return entityIdTable.get(id)!;
  }

  // Process events to build tables
  for (const chunk of trace.events) {
    for (const event of chunk.events) {
      internString(event.type);
      internString(event.context_id);
      if ('entity_id' in event && typeof event.entity_id === 'string') {
        internEntityId(event.entity_id);
      }
    }
  }

  // Update dictionary
  const compressed: Trace = {
    ...trace,
    dictionary: {
      strings: Array.from(stringTable.keys()),
      entity_ids: Array.from(entityIdTable.keys()),
      property_keys: [],
      event_types: Array.from(
        new Set(trace.events.flatMap((c) => c.events.map((e) => e.type)))
      ),
    },
  };

  return compressed;
}
