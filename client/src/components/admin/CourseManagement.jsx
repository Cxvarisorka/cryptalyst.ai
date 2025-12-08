import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Loader2,
  List,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { courseService } from '@/services/course.service';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const CourseManagement = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseDetails(selectedCourse._id);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCoursesAdmin();
      setCourses(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async (courseId) => {
    try {
      const data = await courseService.getCourseById(courseId);
      setCourseDetails(data);
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  // ==================== COURSE CRUD ====================

  const handleCreateCourse = () => {
    setEditingCourse({
      title: '',
      description: '',
      category: 'crypto',
      difficulty: 'beginner',
      isPublished: false,
      estimatedDuration: 0,
      order: courses.length,
    });
  };

  const handleSaveCourse = async () => {
    try {
      if (editingCourse._id) {
        await courseService.updateCourse(editingCourse._id, editingCourse);
        toast({ title: 'Success', description: 'Course updated successfully' });
      } else {
        const result = await courseService.createCourse(editingCourse);
        toast({ title: 'Success', description: 'Course created successfully' });
        setSelectedCourse(result.data);
      }
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save course',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course? This will delete all sections and lessons.')) {
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      toast({ title: 'Success', description: 'Course deleted successfully' });
      fetchCourses();
      if (selectedCourse?._id === courseId) {
        setSelectedCourse(null);
        setCourseDetails(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete course',
        variant: 'destructive',
      });
    }
  };

  // ==================== SECTION CRUD ====================

  const handleCreateSection = () => {
    if (!courseDetails) return;
    setEditingSection({
      courseId: courseDetails._id,
      title: '',
      description: '',
      order: courseDetails.sections?.length || 0,
    });
  };

  const handleSaveSection = async () => {
    try {
      if (editingSection._id) {
        await courseService.updateSection(editingSection._id, editingSection);
        toast({ title: 'Success', description: 'Section updated successfully' });
      } else {
        await courseService.createSection(editingSection.courseId, editingSection);
        toast({ title: 'Success', description: 'Section created successfully' });
      }
      setEditingSection(null);
      fetchCourseDetails(courseDetails._id);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save section',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Are you sure? This will delete all lessons in this section.')) {
      return;
    }

    try {
      await courseService.deleteSection(sectionId);
      toast({ title: 'Success', description: 'Section deleted successfully' });
      fetchCourseDetails(courseDetails._id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete section',
        variant: 'destructive',
      });
    }
  };

  // ==================== LESSON CRUD ====================

  const handleCreateLesson = (sectionId) => {
    setEditingLesson({
      sectionId,
      courseId: courseDetails._id,
      title: '',
      content: '',
      contentType: 'text',
      estimatedDuration: 5,
      order: 0,
    });
  };

  const handleSaveLesson = async () => {
    try {
      if (editingLesson._id) {
        await courseService.updateLesson(editingLesson._id, editingLesson);
        toast({ title: 'Success', description: 'Lesson updated successfully' });
      } else {
        await courseService.createLesson(editingLesson.sectionId, editingLesson);
        toast({ title: 'Success', description: 'Lesson created successfully' });
      }
      setEditingLesson(null);
      fetchCourseDetails(courseDetails._id);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save lesson',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      await courseService.deleteLesson(lessonId);
      toast({ title: 'Success', description: 'Lesson deleted successfully' });
      fetchCourseDetails(courseDetails._id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete lesson',
        variant: 'destructive',
      });
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-muted-foreground">Create and manage learning courses</p>
        </div>
        <Button onClick={handleCreateCourse}>
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Course List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Courses ({courses.length})</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto space-y-2">
              {courses.map((course) => (
                <button
                  key={course._id}
                  onClick={() => setSelectedCourse(course)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all',
                    selectedCourse?._id === course._id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{course.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {course.category}
                        </Badge>
                        <Badge
                          variant={course.isPublished ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {course.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                    <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Course Details */}
        <div className="lg:col-span-2">
          {courseDetails ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{courseDetails.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCourse(courseDetails)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCourse(courseDetails._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Course Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <span className="ml-2 font-medium">{courseDetails.category}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Difficulty:</span>
                    <span className="ml-2 font-medium">{courseDetails.difficulty}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lessons:</span>
                    <span className="ml-2 font-medium">{courseDetails.totalLessons || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Enrolled:</span>
                    <span className="ml-2 font-medium">{courseDetails.enrolledCount || 0}</span>
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Sections & Lessons</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCreateSection}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Section
                    </Button>
                  </div>

                  {/* Section List */}
                  {courseDetails.sections && courseDetails.sections.length > 0 ? (
                    <div className="space-y-3">
                      {courseDetails.sections.map((section, idx) => (
                        <div key={section._id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => toggleSection(section._id)}
                              className="flex items-center gap-2 flex-1"
                            >
                              {expandedSections[section._id] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <List className="h-4 w-4" />
                              <span className="font-medium">{section.title}</span>
                              <Badge variant="secondary" className="text-xs">
                                {section.lessons?.length || 0} lessons
                              </Badge>
                            </button>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingSection(section)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSection(section._id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Lessons */}
                          {expandedSections[section._id] && (
                            <div className="mt-3 ml-6 space-y-2">
                              {section.lessons && section.lessons.length > 0 ? (
                                section.lessons.map((lesson) => (
                                  <div
                                    key={lesson._id}
                                    className="flex items-center justify-between p-2 bg-muted rounded"
                                  >
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-3 w-3" />
                                      <span className="text-sm">{lesson.title}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {lesson.contentType}
                                      </Badge>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingLesson(lesson)}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteLesson(lesson._id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">No lessons yet</p>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCreateLesson(section._id)}
                                className="w-full mt-2"
                              >
                                <Plus className="h-3 w-3 mr-2" />
                                Add Lesson
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No sections yet. Click "Add Section" to get started.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a course to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Course Edit Modal */}
      {editingCourse && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingCourse._id ? 'Edit Course' : 'Create Course'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setEditingCourse(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  placeholder="Course title"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={editingCourse.description}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, description: e.target.value })
                  }
                  className="w-full min-h-[100px] p-2 border border-border rounded-md bg-background"
                  placeholder="Course description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={editingCourse.category}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, category: e.target.value })
                    }
                    className="w-full p-2 border border-border rounded-md bg-background"
                  >
                    <option value="crypto">Cryptocurrency</option>
                    <option value="stocks">Stocks</option>
                    <option value="trading">Trading</option>
                    <option value="fundamentals">Fundamentals</option>
                    <option value="technical-analysis">Technical Analysis</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <select
                    value={editingCourse.difficulty}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, difficulty: e.target.value })
                    }
                    className="w-full p-2 border border-border rounded-md bg-background"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={editingCourse.isPublished}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, isPublished: e.target.checked })
                  }
                  className="rounded"
                />
                <label htmlFor="isPublished" className="text-sm font-medium cursor-pointer">
                  Published
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setEditingCourse(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveCourse}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Course
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section Edit Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingSection._id ? 'Edit Section' : 'Create Section'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setEditingSection(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Section Title</label>
                <Input
                  value={editingSection.title}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  placeholder="e.g., Introduction to Crypto"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description (optional)</label>
                <textarea
                  value={editingSection.description}
                  onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                  className="w-full min-h-[80px] p-2 border border-border rounded-md bg-background"
                  placeholder="Section description"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setEditingSection(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSection}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Section
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lesson Edit Modal */}
      {editingLesson && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingLesson._id ? 'Edit Lesson' : 'Create Lesson'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setEditingLesson(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Lesson Title</label>
                <Input
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  placeholder="e.g., What is Bitcoin?"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Content Type</label>
                <select
                  value={editingLesson.contentType}
                  onChange={(e) => setEditingLesson({ ...editingLesson, contentType: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  <option value="text">Text</option>
                  <option value="quiz">Quiz</option>
                  <option value="interactive">Interactive</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Content (HTML supported)</label>
                <textarea
                  value={editingLesson.content}
                  onChange={(e) => setEditingLesson({ ...editingLesson, content: e.target.value })}
                  className="w-full min-h-[200px] p-2 border border-border rounded-md bg-background font-mono text-sm"
                  placeholder="<h2>Lesson Title</h2><p>Content here...</p>"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Estimated Duration (minutes)</label>
                <Input
                  type="number"
                  value={editingLesson.estimatedDuration}
                  onChange={(e) => setEditingLesson({ ...editingLesson, estimatedDuration: parseInt(e.target.value) || 0 })}
                  min="1"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setEditingLesson(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveLesson}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Lesson
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
