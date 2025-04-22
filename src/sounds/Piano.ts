import { noteToFrequency } from '@/components/SongCanvas/utils';
import { NoteName } from '@/songs';
import {
  AudioNode,
  AudioContext,
  OscillatorType,
  OscillatorNode,
  GainNode,
  BiquadFilterNode,
} from 'react-native-audio-api';

class Piano {
  public audioContext: AudioContext;
  public noteName: NoteName;
  public outputNode: AudioNode;
  public oscillatorType: OscillatorType = 'sawtooth';

  public attack = 0.005; // time of attack phase
  public decay = 0.1; // time of decay phase
  public sustain = 0.8; // volume % of sustain phase
  public release = 0.07; // time of release phase

  private oscillators: OscillatorNode[];
  private lowPass: BiquadFilterNode;
  private envelope: GainNode;

  constructor(aCtx: AudioContext, noteName: NoteName, outputNode: AudioNode) {
    this.audioContext = aCtx;
    this.noteName = noteName;
    this.outputNode = outputNode;
  }

  attackDecaySustain = (when: number) => {
    const { envelope, attack, decay, sustain } = this;

    envelope.gain.setValueAtTime(0, when);
    envelope.gain.linearRampToValueAtTime(1, when + attack);
    envelope.gain.exponentialRampToValueAtTime(sustain, when + attack + decay);
  };

  releaseStop = (when: number) => {
    const { envelope, oscillators, sustain, release } = this;

    envelope.gain.setValueAtTime(sustain, when);
    envelope.gain.linearRampToValueAtTime(0, when + release);

    for (const oscillator of oscillators) {
      oscillator.stop(when + release);
    }
  };

  createOscillator = (frequency: number) => {
    const oscillator = this.audioContext.createOscillator();

    oscillator.type = this.oscillatorType;
    oscillator.frequency.value = frequency;

    return oscillator;
  };

  createLowPass = (frequency: number) => {
    const lowPass = this.audioContext.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.value = frequency * 0.9;

    return lowPass;
  };

  start = (when: number = 0) => {
    const frequency = noteToFrequency(this.noteName);

    const oscillator1 = this.createOscillator(frequency);
    this.oscillators = [oscillator1];

    const envelope = this.audioContext.createGain();
    const lowPass = this.createLowPass(frequency);

    for (const oscillator of this.oscillators) {
      oscillator.connect(lowPass);
    }

    lowPass.connect(envelope);
    envelope.connect(this.outputNode);

    this.envelope = envelope;
    this.lowPass = lowPass;

    for (const oscillator of this.oscillators) {
      oscillator.start(when);
    }

    this.attackDecaySustain(when);
  };

  stop = (when?: number) => {
    this.releaseStop(when ?? this.audioContext.currentTime);
  };
}

export default Piano;
