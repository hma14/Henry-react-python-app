import React, { useState } from "react";
import axios from "axios";
import { VisuallyHiddenInput, InputFileUpload } from "./FileUpload";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
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
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { grey, red } from "@mui/material/colors";

function ImageEditor(props) {
  const { endpoint } = props;

  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [maskFile, setMaskFile] = useState(null);
  const [editedImageUrl, setEditedImageUrl] = useState("");
  const [isLoading, setLoading] = useState(false);
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

      setLoading(false);
      setEditedImageUrl(response.data.image_url);
    } catch (err) {
      if (err.response) {
        const msg = err.response?.data?.error || "Unexpected error occurred";
        setError(msg);
      } else {
        setError("Failed to reach the server");
      }
    }
  };

  return (
    <Container maxWidth="md">
      <h2 className="text-info text-center">AI Image Editor (Inpainting)</h2>
      <Box
        component="form"
        sx={{
          "& .MuiTextField-root": {
            m: 4,
          },
        }}
        noValidate
        autoComplete="off"
      >
        <Box display="flex" alignItems="center" gap={5} mt={10}>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            required
            style={{ display: "none" }}
          />

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
          <Box>
            {imageFile && (
              <Typography variant="body2">{imageFile.name}</Typography>
            )}
          </Box>

          <input
            id="file-input2"
            type="file"
            accept="image/png"
            onChange={(e) => setMaskFile(e.target.files[0])}
            style={{ display: "none" }}
          />
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
          <Box>
            {maskFile && (
              <Typography variant="body2">{maskFile.name}</Typography>
            )}{" "}
            (Optional)
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mt: 5,
          }}
        >
          <Spinning_Ai_Logo />
          <TextField
            fullWidth
            multiline
            id="prompt4"
            label="Describe how to edit the image"
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
            <SendIcon />
          </IconButton>
        </Box>

        <br />
      </Box>

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
    </Container>
  );
}

export default ImageEditor;
