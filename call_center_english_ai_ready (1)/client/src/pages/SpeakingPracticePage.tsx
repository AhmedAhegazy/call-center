import React, { useEffect, useState, useRef } from 'react';
import { aiAPI } from '../services/api';
import { ttsService } from '../services/tts';
import AudioPlayer from '../components/AudioPlayer';

interface Scenario {
  id: number;
  scenarioName: string;
  scenarioDescription: string;
  difficulty: string;
  customerPersona: any;
  expectedResponses: string[];
  culturalContext: string;
}

interface SpeakingSession {
  sessionId: number;
  fluencyScore?: number;
  pronunciationScore?: number;
  grammarScore?: number;
  culturalNuanceScore?: number;
  overallScore?: number;
  aiFeedback?: string;
}

const SpeakingPracticePage: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [session, setSession] = useState<SpeakingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [scores, setScores] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scenarioNarrationAudio, setScenarioNarrationAudio] = useState<string>('');
  const [feedbackAudio, setFeedbackAudio] = useState<string>('');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const res = await aiAPI.getScenarios();
        setScenarios(res.data.scenarios);
      } catch (err) {
        setError('Failed to load scenarios');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, []);

  const startSession = async (scenario: Scenario) => {
    try {
      const res = await aiAPI.startSpeakingSession(scenario.scenarioName);
      setSession({ sessionId: res.data.sessionId });
      setSelectedScenario(scenario);
      setTranscript('');
      setFeedback('');
      setScores(null);
      setScenarioNarrationAudio('');
      setFeedbackAudio('');
      setError('');

      // Generate scenario narration audio
      setIsGeneratingAudio(true);
      try {
        const narrationRes = await ttsService.generateScenarioNarration(scenario.id);
        setScenarioNarrationAudio(narrationRes.data.audio);
      } catch (err) {
        console.warn('Failed to generate scenario narration:', err);
      } finally {
        setIsGeneratingAudio(false);
      }
    } catch (err) {
      setError('Failed to start session');
      console.error(err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error(err);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && recordingIntervalRef.current) {
      mediaRecorderRef.current.stop();
      clearInterval(recordingIntervalRef.current);
      setIsRecording(false);

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await submitRecording(audioBlob);
      };
    }
  };

  const submitRecording = async (audioBlob: Blob) => {
    if (!session || !selectedScenario) {
      setError('Session or scenario not found');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Create FormData with audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('duration', recordingTime.toString());
      formData.append('scenarioType', selectedScenario.scenarioName);
      formData.append('expectedResponses', JSON.stringify(selectedScenario.expectedResponses));

      // Submit to backend with Whisper transcription
      const response = await fetch(`/api/ai/speaking-session/${session.sessionId}/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process audio');
      }

      const result = await response.json();

      // Update state with results
      setTranscript(result.transcript);
      setScores(result.scores);
      setFeedback(result.feedback);

      // Generate feedback audio
      setIsGeneratingAudio(true);
      try {
        const feedbackRes = await ttsService.generateFeedbackAudio(result.feedback);
        setFeedbackAudio(feedbackRes.data.audio);
      } catch (err) {
        console.warn('Failed to generate feedback audio:', err);
      } finally {
        setIsGeneratingAudio(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process audio');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      Beginner: 'bg-green-100 text-green-800',
      Intermediate: 'bg-yellow-100 text-yellow-800',
      Advanced: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scenarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🎤 Speaking Practice</h1>
        <p className="text-gray-600 mb-8">
          Practice real call center scenarios with AI-powered Whisper transcription, TTS narration, and instant feedback
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scenarios List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${
                    selectedScenario?.id === scenario.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{scenario.scenarioName}</h3>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getDifficultyColor(scenario.difficulty)}`}>
                      {scenario.difficulty}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">{scenario.scenarioDescription}</p>

                  <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
                    <p className="font-semibold text-gray-700 mb-2">Customer Profile:</p>
                    <p className="text-gray-600">
                      {scenario.customerPersona?.name} - {scenario.customerPersona?.mood} mood, {scenario.customerPersona?.accent} accent
                    </p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded mb-4 text-sm">
                    <p className="font-semibold text-blue-700 mb-2">Cultural Context:</p>
                    <p className="text-blue-600">{scenario.culturalContext}</p>
                  </div>

                  <button
                    onClick={() => startSession(scenario)}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
                  >
                    Start Practice
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recording Interface */}
          <div className="lg:col-span-1">
            {session && selectedScenario ? (
              <div className="bg-white rounded-lg shadow p-6 sticky top-4 space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Recording Session</h2>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Scenario:</p>
                  <p className="font-semibold text-gray-800">{selectedScenario.scenarioName}</p>
                </div>

                {/* Scenario Narration Audio */}
                {scenarioNarrationAudio && (
                  <AudioPlayer
                    audioUrl={scenarioNarrationAudio}
                    title="📢 Scenario Narration"
                    autoPlay={false}
                    className="mb-4"
                  />
                )}

                {!scores ? (
                  <div>
                    <div className="text-center mb-6">
                      {isRecording && <div className="text-4xl mb-2 animate-pulse">🔴</div>}
                      <p className="text-2xl font-bold text-gray-800">
                        {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {isProcessing ? 'Processing audio...' : isRecording ? 'Recording...' : 'Ready to record'}
                      </p>
                    </div>

                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isProcessing}
                      className={`w-full py-3 rounded-lg font-semibold text-white transition mb-3 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {isProcessing ? '⏳ Processing...' : isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      Speak naturally and respond to the scenario. Audio will be transcribed using Whisper AI.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-green-700 mb-2">Overall Score</p>
                      <p className="text-3xl font-bold text-green-600">{scores.overallScore.toFixed(1)}/100</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-700">Fluency</span>
                          <span className="text-sm text-gray-600">{scores.fluencyScore.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${scores.fluencyScore}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-700">Pronunciation</span>
                          <span className="text-sm text-gray-600">{scores.pronunciationScore.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${scores.pronunciationScore}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-700">Grammar</span>
                          <span className="text-sm text-gray-600">{scores.grammarScore.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${scores.grammarScore}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-700">Cultural Nuance</span>
                          <span className="text-sm text-gray-600">{scores.culturalNuanceScore.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${scores.culturalNuanceScore}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {transcript && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Your Transcript</p>
                        <p className="text-sm text-gray-600 italic">"{transcript}"</p>
                      </div>
                    )}

                    {feedbackAudio && (
                      <AudioPlayer
                        audioUrl={feedbackAudio}
                        title="🎧 AI Feedback Audio"
                        autoPlay={false}
                      />
                    )}

                    {feedback && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-blue-700 mb-2">AI Feedback</p>
                        <p className="text-sm text-blue-600">{feedback}</p>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSession(null);
                        setSelectedScenario(null);
                        setScores(null);
                        setTranscript('');
                        setFeedback('');
                        setScenarioNarrationAudio('');
                        setFeedbackAudio('');
                      }}
                      className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
                    >
                      Try Another Scenario
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                <p>Select a scenario to start practicing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakingPracticePage;
