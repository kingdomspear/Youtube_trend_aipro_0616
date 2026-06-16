"use client";

import { useState, useEffect } from "react";
import { Settings, Key, Eye, EyeOff, Save, Trash2, CheckCircle2, AlertCircle, ExternalLink, Loader2, RefreshCw } from "lucide-react";

type SettingKey = "YOUTUBE_API_KEY" | "ANTHROPIC_API_KEY";
type Source = "db" | "env" | "none";

interface KeyState {
  masked: string; source: Source; inputValue: string; showInput: boolean;
  saving: boolean; deleting: boolean; error: string | null; success: string | null;
}

const KEY_META: Record<SettingKey, { label: string; description: string; docsUrl: string; placeholder: string }> = {
  YOUTUBE_API_KEY: {
    label: "YouTube Data API Key",
    description: "YouTube 급상승 영상, 댓글, 채널 정보를 가져오는 데 필요합니다.",
    docsUrl: "https://console.cloud.google.com/",
    placeholder: "AIzaSy…",
  },
  ANTHROPIC_API_KEY: {
    label: "Anthropic API Key (Claude)",
    description: "댓글 감성 분석, AI 영상 요약, 콘텐츠 기획 리포트 생성에 필요합니다.",
    docsUrl: "https://console.anthropic.com/",
    placeholder: "sk-ant-…",
  },
};

const SOURCE_BADGE: Record<Source, { label: string; bg: string; color: string }> = {
  db:   { label: "앱 설정에서 등록됨", bg: "#dcfce7", color: "#15803d" },
  env:  { label: ".env.local에서 읽음", bg: "#dbeafe", color: "#1d4ed8" },
  none: { label: "미등록",             bg: "var(--color-surface-card)", color: "var(--color-ash)" },
};

const KEYS: SettingKey[] = ["YOUTUBE_API_KEY", "ANTHROPIC_API_KEY"];

export default function SettingsPage() {
  const [states, setStates] = useState<Record<SettingKey, KeyState>>({
    YOUTUBE_API_KEY:  { masked: "", source: "none", inputValue: "", showInput: false, saving: false, deleting: false, error: null, success: null },
    ANTHROPIC_API_KEY:{ masked: "", source: "none", inputValue: "", showInput: false, saving: false, deleting: false, error: null, success: null },
  });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setStates((prev) => {
        const next = { ...prev };
        for (const key of KEYS)
          next[key] = { ...prev[key], masked: data[key].masked, source: data[key].source, inputValue: "", success: null, error: null };
        return next;
      });
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = (key: SettingKey, patch: Partial<KeyState>) =>
    setStates((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const save = async (key: SettingKey) => {
    const val = states[key].inputValue.trim();
    if (!val) { update(key, { error: "API 키를 입력해주세요." }); return; }
    update(key, { saving: true, error: null, success: null });
    try {
      const res = await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value: val }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      update(key, { saving: false, masked: data.masked, source: "db", inputValue: "", showInput: false, success: "저장되었습니다." });
      setTimeout(() => update(key, { success: null }), 3000);
    } catch (e: any) { update(key, { saving: false, error: e.message }); }
  };

  const remove = async (key: SettingKey) => {
    if (!confirm("DB에 저장된 키를 삭제합니다. .env.local의 값은 유지됩니다. 계속하시겠습니까?")) return;
    update(key, { deleting: true, error: null, success: null });
    try {
      await fetch(`/api/settings?key=${key}`, { method: "DELETE" });
      update(key, { deleting: false, success: "삭제되었습니다." });
      await load();
    } catch (e: any) { update(key, { deleting: false, error: e.message }); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2.5 mb-6">
        <Settings className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
        <h1 className="heading-xl" style={{ color: "var(--color-ink)" }}>설정</h1>
        <button onClick={load} disabled={loading}
          className="ml-auto w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: "var(--color-surface-card)", color: "var(--color-mute)" }}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Priority note */}
      <div className="rounded-[16px] p-4 mb-6"
        style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
        <p className="font-bold text-sm mb-1" style={{ color: "#1d4ed8" }}>API 키 적용 우선순위</p>
        <p className="caption-sm" style={{ color: "#3b82f6" }}>
          앱 설정(DB에 저장) → <code className="font-mono px-1 rounded" style={{ background: "#dbeafe" }}>.env.local</code> 파일 순서로 적용됩니다.
          앱에서 등록한 키가 항상 우선합니다.
        </p>
      </div>

      <div className="space-y-4">
        {KEYS.map((key) => {
          const s = states[key];
          const meta = KEY_META[key];
          const badge = SOURCE_BADGE[s.source];
          const hasKey = s.source !== "none";

          return (
            <div key={key} className="rounded-[16px] p-5"
              style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Key className="w-4 h-4 shrink-0" style={{ color: "var(--color-ash)" }} />
                    <span className="font-bold text-sm" style={{ color: "var(--color-ink)" }}>{meta.label}</span>
                    <span className="caption-sm px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="caption-sm mt-1 ml-6" style={{ color: "var(--color-mute)" }}>{meta.description}</p>
                </div>
                <a href={meta.docsUrl} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 caption-sm font-semibold flex items-center gap-1"
                  style={{ color: "var(--color-primary)" }}>
                  키 발급 <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Current value */}
              {hasKey && (
                <div className="flex items-center gap-2 rounded-[16px] px-3 py-2 mb-3 font-mono text-sm"
                  style={{ background: "var(--color-surface-card)", color: "var(--color-mute)" }}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#22c55e" }} />
                  <span>{s.masked || "****"}</span>
                  {s.source === "db" && (
                    <button onClick={() => remove(key)} disabled={s.deleting}
                      className="ml-auto transition-colors" style={{ color: "var(--color-stone)" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--color-error)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--color-stone)")}
                      title="DB에서 삭제">
                      {s.deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              )}

              {/* Input */}
              <div className="space-y-2">
                <div className="relative flex items-center">
                  <input
                    type={s.showInput ? "text" : "password"}
                    value={s.inputValue}
                    onChange={(e) => update(key, { inputValue: e.target.value, error: null })}
                    onKeyDown={(e) => e.key === "Enter" && save(key)}
                    placeholder={hasKey ? "새 키로 덮어쓰기…" : meta.placeholder}
                    className="input-base pr-20 font-mono text-sm"
                  />
                  <button onClick={() => update(key, { showInput: !s.showInput })}
                    className="absolute right-10 p-1" style={{ color: "var(--color-ash)" }} type="button">
                    {s.showInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => save(key)} disabled={s.saving || !s.inputValue.trim()}
                    className="absolute right-2 p-1 disabled:opacity-40 transition-colors"
                    style={{ color: "var(--color-primary)" }} type="button" title="저장">
                    {s.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </button>
                </div>

                {s.error && (
                  <p className="flex items-center gap-1.5 caption-sm" style={{ color: "var(--color-error)" }}>
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {s.error}
                  </p>
                )}
                {s.success && (
                  <p className="flex items-center gap-1.5 caption-sm" style={{ color: "#15803d" }}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {s.success}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* How-to guide */}
      <div className="mt-6 rounded-[16px] p-5 space-y-4"
        style={{ background: "var(--color-surface-card)", border: "1px solid var(--color-hairline)" }}>
        <p className="font-bold text-sm" style={{ color: "var(--color-ink)" }}>API 키 발급 방법</p>

        <div>
          <p className="font-semibold text-sm mb-1.5" style={{ color: "var(--color-charcoal)" }}>🎬 YouTube Data API Key</p>
          <ol className="list-decimal list-inside space-y-1 caption-sm" style={{ color: "var(--color-mute)" }}>
            <li><a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer"
              className="font-semibold" style={{ color: "var(--color-primary)" }}>Google Cloud Console</a> 접속 → 프로젝트 생성</li>
            <li>APIs & Services → Library → <strong>YouTube Data API v3</strong> 검색 후 활성화</li>
            <li>APIs & Services → Credentials → Create Credentials → <strong>API key</strong> 생성</li>
            <li>생성된 키를 위 입력란에 붙여넣고 저장</li>
          </ol>
        </div>

        <div>
          <p className="font-semibold text-sm mb-1.5" style={{ color: "var(--color-charcoal)" }}>🤖 Anthropic API Key</p>
          <ol className="list-decimal list-inside space-y-1 caption-sm" style={{ color: "var(--color-mute)" }}>
            <li><a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer"
              className="font-semibold" style={{ color: "var(--color-primary)" }}>Anthropic Console</a> 접속 → 계정 생성/로그인</li>
            <li>API Keys 메뉴 → <strong>Create Key</strong></li>
            <li>생성된 키(<code className="font-mono">sk-ant-…</code>)를 위 입력란에 붙여넣고 저장</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
