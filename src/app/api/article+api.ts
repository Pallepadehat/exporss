/**
 * GET /api/article?url=<encoded-blog-url>
 *
 * Fetches the full content of an Expo blog post, converts the article HTML
 * into clean Markdown, and returns it alongside Open Graph metadata.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const articleUrl = searchParams.get("url");

    if (!articleUrl) {
      return Response.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const response = await fetch(articleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      return Response.json(
        { error: `Failed to fetch article: ${response.status}` },
        { status: response.status },
      );
    }

    const html = await response.text();

    // ── Open Graph meta ──────────────────────────────────────────────────────
    const ogTitle =
      extractMeta(html, "og:title") ||
      extractMeta(html, "twitter:title") ||
      extractTag(html, "title");

    const ogDescription =
      extractMeta(html, "og:description") ||
      extractMeta(html, "twitter:description");

    const ogImage =
      extractMeta(html, "og:image") || extractMeta(html, "twitter:image");

    // ── Isolate article body ─────────────────────────────────────────────────
    let articleHtml =
      extractBetween(html, "<article", "</article>") ||
      extractBetween(html, 'class="prose', "</main>") ||
      extractBetween(html, 'data-component="article"', "</section>") ||
      html;

    // Strip non-content sections
    articleHtml = articleHtml
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<aside[\s\S]*?<\/aside>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "");

    // ── Convert HTML → Markdown ──────────────────────────────────────────────
    let markdown = htmlToMarkdown(articleHtml);

    // Strip any leading # h1 line(s) — the screen already displays the title
    markdown = markdown.replace(/^(#\s+[^\n]+\n*)+/, "").trimStart();

    return Response.json({
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
      url: articleUrl,
      markdown,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractMeta(html: string, name: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${name}["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`,
      "i",
    ),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return decodeHtmlEntities(m[1]);
  }
  return null;
}

function extractTag(html: string, tag: string): string | null {
  const m = html.match(new RegExp(`<${tag}[^>]*>([^<]+)<\\/${tag}>`, "i"));
  return m ? decodeHtmlEntities(m[1].trim()) : null;
}

function extractBetween(
  html: string,
  startPattern: string,
  endTag: string,
): string | null {
  const startIdx = html.indexOf(startPattern);
  if (startIdx === -1) return null;
  const endIdx = html.indexOf(endTag, startIdx + startPattern.length);
  if (endIdx === -1) return null;
  return html.slice(startIdx, endIdx + endTag.length);
}

// ── HTML → Markdown converter ─────────────────────────────────────────────────

function htmlToMarkdown(html: string): string {
  let md = html;

  // Pre/code blocks — must come BEFORE other replacements
  md = md.replace(
    /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (_, code) => {
      // Try to detect language from class
      const langMatch = _.match(
        /class=["'][^"']*language-([a-z0-9]+)[^"']*["']/i,
      );
      const lang = langMatch ? langMatch[1] : "";
      const clean = decodeHtmlEntities(stripTags(code)).trim();
      return `\n\`\`\`${lang}\n${clean}\n\`\`\`\n\n`;
    },
  );

  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, code) => {
    const clean = decodeHtmlEntities(stripTags(code)).trim();
    // If multi-line, use fenced block; otherwise inline
    if (clean.includes("\n")) {
      return `\n\`\`\`\n${clean}\n\`\`\`\n`;
    }
    return `\`${clean}\``;
  });

  // Headings
  md = md.replace(
    /<h1[^>]*>([\s\S]*?)<\/h1>/gi,
    (_, t) => `\n# ${clean(t)}\n\n`,
  );
  md = md.replace(
    /<h2[^>]*>([\s\S]*?)<\/h2>/gi,
    (_, t) => `\n## ${clean(t)}\n\n`,
  );
  md = md.replace(
    /<h3[^>]*>([\s\S]*?)<\/h3>/gi,
    (_, t) => `\n### ${clean(t)}\n\n`,
  );
  md = md.replace(
    /<h4[^>]*>([\s\S]*?)<\/h4>/gi,
    (_, t) => `\n#### ${clean(t)}\n\n`,
  );
  md = md.replace(
    /<h5[^>]*>([\s\S]*?)<\/h5>/gi,
    (_, t) => `\n##### ${clean(t)}\n\n`,
  );
  md = md.replace(
    /<h6[^>]*>([\s\S]*?)<\/h6>/gi,
    (_, t) => `\n###### ${clean(t)}\n\n`,
  );

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, t) => {
    return (
      clean(t)
        .split("\n")
        .map((l) => `> ${l}`)
        .join("\n") + "\n\n"
    );
  });

  // Bold / italic
  md = md.replace(
    /<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi,
    (_, _t, t) => `**${clean(t)}**`,
  );
  md = md.replace(
    /<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi,
    (_, _t, t) => `_${clean(t)}_`,
  );

  // Links
  md = md.replace(
    /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_, href, text) => {
      const t = clean(text);
      return t ? `[${t}](${href})` : href;
    },
  );

  // Images
  md = md.replace(
    /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*\/?>/gi,
    (_, src, alt) => {
      if (
        !src ||
        src.includes("icon") ||
        src.includes("logo") ||
        src.includes("avatar") ||
        src.includes("pixel")
      )
        return "";
      return `\n![${alt || ""}](${src})\n\n`;
    },
  );

  // Lists
  md = md.replace(
    /<ul[^>]*>([\s\S]*?)<\/ul>/gi,
    (_: string, content: string) => {
      return (
        content.replace(
          /<li[^>]*>([\s\S]*?)<\/li>/gi,
          (_: string, item: string) => `- ${clean(item)}\n`,
        ) + "\n"
      );
    },
  );
  md = md.replace(
    /<ol[^>]*>([\s\S]*?)<\/ol>/gi,
    (_: string, content: string) => {
      let i = 0;
      return (
        content.replace(
          /<li[^>]*>([\s\S]*?)<\/li>/gi,
          (_: string, item: string) => `${++i}. ${clean(item)}\n`,
        ) + "\n"
      );
    },
  );

  // Paragraphs & breaks
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => {
    const text = clean(t).trim();
    return text ? `${text}\n\n` : "";
  });
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n\n");

  // Strip remaining tags
  md = md.replace(/<[^>]+>/g, "");

  // Decode entities & clean whitespace
  md = decodeHtmlEntities(md);
  md = md.replace(/\n{3,}/g, "\n\n").trim();

  return md;
}

function clean(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&[a-z]+;/g, "");
}
