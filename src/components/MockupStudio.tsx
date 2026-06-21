import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Loader2, Sparkles, Download, Layers } from "lucide-react";

export function MockupStudio() {
  const [logo, setLogo] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/png");
  const [prompt, setPrompt] = useState<string>("");
  const [preset, setPreset] = useState<string>("white coffee mug");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets = [
    { label: "Coffee Mug", value: "A blank white ceramic coffee mug on a minimal wooden table, well lit. The logo is printed perfectly on the side of the mug." },
    { label: "White T-Shirt", value: "A person wearing a clean blank white t-shirt facing the camera. The logo is printed large on the center of the chest." },
    { label: "Black Hoodie", value: "A folded black hoodie on a studio background. The logo is printed clearly on the chest of the hoodie." },
    { label: "Tote Bag", value: "A canvas tote bag hanging on a hook. The logo is printed centrally on the bag." },
    { label: "Custom", value: "" },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogo(event.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!logo) {
      setError("Please upload a logo first.");
      return;
    }
    
    const finalPrompt = preset === "Custom" ? prompt : presets.find(p => p.label === preset)?.value || prompt;
    
    if (!finalPrompt) {
      setError("Please provide a prompt or select a preset.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoBase64: logo,
          mimeType,
          prompt: finalPrompt
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate mockup");
      }

      setResultImage(data.imageUrl);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Upload Logo</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            {logo ? (
              <div className="flex flex-col items-center gap-4">
                <img src={logo} alt="Uploaded logo" className="max-h-32 object-contain" />
                <span className="text-sm text-gray-500 font-medium">Click to change logo</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-500 mt-1">SVG, PNG, or JPG (max. 5MB)</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-700 flex justify-between items-center">
            <span>Select Product</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setPreset(p.label);
                  if (p.label !== "Custom") {
                    setPrompt(p.value);
                  }
                }}
                className={`py-2 px-3 text-sm rounded-lg border text-left flex items-center gap-2 ${
                  preset === p.label 
                  ? "border-black bg-gray-50 font-medium text-black ring-1 ring-black" 
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Layers className="w-4 h-4" />
                {p.label}
              </button>
            ))}
          </div>

          {preset === "Custom" && (
            <div className="space-y-2 mt-4 transition-all duration-300 ease-in-out">
              <label className="text-sm font-medium text-gray-700">Custom Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the product and environment... e.g. A white coffee mug sitting on an office desk, the logo is printed on it."
                className="w-full border border-gray-200 rounded-lg p-3 text-sm min-h-[100px] outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!logo || isGenerating || (!prompt && preset === "Custom")}
          className="w-full bg-black text-white rounded-xl py-3.5 font-medium flex items-center justify-center gap-2 hover:bg-gray-900 focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Mockup...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Mockup
            </>
          )}
        </button>
      </div>

      {/* Output Section */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
        {resultImage ? (
          <div className="w-full flex-1 flex flex-col items-center gap-4">
            <img 
              src={resultImage} 
              alt="Generated Mockup" 
              className="max-w-full rounded-lg shadow-sm border border-gray-200 object-contain"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => {
                const a = document.createElement("a");
                a.href = resultImage;
                a.download = `mockup-${Date.now()}.png`;
                a.click();
              }}
              className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download Full Resolution
            </button>
          </div>
        ) : isGenerating ? (
          <div className="flex flex-col items-center gap-4 text-gray-500 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium">Blending logo with product...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <ImageIcon className="w-16 h-16 opacity-30" />
            <div className="text-center">
              <p className="font-medium text-gray-500">Your mockup will appear here</p>
              <p className="text-sm mt-1">Upload a logo and click generate to see the magic.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
