"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, FileText, CheckCircle, AlertCircle, FlaskConical, Code2, Cpu } from "lucide-react";
import { toast } from "sonner";

interface ExperienceEntry {
  position: string;
  company: string;
  duration: string;
  description?: string;
}

interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
}

interface ParsedResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills?: string[];
  experience?: ExperienceEntry[];
  education?: EducationEntry[];
  certifications?: string[];
  languages?: string[];
  uploadedFile?: string;
}

interface ParseResult {
  success: boolean;
  data: ParsedResumeData;
  message?: string;
}

export default function TestAIPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Only PDF files are accepted");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }
      setFile(selectedFile);
      setResult(null);
      toast.success(`${selectedFile.name} selected`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a PDF file first");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to parse resume");
        return;
      }

      setResult(data);
      toast.success("Resume parsed successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2.5">
          <FlaskConical className="h-8 w-8 text-[#22396F] dark:text-[#FCF1D0]" />
          AI Resume Parser Test
        </h1>
        <p className="text-muted-foreground">
          Upload a PDF resume and see AI-powered parsing in action
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Resume
          </CardTitle>
          <CardDescription>
            Upload a PDF resume (max 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resume">PDF Resume</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={loading}
            />
            {file && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <FileText className="h-4 w-4" />
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Parse with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result Section */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Parse Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Full Name */}
            {result.data?.fullName && (
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <p className="text-lg font-semibold">{result.data.fullName}</p>
              </div>
            )}

            {/* Email */}
            {result.data?.email && (
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-lg">{result.data.email}</p>
              </div>
            )}

            {/* Phone */}
            {result.data?.phone && (
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <p className="text-lg">{result.data.phone}</p>
              </div>
            )}

            {/* Location */}
            {result.data?.location && (
              <div>
                <Label className="text-muted-foreground">Location</Label>
                <p className="text-lg">{result.data.location}</p>
              </div>
            )}

            {/* Summary */}
            {result.data?.summary && (
              <div>
                <Label className="text-muted-foreground">Summary</Label>
                <p className="text-sm leading-relaxed">{result.data.summary}</p>
              </div>
            )}

            {/* Skills */}
            {result.data?.skills && result.data.skills.length > 0 && (
              <div>
                <Label className="text-muted-foreground">Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.data.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {result.data?.experience && result.data.experience.length > 0 && (
              <div>
                <Label className="text-muted-foreground">Experience</Label>
                <div className="space-y-3 mt-2">
                  {result.data.experience.map((exp: ExperienceEntry, index: number) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <p className="font-semibold">{exp.position}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.company} • {exp.duration}
                      </p>
                      {exp.description && (
                        <p className="text-sm mt-1">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {result.data?.education && result.data.education.length > 0 && (
              <div>
                <Label className="text-muted-foreground">Education</Label>
                <div className="space-y-3 mt-2">
                  {result.data.education.map((edu: EducationEntry, index: number) => (
                    <div key={index} className="border-l-2 border-accent pl-4">
                      <p className="font-semibold">{edu.degree}</p>
                      <p className="text-sm text-muted-foreground">
                        {edu.institution} • {edu.year}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {result.data?.certifications && result.data.certifications.length > 0 && (
              <div>
                <Label className="text-muted-foreground">Certifications</Label>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {result.data.certifications.map((cert: string, index: number) => (
                    <li key={index} className="text-sm">{cert}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Languages */}
            {result.data?.languages && result.data.languages.length > 0 && (
              <div>
                <Label className="text-muted-foreground">Languages</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.data.languages.map((lang: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Raw JSON for debugging */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
                <Code2 className="h-4 w-4" />
                View Raw JSON
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!result && !loading && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              How to Use
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ol className="list-decimal list-inside space-y-2">
              <li>Click the <strong>&ldquo;Choose File&rdquo;</strong> button above</li>
              <li>Select a PDF resume (max 5MB)</li>
              <li>Click <strong>&ldquo;Parse with AI&rdquo;</strong></li>
              <li>AI will automatically extract all information from the resume</li>
              <li>View the parsed results below</li>
            </ol>
            
            <div className="mt-4 p-4 bg-primary/5 rounded-lg">
              <p className="font-semibold text-primary mb-2 flex items-center gap-1.5">
                <Cpu className="h-4 w-4" />
                What AI Extracts:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Name, email, phone, location</li>
                <li>Professional summary</li>
                <li>Skills and expertise</li>
                <li>Work experience</li>
                <li>Education background</li>
                <li>Certifications</li>
                <li>Languages</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
