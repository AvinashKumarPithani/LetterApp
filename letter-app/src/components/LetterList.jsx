import { useState, useEffect } from "react";
import axios from "axios";
import { Paper, TextField, List, ListItem, ListItemText, Button, Box, Typography, Stack } from "@mui/material";

const LetterList = ({ setSelectedLetter, setLetterContent }) => {
    const [letters, setLetters] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/drive/files`)
            .then((res) => setLetters(res.data))
            .catch((err) => console.error("Error fetching letters:", err));
    }, []);

    const viewLetter = (fileId) => {
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/drive/file/${fileId}`, { responseType: "text" })
            .then((res) => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(res.data, "text/html");
                setLetterContent(doc.body.innerHTML);
                setSelectedLetter(fileId);
            })
            .catch((err) => console.error("Error fetching letter:", err));
    };

    const downloadLetter = (fileId) => {
        window.open(`${import.meta.env.VITE_BACKEND_URL}/api/drive/file/${fileId}/pdf`, "_blank");
    };

    return (
        <Paper elevation={3} sx={{ padding: 3, borderRadius: 2, height: "500px", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" gutterBottom>📂 Saved Letters</Typography>

            <TextField
                label="Search Letters..."
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ marginBottom: 2 }}
            />

            <Box sx={{ flex: 1, overflow: "auto" }}>
                <List>
                    {letters
                        .filter(letter => letter.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(letter => (
                            <ListItem key={letter.id} sx={{ display: "flex", alignItems: "center", borderBottom: "1px solid #ddd", paddingY: 1 }}>
                                <ListItemText primary={letter.name} sx={{ flex: 1, marginRight: 2 }} />

                                <Stack direction="row" spacing={1}>
                                    <Button variant="contained" size="small" onClick={() => viewLetter(letter.id)}>
                                        View
                                    </Button>
                                    <Button variant="contained" size="small" color="success" onClick={() => downloadLetter(letter.id)}>
                                        Download
                                    </Button>
                                </Stack>
                            </ListItem>
                        ))}
                </List>
            </Box>
        </Paper>
    );
};

export default LetterList;
