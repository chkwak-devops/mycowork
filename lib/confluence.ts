export interface ConfluenceSpace {
  id: string;
  key: string;
  name: string;
  _links: { self: string };
}

export interface ConfluencePage {
  id: string;
  title: string;
  type: string;
  status: string;
  version?: { number: number };
  ancestors?: ConfluencePage[];
  _links: { self: string; webui?: string };
}

export interface ConfluenceSpacesResult {
  results: ConfluenceSpace[];
  size: number;
}

export interface ConfluencePagesResult {
  results: ConfluencePage[];
  size: number;
  start: number;
  limit: number;
}

export interface ConfluenceRecentPage {
  id: string;
  title: string;
  type: string;
  status: string;
  version: {
    number: number;
    when: string;
    message?: string;
  };
  space: {
    id: string;
    key: string;
    name: string;
  };
  _links: { self: string; webui?: string; tinyui?: string };
}

export interface ConfluenceSearchResult {
  results: ConfluenceRecentPage[];
  size: number;
  start: number;
  limit: number;
}


export interface ConfluenceCreateRequest {
  type: "page";
  title: string;
  space: { key: string };
  body: {
    storage: {
      value: string;
      representation: "storage";
    };
  };
  ancestors?: Array<{ id: string }>;
}

const BASE_URL = process.env.CONFLUENCE_BASE_URL!;
function getPat(): string {
  return process.env.CONFLUENCE_PAT || process.env.JIRA_PAT || "";
}

function headers() {
  return {
    Authorization: `Bearer ${getPat()}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export async function getSpaces(): Promise<ConfluenceSpace[]> {
  const url = new URL(`${BASE_URL}/rest/api/space`);
  url.searchParams.set("limit", "200");

  const res = await fetch(url.toString(), {
    headers: headers(),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Confluence API error ${res.status}: ${text}`);
  }

  const data: ConfluenceSpacesResult = await res.json();
  return data.results;
}

export async function getPages(spaceKey: string): Promise<ConfluencePage[]> {
  const url = new URL(`${BASE_URL}/rest/api/content`);
  url.searchParams.set("spaceKey", spaceKey);
  url.searchParams.set("type", "page");
  url.searchParams.set("limit", "200");
  url.searchParams.set("expand", "ancestors,version");

  const res = await fetch(url.toString(), {
    headers: headers(),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Confluence API error ${res.status}: ${text}`);
  }

  const data: ConfluencePagesResult = await res.json();
  return data.results;
}

export async function createPage(req: ConfluenceCreateRequest): Promise<ConfluencePage> {
  const res = await fetch(`${BASE_URL}/rest/api/content`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Confluence API error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function getMyRecentPages(maxResults = 30): Promise<ConfluenceRecentPage[]> {
  const cql = "creator = currentUser() AND type = page ORDER BY created DESC";
  const url = new URL(`${BASE_URL}/rest/api/content/search`);
  url.searchParams.set("cql", cql);
  url.searchParams.set("limit", String(maxResults));
  url.searchParams.set("expand", "version,space");

  const res = await fetch(url.toString(), {
    headers: headers(),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Confluence API error ${res.status}: ${text}`);
  }

  const data: ConfluenceSearchResult = await res.json();
  return data.results;
}
