// speech.ts
// Add safe constructor handling & typings for TS

// Minimal DOM typings for Web Speech API (if not available in TS lib)
interface SpeechRecognitionAlternative {
  confidence: number;
  transcript: string;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error:
    | "no-speech"
    | "aborted"
    | "audio-capture"
    | "network"
    | "not-allowed"
    | "service-not-allowed"
    | "bad-grammar"
    | "language-not-supported"
    | string;
  readonly message?: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous?: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onaudiostart?: (this: SpeechRecognition, ev: Event) => any;
  onaudioend?: (this: SpeechRecognition, ev: Event) => any;
  onsoundstart?: (this: SpeechRecognition, ev: Event) => any;
  onsoundend?: (this: SpeechRecognition, ev: Event) => any;
  onspeechstart?: (this: SpeechRecognition, ev: Event) => any;
  onspeechend?: (this: SpeechRecognition, ev: Event) => any;
  onresult?: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => any;
  onerror?: (this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any;
  onstart?: (this: SpeechRecognition, ev: Event) => any;
  onend?: (this: SpeechRecognition, ev: Event) => any;
  start(): void;
  stop(): void;
  abort?(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const SpeechRecognitionCtor: SpeechRecognitionConstructor | undefined =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined;

if (!SpeechRecognitionCtor) {
  // At runtime in unsupported browsers, we keep previous behavior.
  // In TS, this avoids untyped globals.
  throw new Error("Speech Recognition API not supported in this browser.");
}

let recognition: SpeechRecognition | null = null;

/**
 * Initialize the recognition instance
 */
export function initSpeechRecognition({
  lang = "en-US",
  interimResults = false,
  maxAlternatives = 1,
}: {
  lang?: string;
  interimResults?: boolean;
  maxAlternatives?: number;
} = {}) {
  if (!SpeechRecognitionCtor) {
    throw new Error("Speech Recognition API not supported in this browser.");
  }
  recognition = new SpeechRecognitionCtor();
  recognition.lang = lang;
  recognition.interimResults = interimResults;
  recognition.maxAlternatives = maxAlternatives;
}

/**
 * Start listening and return a promise with transcript
 */
export function startListening(): Promise<{ transcript: string; confidence: number }> {
  return new Promise((resolve, reject) => {
    if (!recognition) initSpeechRecognition();

    // Guard after init
    if (!recognition) {
      reject("speech-recognition-not-initialized");
      return;
    }

    recognition.start();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;

      resolve({ transcript, confidence });
    };

    recognition.onerror = (err: SpeechRecognitionErrorEvent | any) => {
      const error = ("error" in err ? err.error : undefined) || "speech-error";
      reject(error);
    };
  });
}

/**
 * Stop the recognition manually
 */
export function stopListening() {
  if (recognition) recognition.stop();
}

/**
 * Optional: attach handlers if needed
 */
export function onSpeechStart(fn: (this: SpeechRecognition, ev: Event) => any) {
  if (recognition) recognition.onspeechstart = fn as any;
}

export function onSpeechEnd(fn: (this: SpeechRecognition, ev: Event) => any) {
  if (recognition) recognition.onspeechend = fn as any;
}

export function onAudioStart(fn: (this: SpeechRecognition, ev: Event) => any) {
  if (recognition) recognition.onaudiostart = fn as any;
}

export function onAudioEnd(fn: (this: SpeechRecognition, ev: Event) => any) {
  if (recognition) recognition.onaudioend = fn as any;
}

export function onError(fn: (this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) {
  if (recognition) recognition.onerror = fn as any;
}
