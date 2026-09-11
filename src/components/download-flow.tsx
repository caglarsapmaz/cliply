"use client";

import { useReducer } from "react";
import { useLocale } from "@/lib/i18n/provider";
import { ApiRequestError, fetchMetadata, prepareDownload } from "@/lib/api-client";
import type { ApiErrorCode, MediaFormat, MediaQuality, MetadataResponse } from "@/types";
import { UrlInputForm } from "./url-input-form";
import { MetadataPreview } from "./metadata-preview";
import { FormatSelector } from "./format-selector";
import { QualitySelector } from "./quality-selector";
import { ConversionProgress, type ProgressStage } from "./conversion-progress";
import { ResultCard } from "./result-card";
import { ErrorBanner } from "./error-banner";
import { ArrowRightIcon } from "./icons";

type Step = "idle" | "loading-metadata" | "metadata" | "preparing" | "ready";

interface FlowState {
  step: Step;
  url: string | null;
  data: MetadataResponse | null;
  format: MediaFormat;
  quality: MediaQuality;
  stage: ProgressStage;
  downloadUrl: string | null;
  filename: string | null;
  metadataError: ApiErrorCode | null;
  prepareError: ApiErrorCode | null;
}

type Action =
  | { type: "SUBMIT_URL"; url: string }
  | { type: "METADATA_SUCCESS"; data: MetadataResponse }
  | { type: "METADATA_ERROR"; code: ApiErrorCode }
  | { type: "SET_FORMAT"; format: MediaFormat }
  | { type: "SET_QUALITY"; quality: MediaQuality }
  | { type: "START_PREPARE" }
  | { type: "SET_STAGE"; stage: ProgressStage }
  | { type: "PREPARE_SUCCESS"; downloadUrl: string; filename: string }
  | { type: "PREPARE_ERROR"; code: ApiErrorCode }
  | { type: "RESET" };

const initialState: FlowState = {
  step: "idle",
  url: null,
  data: null,
  format: "mp4",
  quality: "auto",
  stage: "preparing",
  downloadUrl: null,
  filename: null,
  metadataError: null,
  prepareError: null,
};

function reducer(state: FlowState, action: Action): FlowState {
  switch (action.type) {
    case "SUBMIT_URL":
      return { ...initialState, step: "loading-metadata", url: action.url };
    case "METADATA_SUCCESS":
      return { ...state, step: "metadata", data: action.data, format: "mp4", quality: "auto" };
    case "METADATA_ERROR":
      return { ...state, step: "idle", metadataError: action.code };
    case "SET_FORMAT":
      return { ...state, format: action.format, quality: "auto", prepareError: null };
    case "SET_QUALITY":
      return { ...state, quality: action.quality, prepareError: null };
    case "START_PREPARE":
      return { ...state, step: "preparing", stage: "preparing", prepareError: null };
    case "SET_STAGE":
      return { ...state, stage: action.stage };
    case "PREPARE_SUCCESS":
      return {
        ...state,
        step: "ready",
        downloadUrl: action.downloadUrl,
        filename: action.filename,
      };
    case "PREPARE_ERROR":
      return { ...state, step: "metadata", prepareError: action.code };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function DownloadFlow() {
  const { t } = useLocale();
  const [state, dispatch] = useReducer(reducer, initialState);

  async function handleUrlSubmit(url: string) {
    dispatch({ type: "SUBMIT_URL", url });
    try {
      const data = await fetchMetadata(url);
      dispatch({ type: "METADATA_SUCCESS", data });
    } catch (err) {
      const code = err instanceof ApiRequestError ? err.code : "service_unavailable";
      dispatch({ type: "METADATA_ERROR", code });
    }
  }

  async function handleDownload() {
    if (!state.url) return;
    dispatch({ type: "START_PREPARE" });
    const timers = [
      setTimeout(() => dispatch({ type: "SET_STAGE", stage: "fetching" }), 900),
      setTimeout(() => dispatch({ type: "SET_STAGE", stage: "converting" }), 2600),
      setTimeout(() => dispatch({ type: "SET_STAGE", stage: "finishing" }), 5200),
    ];
    try {
      const result = await prepareDownload(state.url, state.format, state.quality);
      timers.forEach(clearTimeout);
      dispatch({ type: "PREPARE_SUCCESS", downloadUrl: result.downloadUrl, filename: result.filename });
    } catch (err) {
      timers.forEach(clearTimeout);
      const code = err instanceof ApiRequestError ? err.code : "service_unavailable";
      dispatch({ type: "PREPARE_ERROR", code });
    }
  }

  const qualities = state.data
    ? state.format === "mp3"
      ? state.data.formats.mp3
      : state.data.formats.mp4
    : [];

  return (
    <section className="mx-auto flex max-w-3xl flex-1 flex-col items-start gap-5 px-5 py-10 [justify-content:safe_center] sm:px-8">
      <div className="flex flex-wrap gap-2">
        {[t.badges.free, t.badges.noAds, t.badges.noAccount, t.badges.openWeb].map((badge) => (
          <span
            key={badge}
            className="-rotate-1 border-2 border-ink bg-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-accent-ink first:rotate-1 last:-rotate-2"
          >
            {badge}
          </span>
        ))}
      </div>

      <h1 className="font-display text-[11.5vw] leading-[0.95] tracking-tight text-ink sm:text-5xl md:text-6xl">
        {t.hero.titleLine1}
        <br />
        {t.hero.titleLine2}
        <br />
        <span className="text-accent [-webkit-text-stroke:2px_var(--color-ink)]">
          {t.hero.titleLine3}
        </span>
      </h1>
      <p className="text-lg text-ink-soft">{t.hero.tagline}</p>

      <UrlInputForm onSubmit={handleUrlSubmit} loading={state.step === "loading-metadata"} />

      {state.metadataError && (
        <ErrorBanner
          code={state.metadataError}
          onRetry={state.url ? () => handleUrlSubmit(state.url!) : undefined}
        />
      )}

      {(state.step === "metadata" || state.step === "preparing" || state.step === "ready") &&
        state.data && <MetadataPreview metadata={state.data.metadata} />}

      {(state.step === "metadata" || state.step === "preparing") && state.data && (
        <div className="flex w-full flex-col gap-5">
          <FormatSelector
            value={state.format}
            onChange={(format) => dispatch({ type: "SET_FORMAT", format })}
          />
          <QualitySelector
            format={state.format}
            qualities={qualities}
            value={state.quality}
            onChange={(quality) => dispatch({ type: "SET_QUALITY", quality })}
          />

          {state.prepareError && <ErrorBanner code={state.prepareError} onRetry={handleDownload} />}

          {state.step === "metadata" && (
            <button
              type="button"
              onClick={handleDownload}
              className="press-tactile inline-flex w-full items-center justify-center gap-2 border-2 border-ink bg-ink px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-paper shadow-hard sm:w-auto"
            >
              {t.actions.download}
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          )}

          {state.step === "preparing" && <ConversionProgress stage={state.stage} />}
        </div>
      )}

      {state.step === "ready" && state.data && state.downloadUrl && state.filename && (
        <ResultCard
          metadata={state.data.metadata}
          format={state.format}
          quality={state.quality}
          downloadUrl={state.downloadUrl}
          filename={state.filename}
          onStartOver={() => dispatch({ type: "RESET" })}
        />
      )}
    </section>
  );
}
