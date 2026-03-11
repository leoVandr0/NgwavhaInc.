import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Typography, message, List, Avatar, Badge } from 'antd';
import { Share2, Users, Gift, Copy, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;

const ReferralPage = () => {
  const { currentUser } = useAuth();
  const [referralInfo, setReferralInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    fetchReferralInfo();
  }, []);

  useEffect(() => {
    if (referralInfo?.referralCode) {
      const link = `${window.location.origin}/register?ref=${referralInfo.referralCode}`;
      setReferralLink(link);
    }
  }, [referralInfo]);

  const fetchReferralInfo = async () => {
    try {
      setLoading(true);
      const res = await api.get('/referrals/my-code');
      setReferralInfo(res.data);
    } catch (err) {
      message.error('Failed to load referral information');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    message.success('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Ngwavha!',
          text: `Use my referral code ${referralInfo?.referralCode} to sign up and get started!`,
          url: referralLink,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <Title level={2} className="text-white mb-2">Refer & Earn</Title>
        <Paragraph className="text-dark-300">
          Invite your friends to join Ngwavha and earn 3 points for each successful referral!
        </Paragraph>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-dark-800 border-dark-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary-500/20">
              <Gift className="text-primary-500" size={24} />
            </div>
            <div>
              <Text className="text-dark-400 block">Your Points</Text>
              <Title level={4} className="text-white !m-0">{referralInfo?.referralPoints || 0}</Title>
            </div>
          </div>
        </Card>

        <Card className="bg-dark-800 border-dark-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-green-500/20">
              <Users className="text-green-500" size={24} />
            </div>
            <div>
              <Text className="text-dark-400 block">Total Referrals</Text>
              <Title level={4} className="text-white !m-0">{referralInfo?.totalReferrals || 0}</Title>
            </div>
          </div>
        </Card>

        <Card className="bg-dark-800 border-dark-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-blue-500/20">
              <Share2 className="text-blue-500" size={24} />
            </div>
            <div>
              <Text className="text-dark-400 block">Your Code</Text>
              <Title level={4} className="text-white !m-0">{referralInfo?.referralCode || 'N/A'}</Title>
            </div>
          </div>
        </Card>
      </div>

      {/* Share Section */}
      <Card className="bg-dark-800 border-dark-700">
        <Title level={4} className="text-white mb-4">Share Your Link</Title>
        <div className="flex gap-2 mb-4">
          <Input
            value={referralLink}
            readOnly
            className="bg-dark-900 border-dark-600 text-white flex-1"
          />
          <Button
            type="primary"
            icon={copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            onClick={copyToClipboard}
            className="bg-primary-500 hover:bg-primary-600 text-dark-950 font-semibold"
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            type="primary"
            icon={<Share2 size={16} />}
            onClick={shareReferral}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            Share
          </Button>
        </div>
        <Paragraph className="text-dark-400 text-sm">
          Share this link with your friends. When they sign up using your code, you'll earn 3 points!
        </Paragraph>
      </Card>

      {/* Referral History */}
      {referralInfo?.referrals?.length > 0 && (
        <Card className="bg-dark-800 border-dark-700">
          <Title level={4} className="text-white mb-4">Your Referrals</Title>
          <List
            dataSource={referralInfo.referrals}
            renderItem={(item) => (
              <List.Item className="border-dark-600">
                <List.Item.Meta
                  avatar={
                    <Avatar className="bg-primary-500">
                      {item.referredUser?.name?.charAt(0) || '?'}
                    </Avatar>
                  }
                  title={<Text className="text-white">{item.referredUser?.name}</Text>}
                  description={
                    <Text className="text-dark-400">
                      Joined {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  }
                />
                <Badge
                  count={`+${item.pointsAwarded} pts`}
                  style={{ backgroundColor: '#52c41a' }}
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};

export default ReferralPage;
