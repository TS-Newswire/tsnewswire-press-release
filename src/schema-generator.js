/**
 * Press Release JSON-LD schema generator.
 *
 * Produces Schema.org NewsArticle + Organization structured data so press
 * releases become eligible for Google rich results and Google News surfaces.
 *
 * Zero dependencies — runs on any modern Node.js (>= 16) and in the browser.
 *
 * Maintained by TS Newswire — https://tsnewswire.com
 *
 * @module schema-generator
 */

/**
 * @typedef {Object} ImageInput
 * @property {string} url        Absolute URL of the image.
 * @property {number} [width]    Pixel width.
 * @property {number} [height]   Pixel height.
 */

/**
 * @typedef {Object} PressReleaseInput
 * @property {string}  headline            Release headline (<= 110 chars for rich results).
 * @property {string}  [description]       Short summary / dek.
 * @property {string}  body                Full release body (plain text or HTML).
 * @property {string}  url                 Canonical URL where the release is published.
 * @property {string}  datePublished       ISO 8601 date, e.g. "2026-05-31" or full timestamp.
 * @property {string}  [dateModified]      ISO 8601 date; defaults to datePublished.
 * @property {string|string[]|ImageInput|ImageInput[]} [image]  Hero image(s).
 * @property {string}  [authorName]        Author / byline; defaults to the publisher name.
 * @property {string}  [authorUrl]         Author profile URL.
 * @property {string}  publisherName       Organization issuing the release.
 * @property {string}  publisherUrl        Organization website URL.
 * @property {string}  [publisherLogo]     Absolute URL of the publisher logo (>=112x112).
 * @property {string[]} [keywords]         Topic keywords / tags.
 * @property {string}  [articleSection]    Section, e.g. "Crypto", "iGaming".
 * @property {string}  [inLanguage]        BCP-47 language tag; defaults to "en".
 */

const DEFAULT_LANGUAGE = 'en';
const HEADLINE_MAX = 110;

/**
 * Normalize an image input into a Schema.org ImageObject (or array thereof).
 * @param {string|string[]|ImageInput|ImageInput[]} image
 * @returns {object|object[]|undefined}
 */
function normalizeImage(image) {
  if (image == null) return undefined;

  const toImageObject = (img) => {
    if (typeof img === 'string') {
      return { '@type': 'ImageObject', url: img };
    }
    const out = { '@type': 'ImageObject', url: img.url };
    if (img.width) out.width = img.width;
    if (img.height) out.height = img.height;
    return out;
  };

  if (Array.isArray(image)) {
    const list = image.filter(Boolean).map(toImageObject);
    return list.length ? list : undefined;
  }
  return toImageObject(image);
}

/**
 * Approximate a word count from a body string (HTML tags stripped).
 * @param {string} body
 * @returns {number}
 */
function wordCount(body) {
  if (!body) return 0;
  const text = String(body).replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

/**
 * Validate required fields and surface actionable problems.
 * @param {PressReleaseInput} input
 * @returns {string[]} array of human-readable warnings/errors (empty if clean)
 */
export function validate(input) {
  const problems = [];
  if (!input || typeof input !== 'object') {
    return ['Input must be an object.'];
  }

  const required = ['headline', 'body', 'url', 'datePublished', 'publisherName', 'publisherUrl'];
  for (const field of required) {
    if (!input[field]) problems.push(`Missing required field: "${field}".`);
  }

  if (input.headline && input.headline.length > HEADLINE_MAX) {
    problems.push(
      `Headline is ${input.headline.length} chars; keep it <= ${HEADLINE_MAX} for rich-result eligibility.`,
    );
  }

  if (input.url && !/^https?:\/\//i.test(input.url)) {
    problems.push('"url" should be an absolute http(s) URL.');
  }

  if (input.datePublished && Number.isNaN(Date.parse(input.datePublished))) {
    problems.push('"datePublished" is not a parseable date (use ISO 8601, e.g. 2026-05-31).');
  }

  if (!input.publisherLogo) {
    problems.push('Recommended: "publisherLogo" (>=112x112) for richer publisher attribution.');
  }

  if (!input.image) {
    problems.push('Recommended: at least one "image" for image rich results.');
  }

  return problems;
}

/**
 * Build the Schema.org JSON-LD object for a press release.
 *
 * @param {PressReleaseInput} input
 * @returns {object} a JSON-LD object (NewsArticle with embedded Organization publisher)
 */
export function generateSchema(input) {
  if (!input || typeof input !== 'object') {
    throw new TypeError('generateSchema expects a PressReleaseInput object.');
  }

  const datePublished = input.datePublished;
  const dateModified = input.dateModified || datePublished;
  const inLanguage = input.inLanguage || DEFAULT_LANGUAGE;

  const publisher = {
    '@type': 'Organization',
    name: input.publisherName,
    url: input.publisherUrl,
  };
  if (input.publisherLogo) {
    publisher.logo = { '@type': 'ImageObject', url: input.publisherLogo };
  }

  const author = {
    '@type': input.authorName && input.authorName !== input.publisherName ? 'Person' : 'Organization',
    name: input.authorName || input.publisherName,
  };
  if (input.authorUrl) author.url = input.authorUrl;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: input.headline,
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    url: input.url,
    datePublished,
    dateModified,
    inLanguage,
    author,
    publisher,
    articleBody: input.body,
    wordCount: wordCount(input.body),
  };

  if (input.description) schema.description = input.description;

  const image = normalizeImage(input.image);
  if (image) schema.image = image;

  if (Array.isArray(input.keywords) && input.keywords.length) {
    schema.keywords = input.keywords.join(', ');
  }
  if (input.articleSection) schema.articleSection = input.articleSection;

  return schema;
}

/**
 * Convenience: produce a ready-to-embed <script type="application/ld+json"> tag.
 * @param {PressReleaseInput} input
 * @param {object} [opts]
 * @param {number} [opts.indent=2] JSON indentation
 * @returns {string}
 */
export function generateScriptTag(input, opts = {}) {
  const indent = opts.indent ?? 2;
  const json = JSON.stringify(generateSchema(input), null, indent);
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

export default { generateSchema, generateScriptTag, validate };
