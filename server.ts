import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Route for product mockups / image editing
  app.post("/api/mockup", async (req, res) => {
    try {
      const { logoBase64, mimeType, prompt } = req.body;
      
      if (!logoBase64 || !prompt) {
        return res.status(400).json({ error: "logoBase64 and prompt are required" });
      }

      // Convert base64
      let data = logoBase64;
      if (data.includes("base64,")) {
        data = data.split("base64,")[1];
      }

      const interaction = await ai.interactions.create({
        model: 'gemini-3.1-flash-image-preview',
        input: [
          {
            type: "image",
            data: data,
            mime_type: mimeType || "image/png",
          },
          {
            type: "text",
            text: prompt,
          },
        ],
        response_modalities: ['image'],
        generation_config: {
          image_config: {
            aspect_ratio: "1:1"
          }
        }
      });
      
      let generatedImage = null;
      for (const step of interaction.steps) {
        if (step.type === 'model_output') {
          const imageContent = step.content?.find(c => c.type === 'image');
          if (imageContent && imageContent.data) {
            const base64EncodeString = imageContent.data;
            const resMimeType = imageContent.mime_type || 'image/png';
            generatedImage = `data:${resMimeType};base64,${base64EncodeString}`;
          }
        }
      }

      if (generatedImage) {
        res.json({ imageUrl: generatedImage });
      } else {
        res.status(500).json({ error: "Failed to generate image" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API Route for High-Quality Image Generation
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, size } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "prompt is required" });
      }
      
      const imageSize = size || "1K"; // 1K, 2K, 4K

      const interaction = await ai.interactions.create({
        model: 'gemini-3-pro-image-preview',
        input: prompt,
        response_modalities: ['image'],
        generation_config: {
          image_config: {
            aspect_ratio: "1:1",
            image_size: imageSize
          },
        },
      });
      
      let generatedImage = null;
      for (const step of interaction.steps) {
        if (step.type === 'model_output') {
          const imageContent = step.content?.find(c => c.type === 'image');
          if (imageContent && imageContent.data) {
            const base64EncodeString = imageContent.data;
            const resMimeType = imageContent.mime_type || 'image/png';
            generatedImage = `data:${resMimeType};base64,${base64EncodeString}`;
          }
        }
      }

      if (generatedImage) {
        res.json({ imageUrl: generatedImage });
      } else {
        res.status(500).json({ error: "Failed to generate image" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
