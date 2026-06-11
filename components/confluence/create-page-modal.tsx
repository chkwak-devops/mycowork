"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Check, ChevronsUpDown, Loader2, ExternalLink } from "lucide-react";
import type { ConfluenceSpace, ConfluencePage } from "@/lib/confluence";

const CONFLUENCE_BASE_URL =
  process.env.NEXT_PUBLIC_CONFLUENCE_BASE_URL ?? "";

export function CreateConfluencePageModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);

  const [spaces, setSpaces] = useState<ConfluenceSpace[]>([]);
  const [pages, setPages] = useState<ConfluencePage[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [spaceKey, setSpaceKey] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [parentSearch, setParentSearch] = useState("");

  const [createdUrl, setCreatedUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep("form");
    setTitle("");
    setContent("");
    setSpaceKey("");
    setParentId(null);
    setCreatedUrl("");
    (async () => {
      setLoadingSpaces(true);
      try {
        const r = await fetch("/api/confluence/spaces");
        const d = await r.json();
        const list: ConfluenceSpace[] = d.spaces ?? [];
        setSpaces(list);
        if (list.length === 1 && list[0].key !== spaceKey) {
          setSpaceKey(list[0].key);
        }
      } catch {
        toast.error("Space 목록을 불러오지 못했습니다");
      } finally {
        setLoadingSpaces(false);
      }
    })();
  }, [open]);

  const fetchPages = useCallback(async (key: string) => {
    const res = await fetch(`/api/confluence/pages?spaceKey=${key}`);
    const data = await res.json();
    setPages(data.pages ?? []);
  }, []);

  useEffect(() => {
    if (spaceKey) fetchPages(spaceKey);
  }, [spaceKey, fetchPages]);

  const filteredPages = parentSearch
    ? pages.filter((p) =>
        p.title.toLowerCase().includes(parentSearch.toLowerCase())
      )
    : pages;

  const handleCreate = async () => {
    if (!title.trim() || !spaceKey) return;

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        type: "page",
        title: title.trim(),
        space: { key: spaceKey },
        body: {
          storage: {
            value: content.trim()
              ? `<p>${content.trim().replace(/\n/g, "</p><p>")}</p>`
              : "<p></p>",
            representation: "storage",
          },
        },
      };
      if (parentId) {
        body.ancestors = [{ id: parentId }];
      }

      const res = await fetch("/api/confluence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create");
      }

      const data = await res.json();
      const pageId = data.page?.id;
      setCreatedUrl(
        pageId ? `${CONFLUENCE_BASE_URL}/spaces/${spaceKey}/pages/${pageId}` : CONFLUENCE_BASE_URL
      );
      setStep("success");
      toast.success("페이지가 생성되었습니다");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "생성 실패");
    } finally {
      setLoading(false);
    }
  };

  const selectedSpaceName =
    spaces.find((s) => s.key === spaceKey)?.name ?? "";

  const selectedPageTitle =
    pages.find((p) => p.id === parentId)?.title ?? "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={() => setOpen(true)}
      >
        <FileText className="h-3.5 w-3.5" />
        Confluence 글쓰기
      </Button>

      <DialogContent className="sm:max-w-[520px]">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle>Confluence 페이지 생성</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="title">페이지 제목</Label>
                <Input
                  id="title"
                  placeholder="제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="space">Space</Label>
                {loadingSpaces ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    불러오는 중...
                  </div>
                ) : (
                  <Select
                    value={spaceKey}
                    onValueChange={(v: string | null) => {
                      setSpaceKey(v ?? "");
                      setParentId(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Space 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {spaces.map((s) => (
                        <SelectItem key={s.key} value={s.key}>
                          {s.name} ({s.key})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label>부모 페이지 (선택)</Label>
                <Popover>
                  <PopoverTrigger render={<Button variant="outline" role="combobox" disabled={!spaceKey} className="w-full justify-between text-sm font-normal" />}>
                      {parentId
                        ? selectedPageTitle
                        : "최상위에 생성 (루트)"}
                      <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="w-[460px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="페이지 검색..."
                        value={parentSearch}
                        onValueChange={setParentSearch}
                      />
                      <CommandList>
                        <CommandEmpty>검색 결과 없음</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setParentId(null);
                              setParentSearch("");
                            }}
                          >
                            <Check
                              className={`mr-2 h-3.5 w-3.5 ${
                                !parentId ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <span className="text-muted-foreground">
                              최상위 (루트)
                            </span>
                          </CommandItem>
                          <ScrollArea className="h-56">
                            {filteredPages.map((p) => (
                              <CommandItem
                                key={p.id}
                                onSelect={() => {
                                  setParentId(p.id);
                                  setParentSearch("");
                                }}
                              >
                                <Check
                                  className={`mr-2 h-3.5 w-3.5 ${
                                    parentId === p.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                <div className="min-w-0">
                                  <span className="truncate block">
                                    {p.title}
                                  </span>
                                  {p.ancestors && p.ancestors.length > 0 && (
                                    <span className="text-xs text-muted-foreground/60 block truncate">
                                      {p.ancestors
                                        .map((a) => a.title)
                                        .join(" > ")}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </ScrollArea>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  placeholder="내용을 입력하세요 (일반 텍스트)"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <p className="text-xs text-muted-foreground/60">
                  빈 줄로 단락 구분. HTML 태그는 자동 변환됩니다.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  취소
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!title.trim() || !spaceKey || loading}
                >
                  {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  생성
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-base mb-1">
                페이지가 생성되었습니다
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {`${selectedSpaceName} » ${title}`}
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                닫기
              </Button>
              <Button
                size="sm"
                onClick={() => window.open(createdUrl, "_blank")}
                className="gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                열기
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
