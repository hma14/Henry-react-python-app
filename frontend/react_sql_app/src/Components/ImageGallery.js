import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  Dialog,
  DialogContent,
} from "@mui/material";

export default function ImageGallery({ endpoint }) {
  const baseUrl = new URL(endpoint).origin;
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch images on load
  useEffect(() => {
    axios
      .get(endpoint)
      .then((res) => setImages(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleOpen = (imgUrl) => {
    setSelectedImage(`${imgUrl}`);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  return (
    <div className="container">
      <h2 className="text-info text-center">Gallery</h2>

      {/* Thumbnail Grid */}
      <Grid container spacing={4}>
        {images.map((img, idx) => (
          <Grid item xs={3} sm={2} md={1} key={idx}>
            <Card>
              <CardActionArea onClick={() => handleOpen(img.url)}>
                <CardMedia
                  component="img"
                  image={`${img.url}`}
                  alt={img.prompt}
                  title={img.prompt}
                  sx={{
                    height: 80, // small thumbnail
                    objectFit: "cover",
                    marginTop: "10px",
                  }}
                />
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog for Full Size Image */}
      <Dialog open={!!selectedImage} onClose={handleClose} maxWidth="lg">
        {selectedImage && (
          <img
            src={selectedImage}
            alt="Full Size"
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        )}
      </Dialog>
    </div>
  );
}
