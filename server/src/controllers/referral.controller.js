import User from '../models/User.js';
import Referral from '../models/Referral.js';
import { Op } from 'sequelize';

// @desc    Get current user's referral info
// @route   GET /api/referrals/my-code
// @access  Private
export const getMyReferralInfo = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'referralCode', 'referralPoints', 'referredBy']
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get referral history
        const referrals = await Referral.findAll({
            where: { referrerId: req.user.id },
            include: [
                {
                    model: User,
                    as: 'referred',
                    attributes: ['id', 'name', 'email', 'createdAt']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            referralCode: user.referralCode,
            referralPoints: user.referralPoints,
            totalReferrals: referrals.length,
            referrals: referrals.map(r => ({
                id: r.id,
                referredUser: r.referred,
                pointsAwarded: r.pointsAwarded,
                status: r.status,
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        console.error('Error getting referral info:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Validate a referral code
// @route   GET /api/referrals/validate/:code
// @access  Public
export const validateReferralCode = async (req, res) => {
    try {
        const { code } = req.params;

        if (!code) {
            return res.status(400).json({ message: 'Referral code is required' });
        }

        const user = await User.findOne({
            where: { referralCode: code.trim().toUpperCase() },
            attributes: ['id', 'name', 'referralCode']
        });

        if (!user) {
            return res.status(404).json({ message: 'Invalid referral code' });
        }

        res.json({
            valid: true,
            referrerName: user.name,
            referralCode: user.referralCode
        });
    } catch (error) {
        console.error('Error validating referral code:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get referral statistics (admin only)
// @route   GET /api/referrals/stats
// @access  Private/Admin
export const getReferralStats = async (req, res) => {
    try {
        const totalReferrals = await Referral.count();
        const totalPointsAwarded = await Referral.sum('pointsAwarded');
        
        const topReferrers = await User.findAll({
            where: { referralPoints: { [Op.gt]: 0 } },
            attributes: ['id', 'name', 'email', 'referralPoints'],
            order: [['referralPoints', 'DESC']],
            limit: 10
        });

        const recentReferrals = await Referral.findAll({
            include: [
                {
                    model: User,
                    as: 'referrer',
                    attributes: ['id', 'name']
                },
                {
                    model: User,
                    as: 'referred',
                    attributes: ['id', 'name']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        res.json({
            totalReferrals,
            totalPointsAwarded: totalPointsAwarded || 0,
            topReferrers,
            recentReferrals
        });
    } catch (error) {
        console.error('Error getting referral stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
