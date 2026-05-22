const mongoose = require('mongoose');
const Track = require('../models/Track');
const Certificate = require('../models/Certificate');
const Room = require('../models/Room');
const User = require('../models/User');
const crypto = require('crypto');

/**
 * Mock utility function to output certificate PDF to object storage or disk.
 */
async function generateCertificatePDF(certificateData) {
  console.log(`[PDF Generator] Generating PDF asset for track "${certificateData.trackName}"...`);
  return `uploads/certificates/${certificateData.credentialId}.pdf`;
}

/**
 * Checks if a user has completed all rooms inside a Track and issues a certificate if so.
 * Triggers immediately after a user marks a room as completed or passes the final quiz.
 * 
 * @param {string} userId - User's MongoDB ObjectId
 * @param {string} roomId - Slug or ObjectId of the room just completed
 * @returns {Promise<{success: boolean, certificates?: Array<any>, celebrate?: boolean, message?: string}>}
 */
async function checkAndIssueTrackCertificate(userId, roomId) {
  try {
    // 1. Find Room Object in DB to support matching by both ID and slug
    const room = await Room.findOne({ 
      $or: [
        { _id: mongoose.isValidObjectId(roomId) ? roomId : null }, 
        { slug: roomId }
      ] 
    });
    
    if (!room) {
      console.warn(`[Cert Service] Room not found by ID or slug: ${roomId}`);
      return { success: false, message: 'Room not found' };
    }

    // 2. Find all Tracks that include the recently completed roomId
    const tracks = await Track.find({ rooms: room._id });
    if (!tracks.length) {
      return { success: false, message: 'No tracks associated with this room' };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const newlyIssued = [];

    for (const track of tracks) {
      // 3. Check lock / idempotency state: Ensure no duplicate certificate exists
      const existingCert = await Certificate.findOne({ userId, trackId: track._id });
      if (existingCert) {
        console.log(`[Cert Service] User ${userId} already possesses a certificate for track: ${track.name}`);
        continue;
      }

      // 4. Calculate track completion status
      // Fetch details of rooms under this track to compare slug values stored in user.roomProgress
      const trackRooms = await Room.find({ _id: { $in: track.rooms } });
      const requiredSlugs = trackRooms.map(r => r.slug);

      // Get user's completed room slugs
      const completedSlugs = user.roomProgress
        .filter(rp => rp.completed)
        .map(rp => rp.roomId);

      // Find overlap
      const completedRequiredRooms = requiredSlugs.filter(slug => completedSlugs.includes(slug));

      console.log(`[Cert Service] User ${userId} completed ${completedRequiredRooms.length}/${requiredSlugs.length} rooms for track ${track.name}`);

      // 5. If all required rooms are completed, proceed to cryptographic issuance
      if (completedRequiredRooms.length === requiredSlugs.length && requiredSlugs.length > 0) {
        const year = new Date().getFullYear();
        const randomHash = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 character crypto hash
        const credentialId = `CV-${year}-${randomHash}`;

        // Create secure verification hash
        const verificationHash = crypto.createHash('sha256')
          .update(`${userId}-${track._id}-${credentialId}`)
          .digest('hex');

        const certificate = new Certificate({
          credentialId,
          userId,
          trackId: track._id,
          verificationHash,
          issueDate: new Date(),
          status: 'issued'
        });

        await certificate.save();

        // Trigger PDF generation utility
        await generateCertificatePDF({
          credentialId,
          userName: user.name,
          trackName: track.name,
          verificationHash,
          issueDate: certificate.issueDate
        });

        newlyIssued.push({
          credentialId,
          title: track.name,
          category: track.description || 'Specialization',
          issueDate: certificate.issueDate,
          verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${credentialId}`,
          verificationHash
        });
      }
    }

    if (newlyIssued.length > 0) {
      return {
        success: true,
        certificates: newlyIssued,
        celebrate: true
      };
    }

    return { success: false, message: 'Track requirements not fully met' };
  } catch (error) {
    console.error('[Cert Service] Error in checkAndIssueTrackCertificate:', error);
    throw error;
  }
}

module.exports = {
  checkAndIssueTrackCertificate,
  generateCertificatePDF
};
