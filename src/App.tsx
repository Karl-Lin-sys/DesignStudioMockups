/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { MockupStudio } from "./components/MockupStudio";
import { ImageGenerator } from "./components/ImageGenerator";
import { Palette, ImageIcon } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"mockup" | "generate">("mockup");

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold tracking-tight text-lg">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-lg">
              <Palette className="w-4 h-4" />
            </div>
            DesignStudio
          </div>
          <nav className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button
              onClick={() => setActiveTab("mockup")}
              className={`px-4 py-1.5 text-sm font-medium flex items-center gap-2 rounded-lg transition-all ${
                activeTab === "mockup" 
                ? "bg-white text-black shadow-sm ring-1 ring-gray-200/50" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Mockups
            </button>
            <button
              onClick={() => setActiveTab("generate")}
              className={`px-4 py-1.5 text-sm font-medium flex items-center gap-2 rounded-lg transition-all ${
                activeTab === "generate" 
                ? "bg-white text-black shadow-sm ring-1 ring-gray-200/50" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
            >
              <Palette className="w-4 h-4" />
              Generator
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 font-display">
            {activeTab === "mockup" ? "Product Mockup Studio" : "AI Image Generator"}
          </h1>
          <p className="text-gray-500 mt-3 text-lg">
            {activeTab === "mockup" 
              ? "Upload your logo to visualize it on high-quality product mockups." 
              : "Transform text descriptions into stunning high-resolution images."}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 p-8">
          {activeTab === "mockup" ? <MockupStudio /> : <ImageGenerator />}
        </div>
      </main>
    </div>
  );
}
