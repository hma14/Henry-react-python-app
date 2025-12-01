// ApiOpenAI.js
import React, { useState, useEffect } from "react";
import axios from "axios";
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
    axios
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
