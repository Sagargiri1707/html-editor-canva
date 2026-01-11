import { useState } from "react";
import { WysiwygEditor } from "./components/WysiwygEditor";
import "./App.css";

const initialHtml = `
<h1>Welcome to the WYSIWYG Editor</h1>
<p>This is a <strong>simple</strong> in-place editor. You can click anywhere to start editing the content directly.</p>
<p>Try editing this text! The changes will be reflected in the HTML output below.</p>
<h2>Features:</h2>
<ul>
  <li><strong>Text formatting</strong> - bold, italic, underline, strikethrough</li>
  <li><strong>Headings</strong> - H1, H2, H3 via dropdown</li>
  <li><strong>Lists</strong> - bullet and numbered lists</li>
  <li><strong>Links</strong> - add and edit hyperlinks</li>
  <li><strong>Images</strong> - click to replace or delete</li>
</ul>
<h2>Sample Image:</h2>
<p>Click on the image below to see the media toolbar:</p>
<img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop" alt="Mountain landscape" />
<p>You can replace this image with one from the asset library or upload a new one.</p>
`.trim();

// Sample assets for the asset library
const sampleAssets = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop",
    name: "Nature",
    type: "image" as const,
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=300&h=300&fit=crop",
    name: "Waterfall",
    type: "image" as const,
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=300&h=300&fit=crop",
    name: "Lake",
    type: "image" as const,
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&h=300&fit=crop",
    name: "Foggy mountains",
    type: "image" as const,
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&h=300&fit=crop",
    name: "Forest",
    type: "image" as const,
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&h=300&fit=crop",
    name: "Valley",
    type: "image" as const,
  },
];

// Simulated upload function
const handleUpload = async (file: File): Promise<string> => {
  // Simulate upload delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Return a local URL for the uploaded file
  return URL.createObjectURL(file);
};

// Dangerous HTML for testing sanitization
const dangerousHtml = `
<h1>This content has been sanitized!</h1>
<p>The following dangerous elements were removed:</p>
<script>alert('XSS Attack!')</script>
<p onclick="alert('clicked')">This had an onclick handler</p>
<a href="javascript:alert('xss')">This had a javascript: URL</a>
<img src="x" onerror="alert('img error')">
<p>But safe content like <strong>bold</strong> and <em>italic</em> is preserved.</p>
`.trim();

function App() {
  const [html, setHtml] = useState(initialHtml);
  const [showOutput, setShowOutput] = useState(false);

  const testSanitization = () => {
    setHtml(dangerousHtml);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">WYSIWYG Editor</h1>
        <div className="header-actions">
          <button className="test-btn" onClick={testSanitization}>
            Test Sanitization
          </button>
          <button
            className="toggle-output-btn"
            onClick={() => setShowOutput(!showOutput)}
          >
            {showOutput ? "Hide" : "Show"} HTML Output
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="editor-container">
          <WysiwygEditor
            html={html}
            onChange={setHtml}
            debounceMs={300}
            assets={sampleAssets}
            onUpload={handleUpload}
          />
        </div>

        {showOutput && (
          <div className="output-panel">
            <h3 className="output-title">HTML Output</h3>
            <pre className="output-code">{html}</pre>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
