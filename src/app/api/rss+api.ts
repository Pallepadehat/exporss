import { XMLParser } from "fast-xml-parser";

export async function GET(request: Request) {
  try {
    const rssUrl = "https://expo.dev/blog/rss.xml";
    const response = await fetch(rssUrl);
    const responseData = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });

    const jsonObj = parser.parse(responseData);
    const channel = jsonObj?.rss?.channel;

    if (!channel)
      return Response.json({ error: "Invalid RSS format" }, { status: 400 });

    const items = (channel.item || []).map((item: any) => ({
      id: item.guid?.["#text"] || item.guid || item.link,
      title: item.title,
      link: item.link,
      publishDate: item.pubDate,
      description: item.description,
      author: item.author,
      thumbnailUrl: item["media:thumbnail"]?.["@_url"] || null,
    }));

    return Response.json({
      title: channel.title,
      description: channel.description,
      link: channel.link,
      items,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
