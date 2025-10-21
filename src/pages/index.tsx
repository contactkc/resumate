"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import type { NextPage } from 'next';
import React from 'react';
import { useState } from 'react';
import { Toaster, toast } from "sonner";

interface AnalysisResult {
  matchScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  keywordAnalysis: {
    jobKeywords: string[];
    resumeKeywords: string[];
  };
}

const Home: NextPage = () => {
    const [resume, setResume] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
    if (!resume || !jobDescription) {
      toast.error("please paste both your resume and the job description.");
      return;
    }
    setIsLoading(true); 
    setAnalysisResult(null);

    try {
        const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jobDescription }),
      });
            let result: any;
            if (!response.ok) {
                const text = await response.text();
                try {
                    const parsed = JSON.parse(text);
                    throw new Error(parsed.error || 'an unknown error occurred.');
                } catch (e) {
                    console.error('Non-JSON error response:', text);
                    throw new Error('server returned an error. see console for details.');
                }
            }

            try {
                result = await response.json();
            } catch (e) {
                const text = await response.text();
                console.error('expected JSON but received:', text);
                throw new Error('received non-JSON response from server. see console for details.');
            }
      setAnalysisResult(result);
      toast.success("analysis complete!");

    } catch (error: any) {
      console.error("analysis failed:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const Keyword = ({ children, present }: { children: React.ReactNode, present: boolean }) => (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mr-2 mb-2 ${present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {children}
    </span>
  );

    return (
        <>
            <div className="min-h-screen flex justify-center p-12">
                <div className="max-w-2xl w-full">
                    <h1 className="text-2xl mb-2">resumate 📝</h1>
                    <p className="text-sm text-zinc-400 font-light">get instant feedback on your resume against any job description</p>

                    <div className="mt-4">
                        <Card className="bg-zinc-950">
                        <CardHeader>
                            <CardTitle className="font-normal">your details</CardTitle>
                            <CardDescription>paste your resume and the job description below</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                            <label htmlFor="resume" className="text-sm mb-2">resume</label>
                            <Textarea
                                id="resume"
                                placeholder="paste your full resume text here..."
                                className="h-64 resize-none text-zinc-400"
                                value={resume}
                                onChange={(e) => setResume(e.target.value)}
                            />
                            </div>
                            <div className="space-y-2">
                            <label htmlFor="job-description" className="text-sm mb-2">job description</label>
                            <Textarea
                                id="job-description"
                                placeholder="paste the job description here..."
                                className="h-64 resize-none text-zinc-400"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            </div>
                            <Button onClick={handleAnalyze} disabled={isLoading} className="w-full hover:cursor-pointer">
                            {isLoading ? (
                                <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                analyzing...
                                </>
                            ) : (
                                <>
                                <Sparkles className="h-4 w-4" />
                                analyze resume
                                </>
                            )}
                            </Button>   
                        </CardContent>
                        </Card>

                        <Card className="flex flex-col mt-4 bg-zinc-950">
                        <CardHeader>
                            <CardTitle className="font-normal">analysis report  </CardTitle>
                            <CardDescription>your ai-generated feedback will appear here</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <Loader2 className="h-12 w-12 animate-spin mb-4 size-sm" />
                            </div>
                            ) : analysisResult ? (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                <h3 className="text-sm">match score</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-full bg-zinc-200 rounded-full h-4">
                                    <div
                                        className="bg-zinc-800 h-4 rounded-full transition-all duration-1000"
                                        style={{ width: `${analysisResult.matchScore}%` }}
                                    />
                                    </div>
                                    <span className="text-sm text-white">{analysisResult.matchScore}%</span>
                                </div>
                                </div>
                                <div>
                                <h3 className="text-sm mb-2">summary</h3>
                                <p className="text-zinc-400 bg-zinc-900 p-3 rounded-md text-sm border border-zinc-800">{analysisResult.summary.toLowerCase()}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h3 className="text-sm">strengths</h3>
                                <ul className="list-disc list-outside pl-4 marker:mr-2 space-y-1 text-zinc-400 text-sm">
                                    {analysisResult.strengths.map((s, i) => <li key={i}>{s.toLowerCase()}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm">improvements</h3>
                                <ul className="list-disc list-outside pl-4 marker:mr-2 space-y-1 text-zinc-400 text-sm">
                                    {analysisResult.improvements.map((s, i) => <li key={i}>{s.toLowerCase()}</li>)}
                                    </ul>
                                </div>
                                </div>
                                <div>
                                <h3 className="text-md">keyword analysis</h3>
                                <p className="text-sm text-zinc-400 mb-3">keywords from the job description and their presence in your resume</p>
                                <div className="p-3 border border-zinc-800 bg-zinc-900 rounded-md">
                                    {analysisResult.keywordAnalysis.jobKeywords.map((keyword, i) => (
                                    <Keyword key={i} present={analysisResult.keywordAnalysis.resumeKeywords.includes(keyword)}>
                                        {keyword.toLowerCase()}
                                    </Keyword>
                                    ))}
                                </div>
                                </div>
                            </div>
                            ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <div className="text-center">
                                <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium">ready for your review</h3>
                                <p className="text-sm text-gray-500">fill in the details and click analyze</p>
                                </div>
                            </div>
                            )}
                        </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;