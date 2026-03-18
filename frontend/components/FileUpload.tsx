"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
  onUploadSuccess: (filename: string) => void;
  onUploadStart: () => void;
  onUploadError: (err: string) => void;
}

export default function FileUpload({ onUploadSuccess, onUploadStart, onUploadError }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setSuccess(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const uploadFile = async () => {
    if (!file) return;

    setUploading(true);
    onUploadStart();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setSuccess(true);
      onUploadSuccess(data.filename);
      setTimeout(() => setFile(null), 3000);
    } catch (err: any) {
      onUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div
        {...getRootProps()}
        className={`relative group cursor-pointer p-8 rounded-2xl border-2 border-dashed transition-all duration-300 glass
          ${isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-white/10 hover:border-white/30"}
          ${success ? "border-green-500/50" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          {success ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </motion.div>
          ) : (
            <Upload className={`w-12 h-12 transition-colors ${isDragActive ? "text-primary" : "text-white/40"}`} />
          )}
          
          <div className="space-y-1">
            <p className="text-lg font-medium text-white/90">
              {file ? file.name : "Drop your shipment PDF here"}
            </p>
            <p className="text-sm text-white/50">
              {file ? "Ready to analyze" : "or click to browse documents"}
            </p>
          </div>
        </div>

        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl bg-primary/10 -z-1" />
      </div>

      <AnimatePresence>
        {file && !success && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={uploadFile}
            disabled={uploading}
            className="w-full py-3 px-6 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all glow-primary disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Document...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Inject into Engine
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
