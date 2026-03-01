import { useEffect, useMemo, useState } from 'react';
import { enabledItem, excludedSitesItem, type ExcludedSite } from '@/lib/storage';
import { matchesPattern } from '@/lib/match-pattern';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Ban,
  Check,
  Globe,
  HelpCircle,
  Package,
  Pencil,
  Plus,
  Search,
  ShieldBan,
  Trash2,
  X,
} from 'lucide-react';

const PATTERN_HINTS = [
  { label: 'Domain + subdomains', example: 'example.com', desc: 'example.com, www.example.com' },
  {
    label: 'Subdomains only',
    example: '*.example.com',
    desc: 'sub.example.com (not example.com)',
  },
  { label: 'Specific subdomain', example: 'docs.example.com', desc: 'only docs.example.com' },
  { label: 'Keyword match', example: 'google', desc: 'any hostname containing "google"' },
  { label: 'Domain + path', example: 'example.com/docs', desc: 'example.com/docs and sub-paths' },
  {
    label: 'Subdomain + path',
    example: '*.example.com/api',
    desc: 'sub.example.com/api/*',
  },
];

interface PatternHelpProps {
  onSelect: (value: string) => void;
}

function PatternHelp({ onSelect }: PatternHelpProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="max-h-[min(300px,var(--radix-popover-content-available-height))] w-64 overflow-y-auto p-2"
      >
        <p className="mb-1.5 px-1 text-xs font-medium">Pattern examples</p>
        <div className="space-y-0.5">
          {PATTERN_HINTS.map((hint) => (
            <button
              key={hint.example}
              type="button"
              className="flex w-full flex-col gap-0.5 rounded-sm px-2 py-1.5 text-left hover:bg-muted"
              onClick={() => onSelect(hint.example)}
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-xs text-muted-foreground">{hint.label}</span>
                <code className="font-mono text-xs text-foreground">{hint.example}</code>
              </div>
              <span className="text-[10px] text-muted-foreground/70">{hint.desc}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 border-t px-1 pt-2">
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Use <code className="text-[10px]">*.</code> to match subdomains only. A plain domain
            like <code className="text-[10px]">example.com</code> also matches its subdomains. Add a
            path like <code className="text-[10px]">/docs</code> to restrict to specific sections.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function App() {
  const [enabled, setEnabled] = useState(true);
  const [excluded, setExcluded] = useState<ExcludedSite[]>([]);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [newPattern, setNewPattern] = useState('');
  const [currentHostname, setCurrentHostname] = useState<string | null>(null);
  const [currentPathname, setCurrentPathname] = useState('/');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const isCurrentSiteExcluded = useMemo(() => {
    if (!currentHostname) return false;
    return excluded.some((s) => matchesPattern(currentHostname, currentPathname, s.hostname));
  }, [excluded, currentHostname, currentPathname]);

  const filteredExcluded = useMemo(() => {
    if (!search.trim()) return excluded;
    const q = search.toLowerCase();
    return excluded.filter((s) => s.hostname.toLowerCase().includes(q));
  }, [excluded, search]);

  useEffect(() => {
    enabledItem.getValue().then(setEnabled);
    excludedSitesItem.getValue().then(setExcluded);

    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.url) {
        try {
          const url = new URL(tab.url);
          setCurrentHostname(url.hostname);
          setCurrentPathname(url.pathname);
        } catch {
          // invalid URL (e.g. chrome:// pages)
        }
      }
    });

    const unwatchEnabled = enabledItem.watch((val) => setEnabled(val));
    const unwatchExcluded = excludedSitesItem.watch((val) => setExcluded(val));

    return () => {
      unwatchEnabled();
      unwatchExcluded();
    };
  }, []);

  async function handleToggleEnabled(checked: boolean) {
    setEnabled(checked);
    await enabledItem.setValue(checked);
  }

  async function handleExcludePattern(pattern: string) {
    const normalized = pattern.trim().toLowerCase();
    if (!normalized) return;
    if (excluded.some((s) => s.hostname === normalized)) return;

    const entry: ExcludedSite = { id: crypto.randomUUID(), hostname: normalized };
    const updated = [...excluded, entry];
    setExcluded(updated);
    await excludedSitesItem.setValue(updated);
    setNewPattern('');
    setAdding(false);
  }

  async function handleDeleteExclusion(id: string) {
    const updated = excluded.filter((s) => s.id !== id);
    setExcluded(updated);
    await excludedSitesItem.setValue(updated);
  }

  function handleStartEdit(site: ExcludedSite) {
    setEditingId(site.id);
    setEditValue(site.hostname);
  }

  async function handleSaveEdit() {
    const normalized = editValue.trim().toLowerCase();
    if (!normalized || !editingId) {
      setEditingId(null);
      return;
    }

    const updated = excluded.map((s) => (s.id === editingId ? { ...s, hostname: normalized } : s));
    setExcluded(updated);
    await excludedSitesItem.setValue(updated);
    setEditingId(null);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditValue('');
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') handleCancelEdit();
  }

  function handleOpenAddForm() {
    setNewPattern(currentHostname ?? '');
    setAdding(true);
  }

  function handleAddKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleExcludePattern(newPattern);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h1 className="text-sm font-semibold">npmx Redirect</h1>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="global-toggle" className="text-xs text-muted-foreground">
            {enabled ? 'On' : 'Off'}
          </Label>
          <Switch id="global-toggle" checked={enabled} onCheckedChange={handleToggleEnabled} />
        </div>
      </div>

      {/* Current site banner */}
      {currentHostname && (
        <div className="flex items-center gap-2.5 border-b bg-muted/40 px-4 py-2.5">
          <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{currentHostname}</p>
          {isCurrentSiteExcluded ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Ban className="h-3 w-3" />
              Excluded
            </span>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="h-6 gap-1 px-2 text-xs"
              onClick={() => handleExcludePattern(currentHostname)}
              disabled={!enabled}
            >
              <ShieldBan className="h-3 w-3" />
              Exclude this site
            </Button>
          )}
        </div>
      )}

      {/* Search + Exclude button */}
      <div className="flex items-center gap-2 px-4 pb-2 pt-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search exclusions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 text-xs"
          onClick={() => (adding ? setAdding(false) : handleOpenAddForm())}
        >
          <Plus className="h-3.5 w-3.5" />
          Exclude
        </Button>
      </div>

      {/* Add exclusion form (collapsible) */}
      {adding && (
        <div className="mx-4 mb-2 space-y-2 rounded-md border bg-muted/30 p-3">
          <div className="flex items-center gap-1">
            <Input
              placeholder="pattern, e.g. bing.com or example.com/docs"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              onKeyDown={handleAddKeyDown}
              className="h-8 text-xs"
              autoFocus
            />
            <PatternHelp onSelect={setNewPattern} />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-7 flex-1 text-xs"
              onClick={() => handleExcludePattern(newPattern)}
              disabled={!newPattern.trim()}
            >
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setAdding(false);
                setNewPattern('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Excluded sites list */}
      <ScrollArea className="min-h-0 flex-1 px-4">
        <div className="space-y-1 pb-3">
          {filteredExcluded.length === 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">
              {search
                ? 'No exclusions match your search'
                : 'No excluded sites — link rewriting is active on all pages'}
            </p>
          )}
          {filteredExcluded.map((site) => (
            <div
              key={site.id}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted/50"
            >
              <ShieldBan className="h-4 w-4 shrink-0 text-muted-foreground" />

              {editingId === site.id ? (
                <>
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    className="h-7 min-w-0 flex-1 text-xs"
                    autoFocus
                  />
                  <PatternHelp onSelect={setEditValue} />
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSaveEdit}>
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </>
              ) : (
                <>
                  <p className="min-w-0 flex-1 truncate text-sm">{site.hostname}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleStartEdit(site)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDeleteExclusion(site.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
