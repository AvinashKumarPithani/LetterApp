import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const TextEditor = () => {
  const [content, setContent] = useState("");

  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:5000/save-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      alert(data.message || "Saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  return (
    <div>
      <ReactQuill value={content} onChange={setContent} />
      <button onClick={handleSave}>Save to Google Drive</button>
    </div>
  );
};

export default TextEditor;
