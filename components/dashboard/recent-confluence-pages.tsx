"use client";

import { useState } from "react";
import { ExternalLink, FileText, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConfluenceRecentPage } from "@/lib/confluence";

const CONFLUENCE_BASE_URL = process.env.NEXT_PUBLIC_CONFLUENCE_BASE_URL ?? "";

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

interface RecentConfluencePagesProps {
  pages: ConfluenceRecentPage[];
  loading: boolean;
}

export function RecentConfluencePages({ pages, loading }: RecentConfluencePagesProps) {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_SHOW = 10;
  const displayPages = showAll ? pages : pages.slice(0, INITIAL_SHOW);
  const hasMore = pages.length > INITIAL_SHOW;
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="pb-2 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-400/60" />
            <CardTitle className="text-sm font-medium">내 Confluence 글</CardTitle>
          </div>
          {loading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/60" />}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        {loading && pages.length === 0 ? (
          <div className="space-y-1 py-4 px-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 animate-pulse">
                <div className="w-4 h-4 rounded bg-muted/60" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-muted/60 rounded w-3/4" />
                  <div className="h-2.5 bg-muted/40 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : pages.length === 0 ? (
          <p className="text-sm text-muted-foreground/50 text-center py-10 italic">
            작성한 Confluence 글이 없습니다
          </p>
        ) : (
          <div>
            {displayPages.map((page) => {
              const href = page._links.webui
                ? `${CONFLUENCE_BASE_URL}${page._links.webui}`
                : `${CONFLUENCE_BASE_URL}/spaces/${page.space.key}/pages/${page.id}`;

              return (
                <a
                  key={page.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors duration-150 border-b last:border-0 group before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-r before:bg-blue-400/0 before:transition-colors before:duration-150 hover:before:bg-blue-400/30"
                >
                  <FileText className="w-4 h-4 mt-0.5 shrink-0 text-blue-400/70 group-hover:text-blue-500 transition-colors" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug group-hover:text-foreground transition-colors duration-150 truncate">
                      {page.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground/60">
                      <span className="truncate max-w-[140px]">{page.space.name}</span>
                      <span className="shrink-0">v{page.version.number}</span>
                      <span className="shrink-0">{formatDate(page.version.when)}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 mt-1 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                </a>
              );
            })}
            {hasMore && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-medium text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 transition-colors border-t border-border/20"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    접기
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    더보기 ({pages.length - INITIAL_SHOW}개)
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
