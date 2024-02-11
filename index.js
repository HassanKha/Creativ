import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import csvParser from "csv-parser";
import * as statistics from "simple-statistics";
import lo from "lodash";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import path from 'path';

const app = express();
const port =  3001;
app.use(cors({
  origin: ['https://task-vg2v.vercel.app','http://localhost:5173','https://backend-8fks.onrender.com','http://localhost:3001'],
  credentials: true,
  optionSuccessStatus: 200,
}));
dotenv.config();
const __dirname = path.resolve();
app.use(express.json());
app.use(express.static(path.join(__dirname,'/client/dist')));

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("csvFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const results = [];
    const stream = fs.createReadStream(req.file.path)
      .pipe(csvParser());

    for await (const data of stream) {
      // Perform data wrangling (cleaning, transformation)
      results.push({ ...data, Age: parseInt(data.Age) });
    }

    fs.unlinkSync(req.file.path); // Remove the temporary file

    // Perform EDA
    const ages = results.map((entry) => entry.Age);
    const meanAge = statistics.mean(ages);
    const medianAge = statistics.median(ages);
    const maxAge = statistics.max(ages);
    const minAge = statistics.min(ages);
    const ageRange = maxAge - minAge;
    const Stats = { meanAge, medianAge, ageRange , ages };

    

     res.json({ success: true,
     //  image: base64ImageData ,
        Stats:Stats });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

function generateBarChart(data, width, height) {
  const svgStart = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  let bars = '';

  // Calculate dimensions
  const maxDataValue = Math.max(...Object.values(data));

  // Generate bars and labels
  let index = 0;
  for (const [ageGroup, count] of Object.entries(data)) {
    const barHeight = (count / maxDataValue) * height;
    const x = index * (width / Object.keys(data).length);
    const y = height - barHeight;
    const barWidth = width / Object.keys(data).length;

    // Add styling to the bars
    const color = getRandomColor();
    bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" stroke="black" stroke-width="2" />`;

    // Add text label for age group and count
    const label = `${ageGroup}: ${count}`;
    const labelX = x + barWidth / 2;
    const labelY = y + barHeight / 2;
    bars += `<text x="${labelX}" y="${labelY}" font-family="cursive" font-size="18" fill="white" text-anchor="middle">${label}</text>`;

    index++;
  }

  const svgEnd = '</svg>';

  // Combine SVG elements
  const svgContent = svgStart + bars + svgEnd;
  return svgContent;
}
// Function to generate random color
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


app.post("/graph", async (req, res) => {
  try {
    if (!req.body.ages) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

  
    console.log(req.body.ages);
     const configuration = req.body.ages;
    // console.log(configuration);


    const svgContent = generateBarChart(configuration, 800, 600);
    //console.log(svgContent);
    fs.writeFileSync('bar_chart.svg', svgContent);
    
     res.json({ success: true , image: svgContent});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
