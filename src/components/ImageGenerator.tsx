import { useState } from "react";
import { Loader2, Sparkles, Download, Image as ImageIcon } from "lucide-react";

export function ImageGenerator() {
  const [prompt, setPrompt] = useState<string>("");
  const [size, setSize] = useState<string>("1K");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) {
      setError("Please provide a prompt.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
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
          <label className="text-sm font-medium text-gray-700">Image Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate in detail... e.g. An isometric 3D render of a cozy coffee shop, pastel colors, high resolution"
            className="w-full border border-gray-200 rounded-xl p-4 min-h-[120px] outline-none focus:border-black focus:ring-1 focus:ring-black resize-none text-sm"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Resolution</label>
          <div className="grid grid-cols-3 gap-3">
            {["1K", "2K", "4K"].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`py-3 px-4 text-sm font-medium rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  size === s 
                  ? "border-black bg-gray-900 text-white shadow-md shadow-gray-200" 
                  : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Higher resolutions may take longer to generate.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!prompt || isGenerating}
          className="w-full bg-black text-white rounded-xl py-3.5 font-medium flex items-center justify-center gap-2 hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Rendering Image...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Image
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
              alt="Generated Result" 
              className="max-w-full rounded-lg shadow-sm border border-gray-200 object-contain"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => {
                const a = document.createElement("a");
                a.href = resultImage;
                a.download = `generated-${size}-${Date.now()}.png`;
                a.click();
              }}
              className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm focus:ring-2 focus:ring-gray-200 transition-all"
            >
              <Download className="w-4 h-4" />
              Download {size} Image
            </button>
          </div>
        ) : isGenerating ? (
          <div className="flex flex-col items-center gap-4 text-gray-500 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium">Synthesizing image...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <ImageIcon className="w-16 h-16 opacity-30" />
            <div className="text-center">
              <p className="font-medium text-gray-500">Awaiting your prompt</p>
              <p className="text-sm mt-1">Enter a description to generate.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
