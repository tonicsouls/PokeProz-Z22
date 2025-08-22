
import React from 'react';

interface ResultCardProps {
  title: string;
  content: string;
}

// A simple parser to convert markdown-like text to styled divs
const SimpleMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const elements = lines.map((line, index) => {
    if (line.startsWith('### ')) {
      return <h3 key={index} className="text-xl font-bold text-purple-300 mt-6 mb-2 pb-1 border-b border-gray-700">{line.substring(4)}</h3>;
    }
     if (line.startsWith('## ')) {
      return <h2 key={index} className="text-2xl font-bold text-teal-300 mt-6 mb-3">{line.substring(3)}</h2>;
    }
    if (line.startsWith('**')) {
      const parts = line.split('**');
      return <p key={index} className="my-2"><strong className="font-semibold text-gray-200">{parts[1]}</strong>{parts[2]}</p>;
    }
    if (line.startsWith('- ')) {
      return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
    }
    if (line.trim() === '') {
      return null;
    }
    return <p key={index} className="my-2">{line}</p>;
  });
  return <>{elements}</>;
};

export const ResultCard: React.FC<ResultCardProps> = ({ title, content }) => {
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-700 h-full">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
        {title}
      </h2>
      <div className="prose prose-invert prose-p:text-gray-300 prose-li:text-gray-300 text-gray-300 leading-relaxed">
        <SimpleMarkdownRenderer text={content} />
      </div>
    </div>
  );
};
