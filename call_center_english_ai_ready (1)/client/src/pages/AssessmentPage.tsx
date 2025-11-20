import React, { useEffect, useState } from 'react';
import { assessmentsAPI } from '../services/api';

interface AssessmentStatus {
  canTakeAssessment: boolean;
  completedAssessments: any[];
}

const AssessmentPage: React.FC = () => {
  const [status, setStatus] = useState<AssessmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [certification, setCertification] = useState<any>(null);

  const assessmentSections = [
    {
      name: 'Speaking',
      description: 'Demonstrate your speaking ability in call center scenarios',
      duration: 20,
      passingScore: 75,
    },
    {
      name: 'Listening',
      description: 'Comprehend various accents and speaking speeds',
      duration: 15,
      passingScore: 75,
    },
    {
      name: 'Grammar & Vocabulary',
      description: 'Test your grammar and vocabulary knowledge',
      duration: 20,
      passingScore: 75,
    },
    {
      name: 'Cultural Communication',
      description: 'Demonstrate understanding of cultural nuances',
      duration: 15,
      passingScore: 75,
    },
  ];

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await assessmentsAPI.getStatus();
        setStatus(res.data);
      } catch (err) {
        setError('Failed to load assessment status');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const startAssessment = () => {
    setAssessmentStarted(true);
    setCurrentSection(0);
    setScores({});
  };

  const submitSection = async (sectionName: string, score: number) => {
    const newScores = { ...scores, [sectionName]: score };
    setScores(newScores);

    if (currentSection < assessmentSections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      // All sections completed
      submitAssessment(newScores);
    }
  };

  const submitAssessment = async (finalScores: Record<string, number>) => {
    try {
      const overallScore =
        Object.values(finalScores).reduce((a, b) => a + b, 0) / Object.keys(finalScores).length;

      await assessmentsAPI.submitAssessment('b2-certification', {
        assessmentType: 'B2 Certification',
        score: overallScore,
        passingScore: 75,
        feedback: overallScore >= 75 ? 'Congratulations! You passed the B2 assessment.' : 'Please try again.',
      });

      if (overallScore >= 75) {
        // Issue certification
        const certRes = await assessmentsAPI.issueCertification('B2');
        setCertification(certRes.data.certification);
      }

      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit assessment');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🎯 B2 Certification Assessment</h1>
        <p className="text-gray-600 mb-8">
          Complete this comprehensive assessment to earn your B2 English certification
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!status?.canTakeAssessment && !assessmentStarted ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">Not Yet Eligible</h2>
            <p className="text-yellow-700">
              You need to complete all modules (Module 3, Week 4) before taking the assessment.
            </p>
          </div>
        ) : !assessmentStarted ? (
          <div className="space-y-6">
            {/* Assessment Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Assessment Overview</h2>
              
              <div className="space-y-4 mb-6">
                {assessmentSections.map((section, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-red-600 text-white font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{section.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>⏱️ {section.duration} minutes</span>
                        <span>✓ Passing score: {section.passingScore}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Total duration: ~70 minutes</li>
                  <li>✓ You need to score at least 75% overall to pass</li>
                  <li>✓ Each section must be completed in order</li>
                  <li>✓ You cannot go back to previous sections</li>
                  <li>✓ Upon passing, you'll receive a B2 certification</li>
                </ul>
              </div>

              <button
                onClick={startAssessment}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold text-lg"
              >
                Start Assessment
              </button>
            </div>

            {/* Previous Results */}
            {status?.completedAssessments && status.completedAssessments.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Previous Attempts</h2>
                <div className="space-y-3">
                  {status.completedAssessments.map((attempt, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-800">{attempt.assessmentType}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-800">{attempt.score.toFixed(1)}%</p>
                        <p className={`text-sm font-semibold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {attempt.passed ? 'PASSED' : 'FAILED'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : submitted ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            {certification ? (
              <div>
                <div className="text-6xl mb-4">🎓</div>
                <h2 className="text-3xl font-bold text-green-600 mb-2">Congratulations!</h2>
                <p className="text-gray-600 mb-6">You have successfully passed the B2 assessment!</p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <p className="text-sm text-gray-600 mb-2">Your Certification</p>
                  <p className="text-2xl font-bold text-green-600 mb-2">B2 English Certification</p>
                  <p className="text-sm text-gray-600">
                    Valid until: {new Date(certification.expiryDate).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setAssessmentStarted(false);
                    setSubmitted(false);
                  }}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <div>
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Assessment Submitted</h2>
                <p className="text-gray-600 mb-6">Your assessment has been recorded. Please try again to improve your score.</p>
                
                <button
                  onClick={() => {
                    setAssessmentStarted(false);
                    setSubmitted(false);
                  }}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  {assessmentSections[currentSection].name}
                </h2>
                <p className="text-sm font-semibold text-gray-600">
                  Section {currentSection + 1} of {assessmentSections.length}
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-600 h-3 rounded-full transition-all"
                  style={{ width: `${((currentSection + 1) / assessmentSections.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <p className="text-gray-600 mb-6">{assessmentSections[currentSection].description}</p>

            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-center">
              <p className="text-gray-600 mb-4">Simulated Assessment Section</p>
              <p className="text-4xl mb-4">🎤</p>
              <p className="text-gray-800 font-semibold mb-4">
                Complete the {assessmentSections[currentSection].name} section
              </p>
              <p className="text-sm text-gray-600">
                Duration: {assessmentSections[currentSection].duration} minutes
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Enter your score"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  onChange={(e) => {
                    const score = parseInt(e.target.value) || 0;
                    setScores({ ...scores, [assessmentSections[currentSection].name]: score });
                  }}
                />
              </div>
            </div>

            <button
              onClick={() =>
                submitSection(
                  assessmentSections[currentSection].name,
                  scores[assessmentSections[currentSection].name] || 0
                )
              }
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold"
            >
              {currentSection === assessmentSections.length - 1 ? 'Submit Assessment' : 'Next Section'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;
