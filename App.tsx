import React, { useState, useCallback } from 'react';
import Input from './components/Input';
import OutputCard from './components/OutputCard';
import { generateMeetingPrep } from './services/geminiService';
import { MeetingInputs, MeetingPrepOutput } from './types';

function App() {
  const [inputs, setInputs] = useState<MeetingInputs>({
    topic: '',
    attendees: '',
    role: '',
    goal: '',
  });
  const [output, setOutput] = useState<MeetingPrepOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleGeneratePrep = useCallback(async () => {
    setError(null);
    setLoading(true);
    setOutput(null);

    // Basic validation
    if (!inputs.topic || !inputs.attendees || !inputs.role || !inputs.goal) {
      setError("Please fill in all input fields.");
      setLoading(false);
      return;
    }

    try {
      // Check if API key is selected, if not, prompt user
      if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
        await window.aistudio.openSelectKey();
        // Assume key selection was successful and proceed.
        // The service will create a new GoogleGenAI instance with the updated API_KEY.
      }

      const generatedOutput = await generateMeetingPrep(inputs);
      setOutput(generatedOutput);
    } catch (err: any) {
      console.error('Error in App:', err);
      // Check for specific API key error message to prompt re-selection
      if (err.message && err.message.includes("Requested entity was not found.")) {
        setError("API key issue: Your selected API key might be invalid or unauthorized. Please re-select your API key to ensure billing is enabled, or use a different key. (ai.google.dev/gemini-api/docs/billing)");
        if (window.aistudio) {
          window.aistudio.openSelectKey(); // Prompt user to re-select
        }
      } else {
        setError(err.message || "An unexpected error occurred during generation.");
      }
    } finally {
      setLoading(false);
    }
  }, [inputs]);

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gray-100">
      <header className="w-full max-w-2xl text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Meeting Prep AI</h1>
        <p className="text-lg text-gray-600">Prepare for your next meeting with AI-powered insights.</p>
      </header>

      <main className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-xl mb-8 md:mb-20">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Meeting Details</h2>
        <Input
          label="Meeting Topic"
          id="topic"
          name="topic"
          value={inputs.topic}
          onChange={handleChange}
          placeholder="e.g., Q3 Sales Strategy Review"
        />
        <Input
          label="Attendees"
          id="attendees"
          name="attendees"
          value={inputs.attendees}
          onChange={handleChange}
          placeholder="e.g., John (CEO), Sarah (Marketing Head), David (Sales Lead)"
        />
        <Input
          label="Your Role"
          id="role"
          name="role"
          value={inputs.role}
          onChange={handleChange}
          placeholder="e.g., Presenting Q2 Performance"
        />
        <Input
          label="Meeting Goal"
          id="goal"
          name="goal"
          value={inputs.goal}
          onChange={handleChange}
          placeholder="e.g., Get approval for new marketing campaign budget"
          rows={3}
        />
      </main>

      <div className="fixed bottom-0 md:static w-full p-4 bg-white md:bg-transparent shadow-lg md:shadow-none flex justify-center z-10">
        <button
          onClick={handleGeneratePrep}
          disabled={loading}
          className={`w-full max-w-sm px-8 py-3 rounded-full text-white font-semibold text-lg
            ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50'}
            transition duration-300 ease-in-out`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Prep...
            </div>
          ) : (
            'Generate Prep'
          )}
        </button>
      </div>


      {error && (
        <div className="w-full max-w-2xl bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mt-4 mb-8">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {output && (
        <section className="w-full max-w-2xl mt-8 mb-20 md:mt-12 space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Your Meeting Prep</h2>
          <OutputCard title="Key Talking Points" content={output.keyTalkingPoints} />
          <OutputCard title="Smart Questions to Ask" content={output.smartQuestions} />
          <OutputCard
            title="Potential Objections & Responses"
            content={output.potentialObjections.map(
              (item, index) => `Objection ${index + 1}: ${item.objection}\nResponse: ${item.response}`
            )}
          />
          <OutputCard title="Confidence-Boosting Opening Line" content={output.openingLine} />
        </section>
      )}
    </div>
  );
}

export default App;
