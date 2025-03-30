import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { Container, TextField, Button, Paper, Typography, Box } from "@mui/material";

const LetterEditor = ({ user }) => {
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [draftId, setDraftId] = useState(null);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/drafts/latest`)
            .then((res) => {
                if (res.data) {
                    setTitle(res.data.title || "Untitled");
                    setContent(res.data.content || "");
                    setDraftId(res.data._id);
                }
            })
            .catch((err) => console.error("Error fetching draft:", err));
    }, []);

    const saveDraft = async () => {
        try {
            const draftData = {
                userId: user?.id || "guest_user",
                title: title?.trim() || "Untitled Draft",
                content: content || "<p>Empty content</p>",
            };

            if (draftId) {
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/drafts/${draftId}`, draftData);
            } else {
                const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/drafts`, draftData);
                setDraftId(res.data._id);
            }

            alert("Draft saved!");
        } catch (error) {
            console.error("Error saving draft:", error);
            alert("Failed to save draft.");
        }
    };

    const uploadDraftToDrive = async () => {
        if (!draftId) {
            alert("No draft found! Save a draft first.");
            return;
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/upload-draft-to-drive`, { draftId });
            alert(res.data.message);
        } catch (error) {
            console.error("Error uploading draft to Google Drive:", error);
            alert("Failed to upload draft.");
        }
    };

    return (
        <Paper elevation={3} sx={{ padding: 3, borderRadius: 2, height: "500px", display: "flex", flexDirection: "column" }}>
            <Typography variant="h5" gutterBottom>
                Letter Editor
            </Typography>

            <TextField
                label="Title"
                variant="outlined"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ marginBottom: 2 }}
            />

            <Box sx={{ flex: 1, overflow: "auto", marginBottom: 2 }}>
                <ReactQuill
                    value={content}
                    onChange={setContent}
                    theme="snow"
                    placeholder="Write your letter here..."
                    style={{ height: "200px" }}
                />
            </Box>

            <Box display="flex" justifyContent="space-between">
                <Button variant="contained" color="primary" onClick={saveDraft}>
                    Save Draft
                </Button>
                <Button variant="contained" color="secondary" onClick={uploadDraftToDrive}>
                    Upload to Google Drive
                </Button>
            </Box>
        </Paper>
    );
};

export default LetterEditor;
