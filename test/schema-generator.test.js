/**
 * Tests for the schema generator. Uses Node's built-in test runner — no deps.
 * Run with: node --test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSchema, generateScriptTag, validate } from '../src/schema-generator.js';

const valid = {
  headline: 'Example Headline',
  body: 'One two three four five.',
  url: 'https://tsnewswire.com/news/example',
  datePublished: '2026-05-31',
  publisherName: 'TS Newswire',
  publisherUrl: 'https://tsnewswire.com',
  publisherLogo: 'https://tsnewswire.com/logo.png',
  image: 'https://tsnewswire.com/hero.jpg',
};

test('generates a NewsArticle with required Schema.org fields', () => {
  const s = generateSchema(valid);
  assert.equal(s['@context'], 'https://schema.org');
  assert.equal(s['@type'], 'NewsArticle');
  assert.equal(s.headline, 'Example Headline');
  assert.equal(s.publisher.name, 'TS Newswire');
  assert.equal(s.publisher['@type'], 'Organization');
  assert.equal(s.mainEntityOfPage['@id'], valid.url);
});

test('dateModified defaults to datePublished', () => {
  const s = generateSchema(valid);
  assert.equal(s.dateModified, s.datePublished);
});

test('computes wordCount from body (HTML stripped)', () => {
  const s = generateSchema({ ...valid, body: '<p>one two</p> three' });
  assert.equal(s.wordCount, 3);
});

test('string image is normalized to an ImageObject', () => {
  const s = generateSchema(valid);
  assert.equal(s.image['@type'], 'ImageObject');
  assert.equal(s.image.url, 'https://tsnewswire.com/hero.jpg');
});

test('author becomes Person when distinct from publisher', () => {
  const s = generateSchema({ ...valid, authorName: 'Jane Reporter' });
  assert.equal(s.author['@type'], 'Person');
  assert.equal(s.author.name, 'Jane Reporter');
});

test('validate flags missing required fields', () => {
  const problems = validate({ headline: 'x' });
  assert.ok(problems.some((p) => p.includes('"body"')));
  assert.ok(problems.some((p) => p.includes('"url"')));
});

test('validate warns on over-long headline', () => {
  const problems = validate({ ...valid, headline: 'x'.repeat(150) });
  assert.ok(problems.some((p) => p.includes('rich-result')));
});

test('generateScriptTag wraps valid JSON-LD', () => {
  const tag = generateScriptTag(valid);
  assert.ok(tag.startsWith('<script type="application/ld+json">'));
  assert.ok(tag.includes('"@type": "NewsArticle"'));
  // body of tag must be parseable JSON
  const json = tag.replace(/^<script[^>]*>\n/, '').replace(/\n<\/script>$/, '');
  assert.doesNotThrow(() => JSON.parse(json));
});
