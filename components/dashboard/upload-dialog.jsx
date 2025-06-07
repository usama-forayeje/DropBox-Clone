"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, ImageIcon, File, Video, Music, X, Check, AlertCircle } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";

export default function UploadDialog({ open, onOpenChange, parentId }) {
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const { userId } = useAuth();

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: "pending",
    }));
    setUploadFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "video/*": [".mp4", ".avi", ".mov", ".wmv"],
      "audio/*": [".mp3", ".wav", ".flac"],
      "application/pdf": [".pdf"],
      "text/*": [".txt", ".md"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const removeFile = (id) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFile = async (uploadFile) => {
    const formData = new FormData();
    formData.append("file", uploadFile.file);
    formData.append("userId", userId);
    if (parentId) formData.append("parentId", parentId);

    try {
      setUploadFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "uploading" } : f))
      );

      const xhr = new XMLHttpRequest();

      // Progress tracking
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadFiles((prev) =>
            prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f))
          );
        }
      };

      const response = await new Promise((resolve, reject) => {
        xhr.open("POST", "/api/files/upload");
        xhr.onload = () => resolve(xhr);
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(formData);
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.statusText);
      }

      const result = JSON.parse(response.responseText);

      setUploadFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "success", progress: 100 } : f))
      );

      return result;
    } catch (error) {
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "error", error: error.message || "Upload failed" }
            : f
        )
      );
      throw error;
    }
  };

  const handleUploadAll = async () => {
    if (!userId) {
      toast.error("Please sign in to upload files");
      return;
    }

    setIsUploading(true);
    const pendingFiles = uploadFiles.filter((f) => f.status === "pending");

    try {
      await Promise.all(pendingFiles.map(uploadFile));
      toast.success(`${pendingFiles.length} file(s) uploaded successfully`);

      setTimeout(() => {
        onOpenChange(false);
        setUploadFiles([]);
      }, 1000);
    } catch (error) {
      toast.error("Some files failed to upload");
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return ImageIcon;
    if (type.startsWith("video/")) return Video;
    if (type.startsWith("audio/")) return Music;
    return File;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <Check className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "uploading":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) setUploadFiles([]);
        onOpenChange(open);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Drag and drop files here or click to browse. Maximum file size: 100MB
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
            ) : (
              <>
                <p className="text-gray-600 mb-2">Drag & drop files here, or click to select files</p>
                <p className="text-sm text-gray-500">
                  Supports images, videos, audio, documents and more
                </p>
              </>
            )}
          </div>

          {/* File list */}
          {uploadFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Files to upload</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploadFiles.map((uploadFile) => {
                  const FileIcon = getFileIcon(uploadFile.file.type);
                  return (
                    <Card key={uploadFile.id} className="p-3">
                      <div className="flex items-center space-x-3">
                        <FileIcon className="h-8 w-8 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {uploadFile.file.name}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-gray-500">{formatBytes(uploadFile.file.size)}</p>
                            <Badge variant="secondary" className={getStatusColor(uploadFile.status)}>
                              {uploadFile.status}
                            </Badge>
                          </div>
                          {uploadFile.status === "uploading" && <Progress value={uploadFile.progress} className="mt-2" />}
                          {uploadFile.error && <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(uploadFile.status)}
                          {uploadFile.status === "pending" && (
                            <Button variant="ghost" size="sm" onClick={() => removeFile(uploadFile.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {uploadFiles.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-500">{uploadFiles.length} file(s) selected</p>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setUploadFiles([])} disabled={isUploading}>
                Clear All
              </Button>
              <Button onClick={handleUploadAll} disabled={isUploading || uploadFiles.every((f) => f.status !== "pending")}>
                {isUploading ? "Uploading..." : "Upload All"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
