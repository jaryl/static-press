import { Readable } from 'stream';
import { Buffer } from 'buffer';

/**
 * Helper function to convert a Readable stream to a string.
 *
 * @param stream - The Readable stream to convert.
 * @returns A promise that resolves with the string content of the stream.
 */
export async function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}
