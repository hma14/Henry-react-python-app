import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Container,
  Grid,
  Typography,
  CssBaseline,
  Paper,
  Box,
  Checkbox,
  FormControl,
  OutlinedInput,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import Spinning_Ai_Logo from "./Spinning_Ai_Logo";
import SendIcon from "@mui/icons-material/Send"; // arrow icon

export default function ImageUpload(props) {
  const { endpoint, prompt1 } = props;
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState(prompt1);
  const [isLoading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);

  const handleFileClick = (e) => {
    console.log("File input clicked", e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", prompt);

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setMessage(`Uploading... ${percent}%`);
        },
      });

      setMessage(`✅ Success: ${res.data.message}`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    console.log("Button clicked, triggering file input");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <Container maxWidth="md">
      <h2 className="text-info text-center">Upload an Image</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="file"
            accept="image/*"
            id="file-input"
            //ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            required
          />
          <Box display="flex" alignItems="center" gap={2} mt={4}>
            <label htmlFor="file-input">
              <Button
                variant="contained"
                component="span"
                color="primary"
                sx={{ width: 300 }}
              >
                Choose Files
              </Button>
            </label>
            <Box mt={2}>
              {file && <Typography variant="body2">{file.name}</Typography>}
            </Box>
          </Box>
        </div>
        <br />
        <Box
          component="form"
          sx={{
            "& .MuiTextField-root": {
              m: 2,
            },
          }}
          noValidate
          autoComplete="off"
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Spinning_Ai_Logo />
            <TextField
              id="prompt1"
              fullWidth
              multiline
              label={prompt}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px", // round the input box
                },
              }}
            />

            <IconButton
              type="submit"
              sx={{
                ml: 1,
                bgcolor: "Highlight", // ChatGPT green
                color: "white",
                "&:hover": { bgcolor: "#0d8c6c" },
                display: "flex",
                justifyContent: "flex-end",
              }}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loader-container">
                  <CircularProgress size={120} />
                </div>
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </Box>
        </Box>
      </form>

      {message && <p>{message}</p>}
    </Container>
  );
}
