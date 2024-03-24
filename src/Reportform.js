// ReportForm.js
import React, { useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import quill styles
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
//import { diff_match_patch } from "diff-match-patch";
const Diff = require("diff");

const ReportForm = () => {
  // Initialize form state with all fields
  const [formValues, setFormValues] = useState({
    student_name: "leo",
    gender: "male",
    class_behavior: "good",
    strengths: "smart",
    year_group: "",
    subject: "algorithms",
    academic_performance: "poor",
    areas_of_development: "dynamic programming",
    tone: "formal",
    report_length: "200", // Keeping it empty to allow user input
  });

  const highlightDifferences = (oldText, newText) => {
    const diff = Diff.diffWords(oldText, newText);
    console.log(oldText, "weifwoegf");
    console.log(newText);
    const to_ret = diff
      .map((part) => {
        if (part.added) {
          return `<span style="background-color: #ddffdd;">${part.value}</span>`;
        } else if (part.removed) {
          return `<span style="background-color: #ffdddd;">${part.value}</span>`;
        }
        return part.value;
      })
      .join("");
    console.log(to_ret);
    return to_ret;
  };

  // State for the generated report
  const [structure, setStructure] = useState("");
  const [detailedReport, setDetailedReport] = useState(""); // New state for the detailed report
  const [lastSavedStructure, setLastSavedStructure] = useState("");
  const [lastSavedReport, setLastSavedReport] = useState("");
  const [reportWithChanges, setReportWithChanges] = useState("");
  const [structureLoading, setStructureLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [showChanges, setShowChanges] = useState(true);

  // Update form state based on input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };
  const undoChanges = () => {
    setShowChanges(false);
    setDetailedReport(lastSavedReport);
  };
  const handleShowChanges = () => {
    setShowChanges(!showChanges);
  };

  // New function to handle detailed report generation
  const handleDetailedReportGeneration = async () => {
    try {
      const detailedResponse = await axios.post(
        "http://127.0.0.1:5000/generate_detailed_report",
        {
          structure: structure, // The structure obtained from the first API call
          // Include other formValues that are needed to generate the detailed report
          ...formValues,
        }
      );
      const formattedDetailedReport =
        detailedResponse.data.detailedReport.replace(/\n/g, "<br>");

      setDetailedReport(formattedDetailedReport);
      //setDetailedReport(detailedResponse.data.detailedReport);

      console.log("Ive been executed (detailed report)");
      setLastSavedReport(detailedReport);
    } catch (error) {
      console.error("Error generating the detailed report:", error);
    }
  };

  const handleRegenerateReport = async () => {
    setReportLoading(true);
    try {
      setLastSavedReport(detailedReport);
      setLastSavedStructure(structure);

      const dataToSend = {
        last_saved_structure: lastSavedStructure,
        last_saved_report: lastSavedReport,
        current_structure: structure,
        current_report: detailedReport,
      };
      const response = await axios.post(
        "http://127.0.0.1:5000/regenerate_detailed_report",
        {
          last_saved_structure: lastSavedStructure,
          last_saved_report: lastSavedReport,
          current_structure: structure, // The current content of the first editor
          current_report: detailedReport, // The current content of the second editor
        }
      );

      // Update the content of the text editors with the regenerated report
      //setReport(response.data.updatedDetailedReport); // tjat was a mistake
      setReportWithChanges(
        highlightDifferences(
          detailedReport,
          response.data.updatedDetailedReport
        )
      );

      setDetailedReport(
        response.data.updatedDetailedReport.replace(/\n/g, "<br>")
      );
    } catch (error) {
      console.error("Error regenerating the report:", error);
    }
    setReportLoading(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    setReportLoading(true);
    setStructureLoading(true);

    e.preventDefault(); // Prevent default form submission behavior
    try {
      // Post form data to the backend and set the generated report in state
      const response = await axios.post(
        "http://127.0.0.1:5000/generate_report ",
        formValues
      );
      const formattedStructure = response.data.report.replace(/\n/g, "<br>");

      setStructure(formattedStructure);
      setStructureLoading(false);

      //setStructure(response.data.report);
      console.log("Ive been executed Structure");
      setLastSavedStructure(formattedStructure);
    } catch (error) {
      console.error("Error generating the report:", error);
    }
    await handleDetailedReportGeneration();
    setReportLoading(false);
  };

  //

  //

  return (
    <Box>
      <Box
        component="form"
        sx={{
          "& .MuiTextField-root": { m: 1, width: "25ch" },
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <Box sx={{ margin: "auto" }}>
          <TextField
            label="Student Name"
            type="text"
            name="student_name"
            value={formValues.student_name}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            label="Gender"
            type="text"
            name="gender"
            value={formValues.gender}
            onChange={handleChange}
            variant="outlined"
          />
          {/* Repeat for other inputs */}
          <TextField
            label="Year Group"
            type="text"
            name="year_group"
            value={formValues.year_group}
            onChange={handleChange}
            variant="outlined"
          />
        </Box>
        <Box sx={{ margin: "auto" }}>
          <TextField
            label="Subject"
            type="text"
            name="subject"
            value={formValues.subject}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            label="Academic Performance"
            type="text"
            name="academic_performance"
            value={formValues.academic_performance}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            label="Areas of Development"
            type="text"
            name="areas_of_development"
            value={formValues.areas_of_development}
            onChange={handleChange}
            variant="outlined"
          />
        </Box>
        <Box sx={{ margin: "auto" }}>
          <TextField
            label="Strengths"
            type="text"
            name="strengths"
            value={formValues.strengths}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            label="Class Behavior"
            type="text"
            name="class_behavior"
            value={formValues.class_behavior}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            label="Tone"
            type="text"
            name="tone"
            value={formValues.tone}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            label="Report Length (words)"
            type="number"
            name="report_length"
            value={formValues.report_length}
            onChange={handleChange}
            variant="outlined"
          />
        </Box>
        <Button
          variant="contained"
          type="submit"
          sx={{ margin: "auto", top: "15px", marginBottom: "15px" }}
        >
          Generate Report
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          maxWidth: "90%",
          minHeight: "400px",
          paddingTop: "15px",
          margin: "auto",
        }}
      >
        <Box sx={{ flex: 1, height: "400px", maxWidth: "50%" }}>
          {structureLoading && (
            <CircularProgress
              sx={{ position: "absolute", left: "25%", top: "50%" }}
            />
          )}
          <ReactQuill
            style={{ height: "350px" }}
            theme="snow"
            value={structureLoading ? "" : structure}
            onChange={(content) => setStructure(content)}
          />
        </Box>
        <Box sx={{ flex: 1, maxWidth: "50%" }}>
          {reportLoading && (
            <CircularProgress
              sx={{ position: "absolute", right: "25%", top: "50%" }}
            />
          )}

          <ReactQuill
            style={{ height: "350px" }}
            theme="snow"
            value={
              !reportLoading
                ? showChanges && reportWithChanges !== ""
                  ? reportWithChanges.replace(/\n/g, "<br>")
                  : detailedReport.replace(/\n/g, "<br>")
                : ""
            }
            onChange={(content, delta, source, editor) => {
              const formattedContent = content.replace(/\n/g, "<br>");
              // Log the content of the editor after change
              // console.log(formattedContent);
              // If you also want to log the actual changes (deltas)
              //console.log(delta);
              // Update the state with the new content
              // setDetailedReport(content);
              //setDetailedReport(formattedContent);
            }}
            //onChange={(content) => setDetailedReport(content)}
          />
        </Box>
      </Box>
      <Box
        sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <Button
          variant="contained"
          type="submit"
          sx={{ margin: "auto", top: "15px", marginBottom: "15px" }}
          onClick={handleRegenerateReport}
        >
          Regenerate Full Report
        </Button>
        {reportWithChanges !== "" && lastSavedReport !== detailedReport && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: 500,
            }}
          >
            <Button
              variant="contained"
              type="submit"
              sx={{
                margin: "auto",
                top: "15px",
                marginBottom: "15px",
                width: 200,
              }}
              onClick={handleShowChanges}
            >
              {showChanges ? "Hide Changes" : "Show Changes"}
            </Button>

            <Button
              variant="contained"
              type="submit"
              sx={{
                margin: "auto",
                top: "15px",
                marginBottom: "15px",
                width: 200,
              }}
              onClick={undoChanges}
            >
              undo changes
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ReportForm;
