import { useState } from "react";

export default function JSONViewer({ data }) {
  const [isOpen, setIsOpen] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full mb-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
      >
        {isOpen ? "Close" : "View JSON"} 📋
      </button>

      {isOpen && (
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 shadow-lg overflow-auto max-h-96 font-mono text-xs border border-gray-700">
          <pre className="whitespace-pre-wrap break-words">{jsonString}</pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(jsonString);
              alert("Copied to clipboard!");
            }}
            className="mt-2 w-full px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition"
          >
            Copy JSON
          </button>
        </div>
      )}
    </div>
  );
}
