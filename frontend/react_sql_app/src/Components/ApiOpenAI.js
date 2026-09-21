// ApiOpenAI.js
import React, { useState, useEffect } from "react";
import apiClient from "../apiClient"; // Import the apiClient
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import {
  Container,
  Card,
  CardContent,
  Accordion,
  AccordionDetails,
  Typography,
} from "@mui/material";

const ApiOpenAI = (props) => {
  const { endpoint } = props;
  const [data, setData] = useState("");

  useEffect(() => {
    // Fetch data from the specified endpoint
    apiClient
      .get(endpoint)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [endpoint]);

  return (
    <Container maxWidth="md">
      <h3 className="text-info">Open AI Response</h3>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <AccordionDetails>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data}</ReactMarkdown>
          </AccordionDetails>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ApiOpenAI;
