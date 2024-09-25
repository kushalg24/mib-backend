const express = require("express");
const app = express();
const axios = require("axios");

const PORT = 8000;
require("dotenv").config();
const mib_bearer = process.env.MIB_BEARER_TOKEN;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/health", async (req, res) => {
  res.json({ message: "ok" });
});

// app.post("/mib/webhook", async (req, res) => {
//   const body = req.body;
//   let transactionType = "";
//   let sourceId = "";
//   let transactionData = {};

//   if (body.issue) {
//     transactionType = "issue";
//     sourceId = body.issue.id;
//     transactionData = {
//       issueKey: body.issue.key,
//       issueSummary: body.issue.fields.summary,
//       issueStatus: body.issue.fields.status.name,
//       updatedTime: body.issue.fields.updated,
//     };
//   } else if (body.sprint) {
//     transactionType = "sprint";
//     sourceId = body.sprint.id;
//     transactionData = {
//       sprintId: body.sprint.id,
//       sprintName: body.sprint.name,
//       sprintState: body.sprint.state,
//     };
//   } else if (body.project) {
//     transactionType = "project";
//     sourceId = body.project.id;
//     transactionData = {
//       projectId: body.project.id,
//       projectName: body.project.name,
//       projectKey: body.project.key,
//     };
//   } else {
//     return res.status(400).json({ error: "Unrecognized event type" });
//   }

//   const dataToIngest = {
//     transactionType,
//     sourceId,
//     isProcessed: false,
//     createdAt: new Date().toISOString(),
//     transactionData,
//   };

//   console.log("Payload to ingest:", JSON.stringify(dataToIngest, null, 2));

//   try {
//     const response = await axios.post(
//       "https://ig.gov-cloud.ai/tf-entity-ingestion/v1.0/schemas/66f100f74006bd33cd1a3832/instance?upsert=true",
//       dataToIngest,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${mib_bearer}`,
//         },
//       }
//     );

//     if (response.status >= 200 && response.status < 300) {
//       res
//         .status(200)
//         .json({ message: "Data ingested successfully into the schema" });
//     } else {
//       res
//         .status(response.status)
//         .json({ error: "Failed to ingest data into the schema" });
//     }
//   } catch (error) {
//     console.error(
//       "Error ingesting data:",
//       error.response ? error.response.data : error.message
//     );
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

app.post("/mib/webhook", async (req, res) => {
    const body = req.body;
    let transactionType = "";
    let sourceId = "";
    let transactionData = {};
  
    if (body.issue) {
      transactionType = "issue";
      sourceId = body.issue.id;
      transactionData = {
        issueKey: body.issue.key,
        issueSummary: body.issue.fields.summary,
        issueStatus: body.issue.fields.status.name,
        updatedTime: body.issue.fields.updated,
      };
    } else if (body.sprint) {
      transactionType = "sprint";
      sourceId = body.sprint.id;
      transactionData = {
        sprintId: body.sprint.id,
        sprintName: body.sprint.name,
        sprintState: body.sprint.state,
      };
    } else if (body.project) {
      transactionType = "project";
      sourceId = body.project.id;
      transactionData = {
        projectId: body.project.id,
        projectName: body.project.name,
        projectKey: body.project.key,
      };
    } else {
      return res.status(400).json({ error: "Unrecognized event type" });
    }
  
    const dataToIngest = {
      transactionType,
      sourceId,
      isProcessed: false,
      createdAt: new Date().toISOString(),
      transactionData,
    };
  
    console.log("Payload to ingest:", JSON.stringify(dataToIngest, null, 2));
  
    try {
      const response = await fetch(
        "https://ig.gov-cloud.ai/tf-entity-ingestion/v1.0/schemas/66f100f74006bd33cd1a3832/instance?upsert=true",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mib_bearer}`,
          },
          body: JSON.stringify(dataToIngest),
        }
      );
  
      if (response.ok) {
        res.status(200).json({ message: "Data ingested successfully into the schema" });
      } else {
        const errorData = await response.json();
        res.status(response.status).json({ error: errorData.message || "Failed to ingest data into the schema" });
      }
    } catch (error) {
      console.error("Error ingesting data:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
