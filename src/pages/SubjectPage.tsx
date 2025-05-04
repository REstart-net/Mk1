import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, GraduationCap, BookOpen, BrainCircuit, Clock, Award, Download, ArrowLeft, Check, ChevronRight, Target, Users, BookMarked } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";
import { subjects, type Subject } from "@/shared/schema";
import { motion } from "framer-motion";

const subjectIcons = {
  "Basic Mathematics": FileText,
  "Advanced Mathematics": GraduationCap,
  "English": BookOpen,
  "Logical Reasoning": BrainCircuit,
} as const;

const mockTests = {
  "Basic Mathematics": [
    { id: "bm1", title: "HCF & LCM | Divisibility", duration: 30, questions: 20, difficulty: "Easy" },
    { id: "bm2", title: "Ratios, Averages & Percentages", duration: 45, questions: 25, difficulty: "Medium" },
    { id: "bm3", title: "Polynomials", duration: 40, questions: 22, difficulty: "Medium" },
    { id: "bm4", title: "Inequalities & Linear Equations", duration: 35, questions: 20, difficulty: "Hard" },
    { id: "bm5", title: "Speed, Profit & Loss", duration: 30, questions: 18, difficulty: "Medium" },
  ],
  "Advanced Mathematics": [
    { id: "am1", title: "Sets & PnC", duration: 60, questions: 30, difficulty: "Medium" },
    { id: "am2", title: "Functions", duration: 45, questions: 25, difficulty: "Hard" },
    { id: "am3", title: "Sequence and Series", duration: 50, questions: 28, difficulty: "Hard" },
    { id: "am4", title: "Calculus", duration: 60, questions: 30, difficulty: "Hard" },
    { id: "am5", title: "Probability & Statistics", duration: 55, questions: 25, difficulty: "Medium" },
  ],
  "English": [
    { id: "en1", title: "Summary & Tone of Passage", duration: 45, questions: 25, difficulty: "Medium" },
    { id: "en2", title: "Cause and Effect Relationships", duration: 30, questions: 20, difficulty: "Easy" },
    { id: "en3", title: "High Order Inferences from Texts", duration: 35, questions: 22, difficulty: "Hard" },
  ],
  "Logical Reasoning": [
    { id: "lr1", title: "Tables and Graphs", duration: 40, questions: 25, difficulty: "Medium" },
    { id: "lr2", title: "Venn Diagrams and Scatter Plots", duration: 45, questions: 28, difficulty: "Hard" },
    { id: "lr3", title: "Arrangements and Navigation", duration: 50, questions: 30, difficulty: "Hard" },
    { id: "lr4", title: "Family Relations", duration: 40, questions: 25, difficulty: "Medium" },
    { id: "lr5", title: "Encryption and Instructions", duration: 45, questions: 28, difficulty: "Hard" },
  ],
};

const fullTests = {
  "Basic Mathematics": { 
    id: "bm-full", 
    title: "Complete Mathematics Basic Test", 
    duration: 60, 
    questions: 30, 
    difficulty: "Mixed",
    description: "Comprehensive test covering all chapters in Basic Mathematics"
  },
  "Advanced Mathematics": { 
    id: "am-full", 
    title: "Complete Mathematics Advanced Test", 
    duration: 60, 
    questions: 30, 
    difficulty: "Mixed",
    description: "Comprehensive test covering all chapters in Advanced Mathematics"
  },
  "English": { 
    id: "en-full", 
    title: "Complete English Proficiency Test", 
    duration: 45, 
    questions: 30, 
    difficulty: "Mixed",
    description: "Comprehensive test covering all aspects of English comprehension"
  },
  "Logical Reasoning": { 
    id: "lr-full", 
    title: "Complete Logical Reasoning Test", 
    duration: 60, 
    questions: 30, 
    difficulty: "Mixed",
    description: "Comprehensive test covering all major logical reasoning concepts"
  },
};

const studyMaterials = {
  "Basic Mathematics": [
    { id: "bm-pdf1", title: "HCF & LCM | Divisibility Guide", size: "2.4 MB", pages: 45, type: "PDF" },
    { id: "bm-pdf2", title: "Ratios & Percentages Handbook", size: "3.1 MB", pages: 60, type: "PDF" },
    { id: "bm-pdf3", title: "Polynomials & Equations", size: "2.8 MB", pages: 52, type: "PDF" },
    { id: "bm-pdf4", title: "Profit, Loss & Interest", size: "2.5 MB", pages: 48, type: "PDF" },
  ],
  "Advanced Mathematics": [
    { id: "am-pdf1", title: "Sets & PnC Comprehensive Guide", size: "4.2 MB", pages: 75, type: "PDF" },
    { id: "am-pdf2", title: "Functions & Series Workbook", size: "3.8 MB", pages: 68, type: "PDF" },
    { id: "am-pdf3", title: "Calculus Reference Manual", size: "3.5 MB", pages: 62, type: "PDF" },
    { id: "am-pdf4", title: "Probability & Statistics Guide", size: "3.7 MB", pages: 70, type: "PDF" },
  ],
  "English": [
    { id: "en-pdf1", title: "Summary & Tone of Passage Guide", size: "2.9 MB", pages: 55, type: "PDF" },
    { id: "en-pdf2", title: "Cause and Effect Relationships Manual", size: "2.6 MB", pages: 48, type: "PDF" },
    { id: "en-pdf3", title: "High Order Inferences Guide", size: "2.2 MB", pages: 42, type: "PDF" },
  ],
  "Logical Reasoning": [
    { id: "lr-pdf1", title: "Tables and Graphs Guide", size: "3.2 MB", pages: 58, type: "PDF" },
    { id: "lr-pdf2", title: "Venn Diagrams and Scatter Plots", size: "3.4 MB", pages: 62, type: "PDF" },
    { id: "lr-pdf3", title: "Arrangements and Navigation", size: "3.6 MB", pages: 65, type: "PDF" },
    { id: "lr-pdf4", title: "Family Relations and Encryption", size: "3.5 MB", pages: 60, type: "PDF" },
    { id: "lr-pdf5", title: "Instruction Sets Guide", size: "3.3 MB", pages: 55, type: "PDF" },
  ],
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'text-green-500 bg-green-500/10';
    case 'medium':
      return 'text-orange-500 bg-orange-500/10';
    case 'hard':
      return 'text-red-500 bg-red-500/10';
    case 'mixed':
      return 'text-purple-500 bg-purple-500/10';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

export default function SubjectPage() {
  const { subject } = useParams<{ subject: Subject }>();
  const { progress, updateProgress } = useProgress();
  
  if (!subjects.includes(subject as Subject)) {
    return <div>Subject not found</div>;
  }

  const Icon = subjectIcons[subject as Subject];
  const subjectProgress = progress?.[subject as Subject] || {
    completedTests: 0,
    totalScore: 0,
    completedMaterials: [],
  };

  const handleStartTest = async (testId: string) => {
    window.location.href = `/subjects/${subject}/test`;
  };

  const handleStartFullTest = async () => {
    window.location.href = `/subjects/${subject}/full-test`;
  };

  const handleDownloadMaterial = async (materialId: string) => {
    await updateProgress(subject as Subject, {
      completedMaterials: [...subjectProgress.completedMaterials, materialId],
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Study Group
            </Button>
            <Button className="gap-2" onClick={handleStartFullTest}>
              <Target className="h-4 w-4" />
              Take Full Test
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-6 mb-8"
        >
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">{subject}</h1>
            <p className="text-muted-foreground">Master your skills and track your progress</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Tests Completed</h3>
                  <p className="text-2xl font-bold">{subjectProgress.completedTests}</p>
                </div>
              </div>
              <Progress value={subjectProgress.completedTests * 10} className="h-2" />
            </CardContent>
          </Card>

          <Card className="bg-green-500/5 border-green-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Materials Completed</h3>
                  <p className="text-2xl font-bold">{subjectProgress.completedMaterials.length}</p>
                </div>
              </div>
              <Progress value={subjectProgress.completedMaterials.length * 10} className="h-2 bg-green-500/20" />
            </CardContent>
          </Card>

          <Card className="bg-orange-500/5 border-orange-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Average Score</h3>
                  <p className="text-2xl font-bold">
                    {subjectProgress.completedTests
                      ? Math.round(subjectProgress.totalScore / subjectProgress.completedTests)
                      : 0}%
                  </p>
                </div>
              </div>
              <Progress
                value={subjectProgress.completedTests
                  ? (subjectProgress.totalScore / subjectProgress.completedTests)
                  : 0}
                className="h-2 bg-orange-500/20"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Full Test Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-primary/20 to-primary/5 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center">
                    <BookMarked className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      {fullTests[subject as Subject].title}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      {fullTests[subject as Subject].description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {fullTests[subject as Subject].duration} mins
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {fullTests[subject as Subject].questions} Questions
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(fullTests[subject as Subject].difficulty)}`}>
                        {fullTests[subject as Subject].difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="whitespace-nowrap"
                  onClick={handleStartFullTest}
                >
                  Start Full Test
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="tests" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="tests" className="gap-2">
              <Target className="h-4 w-4" />
              Practice Tests
            </TabsTrigger>
            <TabsTrigger value="materials" className="gap-2">
              <FileText className="h-4 w-4" />
              Study Materials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tests">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockTests[subject as Subject].map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold">{test.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                              {test.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {test.duration} mins
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {test.questions} questions
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        className="w-full group-hover:bg-primary/90"
                        onClick={() => handleStartTest(test.id)}
                      >
                        Start Test
                        <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="materials">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studyMaterials[subject as Subject].map((material, index) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold">{material.title}</h3>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                              {material.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {material.pages} pages
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="h-4 w-4" />
                              {material.size}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={subjectProgress.completedMaterials.includes(material.id) ? "secondary" : "default"}
                        className="w-full group-hover:bg-primary/90"
                        onClick={() => handleDownloadMaterial(material.id)}
                      >
                        {subjectProgress.completedMaterials.includes(material.id) ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download Material
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}