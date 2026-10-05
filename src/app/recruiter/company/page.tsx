"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Loader2,
  Save,
  ArrowLeft,
  Pencil,
  CheckCircle2,
  Briefcase,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";

interface CompanyProfile {
  _id?: string;
  name: string;
  logo: string;
  website: string;
  industry: string;
  size: string;
  description: string;
  location: string;
}

const industries = [
  "Technology",
  "Healthcare",
  "Finance & Banking",
  "Education",
  "E-commerce",
  "Manufacturing",
  "Consulting",
  "Media & Entertainment",
  "Real Estate",
  "Telecommunications",
  "Automotive",
  "Energy",
  "Government",
  "Nonprofit",
  "Other",
];

const companySizes = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "501-1000", label: "501–1,000 employees" },
  { value: "1000+", label: "1,000+ employees" },
];

export default function CompanyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);

  const [company, setCompany] = useState<CompanyProfile>({
    name: "",
    logo: "",
    website: "",
    industry: "",
    size: "1-10",
    description: "",
    location: "",
  });

  const fetchCompany = useCallback(async () => {
    try {
      const res = await fetch("/api/company");
      const data = await res.json();
      if (data.success && data.data) {
        setCompany({
          _id: data.data._id,
          name: data.data.name || "",
          logo: data.data.logo || "",
          website: data.data.website || "",
          industry: data.data.industry || "",
          size: data.data.size || "1-10",
          description: data.data.description || "",
          location: data.data.location || "",
        });
        setHasCompany(true);
      } else {
        setEditing(true); // New company, start in edit mode
      }
    } catch {
      console.error("Failed to fetch company");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const handleSave = async () => {
    if (!company.name || !company.industry || !company.location) {
      toast.error("Company name, industry, and location are required");
      return;
    }

    setSaving(true);
    try {
      const method = hasCompany ? "PUT" : "POST";
      const res = await fetch("/api/company", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save company profile");
        return;
      }

      toast.success(
        hasCompany ? "Company profile updated!" : "Company profile created!"
      );
      setHasCompany(true);
      setEditing(false);
      if (data.data?._id) {
        setCompany((prev) => ({ ...prev, _id: data.data._id }));
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#010736] text-[#010736] dark:text-white transition-colors duration-200">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link href="/recruiter/dashboard">
              <Button variant="ghost" size="icon" className="text-[#475569] dark:text-[#cbd5e1] hover:text-[#010736] dark:hover:text-[#FCF1D0] hover:bg-[#f1f5f9] dark:hover:bg-[#0D1C42]">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#010736] dark:text-white">
                Company{" "}
                <span className="text-[#22396F] dark:text-[#FCF1D0]">
                  Profile
                </span>
              </h1>
              <p className="text-sm text-[#475569] dark:text-[#cbd5e1] mt-0.5">
                {hasCompany
                  ? "Manage your company information"
                  : "Set up your company profile to start posting jobs"}
              </p>
            </div>
          </div>
          {hasCompany && !editing && (
            <Button onClick={() => setEditing(true)} variant="outline" className="gap-2 border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] text-[#010736] dark:text-white hover:bg-[#f1f5f9] dark:hover:bg-[#22396F] hover:text-[#22396F] dark:hover:text-[#FCF1D0]">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          )}
        </motion.div>

        {/* View Mode */}
        {hasCompany && !editing ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-[#cbd5e1] dark:border-[#22396F] bg-white dark:bg-[#0D1C42] text-[#010736] dark:text-white overflow-hidden shadow-sm">
              <div className="bg-[#f8fafc] dark:bg-[#22396F] p-6 border-b border-[#cbd5e1] dark:border-[#22396F]">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-[#010736] border border-[#cbd5e1] dark:border-[#22396F]">
                    {company.logo ? (
                      <Image
                        src={company.logo}
                        alt={company.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-[#22396F] dark:text-[#FCF1D0]" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{company.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {company.industry}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {companySizes.find((s) => s.value === company.size)?.label || company.size}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{company.location}</span>
                  </div>
                  {company.website && (
                    <a
                      href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4" /> {company.website}
                    </a>
                  )}
                </div>
                {company.description && (
                  <>
                    <div className="border-t border-border/40 pt-4">
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" /> About
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {company.description}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Company profile is complete. Your jobs will display this information.</span>
            </div>
          </motion.div>
        ) : (
          /* Edit / Create Mode */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  {hasCompany ? "Edit Company Profile" : "Create Company Profile"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Acme Technologies"
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  />
                </div>

                {/* Industry & Size */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Industry <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={company.industry}
                      onValueChange={(v) => setCompany({ ...company, industry: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Company Size</Label>
                    <Select
                      value={company.size}
                      onValueChange={(v) => setCompany({ ...company, size: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g. San Francisco, CA"
                    value={company.location}
                    onChange={(e) => setCompany({ ...company, location: e.target.value })}
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="e.g. https://www.acme.com"
                    value={company.website}
                    onChange={(e) => setCompany({ ...company, website: e.target.value })}
                  />
                </div>

                {/* Logo URL */}
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    placeholder="e.g. https://www.acme.com/logo.png"
                    value={company.logo}
                    onChange={(e) => setCompany({ ...company, logo: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">About the Company</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell candidates about your company culture, mission, and values..."
                    rows={5}
                    value={company.description}
                    onChange={(e) => setCompany({ ...company, description: e.target.value })}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#FCF1D0] text-[#010736] hover:bg-white font-semibold shadow-md"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {saving ? "Saving..." : hasCompany ? "Update Profile" : "Create Profile"}
                  </Button>
                  {hasCompany && (
                    <Button variant="ghost" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
