import { Paper, Typography, Box } from "@mui/material";

const LetterContent = ({ letterContent }) => {
    return (
        <Paper elevation={3} sx={{ padding: 3, borderRadius: 2, height: "500px", overflow: "auto" }}>
            <Typography variant="h6" gutterBottom>📜 Letter Content</Typography>

            <Box sx={{ overflow: "auto", flex: 1 }}>
                <div dangerouslySetInnerHTML={{ __html: letterContent }} />
            </Box>
        </Paper>
    );
};

export default LetterContent;
