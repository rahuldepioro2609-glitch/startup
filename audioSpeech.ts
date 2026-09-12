/**
 * Web Speech API and Audio Synthesizer with Instant Interruption support
 */

class AudioSpeechManager {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoice();
      };
      this.initVoice();
    }
  }

  private initVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Look for natural voices: prioritize Indian English/Hindi for Hinglish when available, else natural English
    const preferred = voices.find(
      (v) =>
        (v.lang.startsWith('en-IN') || v.lang.startsWith('hi')) &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Veena') || v.name.includes('Rishi'))
    ) || voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Jenny') ||
          v.name.includes('Daniel') ||
          v.name.includes('Karen'))
    ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];
    if (preferred) {
      this.selectedVoice = preferred;
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en') || v.lang.startsWith('hi'));
  }

  public setVoice(voiceName: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    const found = voices.find((v) => v.name === voiceName);
    if (found) {
      this.selectedVoice = found;
    }
  }

  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return false;
    }

    // Cancel any previous speech for instant turn-taking
    this.interrupt();

    // Clean text of markdown, asterisks, URLs if any
    const cleanText = text
      .replace(/[*#_~`]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Detect if spoken content is Hinglish/Hindi
    const isHinglish = /namaste|aap|mera|meri|kya|bataiye|kardo|karni|baje|subah|dopahar|hai|kaun|chahiye|kitna|kharcha|bhejo|insaan|madad|theek|rahul|amit|gayi|saari/i.test(cleanText);
    const voices = window.speechSynthesis.getVoices();

    if (isHinglish) {
      // Find optimal Indian voice for Hinglish dialogue
      const indianVoice = voices.find(
        (v) => (v.lang === 'hi-IN' || v.lang.startsWith('hi') || v.lang === 'en-IN') &&
               (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Veena') || v.name.includes('Rishi'))
      ) || voices.find((v) => v.lang === 'hi-IN' || v.lang === 'en-IN') || this.selectedVoice;

      if (indianVoice) {
        utterance.voice = indianVoice;
      }
    } else if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.rate = 1.05; // natural conversation speed
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isSpeakingState = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeakingState = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.onEndCallback = onEnd || null;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  /**
   * Immediately halts speech synthesis when caller speaks or interrupts
   */
  public interrupt(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking || this.isSpeakingState) {
        window.speechSynthesis.cancel();
      }
    }
    this.isSpeakingState = false;
    this.currentUtterance = null;
    if (this.onEndCallback) {
      this.onEndCallback();
      this.onEndCallback = null;
    }
  }

  public isSpeaking(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    return window.speechSynthesis.speaking || this.isSpeakingState;
  }
}

export const audioSpeech = new AudioSpeechManager();
