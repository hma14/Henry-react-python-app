import React, { useState } from "react";
import axios from "axios";
import { VisuallyHiddenInput, InputFileUpload } from "./FileUpload";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  Container,
  Grid,
  Typography,
  CssBaseline,
  Paper,
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { grey, red } from "@mui/material/colors";

function ImageEditor(props) {
  const { endpoint } = props;

  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [maskFile, setMaskFile] = useState(null);
  const [editedImageUrl, setEditedImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEditedImageUrl("");
    setError("");

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("image", imageFile);
    formData.append("mask", maskFile);

    try {
      const response = await axios.post(endpoint, formData);
      setEditedImageUrl(response.data.imageUrl);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || "Server returned an error");
      }
      setError("Failed to reach the server");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h2 className="text-info text-center">AI Image Editor (Inpainting)</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Prompt:
          </Typography>
          <TextField
            id="prompt1"
            InputLabel="Describe how to edit the image"
            multiline
            fullWidth
            maxRows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            sx={{ mb: 4 }}
          />
        </div>

        {/* <Button
          component="InputLabel"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          Upload files
          <VisuallyHiddenInput
            type="file"
            onChange={(event) => console.log(event.target.files)}
            multiple
          />
        </Button> */}

        <div>
          <InputLabel>Original Image:</InputLabel>
          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={(e) => setImageFile(e.target.files[0])}
            required
          />
        </div>
        <br />

        <div>
          <InputLabel>Mask Image (Transparent PNG):</InputLabel>
          <input
            type="file"
            accept="image/png"
            onChange={(e) => setMaskFile(e.target.files[0])}
            required
          />
        </div>
        <br />
        <div>
          <Button type="submit" disabled={loading}>
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

      {error && <p style={{ color: "red" }}>{error}</p>}

      {editedImageUrl && (
        <div>
          <h3>Edited Image:</h3>
          <img
            src={editedImageUrl}
            alt="Edited result"
            style={{ maxWidth: "600px", border: "1px solid #ccc" }}
          />
        </div>
      )}
    </div>
  );
}

export default ImageEditor;
