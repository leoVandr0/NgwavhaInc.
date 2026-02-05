import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Star, Users, BookOpen, Award, MapPin, Globe, Play, ChevronRight, Filter, Search } from 'lucide-react';
import { Input, Select, Button, Card, Rate, Avatar, Typography, Row, Col, Tag } from 'antd';
import api from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const InstructorsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('rating');
    const [filterBy, setFilterBy] = useState('all');

    // Fetch instructors data
    const { data: instructors, isLoading } = useQuery(
        ['instructors', searchTerm, sortBy, filterBy],
        async () => {
            const params = new URLSearchParams({
                search: searchTerm,
                sort: sortBy,
                filter: filterBy
            });
            const { data } = await api.get(`/instructors/public?${params}`);
            return data;
        }
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    const InstructorCard = ({ instructor }) => (
        <motion.div variants={itemVariants}>
            <Card 
                className="instructor-card border-dark-800 bg-dark-900 hover:border-primary-500/50 transition-all duration-300 group cursor-pointer"
                bodyStyle={{ padding: '24px' }}
            >
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Instructor Profile */}
                    <div className="flex-shrink-0">
                        <div className="relative">
                            <Avatar 
                                size={120} 
                                src={instructor.avatar} 
                                className="border-4 border-dark-800 group-hover:border-primary-500/50 transition-all duration-300"
                            >
                                {instructor.name?.charAt(0)}
                            </Avatar>
                            {instructor.isTopRated && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full p-2">
                                    <Award size={16} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Instructor Info */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <Title level={4} className="text-white mb-1 group-hover:text-primary-400 transition-colors">
                                    {instructor.name}
                                </Title>
                                <Text className="text-primary-400 font-medium">
                                    {instructor.headline || 'Expert Instructor'}
                                </Text>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 mb-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-white font-bold">{instructor.averageRating || '4.5'}</span>
                                </div>
                                <Text type="secondary" className="text-xs">
                                    ({instructor.totalReviews || 0} reviews)
                                </Text>
                            </div>
                        </div>

                        <Paragraph className="text-dark-300 mb-4 line-clamp-2">
                            {instructor.bio || 'Passionate educator dedicated to helping students achieve their learning goals through practical, real-world experience and engaging teaching methods.'}
                        </Paragraph>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-dark-800 rounded-lg">
                                <Users className="w-5 h-5 text-primary-400 mx-auto mb-1" />
                                <div className="text-white font-bold">{instructor.totalStudents || 0}</div>
                                <Text type="secondary" className="text-xs">Students</Text>
                            </div>
                            <div className="text-center p-3 bg-dark-800 rounded-lg">
                                <BookOpen className="w-5 h-5 text-primary-400 mx-auto mb-1" />
                                <div className="text-white font-bold">{instructor.totalCourses || 0}</div>
                                <Text type="secondary" className="text-xs">Courses</Text>
                            </div>
                            <div className="text-center p-3 bg-dark-800 rounded-lg">
                                <Play className="w-5 h-5 text-primary-400 mx-auto mb-1" />
                                <div className="text-white font-bold">{instructor.totalVideos || 0}</div>
                                <Text type="secondary" className="text-xs">Videos</Text>
                            </div>
                        </div>

                        {/* Expertise Tags */}
                        {instructor.expertise && instructor.expertise.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {instructor.expertise.slice(0, 3).map((skill, index) => (
                                    <Tag 
                                        key={index} 
                                        className="border-primary-500/30 text-primary-400 bg-primary-500/10"
                                    >
                                        {skill}
                                    </Tag>
                                ))}
                                {instructor.expertise.length > 3 && (
                                    <Tag className="border-dark-600 text-dark-400">
                                        +{instructor.expertise.length - 3} more
                                    </Tag>
                                )}
                            </div>
                        )}

                        {/* Location */}
                        {instructor.location && (
                            <div className="flex items-center gap-2 text-dark-400 text-sm mb-4">
                                <MapPin size={14} />
                                <span>{instructor.location}</span>
                            </div>
                        )}

                        {/* Action Button */}
                        <Button 
                            type="primary" 
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-none w-full lg:w-auto"
                            icon={<ChevronRight size={16} />}
                        >
                            View Courses
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-dark-900">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 border-b border-dark-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <Title level={1} className="text-white mb-4">
                            Learn from <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Expert Instructors</span>
                        </Title>
                        <Paragraph className="text-xl text-dark-300 max-w-3xl mx-auto">
                            Discover world-class educators with proven track records. Our instructors are industry experts 
                            dedicated to helping you achieve your learning goals.
                        </Paragraph>
                    </motion.div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-dark-800/50 border-b border-dark-800 sticky top-0 z-10 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} md={8}>
                            <Input
                                placeholder="Search instructors..."
                                prefix={<Search size={16} />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-dark-900 border-dark-700 text-white"
                            />
                        </Col>
                        <Col xs={24} md={8}>
                            <Select
                                value={sortBy}
                                onChange={setSortBy}
                                className="w-full"
                                style={{ backgroundColor: '#1a1a1a', borderColor: '#333' }}
                            >
                                <Option value="rating">Highest Rated</Option>
                                <Option value="students">Most Students</Option>
                                <Option value="courses">Most Courses</Option>
                                <Option value="reviews">Most Reviews</Option>
                            </Select>
                        </Col>
                        <Col xs={24} md={8}>
                            <Select
                                value={filterBy}
                                onChange={setFilterBy}
                                className="w-full"
                                style={{ backgroundColor: '#1a1a1a', borderColor: '#333' }}
                            >
                                <Option value="all">All Instructors</Option>
                                <Option value="top-rated">Top Rated</Option>
                                <Option value="new">New Instructors</Option>
                                <Option value="verified">Verified</Option>
                            </Select>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Instructors Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                    >
                        {instructors?.map((instructor) => (
                            <InstructorCard key={instructor.id} instructor={instructor} />
                        ))}

                        {!instructors?.length && (
                            <div className="text-center py-20">
                                <div className="text-dark-400 text-lg">No instructors found matching your criteria.</div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Title level={2} className="text-white mb-4">
                        Become an Instructor
                    </Title>
                    <Paragraph className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
                        Share your expertise with thousands of students. Join our community of passionate educators 
                        and start earning while teaching what you love.
                    </Paragraph>
                    <Button 
                        size="large" 
                        className="bg-white text-orange-600 hover:bg-orange-50 border-none font-bold px-8"
                    >
                        Start Teaching Today
                    </Button>
                </div>
            </div>

            <style jsx>{`
                .instructor-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(255, 165, 0, 0.1);
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default InstructorsPage;
