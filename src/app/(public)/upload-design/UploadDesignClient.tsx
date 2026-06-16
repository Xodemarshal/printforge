"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Upload, FileText, Image, Package, CheckCircle, X } from "lucide-react";

interface UploadedFile {
  file: File;
  preview?: string;
  type: 'image' | 'document' | 'other';
}

export function UploadDesignClient() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 50 * 1024 * 1024) continue; // Skip files over 50MB
      
      const uploadedFile: UploadedFile = {
        file,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.includes('pdf') || file.type.includes('document') ? 'document' : 
              'other'
      };
      
      if (uploadedFile.type === 'image') {
        uploadedFile.preview = URL.createObjectURL(file);
      }
      
      newFiles.push(uploadedFile);
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const files = event.dataTransfer.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      if (prev[index].preview) {
        URL.revokeObjectURL(prev[index].preview!);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image size={20} className="text-blue-500" />;
      case 'document': return <FileText size={20} className="text-red-500" />;
      default: return <Package size={20} className="text-gray-500" />;
    }
  };

  if (submitted) {
    return (
      <div className="page-shell py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-forest mb-4">Design Submitted Successfully!</h1>
            <p className="text-lg text-forest/70">
              Thank you for submitting your design. Our team will review it and get back to you within 24-48 hours.
            </p>
          </div>
          <div className="bg-cream/50 border border-forest/20 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-forest mb-2">What happens next?</h3>
            <ul className="text-sm text-forest/70 space-y-2 text-left">
              <li>• Our design team will review your files and requirements</li>
              <li>• We'll prepare a custom quote for your project</li>
              <li>• You'll receive an email with pricing and timeline details</li>
              <li>• Once approved, we'll begin production of your custom product</li>
            </ul>
          </div>
          <Button 
            onClick={() => {
              setSubmitted(false);
              setUploadedFiles([]);
            }}
            className="bg-forest hover:bg-forest-dark text-white"
          >
            Submit Another Design
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="h-px w-12 bg-accent/30" />
            <span className="label-font">Custom Design Service</span>
            <span className="h-px w-12 bg-accent/30" />
          </div>
          <h1 className="display-font text-5xl text-forest md:text-7xl mb-6">Upload Your Design</h1>
          <p className="text-lg text-forest/70 max-w-2xl mx-auto">
            Turn your creative ideas into reality. Upload your design files and let us create custom products just for you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* File Upload Zone */}
          <div 
            className={`bg-cream/30 border-2 border-dashed rounded-3xl p-8 transition-colors cursor-pointer ${
              isDragActive ? 'border-forest bg-forest/5' : 'border-forest/30'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef}
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.zip,.stl,.obj"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="text-center">
              <Upload size={48} className={`mx-auto mb-4 ${isDragActive ? 'text-forest' : 'text-forest/50'}`} />
              <h3 className="text-xl font-semibold text-forest mb-2">
                {isDragActive ? 'Drop your files here' : 'Upload Design Files'}
              </h3>
              <p className="text-forest/60 mb-4">
                Drag and drop your files, or click to browse
              </p>
              <p className="text-sm text-forest/50">
                Supported formats: Images (PNG, JPG), Documents (PDF), 3D Models (STL, OBJ)
                <br />
                Maximum file size: 50MB per file
              </p>
            </div>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="bg-cream/20 border border-forest/20 rounded-2xl p-6">
              <h3 className="font-semibold text-forest mb-4">Uploaded Files ({uploadedFiles.length})</h3>
              <div className="grid gap-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/50 border border-forest/10 rounded-lg">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-forest truncate">{file.file.name}</p>
                      <p className="text-sm text-forest/60">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {file.preview && (
                      <img 
                        src={file.preview} 
                        alt="Preview" 
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 border-red-300 hover:border-red-500 p-2 h-8 w-8"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest mb-2">Project Name</label>
                <Input 
                  name="projectName"
                  placeholder="Give your project a name"
                  className="border-forest/30 focus:border-forest"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest mb-2">Your Email</label>
                <Input 
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  className="border-forest/30 focus:border-forest"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest mb-2">Budget Range</label>
                <select 
                  name="budget"
                  className="w-full px-3 py-2 border border-forest/30 rounded-lg focus:border-forest focus:outline-none"
                  required
                >
                  <option value="">Select budget range</option>
                  <option value="under-100">Under $100</option>
                  <option value="100-500">$100 - $500</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="1000-plus">$1,000+</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest mb-2">Project Description</label>
                <Textarea 
                  name="description"
                  placeholder="Describe your project, materials, size, quantity, and any special requirements..."
                  rows={4}
                  className="border-forest/30 focus:border-forest resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest mb-2">Timeline</label>
                <select 
                  name="timeline"
                  className="w-full px-3 py-2 border border-forest/30 rounded-lg focus:border-forest focus:outline-none"
                  required
                >
                  <option value="">When do you need this?</option>
                  <option value="asap">ASAP</option>
                  <option value="1-week">Within 1 week</option>
                  <option value="2-weeks">Within 2 weeks</option>
                  <option value="1-month">Within 1 month</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-6">
            <Button 
              type="submit"
              disabled={uploadedFiles.length === 0 || isSubmitting}
              className="bg-forest hover:bg-forest-dark text-white px-8 py-3 text-lg"
            >
              {isSubmitting ? "Submitting..." : "Submit Design for Quote"}
            </Button>
            {uploadedFiles.length === 0 && (
              <p className="text-sm text-forest/60 mt-2">
                Please upload at least one design file to continue
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}