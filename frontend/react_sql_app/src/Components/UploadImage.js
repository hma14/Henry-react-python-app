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
} from "@mui/material";

export default function ImageUpload({ endpoint }) {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
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
    <div className="container">
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
        <div>
          <Typography variant="h5" sx={{ mb: 2, mt: 2 }}>
            Prompt:
          </Typography>
          <TextField
            id="prompt1"
            label={prompt}
            multiline
            fullWidth
            maxRows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            sx={{ mb: 4 }}
          />
        </div>

        <div>
          <Button
            type="submit"
            disabled={loading}
            sx={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "10px",
              width: "300px",
              float: "right",
            }}
          >
            {loading ? (
              <div className="loader-container">
                <CircularProgress size={120} />
              </div>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
