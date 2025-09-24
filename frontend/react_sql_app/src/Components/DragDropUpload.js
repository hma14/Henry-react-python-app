import React, { useState, useCallback } from "react";
import axios from "axios";
import SendIcon from "@mui/icons-material/Send"; // arrow icon
import Spinning_Ai_Logo from "./Spinning_Ai_Logo";

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

export default function DragDropUpload({ endpoint }) {
  const [files, setFiles] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setLoading] = useState(false);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const onFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      setMessage("Please select at least one file.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Uploading...");

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file); // backend should use request.files.getlist("files")
      });
      formData.append("prompt", prompt);

      const res = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setMessage(`Uploading... ${percent}%`);
        },
      });

      setMessage(`✅ Success: ${res.data.message}`);
      setFiles([]); // Clear after upload
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <h2 className="text-info text-center">Drag & Drop Multi-Image Upload</h2>

      <Box alignItems="center" gap={2} mt={4}>
        {/* Drop area */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            border: "2px dashed #ccc",
            borderRadius: "8px",
            padding: "40px",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: "10px",
          }}
          onClick={() => document.getElementById("multiFileInput").click()}
        >
          {files.length > 0 ? (
            files.map((file) => <p>{file.name}</p>)
          ) : (
            <p>Drag & drop images here, or click to select</p>
          )}
        </div>{" "}
        {/* Hidden file input */}
        <input
          id="multiFileInput"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={onFileChange}
        />
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
              fullWidth
              multiline
              id="prompt3"
              label="Describe what image you want to create"
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
              onClick={onFileChange}
              disabled={isLoading}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Status */}
      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </Container>
  );
}
