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
      const response = await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setEditedImageUrl(response.data.image_url);
    } catch (err) {
      if (err.response) {
        //setError(err.response.data["detail"] || "Server returned an error");
        const msg =
          err.response?.data?.detail?.error?.message ||
          err.response?.data?.detail ||
          "Unexpected error occurred";
        setError(msg);
      } else {
        setError("Failed to reach the server");
      }
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
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            required
            style={{ display: "none" }}
          />
          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <label htmlFor="file-input">
              <Button
                variant="contained"
                component="span"
                color="primary"
                sx={{ width: 300 }}
              >
                Choose Original Image
              </Button>
            </label>
            <Box mt={2}>
              {imageFile && (
                <Typography variant="body2">{imageFile.name}</Typography>
              )}
            </Box>
          </Box>
        </div>
        <br />

        <div>
          <input
            id="file-input2"
            type="file"
            accept="image/png"
            onChange={(e) => setMaskFile(e.target.files[0])}
            style={{ display: "none" }}
          />
          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <label htmlFor="file-input2">
              <Button
                variant="contained"
                component="span"
                color="primary"
                sx={{ width: 300 }}
              >
                Choose Mask Image
              </Button>
            </label>
            <Box mt={2}>
              {maskFile && (
                <Typography variant="body2">{maskFile.name}</Typography>
              )}{" "}
              (Optional)
            </Box>
          </Box>
        </div>
        <br />
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
              margin: "10px",
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

      {error && (
        <Box
          mt={10}
          display="flex"
          sx={{
            color: "red",
            fontWeight: "bold",
            fontStyle: "italic",
          }}
        >
          {error}
        </Box>
      )}
      {editedImageUrl && (
        <div>
          <h3>Edited Image:</h3>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center", // Horizontal centering
              alignItems: "center", // Vertical centering
              minHeight: "200px", // Optional: Set a height to see vertical centering
              width: "100%", // Optional: Full width or set a specific width like '500px'
              mt: 5,
            }}
          >
            <img
              src={editedImageUrl}
              alt="Edited result"
              style={{ maxWidth: "100%", border: "1px solid #ccc" }}
            />
          </Box>
        </div>
      )}
    </div>
  );
}

export default ImageEditor;
