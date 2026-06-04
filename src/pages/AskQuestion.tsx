import { useState } from "react";
import { askQuestion, type StructuredGuidanceResponse } from "../services/api";

function AskQuestion() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<StructuredGuidanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setResponse(null);

      const data = await askQuestion({
        question,
        userConsent: true,
      });

      setResponse(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get response";
      setError(errorMessage);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit();
    }
  };

  const formatBoldText = (text: string) => {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 text-slate-100">
      {/* HEADER DISCLAIMER */}
      <div className="bg-blue-950/40 border border-blue-900 rounded-lg p-4 mb-6">
        <p className="text-blue-300 font-semibold text-sm">Important Notice</p>
        <p className="text-blue-200 text-sm mt-2">
          This tool provides general informational guidance only. It is <strong>NOT legal advice</strong> and does not replace consultation with a qualified legal professional. For specific legal matters, consult with a lawyer in your jurisdiction.
        </p>
      </div>

      {/* INPUT SECTION */}
      <div className="bg-slate-900 border border-slate-800 shadow-md rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4 text-slate-100">Describe Your Situation</h1>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe your situation clearly... (Ctrl+Enter to submit)"
          className="w-full border border-slate-700 bg-slate-950 text-slate-100 p-4 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-normal"
          rows={4}
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !question.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition font-medium"
        >
          {loading ? "Processing..." : "Get Guidance"}
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="h-4 bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* RESPONSE SECTIONS */}
      {response && !loading && (
        <div className="space-y-6">
          {/* CONFIDENCE BADGE */}
          <div className="flex items-center justify-end">
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${
                response.confidenceScore > 75
                  ? "bg-green-100 text-green-700"
                  : response.confidenceScore > 50
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              Relevance Score: {response.confidenceScore}%
            </span>
          </div>

          {/* 1. ISSUE SUMMARY */}
          <div className="bg-slate-900 border border-slate-800 shadow-md rounded-xl p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-4">A. Issue Summary</h2>
            <div className="text-slate-300 leading-relaxed space-y-3">
              {response.issueSummary.split("\n").map((line, idx) => (
                <p key={idx}>{formatBoldText(line)}</p>
              ))}
            </div>
          </div>

          {/* 2. RELEVANT INFORMATION */}
          <div className="bg-slate-900 border border-slate-800 shadow-md rounded-xl p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-4">B. Legal Position</h2>
            <div className="text-slate-300 leading-relaxed space-y-3">
              {response.relevantInformation.split("\n").map((line, idx) => (
                <p key={idx}>{formatBoldText(line)}</p>
              ))}
            </div>
          </div>

          {/* 3. SUGGESTED ACTIONS */}
          {response.suggestedActions.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 shadow-md rounded-xl p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-4">C. Immediate Actions</h2>
              <div className="space-y-3">
                {response.suggestedActions.map((action, idx) => (
                  <div key={idx} className="bg-slate-800 rounded-lg p-4 border-l-4 border-blue-500">
                    <p className="font-semibold text-slate-100">
                      Step {action.step}: {action.action}
                    </p>
                    {action.details && (
                      <p className="text-slate-300 text-sm mt-2">{action.details}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. ESCALATION OPTIONS */}
          {response.escalationOptions.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 shadow-md rounded-xl p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-4">D. Remedies &amp; Escalation</h2>
              <div className="space-y-3">
                {response.escalationOptions.map((option, idx) => (
                  <div key={idx} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <p className="font-semibold text-slate-100">{option.authority}</p>
                    <p className="text-slate-300 text-sm mt-1">{option.description}</p>
                    {option.when && (
                      <p className="text-slate-400 text-xs mt-2">
                        <span className="font-medium">When:</span> {option.when}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. TEMPLATE OUTPUT */}
          {response.templateOutput && (
            <div className="bg-slate-900 border border-slate-800 shadow-md rounded-xl p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-4">E. Draft Output (Ready to Use)</h2>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-700 font-mono text-sm text-slate-300 whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                {response.templateOutput}
              </div>
              <p className="text-slate-400 text-xs mt-3">
                ℹ️ This is a template. Customize it based on your specific situation and local requirements.
              </p>
            </div>
          )}

          {/* 6. DOCUMENTATION CHECKLIST */}
          {response.documentationChecklist.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 shadow-md rounded-xl p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-4">F. Evidence Checklist</h2>
              <div className="space-y-2">
                {response.documentationChecklist.map((item, idx) => (
                  <div key={idx} className="flex items-start">
                    <input
                      type="checkbox"
                      disabled
                      className="mr-3 mt-1"
                    />
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. PRACTICAL REALITY */}
          {response.practicalReality && (
            <div className="bg-amber-950/30 border border-amber-900/40 rounded-lg p-6">
              <h2 className="text-lg font-bold text-amber-200 mb-4">G. Risk / Reality Check</h2>
              <div className="text-amber-100/90 leading-relaxed space-y-3">
                {response.practicalReality.split("\n").map((line, idx) => (
                  <p key={idx} className="text-sm">{formatBoldText(line)}</p>
                ))}
              </div>
            </div>
          )}

          {/* FOOTER DISCLAIMER */}
          <div className="bg-red-950/30 border border-red-900/40 rounded-lg p-4">
            <p className="text-red-300 font-semibold text-sm">Legal Disclaimer</p>
            <p className="text-red-200 text-xs mt-2">
              This guidance is for informational purposes only and does not constitute legal advice. The information provided is based on general knowledge and may not account for all relevant factors in your specific situation. <strong>Always consult a qualified legal professional before taking action.</strong> Use of this tool does not create an attorney-client relationship.
            </p>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!response && !loading && !error && (
        <div className="text-center text-slate-500 py-8">
          <p>Enter a description of your situation to receive structured guidance</p>
        </div>
      )}
    </div>
  );
}

export default AskQuestion;